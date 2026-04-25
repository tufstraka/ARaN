import Phaser from 'phaser';
import { CONFIG, COLORS, UPGRADES } from '../config/gameConfig';
import { ObstacleGenerator } from '../systems/ObstacleGenerator';
import { progression } from '../managers/ProgressionManager';
import { EffectsManager } from '../managers/EffectsManager';
import { soundManager } from '../utils/SoundManager';
import { BackgroundAnimations } from '../utils/BackgroundAnimations';
// import { Background3D } from '../utils/Background3D';
import { PHASE_STORIES, getOverseerTaunt, getRandomLoreFragment } from '../data/story';

// Elegant modern fonts
const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

/**
 * Main endless runner game scene
 * ONE BUTTON CONTROLS - Tap/Space to flip gravity
 */
export class RunnerScene extends Phaser.Scene {
  // Player
  private bot!: Phaser.Physics.Arcade.Sprite;
  private isFlipped: boolean = false;
  private isFlipping: boolean = false;
  private shields: number = 0;
  private shieldVisual?: Phaser.GameObjects.Arc;
  
  // Systems
  private obstacleGenerator!: ObstacleGenerator;
  private effects!: EffectsManager;
  
  // Scoring
  private score: number = 0;
  private gears: number = 0;
  private combo: number = 1;
  private lastGearTime: number = 0;
  private maxCombo: number = 1;
  private totalFlips: number = 0;
  
  // Timing
  private runTime: number = 0;
  private scrollSpeed: number = CONFIG.BASE_SCROLL_SPEED;
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  
  // Collectibles
  private gearsGroup!: Phaser.Physics.Arcade.Group;
  
  // Background animations
  private bgAnimations?: BackgroundAnimations;
  // private bg3D?: Background3D;
  private use3DBackground: boolean = false; // Disabled - using 2D background
  
  // Background layers
  private bgLayers: Phaser.GameObjects.TileSprite[] = [];
  
  // Floor/ceiling
  private floor!: Phaser.Physics.Arcade.StaticGroup;
  private ceiling!: Phaser.Physics.Arcade.StaticGroup;
  
  // Upgrade values (cached)
  private magnetRange: number = 0;
  private timeDilationAmount: number = 0;
  private comboDecayMult: number = 1;
  private pointsMult: number = 1;
  private isNearObstacle: boolean = false;
  
  // Story/phase tracking
  private currentPhaseName: string = '';
  private shownPhaseStory: boolean = false;
  private lastTauntTime: number = 0;
  private lastLoreTime: number = 0;

