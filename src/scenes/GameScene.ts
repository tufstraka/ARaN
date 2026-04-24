import Phaser from 'phaser';
import { LEVELS, LevelData } from '../config/constants';
import { soundManager } from '../utils/SoundManager';
import { PhysicsSystem, InputSystem, ParticleSystem, ScoreSystem } from '../systems';
import { LevelManager, BackgroundManager } from '../managers';
import { Player } from '../entities';

export class GameScene extends Phaser.Scene {
  // Systems
  private physicsSystem!: PhysicsSystem;
  private inputSystem!: InputSystem;
  private particleSystem!: ParticleSystem;
  private scoreSystem!: ScoreSystem;

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

    // Initialize systems
    this.physicsSystem = new PhysicsSystem(this);
    this.inputSystem = new InputSystem(this);
    this.particleSystem = new ParticleSystem(this);
    this.scoreSystem = new ScoreSystem(this);

    // Initialize managers
    this.backgroundManager = new BackgroundManager(this);
    this.levelManager = new LevelManager(this, this.levelData);

    // Create everything
    this.backgroundManager.create();
    this.levelManager.create();
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

    // Show level name
    this.showLevelName();
  }

  private setupCollisions(): void {
    // Player collides with platforms
    this.physics.add.collider(this.player.sprite, this.levelManager.platforms);

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
      this.hitSpike,
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

    // Update player
    this.player.update(
      this.physicsSystem.isFlipped,
      this.physicsSystem.isFlipping
    );

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

  private hitSpike(): void {
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
