import Phaser from 'phaser';
import { LEVELS, LevelData } from '../config/constants';
import { soundManager } from '../utils/SoundManager';
import { 
  PhysicsSystem, 
  InputSystem, 
  ParticleSystem, 
  ScoreSystem,
  ConveyorSystem,
  PistonSystem,
  LaserSystem,
  PowerupSystem
} from '../systems';
import { LevelManager, BackgroundManager } from '../managers';
import { Player } from '../entities';

export class GameScene extends Phaser.Scene {
  // Core Systems
  private physicsSystem!: PhysicsSystem;
  private inputSystem!: InputSystem;
  private particleSystem!: ParticleSystem;
  private scoreSystem!: ScoreSystem;

  // Mechanic Systems
  private conveyorSystem!: ConveyorSystem;
  private pistonSystem!: PistonSystem;
  private laserSystem!: LaserSystem;
  private powerupSystem!: PowerupSystem;

  // Managers
  private levelManager!: LevelManager;
  private backgroundManager!: BackgroundManager;

  // Entities
  private player!: Player;

  // State
  private currentLevel: number = 1;
  private levelData!: LevelData;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: number }): void {
    this.currentLevel = data.level || 1;
  }

  create(): void {
    // Get level data
    this.levelData = LEVELS[this.currentLevel - 1] || LEVELS[0];

    // Initialize core systems
    this.physicsSystem = new PhysicsSystem(this);
    this.inputSystem = new InputSystem(this);
    this.particleSystem = new ParticleSystem(this);
    this.scoreSystem = new ScoreSystem(this);

    // Initialize mechanic systems
    this.conveyorSystem = new ConveyorSystem(this);
    this.pistonSystem = new PistonSystem(this);
    this.laserSystem = new LaserSystem(this);
    this.powerupSystem = new PowerupSystem(this);

    // Initialize managers
    this.backgroundManager = new BackgroundManager(this);
    this.levelManager = new LevelManager(this, this.levelData);

    // Create everything
    this.backgroundManager.create();
    this.levelManager.create();
    
    // Create mechanic objects
    this.conveyorSystem.create(this.levelData);
    this.pistonSystem.create(this.levelData);
    this.laserSystem.create(this.levelData);
    this.powerupSystem.create(this.levelData);
    
    // Create player last (on top)
    this.player = new Player(this, this.levelData);
    
    this.particleSystem.create();
    this.scoreSystem.createUI(this.currentLevel);

    // Setup collisions
    this.setupCollisions();

    // Setup input
    this.inputSystem.setup({
      onFlip: () => this.handleFlip(),
      onRestart: () => this.restartLevel(),
      onPause: () => this.pauseGame()
    });

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Show level name and tutorial
    this.showLevelName();
  }

  private setupCollisions(): void {
    // Player collides with platforms
    this.physics.add.collider(this.player.sprite, this.levelManager.platforms);

    // Player collides with conveyors (for standing on)
    this.physics.add.collider(this.player.sprite, this.conveyorSystem.conveyors);

    // Player collects coins
    this.physics.add.overlap(
      this.player.sprite,
      this.levelManager.coins,
      this.collectCoin,
      undefined,
      this
    );

    // Player hits spikes
    this.physics.add.overlap(
      this.player.sprite,
      this.levelManager.spikes,
      this.hitHazard,
      undefined,
      this
    );

    // Player hits pistons
    this.physics.add.overlap(
      this.player.sprite,
      this.pistonSystem.getGroup(),
      this.hitHazard,
      undefined,
      this
    );

    // Player hits lasers
    this.physics.add.overlap(
      this.player.sprite,
      this.laserSystem.getGroup(),
      this.hitHazard,
      undefined,
      this
    );

    // Player collects powerups
    this.physics.add.overlap(
      this.player.sprite,
      this.powerupSystem.getGroup(),
      this.collectPowerup,
      undefined,
      this
    );

    // Player reaches home
    this.physics.add.overlap(
      this.player.sprite,
      this.levelManager.home,
      this.reachHome,
      undefined,
      this
    );
  }

  update(): void {
    if (!this.player) return;

    // Update player with speed multiplier from powerups
    const speedMult = this.powerupSystem.getSpeedMultiplier();
    this.player.update(
      this.physicsSystem.isFlipped,
      this.physicsSystem.isFlipping,
      speedMult
    );

    // Update systems
    this.conveyorSystem.update(this.player.sprite);
    this.powerupSystem.update();

    // Update UI
    this.scoreSystem.updateFlipIndicator(this.physicsSystem.isFlipped);

    // Check bounds
    if (this.player.isOutOfBounds()) {
      this.restartLevel();
    }
  }

  // === ACTIONS ===

  private handleFlip(): void {
    const flipped = this.physicsSystem.flip();
    if (flipped) {
      soundManager.playFlip();
      this.particleSystem.emitFlip(this.player.x, this.player.y);
      this.cameras.main.shake(100, 0.01);
    }
  }

  private collectCoin(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;

    soundManager.playCoinCollect();
    this.particleSystem.emitCoinCollect(coinSprite.x, coinSprite.y);
    this.scoreSystem.addCoinScore();
    this.scoreSystem.showScorePopup(coinSprite.x, coinSprite.y);

    coinSprite.destroy();
  }

  private collectPowerup(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    powerup: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const powerupSprite = powerup as Phaser.Physics.Arcade.Sprite;
    soundManager.playCoinCollect(); // Reuse sound for now
    this.powerupSystem.collect(powerupSprite, this.player.sprite);
  }

  private hitHazard(): void {
    // Check if shield absorbs the hit
    if (this.powerupSystem.useShield()) {
      // Shield absorbed it - flash blue instead
      this.cameras.main.flash(200, 0, 100, 255);
      soundManager.playFlip(); // Reuse sound
      return;
    }

    soundManager.playDeath();
    this.particleSystem.emitDeath(this.player.x, this.player.y);
    this.cameras.main.flash(200, 255, 0, 0);
    this.restartLevel();
  }

  private reachHome(): void {
    if (!this.player.active) return;
    this.player.stop();

    soundManager.playVictory();
    this.cameras.main.flash(500, 255, 255, 255);
    this.scoreSystem.addLevelBonus();

    // Victory message
    this.showVictoryMessage();

    // Next level or victory scene
    this.time.delayedCall(2000, () => {
      if (this.currentLevel < LEVELS.length) {
        this.scene.restart({ level: this.currentLevel + 1 });
      } else {
        this.scene.start('VictoryScene', { score: this.scoreSystem.score });
      }
    });
  }

  private restartLevel(): void {
    this.physicsSystem.reset();
    this.scene.restart({ level: this.currentLevel });
  }

  private pauseGame(): void {
    soundManager.playPause();
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  // === UI HELPERS ===

  private showLevelName(): void {
    const { width, height } = this.cameras.main;

    const levelName = this.add.text(width / 2, height / 2, this.levelData.name, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(200);

    this.tweens.add({
      targets: levelName,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => levelName.destroy()
    });

    // Show tutorial if present
    if (this.levelData.tutorial) {
      this.showTutorial(this.levelData.tutorial);
    }
  }

  private showTutorial(text: string): void {
    const { width } = this.cameras.main;

    const tutorial = this.add.text(width / 2, 100, text, {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
      targets: tutorial,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      onComplete: () => tutorial.destroy()
    });
  }

  private showVictoryMessage(): void {
    const { width, height } = this.cameras.main;

    const victoryText = this.add.text(width / 2, height / 2, '🏠 HOME! 🏠', {
      fontSize: '48px',
      color: '#FFD700',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2
    });
  }
}
