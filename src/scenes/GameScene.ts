import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, LEVELS, LevelData } from '../config/constants';
import { soundManager } from '../utils/SoundManager';

export class GameScene extends Phaser.Scene {
  // Game objects
  private pip!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private home!: Phaser.Physics.Arcade.Sprite;
  
  // Game state
  private isFlipped: boolean = false;
  private isFlipping: boolean = false;
  private canFlip: boolean = true;
  private score: number = 0;
  private coinsCollected: number = 0;
  private currentLevel: number = 1;
  private levelData!: LevelData;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private flipIndicator!: Phaser.GameObjects.Text;
  
  // Particles
  private flipParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private coinParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: number }): void {
    this.currentLevel = data.level || 1;
    this.isFlipped = false;
    this.isFlipping = false;
    this.canFlip = true;
    this.score = 0;
    this.coinsCollected = 0;
  }

  create(): void {
    // Get level data
    this.levelData = LEVELS[this.currentLevel - 1] || LEVELS[0];
    
    // Create background
    this.createBackground();
    
    // Create game objects
    this.createPlatforms();
    this.createCoins();
    this.createSpikes();
    this.createHome();
    this.createPip();
    
    // Create UI
    this.createUI();
    
    // Create particles
    this.createParticles();
    
    // Set up physics collisions
    this.setupCollisions();
    
    // Set up input
    this.setupInput();
    
    // Camera fade in
    this.cameras.main.fadeIn(500);
    
    // Show level name
    this.showLevelName();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Factory/Industrial gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.SKY_TOP, COLORS.SKY_TOP,
      COLORS.SKY_BOTTOM, COLORS.SKY_BOTTOM
    );
    bg.fillRect(0, 0, width, height);
    bg.setScrollFactor(0);
    
    // Add factory machinery in background
    for (let i = 0; i < 4; i++) {
      const gearX = Phaser.Math.Between(50, width - 50);
      const gearY = Phaser.Math.Between(50, 150);
      this.createBackgroundGear(gearX, gearY, Phaser.Math.Between(20, 40));
    }
    
    // Add some pipes
    for (let i = 0; i < 3; i++) {
      this.createBackgroundPipe(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(100, 200)
      );
    }
  }

  private createBackgroundGear(x: number, y: number, size: number): void {
    const gear = this.add.graphics();
    gear.fillStyle(0x34495E, 0.3); // Dark semi-transparent
    gear.fillCircle(0, 0, size);
    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const toothX = Math.cos(angle) * size;
      const toothY = Math.sin(angle) * size;
      gear.fillRect(toothX - 4, toothY - 4, 8, 8);
    }
    gear.fillStyle(0x2C3E50, 0.3);
    gear.fillCircle(0, 0, size * 0.4);
    gear.setPosition(x, y);
    gear.setScrollFactor(0.3);
    
    // Slow rotation animation
    this.tweens.add({
      targets: gear,
      angle: 360,
      duration: 20000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createBackgroundPipe(x: number, y: number): void {
    const pipe = this.add.graphics();
    pipe.fillStyle(0x5D6D7E, 0.2);
    pipe.fillRect(-100, -8, 200, 16);
    // Pipe joints
    pipe.fillStyle(0x7F8C8D, 0.3);
    pipe.fillRect(-100, -10, 20, 20);
    pipe.fillRect(80, -10, 20, 20);
    pipe.setPosition(x, y);
    pipe.setScrollFactor(0.2);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    this.levelData.platforms.forEach(platform => {
      for (let i = 0; i < platform.width; i++) {
        const tile = this.platforms.create(
          (platform.x + i) * tileSize + tileSize / 2,
          platform.y * tileSize + tileSize / 2,
          'platform'
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setImmovable(true);
        tile.refreshBody();
      }
    });
  }

  private createCoins(): void {
    this.coins = this.physics.add.group({
      allowGravity: false
    });
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    this.levelData.coins.forEach(coinData => {
      const coin = this.coins.create(
        coinData.x * tileSize + tileSize / 2,
        coinData.y * tileSize + tileSize / 2,
        'coin'
      ) as Phaser.Physics.Arcade.Sprite;
      
      coin.setData('originalY', coin.y);
      
      // Disable gravity for this coin
      const body = coin.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      
      // Floating animation
      this.tweens.add({
        targets: coin,
        y: coin.y - 5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Rotation animation
      this.tweens.add({
        targets: coin,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    });
  }

  private createSpikes(): void {
    this.spikes = this.physics.add.staticGroup();
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    this.levelData.spikes.forEach(spikeData => {
      const spike = this.spikes.create(
        spikeData.x * tileSize + tileSize / 2,
        spikeData.y * tileSize + tileSize / 2,
        'spike'
      ) as Phaser.Physics.Arcade.Sprite;
      
      if (spikeData.flipped) {
        spike.setFlipY(true);
      }
      
      spike.setSize(24, 24);
      spike.refreshBody();
    });
  }

  private createHome(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    this.home = this.physics.add.sprite(
      this.levelData.home.x * tileSize + tileSize / 2,
      this.levelData.home.y * tileSize,
      'home'
    );
    
    this.home.setImmovable(true);
    (this.home.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    
    // Gentle glow animation
    this.tweens.add({
      targets: this.home,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createPip(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    this.pip = this.physics.add.sprite(
      this.levelData.start.x * tileSize + tileSize / 2,
      this.levelData.start.y * tileSize + tileSize / 2,
      'pip'
    );
    
    this.pip.setCollideWorldBounds(true);
    this.pip.setBounce(0.1);
    this.pip.setDragX(100);
    
    // Set up physics body
    const body = this.pip.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 28);
    body.setOffset(4, 2);
  }

  private createUI(): void {
    const { width } = this.cameras.main;
    
    // Score display
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);
    
    // Level display
    this.levelText = this.add.text(width - 20, 20, `Level ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    
    // Flip indicator
    this.flipIndicator = this.add.text(width / 2, 50, '⬆ NORMAL ⬆', {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  private createParticles(): void {
    // Flip particles
    this.flipParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      emitting: false
    });
    
    // Coin collection particles
    this.coinParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      tint: COLORS.COIN,
      emitting: false
    });
  }

  private setupCollisions(): void {
    // PIP collides with platforms
    this.physics.add.collider(this.pip, this.platforms);
    
    // PIP collects coins
    this.physics.add.overlap(
      this.pip,
      this.coins,
      this.collectCoin,
      undefined,
      this
    );
    
    // PIP hits spikes
    this.physics.add.overlap(
      this.pip,
      this.spikes,
      this.hitSpike,
      undefined,
      this
    );
    
    // PIP reaches home
    this.physics.add.overlap(
      this.pip,
      this.home,
      this.reachHome,
      undefined,
      this
    );
  }

  private setupInput(): void {
    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', this.flip, this);
    
    // Mouse/touch input
    this.input.on('pointerdown', this.flip, this);
    
    // Restart on R key
    this.input.keyboard?.on('keydown-R', this.restartLevel, this);
    
    // Pause on ESC key
    this.input.keyboard?.on('keydown-ESC', this.pauseGame, this);
  }

  private pauseGame(): void {
    soundManager.playPause();
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  private showLevelName(): void {
    const { width, height } = this.cameras.main;
    
    const levelName = this.add.text(width / 2, height / 2, this.levelData.name, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(200);
    
    // Fade in and out
    this.tweens.add({
      targets: levelName,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => levelName.destroy()
    });
  }

  update(): void {
    if (!this.pip || !this.pip.body) return;
    
    const body = this.pip.body as Phaser.Physics.Arcade.Body;
    
    // Auto-walk: PIP always moves right
    if (!this.isFlipping) {
      body.setVelocityX(GAME_CONFIG.PIP_SPEED);
    }
    
    // Flip PIP sprite based on gravity direction
    this.pip.setFlipY(this.isFlipped);
    
    // Check if PIP fell off the world
    if (this.pip.y > 650 || this.pip.y < -50) {
      this.restartLevel();
    }
    
    // Update flip indicator
    this.flipIndicator.setText(this.isFlipped ? '⬇ FLIPPED ⬇' : '⬆ NORMAL ⬆');
  }

  private flip(): void {
    if (!this.canFlip || this.isFlipping) return;
    
    this.isFlipping = true;
    this.canFlip = false;
    
    // Play flip sound
    soundManager.playFlip();
    
    // Emit flip particles at PIP's position
    this.flipParticles.setPosition(this.pip.x, this.pip.y);
    this.flipParticles.explode(20);
    
    // Screen shake for impact
    this.cameras.main.shake(100, 0.01);
    
    // Toggle gravity
    this.isFlipped = !this.isFlipped;
    const newGravity = this.isFlipped ? -GAME_CONFIG.GRAVITY : GAME_CONFIG.GRAVITY;
    this.physics.world.gravity.y = newGravity;
    
    // Camera rotation animation
    this.tweens.add({
      targets: this.cameras.main,
      rotation: this.isFlipped ? Math.PI : 0,
      duration: GAME_CONFIG.FLIP_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.isFlipping = false;
      }
    });
    
    // Cooldown before next flip
    this.time.delayedCall(GAME_CONFIG.FLIP_DURATION + 100, () => {
      this.canFlip = true;
    });
  }

  private collectCoin(
    _pip: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
    
    // Play coin collection sound
    soundManager.playCoinCollect();
    
    // Particle burst
    this.coinParticles.setPosition(coinSprite.x, coinSprite.y);
    this.coinParticles.explode(10);
    
    // Update score
    this.score += GAME_CONFIG.COIN_SCORE;
    this.coinsCollected++;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Score popup
    const popup = this.add.text(coinSprite.x, coinSprite.y, `+${GAME_CONFIG.COIN_SCORE}`, {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: popup,
      y: popup.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy()
    });
    
    // Remove coin
    coinSprite.destroy();
  }

  private hitSpike(): void {
    // Play death sound
    soundManager.playDeath();
    
    // Flash red
    this.cameras.main.flash(200, 255, 0, 0);
    
    // Restart level
    this.restartLevel();
  }

  private reachHome(): void {
    // Prevent multiple triggers
    if (!this.pip.active) return;
    this.pip.setActive(false);
    
    // Play victory sound
    soundManager.playVictory();
    
    // Stop PIP
    const body = this.pip.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    
    // Celebration effect
    this.cameras.main.flash(500, 255, 255, 255);
    
    // Add bonus score
    this.score += GAME_CONFIG.LEVEL_COMPLETE_BONUS;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Show victory message
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
    
    // Go to next level or victory scene
    this.time.delayedCall(2000, () => {
      if (this.currentLevel < LEVELS.length) {
        this.scene.restart({ level: this.currentLevel + 1 });
      } else {
        this.scene.start('VictoryScene', { score: this.score });
      }
    });
  }

  private restartLevel(): void {
    // Reset gravity to normal before restart
    this.physics.world.gravity.y = GAME_CONFIG.GRAVITY;
    this.cameras.main.rotation = 0;
    
    // Restart scene
    this.scene.restart({ level: this.currentLevel });
  }
}
