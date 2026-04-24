import Phaser from 'phaser';
import { CONFIG, COLORS, DIFFICULTY_PHASES, PATTERNS, ObstacleType } from '../config/gameConfig';
import { soundManager } from '../utils/SoundManager';

interface Obstacle {
  sprite: Phaser.GameObjects.GameObject;
  type: ObstacleType;
  hitbox?: Phaser.Physics.Arcade.Sprite;
}

/**
 * Procedurally generates obstacles based on difficulty
 */
export class ObstacleGenerator {
  private scene: Phaser.Scene;
  private obstacles: Obstacle[] = [];
  private obstaclePool: Phaser.Physics.Arcade.Group;
  private lastSpawnTime: number = 0;
  private runTime: number = 0;
  
  // Difficulty tracking
  private currentPhaseIndex: number = 0;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.obstaclePool = scene.physics.add.group();
  }
  
  reset(): void {
    this.obstacles.forEach(o => {
      o.sprite.destroy();
      o.hitbox?.destroy();
    });
    this.obstacles = [];
    this.lastSpawnTime = 0;
    this.runTime = 0;
    this.currentPhaseIndex = 0;
  }
  
  update(delta: number, scrollSpeed: number): void {
    this.runTime += delta / 1000;
    
    // Update difficulty phase
    this.updatePhase();
    
    // Move existing obstacles
    this.moveObstacles(delta, scrollSpeed);
    
    // Spawn new obstacles
    this.trySpawn(scrollSpeed);
    
    // Clean up off-screen obstacles
    this.cleanup();
  }
  
  private updatePhase(): void {
    for (let i = DIFFICULTY_PHASES.length - 1; i >= 0; i--) {
      if (this.runTime >= DIFFICULTY_PHASES[i].startTime) {
        if (i !== this.currentPhaseIndex) {
          this.currentPhaseIndex = i;
          this.onPhaseChange(DIFFICULTY_PHASES[i]);
        }
        break;
      }
    }
  }
  
  private onPhaseChange(phase: typeof DIFFICULTY_PHASES[0]): void {
    // Play warning sound
    soundManager.playPhaseChange();
    
    // Show phase name
    const { width, height } = this.scene.cameras.main;
    const text = this.scene.add.text(width / 2, height / 3, phase.name, {
      fontSize: '32px',
      color: '#FF0080',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 50,
      duration: 2000,
      onComplete: () => text.destroy()
    });
  }
  
  private get currentPhase() {
    return DIFFICULTY_PHASES[this.currentPhaseIndex];
  }
  
  private trySpawn(scrollSpeed: number): void {
    const phase = this.currentPhase;
    const baseFreq = CONFIG.OBSTACLE_BASE_FREQUENCY * phase.obstacleFreqMult;
    
    if (this.runTime - this.lastSpawnTime < baseFreq) return;
    
    // Pick random pattern from current phase
    const patterns = phase.availablePatterns;
    const patternKey = patterns[Math.floor(Math.random() * patterns.length)];
    const pattern = PATTERNS[patternKey];
    
    if (pattern) {
      this.spawnPattern(pattern);
    }
    
    this.lastSpawnTime = this.runTime;
  }
  
  private spawnPattern(pattern: typeof PATTERNS[string]): void {
    const { width, height } = this.scene.cameras.main;
    const startX = width + 100;
    
    pattern.forEach((def, index) => {
      const delay = (def.delay || 0) * 1000;
      
      this.scene.time.delayedCall(delay, () => {
        this.spawnObstacle(def.type, startX, def.y, def.width);
      });
    });
  }
  
  private spawnObstacle(type: ObstacleType, x: number, yNorm?: number, widthTiles?: number): void {
    const { height } = this.scene.cameras.main;
    const tileSize = 32;
    const floorY = height - 60;
    const ceilingY = 60;
    
    let obstacle: Obstacle;
    
    switch (type) {
      case 'spike_floor':
        obstacle = this.createSpikes(x, floorY, widthTiles || 3, false);
        break;
      case 'spike_ceiling':
        obstacle = this.createSpikes(x, ceilingY, widthTiles || 3, true);
        break;
      case 'spike_both':
        // Create gap in middle
        this.createSpikes(x, floorY, widthTiles || 4, false);
        obstacle = this.createSpikes(x, ceilingY, widthTiles || 4, true);
        break;
      case 'crusher':
        obstacle = this.createCrusher(x, yNorm === 0 ? ceilingY : floorY, yNorm === 0);
        break;
      case 'laser_horizontal':
        const laserY = ceilingY + (floorY - ceilingY) * (yNorm || 0.5);
        obstacle = this.createLaser(x, laserY, true);
        break;
      case 'gap':
        obstacle = this.createGap(x, floorY, widthTiles || 4);
        break;
      default:
        obstacle = this.createSpikes(x, floorY, 3, false);
    }
    
    this.obstacles.push(obstacle);
  }
  
  private createSpikes(x: number, y: number, widthTiles: number, flipped: boolean): Obstacle {
    const container = this.scene.add.container(x, y);
    
    for (let i = 0; i < widthTiles; i++) {
      const spike = this.scene.add.graphics();
      spike.fillStyle(COLORS.DANGER_RED);
      
      if (flipped) {
        spike.fillTriangle(0, 0, 16, 32, 32, 0);
      } else {
        spike.fillTriangle(0, 32, 16, 0, 32, 32);
      }
      
      spike.setPosition(i * 32, flipped ? 0 : -32);
      container.add(spike);
    }
    
    // Hitbox
    const hitbox = this.scene.physics.add.sprite(x + (widthTiles * 16), y + (flipped ? 16 : -16), '');
    hitbox.setVisible(false);
    hitbox.body.setSize(widthTiles * 32, 24);
    (hitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    hitbox.setImmovable(true);
    hitbox.setData('type', 'spike');
    
    this.obstaclePool.add(hitbox);
    
    return { sprite: container, type: 'spike_floor', hitbox };
  }
  
  private createCrusher(x: number, y: number, fromTop: boolean): Obstacle {
    const graphics = this.scene.add.graphics();
    
    // Piston body
    graphics.fillStyle(COLORS.STEEL);
    graphics.fillRect(0, 0, 48, 80);
    
    // Warning stripes
    graphics.fillStyle(COLORS.WARNING_YELLOW);
    graphics.fillRect(0, 20, 48, 8);
    graphics.fillRect(0, 52, 48, 8);
    
    // Danger head
    graphics.fillStyle(COLORS.DANGER_RED);
    graphics.fillRect(0, fromTop ? 70 : 0, 48, 10);
    
    graphics.setPosition(x, fromTop ? y - 80 : y);
    
    // Animate crusher
    const targetY = fromTop ? y + 60 : y - 140;
    this.scene.tweens.add({
      targets: graphics,
      y: targetY,
      duration: 800,
      ease: 'Power2',
      yoyo: true,
      repeat: 0,
      delay: 200
    });
    
    // Hitbox
    const hitbox = this.scene.physics.add.sprite(x + 24, y, '');
    hitbox.setVisible(false);
    hitbox.body.setSize(48, 80);
    (hitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    hitbox.setData('type', 'crusher');
    
    this.obstaclePool.add(hitbox);
    
    return { sprite: graphics, type: 'crusher', hitbox };
  }
  
  private createLaser(x: number, y: number, horizontal: boolean): Obstacle {
    const { width } = this.scene.cameras.main;
    
    // Emitter points
    const emitter1 = this.scene.add.circle(x, y, 8, COLORS.DANGER_RED);
    const emitter2 = this.scene.add.circle(x, y, 8, COLORS.DANGER_RED);
    
    // Laser beam
    const beam = this.scene.add.rectangle(x, y, 200, 6, COLORS.DANGER_RED, 0.8);
    
    // Pulse effect
    this.scene.tweens.add({
      targets: beam,
      alpha: 0.4,
      duration: 100,
      yoyo: true,
      repeat: -1
    });
    
    // Hitbox
    const hitbox = this.scene.physics.add.sprite(x, y, '');
    hitbox.setVisible(false);
    hitbox.body.setSize(200, 6);
    (hitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    hitbox.setData('type', 'laser');
    
    this.obstaclePool.add(hitbox);
    
    const container = this.scene.add.container(0, 0, [emitter1, emitter2, beam]);
    
    return { sprite: container, type: 'laser_horizontal', hitbox };
  }
  
  private createGap(x: number, y: number, widthTiles: number): Obstacle {
    // Gap is absence of floor - create invisible death zone
    const hitbox = this.scene.physics.add.sprite(x + (widthTiles * 16), y + 50, '');
    hitbox.setVisible(false);
    hitbox.body.setSize(widthTiles * 32, 100);
    (hitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    hitbox.setData('type', 'gap');
    
    this.obstaclePool.add(hitbox);
    
    // Visual gap markers
    const marker = this.scene.add.graphics();
    marker.fillStyle(COLORS.WARNING_YELLOW, 0.5);
    marker.fillRect(x, y - 10, widthTiles * 32, 4);
    
    return { sprite: marker, type: 'gap', hitbox };
  }
  
  private moveObstacles(delta: number, scrollSpeed: number): void {
    const moveAmount = scrollSpeed * (delta / 1000);
    
    this.obstacles.forEach(obs => {
      if (obs.sprite instanceof Phaser.GameObjects.Container) {
        obs.sprite.x -= moveAmount;
      } else if (obs.sprite instanceof Phaser.GameObjects.Graphics) {
        obs.sprite.x -= moveAmount;
      }
      
      if (obs.hitbox) {
        obs.hitbox.x -= moveAmount;
      }
    });
  }
  
  private cleanup(): void {
    this.obstacles = this.obstacles.filter(obs => {
      let x = 0;
      if (obs.sprite instanceof Phaser.GameObjects.Container) {
        x = obs.sprite.x;
      } else if (obs.sprite instanceof Phaser.GameObjects.Graphics) {
        x = obs.sprite.x;
      }
      
      if (x < -200) {
        obs.sprite.destroy();
        obs.hitbox?.destroy();
        return false;
      }
      return true;
    });
  }
  
  getHitboxGroup(): Phaser.Physics.Arcade.Group {
    return this.obstaclePool;
  }
  
  getCurrentPhaseName(): string {
    return this.currentPhase.name;
  }
  
  getScrollSpeedMultiplier(): number {
    return this.currentPhase.scrollSpeedMult;
  }
}