  constructor() {
    super({ key: 'RunnerScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Apply upgrades
    this.applyUpgrades();
    
    // Create background
    this.createBackground();
    
    // Create floor and ceiling
    this.createBoundaries();
    
    // Create player
    this.createBot();
    
    // Initialize systems
    this.obstacleGenerator = new ObstacleGenerator(this);
    this.effects = new EffectsManager(this);
    this.effects.create();
    
    // Create gear collectibles group
    this.gearsGroup = this.physics.add.group({ allowGravity: false });
    
    // Create UI
    this.createUI();
    
    // Set up collisions
    this.setupCollisions();
    
    // Set up input - ONE BUTTON!
    this.setupInput();
    
    // Start spawning gears
    this.startGearSpawner();
    
    // Camera effects
    this.cameras.main.fadeIn(300);
    
    // Start trail effect
    this.effects.startTrail(this.bot);
    
    // Handle resize
    this.scale.on('resize', this.onResize, this);
  }
  
  private onResize(gameSize: Phaser.Structs.Size): void {
    // Update camera bounds
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    
    // Recreate boundaries
    this.floor?.clear(true, true);
    this.ceiling?.clear(true, true);
    this.createBoundaries();
    
    // Reposition bot to 15% from left
    if (this.bot) {
      const newX = Math.max(100, gameSize.width * 0.15);
      this.bot.setX(newX);
    }
    
    // Update UI positions
    this.updateUIPositions();
  }
  
  private updateUIPositions(): void {
    const { width } = this.cameras.main;
    
    this.scoreText?.setPosition(width / 2, 80);
    this.comboText?.setPosition(width / 2, 120);
    this.phaseText?.setPosition(width - 20, 70);
  }

  private applyUpgrades(): void {
    // Shield upgrade - start with shields
    const shieldLevel = progression.getUpgradeLevel('shield');
    this.shields = UPGRADES.find(u => u.id === 'shield')?.effect(shieldLevel) || 0;
    
    // Magnet upgrade - attract gears from distance
    const magnetLevel = progression.getUpgradeLevel('magnet');
    this.magnetRange = UPGRADES.find(u => u.id === 'magnet')?.effect(magnetLevel) || 0;
    
    // Time dilation - slow time near obstacles
    const timeDilationLevel = progression.getUpgradeLevel('timeDilation');
    this.timeDilationAmount = UPGRADES.find(u => u.id === 'timeDilation')?.effect(timeDilationLevel) || 0;
    
    // Combo extend - combos last longer
    const comboExtendLevel = progression.getUpgradeLevel('comboExtend');
    this.comboDecayMult = 1 + (UPGRADES.find(u => u.id === 'comboExtend')?.effect(comboExtendLevel) || 0) / 100;
    
    // Double points - score multiplier
    const doublePointsLevel = progression.getUpgradeLevel('doublePoints');
    this.pointsMult = 1 + (UPGRADES.find(u => u.id === 'doublePoints')?.effect(doublePointsLevel) || 0) / 100;
    
    // Debug log
    console.log('Upgrades applied:', {
      shields: this.shields,
      magnetRange: this.magnetRange,
      timeDilation: this.timeDilationAmount + '%',
      comboDecay: this.comboDecayMult + 'x',
      pointsMult: this.pointsMult + 'x'
    });
  }

  private createBackground(): void {
    // 2D parallax background
    this.bgAnimations = new BackgroundAnimations(this);
    this.bgAnimations.create();
  }

  private createBoundaries(): void {
    const { width, height } = this.cameras.main;
    
    // Floor
    this.floor = this.physics.add.staticGroup();
    const floorSprite = this.floor.create(width / 2, height - 30, '') as Phaser.Physics.Arcade.Sprite;
    floorSprite.setDisplaySize(width, 60);
    floorSprite.setVisible(false);
    floorSprite.refreshBody();
    
    // Visual floor - BRIGHTER
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x4a5568); // Brighter steel
    floorGraphics.fillRect(0, height - 60, width, 60);
    // Top edge highlight
    floorGraphics.fillStyle(0x00FFFF, 0.3);
    floorGraphics.fillRect(0, height - 60, width, 3);
    // Rivets
    for (let x = 20; x < width; x += 50) {
      floorGraphics.fillStyle(0x9CA3AF);
      floorGraphics.fillCircle(x, height - 45, 4);
      floorGraphics.fillCircle(x, height - 20, 4);
    }
    // Warning stripes
    floorGraphics.fillStyle(0xFFD700, 0.2);
    for (let x = 0; x < width; x += 40) {
      floorGraphics.fillRect(x, height - 60, 20, 5);
    }
    
    // Ceiling
    this.ceiling = this.physics.add.staticGroup();
    const ceilingSprite = this.ceiling.create(width / 2, 30, '') as Phaser.Physics.Arcade.Sprite;
    ceilingSprite.setDisplaySize(width, 60);
    ceilingSprite.setVisible(false);
    ceilingSprite.refreshBody();
    
    // Visual ceiling - BRIGHTER
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4a5568);
    ceilingGraphics.fillRect(0, 0, width, 60);
    // Bottom edge highlight
    ceilingGraphics.fillStyle(0xFF0080, 0.3);
    ceilingGraphics.fillRect(0, 57, width, 3);
    // Industrial pipes
    for (let x = 30; x < width; x += 100) {
      ceilingGraphics.fillStyle(0x8B4513); // Rust
      ceilingGraphics.fillRect(x, 45, 30, 15);
      ceilingGraphics.fillStyle(0xAA5500);
      ceilingGraphics.fillCircle(x + 15, 52, 6);
    }
  }

