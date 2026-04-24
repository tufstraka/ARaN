import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';

/**
 * Visual effects and juice system
 */
export class EffectsManager {
  private scene: Phaser.Scene;
  
  // Particle emitters
  private flipEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private trailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private collectEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private deathEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // Screen effects
  private vignette?: Phaser.GameObjects.Graphics;
  private scanlines?: Phaser.GameObjects.Graphics;
  private chromaOffset: number = 0;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create(): void {
    this.createParticleEmitters();
    this.createScreenEffects();
  }
  
  private createParticleEmitters(): void {
    // Create particle texture if not exists
    if (!this.scene.textures.exists('particle_soft')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      
      // Soft circle gradient
      const size = 16;
      for (let i = size; i > 0; i--) {
        const alpha = (i / size) * 0.8;
        graphics.fillStyle(0xFFFFFF, alpha);
        graphics.fillCircle(size, size, i);
      }
      graphics.generateTexture('particle_soft', size * 2, size * 2);
      graphics.destroy();
    }
    
    // Flip burst particles
    this.flipEmitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 150, max: 300 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      blendMode: 'ADD',
      tint: [COLORS.NEON_CYAN, COLORS.NEON_PINK],
      emitting: false
    }).setDepth(50);
    
    // Trail particles (continuous behind player)
    this.trailEmitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      tint: COLORS.NEON_CYAN,
      frequency: 30,
      emitting: false
    }).setDepth(5);
    
    // Gear collect particles
    this.collectEmitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      tint: [0xF39C12, 0xFFD700],
      emitting: false
    }).setDepth(50);
    
    // Death explosion
    this.deathEmitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 200, max: 400 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      tint: [COLORS.DANGER_RED, COLORS.NEON_PINK, 0xFF4444],
      emitting: false
    }).setDepth(100);
    
    // Ambient sparks (for factory atmosphere)
    this.sparkEmitter = this.scene.add.particles(0, 0, 'particle_soft', {
      x: { min: 0, max: this.scene.cameras.main.width },
      y: { min: 0, max: this.scene.cameras.main.height },
      speed: { min: 10, max: 30 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      tint: [COLORS.NEON_CYAN, COLORS.WARNING_YELLOW],
      frequency: 500,
      emitting: true
    }).setDepth(1);
  }
  
  private createScreenEffects(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Vignette overlay
    this.vignette = this.scene.add.graphics();
    this.vignette.setDepth(200);
    this.drawVignette();
    
    // CRT scanlines
    if (progression.settings.particles) {
      this.scanlines = this.scene.add.graphics();
      this.scanlines.setDepth(201);
      this.scanlines.setAlpha(0.03);
      
      this.scanlines.fillStyle(0x000000);
      for (let y = 0; y < height; y += 3) {
        this.scanlines.fillRect(0, y, width, 1);
      }
    }
    
    // Handle resize
    this.scene.scale.on('resize', this.onResize, this);
  }
  
  private drawVignette(): void {
    const { width, height } = this.scene.cameras.main;
    
    this.vignette?.clear();
    
    // Simple corner vignette (much lighter)
    const gradient = this.vignette;
    if (!gradient) return;
    
    // Only darken corners slightly
    gradient.fillStyle(0x000000, 0.15);
    gradient.fillTriangle(0, 0, 120, 0, 0, 120);
    gradient.fillTriangle(width, 0, width - 120, 0, width, 120);
    gradient.fillTriangle(0, height, 120, height, 0, height - 120);
    gradient.fillTriangle(width, height, width - 120, height, width, height - 120);
  }
  
  private onResize(): void {
    this.drawVignette();
    
    // Redraw scanlines
    if (this.scanlines) {
      const { width, height } = this.scene.cameras.main;
      this.scanlines.clear();
      this.scanlines.fillStyle(0x000000);
      for (let y = 0; y < height; y += 3) {
        this.scanlines.fillRect(0, y, width, 1);
      }
    }
  }
  
  // === PUBLIC METHODS ===
  
  emitFlip(x: number, y: number): void {
    if (!progression.settings.particles) return;
    
    this.flipEmitter?.setPosition(x, y);
    this.flipEmitter?.explode(15);
  }
  
  emitCollect(x: number, y: number): void {
    if (!progression.settings.particles) return;
    
    this.collectEmitter?.setPosition(x, y);
    this.collectEmitter?.explode(12);
  }
  
  emitDeath(x: number, y: number): void {
    this.deathEmitter?.setPosition(x, y);
    this.deathEmitter?.explode(30);
    
    // Chromatic aberration flash
    this.scene.cameras.main.setPostPipeline('');
  }
  
  startTrail(target: Phaser.GameObjects.Sprite): void {
    if (!progression.settings.particles) return;
    
    this.trailEmitter?.startFollow(target, -15, 0);
    this.trailEmitter?.start();
  }
  
  stopTrail(): void {
    this.trailEmitter?.stop();
  }
  
  updateTrailColor(isFlipped: boolean): void {
    if (this.trailEmitter) {
      this.trailEmitter.setParticleTint(isFlipped ? COLORS.NEON_PINK : COLORS.NEON_CYAN);
    }
  }
  
  /**
   * Screen flash effect
   */
  flash(color: number, duration: number = 100): void {
    const { width, height } = this.scene.cameras.main;
    
    const flash = this.scene.add.rectangle(0, 0, width, height, color, 0.5);
    flash.setOrigin(0).setDepth(150).setScrollFactor(0);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }
  
  /**
   * Slow motion effect
   */
  slowMotion(duration: number = 500, timeScale: number = 0.3): void {
    this.scene.time.timeScale = timeScale;
    this.scene.tweens.timeScale = timeScale;
    this.scene.physics.world.timeScale = 1 / timeScale;
    
    this.scene.time.delayedCall(duration * timeScale, () => {
      this.scene.time.timeScale = 1;
      this.scene.tweens.timeScale = 1;
      this.scene.physics.world.timeScale = 1;
    });
  }
  
  /**
   * Impact freeze (brief pause for emphasis)
   */
  impactFreeze(duration: number = 50): void {
    this.scene.physics.pause();
    this.scene.time.delayedCall(duration, () => {
      this.scene.physics.resume();
    });
  }
  
  /**
   * Number popup with style
   */
  popupText(x: number, y: number, text: string, options: {
    color?: string;
    size?: number;
    duration?: number;
    float?: boolean;
  } = {}): void {
    const {
      color = '#FFFFFF',
      size = 20,
      duration = 800,
      float = true
    } = options;
    
    const popup = this.scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      color: color,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: Math.max(2, size / 8)
    }).setOrigin(0.5).setDepth(100);
    
    if (float) {
      this.scene.tweens.add({
        targets: popup,
        y: y - 60,
        alpha: 0,
        scale: 1.2,
        duration: duration,
        ease: 'Power2',
        onComplete: () => popup.destroy()
      });
    } else {
      this.scene.tweens.add({
        targets: popup,
        alpha: 0,
        scale: 0.5,
        duration: duration,
        onComplete: () => popup.destroy()
      });
    }
  }
  
  /**
   * Combo indicator effect
   */
  comboFlash(combo: number): void {
    if (combo < 3) return;
    
    const intensity = Math.min(combo / 10, 1);
    const color = combo >= 8 ? COLORS.NEON_PINK : combo >= 5 ? COLORS.WARNING_YELLOW : COLORS.NEON_CYAN;
    
    this.flash(color, 80);
    
    if (combo >= 5 && progression.settings.screenShake) {
      this.scene.cameras.main.shake(100, 0.005 * intensity);
    }
  }
  
  destroy(): void {
    this.scene.scale.off('resize', this.onResize, this);
    this.flipEmitter?.destroy();
    this.trailEmitter?.destroy();
    this.collectEmitter?.destroy();
    this.deathEmitter?.destroy();
    this.sparkEmitter?.destroy();
    this.vignette?.destroy();
    this.scanlines?.destroy();
  }
}