  private createBot(): void {
    const { width, height } = this.cameras.main;
    
    // Position robot at 15% from left edge (responsive)
    const botX = Math.max(100, width * 0.15);
    
    this.bot = this.physics.add.sprite(botX, height - 100, 'pip');
    this.bot.setScale(1.0); // Robot is now 48x48 with full body
    this.bot.setCollideWorldBounds(true);
    this.bot.setBounce(0);
    this.bot.setGravityY(CONFIG.GRAVITY);
    this.bot.setMaxVelocity(500, CONFIG.BOT_TERMINAL_VELOCITY);
    
    // 3D-style shadow beneath robot
    const shadow = this.add.ellipse(botX, height - 50, 40, 12, 0x000000, 0.3);
    shadow.setDepth(0);
    this.bot.setData('shadow', shadow);
    
    // Cyan glow effect (enhanced for 3D look)
    const glow = this.add.graphics();
    glow.fillStyle(COLORS.NEON_CYAN, 0.15);
    glow.fillCircle(0, 0, 35);
    glow.fillStyle(COLORS.NEON_CYAN, 0.25);
    glow.fillCircle(0, 0, 28);
    
    // Update glow position in update()
    this.bot.setData('glow', glow);
    
    // Shield visual if shields > 0
    if (this.shields > 0) {
      this.updateShieldVisual();
    }
  }

  private updateShieldVisual(): void {
    if (this.shieldVisual) {
      this.shieldVisual.destroy();
    }
    
    if (this.shields > 0) {
      this.shieldVisual = this.add.circle(this.bot.x, this.bot.y, 28, COLORS.NEON_CYAN, 0.2);
      this.shieldVisual.setStrokeStyle(2, COLORS.NEON_CYAN, 0.6);
    }
  }

  private createUI(): void {
    const { width } = this.cameras.main;
    
    // Score - clean and prominent
    this.scoreText = this.add.text(width / 2, 80, '0', {
      fontSize: '48px',
      color: '#00FFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    this.scoreText.setShadow(0, 0, '#00FFFF', 10, false, true);
    
    // Combo multiplier
    this.comboText = this.add.text(width / 2, 125, '', {
      fontSize: '20px',
      color: '#FF0080',
      fontFamily: BODY_FONT
    }).setOrigin(0.5).setDepth(100);
    
    // Timer
    this.timerText = this.add.text(20, 70, '00:00', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: BODY_FONT
    }).setDepth(100);
    
    // Phase indicator
    this.phaseText = this.add.text(width - 20, 70, 'BOOT SEQUENCE', {
      fontSize: '12px',
      color: '#39FF14',
      fontFamily: BODY_FONT
    }).setOrigin(1, 0).setDepth(100);
    
    // Gears count
    this.add.text(20, 95, '⚙️', { fontSize: '20px' }).setDepth(100);
    this.add.text(45, 95, '0', {
      fontSize: '20px',
      color: '#F39C12',
      fontFamily: BODY_FONT
    }).setDepth(100).setName('gearsText');
  }

  private setupCollisions(): void {
    // Bot vs floor/ceiling
    this.physics.add.collider(this.bot, this.floor);
    this.physics.add.collider(this.bot, this.ceiling);
    
    // Bot vs obstacles
    this.physics.add.overlap(
      this.bot,
      this.obstacleGenerator.getHitboxGroup(),
      this.hitObstacle,
      undefined,
      this
    );
    
    // Bot vs gears
    this.physics.add.overlap(
      this.bot,
      this.gearsGroup,
      this.collectGear,
      undefined,
      this
    );
  }

  private setupInput(): void {
    // Keyboard - Space
    this.input.keyboard?.on('keydown-SPACE', this.flip, this);
    
    // Touch/Click
    this.input.on('pointerdown', this.flip, this);
    
    // Pause on ESC
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene', { fromRunner: true });
    });
  }

  private flip(): void {
    if (this.isFlipping) return;
    
    this.isFlipping = true;
    this.isFlipped = !this.isFlipped;
    this.totalFlips++;
    
    // Flip gravity
    const newGravity = this.isFlipped ? -CONFIG.GRAVITY : CONFIG.GRAVITY;
    this.bot.setGravityY(newGravity);
    
    // Visual flip
    this.tweens.add({
      targets: this.bot,
      scaleY: this.isFlipped ? -1 : 1,
      duration: CONFIG.FLIP_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.isFlipping = false;
      }
    });
    
    // Screen shake
    if (progression.settings.screenShake) {
      this.cameras.main.shake(
        CONFIG.SHAKE_FLIP.duration,
        CONFIG.SHAKE_FLIP.intensity
      );
    }
    
    // Particles and effects
    this.effects.emitFlip(this.bot.x, this.bot.y);
    this.effects.updateTrailColor(this.isFlipped);
    
    // Sound
    soundManager.playFlip();
  }

  private startGearSpawner(): void {
    // Spawn gears periodically
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnGear,
      callbackScope: this,
      loop: true
    });
  }

  private spawnGear(): void {
    const { width, height } = this.cameras.main;
    const y = Phaser.Math.Between(100, height - 100);
    
    const gear = this.gearsGroup.create(width + 50, y, 'coin') as Phaser.Physics.Arcade.Sprite;
    (gear.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    gear.setVelocityX(-this.scrollSpeed);
    
    // Spin animation
    this.tweens.add({
      targets: gear,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private collectGear(
    _bot: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    gear: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const gearSprite = gear as Phaser.Physics.Arcade.Sprite;
    
    // Update combo
    const now = Date.now();
    const comboExtend = progression.getUpgradeLevel('comboExtend');
    const comboDecay = CONFIG.COMBO_DECAY_TIME * this.comboDecayMult;
    
    if (now - this.lastGearTime < comboDecay) {
      this.combo = Math.min(this.combo + 1, CONFIG.COMBO_MULTIPLIER_MAX);
    } else {
      this.combo = 1;
    }
    this.lastGearTime = now;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    
    // Add score with combo (using cached pointsMult)
    const points = Math.floor(CONFIG.POINTS_PER_GEAR * this.combo * this.pointsMult);
    this.score += points;
    this.gears++;
    
    // Update UI
    this.updateUI();
    
    // Effects
    this.effects.emitCollect(gearSprite.x, gearSprite.y);
    this.effects.comboFlash(this.combo);
    this.effects.popupText(gearSprite.x, gearSprite.y, `+${points}`, {
      color: this.combo >= 5 ? '#FF0080' : this.combo >= 3 ? '#FFD700' : '#FFFFFF',
      size: this.combo >= 5 ? 28 : 20
    });
    
    soundManager.playCoinCollect();
    
    gearSprite.destroy();
  }

  private hitObstacle(): void {
    // Check for shield
    if (this.shields > 0) {
      this.shields--;
      this.updateShieldVisual();
      
      // Shield break effect
      this.effects.flash(COLORS.NEON_CYAN, 200);
      this.effects.impactFreeze(30);
      soundManager.playFlip();
      
      // Brief invulnerability
      this.bot.setAlpha(0.5);
      this.time.delayedCall(500, () => {
        this.bot.setAlpha(1);
      });
      
      return;
    }
    
    // Death!
    this.gameOver();
  }

  private gameOver(): void {
    // Stop effects
    this.effects.stopTrail();
    
    // Stop physics
    this.physics.pause();
    
    // Death effects
    soundManager.playDeath();
    this.effects.emitDeath(this.bot.x, this.bot.y);
    this.effects.impactFreeze(100);
    this.cameras.main.shake(CONFIG.SHAKE_DEATH.duration, CONFIG.SHAKE_DEATH.intensity);
    this.effects.flash(COLORS.DANGER_RED, 300);
    
    // Record run
    progression.recordRun(
      this.score,
      this.runTime,
      this.gears,
      this.totalFlips,
      this.maxCombo,
      this.currentPhaseName
    );
    
    // Show game over after brief delay
    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        gears: this.gears,
        time: this.runTime,
        maxCombo: this.maxCombo,
        isNewBest: this.score > (progression.stats.bestScore - this.score)
      });
    });
  }

  update(time: number, delta: number): void {
    if (!this.bot || !this.bot.active) return;
    
    // Update run time
    this.runTime += delta / 1000;
    
    // Check if near obstacle for time dilation
    this.isNearObstacle = this.obstacleGenerator.isObstacleNearPlayer(this.bot.x, this.bot.y, 150);
    
    // Apply time dilation if near obstacle and have upgrade
    let effectiveDelta = delta;
    if (this.isNearObstacle && this.timeDilationAmount > 0) {
      effectiveDelta = delta * (1 - this.timeDilationAmount / 100);
      // Visual feedback - slight tint
      this.bot.setTint(0x8888FF);
    } else {
      this.bot.clearTint();
    }
    
    // Update scroll speed (gradually increases)
    const speedMult = this.obstacleGenerator.getScrollSpeedMultiplier();
    const baseSpeed = CONFIG.BASE_SCROLL_SPEED * speedMult + (this.runTime * CONFIG.SPEED_INCREASE_RATE);
    // Apply time dilation to scroll speed
    const dilatedSpeed = this.isNearObstacle && this.timeDilationAmount > 0 
      ? baseSpeed * (1 - this.timeDilationAmount / 100)
      : baseSpeed;
    this.scrollSpeed = Math.min(dilatedSpeed, CONFIG.MAX_SCROLL_SPEED);
    
    // Update obstacle generator
    this.obstacleGenerator.update(effectiveDelta, this.scrollSpeed);
    
    // Update gear velocities + MAGNET ATTRACTION
    this.gearsGroup.getChildren().forEach(child => {
      const gear = child as Phaser.Physics.Arcade.Sprite;
      
      // Base movement
      let vx = -this.scrollSpeed;
      let vy = 0;
      
      // Magnet attraction
      if (this.magnetRange > 0) {
        const dx = this.bot.x - gear.x;
        const dy = this.bot.y - gear.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.magnetRange && dist > 10) {
          // Attract towards player
          const strength = (1 - dist / this.magnetRange) * 400; // Stronger when closer
          vx += (dx / dist) * strength;
          vy += (dy / dist) * strength;
          
          // Visual feedback - gear glows when attracted
          gear.setTint(0x00FFFF);
        } else {
          gear.clearTint();
        }
      }
      
      gear.setVelocity(vx, vy);
      
      // Cleanup off-screen gears
      if (gear.x < -50) {
        gear.destroy();
      }
    });
    
    // Update glow position
    const glow = this.bot.getData('glow') as Phaser.GameObjects.Graphics;
    if (glow) {
      glow.setPosition(this.bot.x, this.bot.y);
    }
    
    // Update shadow position (3D effect)
    const shadow = this.bot.getData('shadow') as Phaser.GameObjects.Ellipse;
    if (shadow) {
      const { height } = this.cameras.main;
      // Shadow stays on ground, stretches based on height
      const groundY = this.isFlipped ? 70 : height - 50;
      const distFromGround = Math.abs(this.bot.y - groundY);
      const shadowScale = Math.max(0.3, 1 - distFromGround / 200);
      shadow.setPosition(this.bot.x, groundY);
      shadow.setScale(shadowScale, shadowScale * 0.5);
      shadow.setAlpha(0.3 * shadowScale);
    }
    
    // Update shield position
    if (this.shieldVisual) {
      this.shieldVisual.setPosition(this.bot.x, this.bot.y);
    }
    
    // Update score from time (using cached pointsMult)
    this.score += Math.floor(CONFIG.POINTS_PER_SECOND * (delta / 1000) * this.pointsMult);
    
    // Check combo decay (using cached comboDecayMult)
    const comboDecay = CONFIG.COMBO_DECAY_TIME * this.comboDecayMult;
    if (Date.now() - this.lastGearTime > comboDecay && this.combo > 1) {
      this.combo = 1;
    }
    
    // Update UI
    this.updateUI();
    
    // Overseer taunts (every 25-40 seconds after 15s)
    const now = Date.now();
    if (this.runTime > 15 && now - this.lastTauntTime > 25000 + Math.random() * 15000) {
      this.showOverseerTaunt();
      this.lastTauntTime = now;
    }
    
    // Lore fragments (chance every 30s+ when score > 500)
    if (this.score > 500 && now - this.lastLoreTime > 30000 && Math.random() < 0.002) {
      this.showLoreFragment();
      this.lastLoreTime = now;
    }
    
    // Update background
    if (this.bgAnimations) {
      this.bgAnimations.update(this.scrollSpeed, delta);
    }
  }

  private updateUI(): void {
    this.scoreText.setText(this.score.toString());
    
    // Combo display
    if (this.combo > 1) {
      this.comboText.setText(`${this.combo}x COMBO`);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }
    
    // Timer
    const mins = Math.floor(this.runTime / 60);
    const secs = Math.floor(this.runTime % 60);
    this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    
    // Phase - check for phase change and show story
    const newPhaseName = this.obstacleGenerator.getCurrentPhaseName();
    if (newPhaseName !== this.currentPhaseName) {
      this.currentPhaseName = newPhaseName;
      this.showPhaseStory(newPhaseName);
    }
    this.phaseText.setText(newPhaseName);
    
    // Gears
    const gearsText = this.children.getByName('gearsText') as Phaser.GameObjects.Text;
    if (gearsText) {
      gearsText.setText(this.gears.toString());
    }
  }
  
  /**
   * Show story text when entering a new phase
   */
  private showPhaseStory(phaseName: string): void {
    const story = PHASE_STORIES[phaseName];
    if (!story) return;
    
    const { width, height } = this.cameras.main;
    
    // Create story overlay
    const storyContainer = this.add.container(width / 2, height / 2);
    storyContainer.setDepth(200);
    
    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-180, -50, 360, 100, 8);
    storyContainer.add(bg);
    
    // Story title
    const title = this.add.text(0, -30, story.title, {
      fontSize: '18px',
      color: '#00FFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    storyContainer.add(title);
    
    // Story text
    const text = this.add.text(0, 10, story.text, {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: BODY_FONT,
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);
    storyContainer.add(text);
    
    // Animate in
    storyContainer.setAlpha(0);
    storyContainer.setScale(0.8);
    
    this.tweens.add({
      targets: storyContainer,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Fade out after delay
    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: storyContainer,
        alpha: 0,
        y: storyContainer.y - 30,
        duration: 500,
        ease: 'Power2',
        onComplete: () => storyContainer.destroy()
      });
    });
  }
  
  /**
   * Show Overseer taunt message
   */
  private showOverseerTaunt(): void {
    const { width } = this.cameras.main;
    const taunt = getOverseerTaunt();
    
    const tauntText = this.add.text(width / 2, 160, `"${taunt}"`, {
      fontSize: '11px',
      color: '#FF4444',
      fontFamily: BODY_FONT,
      fontStyle: 'italic',
      wordWrap: { width: 300 },
      align: 'center'
    }).setOrigin(0.5).setAlpha(0).setDepth(150);
    
    // Overseer label
    const label = this.add.text(width / 2, 145, '— THE OVERSEER —', {
      fontSize: '8px',
      color: '#882222',
      fontFamily: BODY_FONT,
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0).setDepth(150);
    
    // Animate in
    this.tweens.add({
      targets: [tauntText, label],
      alpha: 0.9,
      duration: 500,
      ease: 'Power2'
    });
    
    // Fade out
    this.time.delayedCall(3500, () => {
      this.tweens.add({
        targets: [tauntText, label],
        alpha: 0,
        duration: 800,
        onComplete: () => {
          tauntText.destroy();
          label.destroy();
        }
      });
    });
  }
  
  /**
   * Show lore fragment discovery
   */
  private showLoreFragment(): void {
    const fragment = getRandomLoreFragment(this.score);
    if (!fragment) return;
    
    const { width, height } = this.cameras.main;
    
    // Container for the lore popup
    const container = this.add.container(width / 2, height - 100);
    container.setDepth(200);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x001122, 0.85);
    bg.fillRoundedRect(-160, -40, 320, 80, 6);
    bg.lineStyle(1, 0x00FFFF, 0.5);
    bg.strokeRoundedRect(-160, -40, 320, 80, 6);
    container.add(bg);
    
    // Category label
    const category = this.add.text(0, -28, `[ ${fragment.category} ]`, {
      fontSize: '8px',
      color: '#00FFFF',
      fontFamily: BODY_FONT,
      letterSpacing: 2
    }).setOrigin(0.5);
    container.add(category);
    
    // Title
    const title = this.add.text(0, -12, fragment.title, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);
    
    // Text
    const text = this.add.text(0, 15, fragment.text, {
      fontSize: '9px',
      color: '#aaaaaa',
      fontFamily: BODY_FONT,
      wordWrap: { width: 300 },
      align: 'center'
    }).setOrigin(0.5);
    container.add(text);
    
    // Animate
    container.setAlpha(0);
    container.setY(height - 60);
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: height - 100,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Fade out
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        y: height - 120,
        duration: 600,
        onComplete: () => container.destroy()
      });
    });
  }
}
