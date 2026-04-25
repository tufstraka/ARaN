import Phaser from 'phaser';
import { GAME_CONFIG, LevelData } from '../config/constants';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private _active: boolean = true;
  
  private glowSprite?: Phaser.GameObjects.Sprite;
  private shadowSprite?: Phaser.GameObjects.Ellipse;
  private trailParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private breatheTween?: Phaser.Tweens.Tween;
  private bobTween?: Phaser.Tweens.Tween;
  private glowTween?: Phaser.Tweens.Tween;
  private lastVelocityY: number = 0;
  private isLanding: boolean = false;
  private wasOnGround: boolean = true;

  constructor(scene: Phaser.Scene, levelData: LevelData) {
    this.scene = scene;
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const startX = levelData.start.x * tileSize + tileSize / 2;
    const startY = levelData.start.y * tileSize + tileSize / 2;

    this.shadowSprite = scene.add.ellipse(startX, startY + 28, 32, 10, 0x000000, 0.3);
    this.shadowSprite.setDepth(4);

    if (scene.textures.exists('pip_glow')) {
      this.glowSprite = scene.add.sprite(startX, startY, 'pip_glow');
      this.glowSprite.setDepth(5);
      this.glowSprite.setAlpha(0.4);
      this.glowSprite.setScale(1.5);
      this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
      
      this.glowTween = scene.tweens.add({
        targets: this.glowSprite,
        alpha: { from: 0.3, to: 0.6 },
        scale: { from: 1.4, to: 1.7 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.sprite = scene.physics.add.sprite(startX, startY, 'pip');
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.15);
    this.sprite.setDragX(120);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 38);
    body.setOffset(16, 13);

    this.createTrailParticles();
    this.startIdleAnimations();
    this.playSpawnAnimation();
  }

  private createTrailParticles(): void {
    if (!this.scene.textures.exists('particle_soft')) return;
    
    this.trailParticles = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 400,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0x00FFFF, 0x00DDFF, 0x66FFFF],
      frequency: 40,
      emitting: true
    });
    this.trailParticles.setDepth(6);
    this.trailParticles.startFollow(this.sprite, -20, 0);
  }

  private startIdleAnimations(): void {
    this.breatheTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 0.97 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.bobTween = this.scene.tweens.add({
      targets: this.sprite,
      y: '+=2',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private playSpawnAnimation(): void {
    this.sprite.setScale(0);
    this.sprite.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      alpha: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: { from: 1, to: 0.5 },
          duration: 100,
          yoyo: true,
          repeat: 2
        });
      }
    });
    
    if (this.glowSprite) {
      this.glowSprite.setScale(0);
      this.scene.tweens.add({
        targets: this.glowSprite,
        scale: 2,
        alpha: { from: 0.8, to: 0.4 },
        duration: 600,
        ease: 'Power2'
      });
    }
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get active(): boolean {
    return this._active;
  }

  update(isFlipped: boolean, isFlipping: boolean, speedMultiplier: number = 1): void {
    if (!this.sprite || !this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.blocked.up;

    if (!isFlipping) {
      body.setVelocityX(GAME_CONFIG.PIP_SPEED * speedMultiplier);
    }

    this.sprite.setFlipY(isFlipped);
    this.updateVisualEffects(isFlipped, onGround);
    this.handleSquashStretch(body, onGround);
    this.handleLanding(body, onGround);
    this.updateTrailColor(isFlipped);
    
    this.lastVelocityY = body.velocity.y;
    this.wasOnGround = onGround;
  }

  private updateVisualEffects(isFlipped: boolean, onGround: boolean): void {
    if (this.glowSprite) {
      this.glowSprite.setPosition(this.sprite.x, this.sprite.y);
      this.glowSprite.setFlipY(isFlipped);
    }
    
    if (this.shadowSprite) {
      const shadowOffset = isFlipped ? -28 : 28;
      this.shadowSprite.setPosition(this.sprite.x, this.sprite.y + shadowOffset);
      
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      const velocityFactor = Math.min(Math.abs(body.velocity.y) / 300, 1);
      const shadowScale = onGround ? 1 : 1 - velocityFactor * 0.5;
      const shadowAlpha = onGround ? 0.3 : 0.3 - velocityFactor * 0.2;
      
      this.shadowSprite.setScale(shadowScale, shadowScale * 0.4);
      this.shadowSprite.setAlpha(shadowAlpha);
    }
  }

  private handleSquashStretch(body: Phaser.Physics.Arcade.Body, onGround: boolean): void {
    const velocityY = body.velocity.y;
    const velocityX = Math.abs(body.velocity.x);
    
    let scaleX = 1;
    let scaleY = 1;
    
    if (!onGround) {
      const stretchFactor = Math.min(Math.abs(velocityY) / 400, 0.2);
      if (velocityY > 50) {
        scaleX = 1 - stretchFactor * 0.5;
        scaleY = 1 + stretchFactor;
      } else if (velocityY < -50) {
        scaleX = 1 - stretchFactor * 0.3;
        scaleY = 1 + stretchFactor * 0.6;
      }
    } else {
      const runSquash = Math.min(velocityX / 300, 0.05);
      scaleX = 1 + runSquash;
      scaleY = 1 - runSquash * 0.5;
    }
    
    const currentScaleX = this.sprite.scaleX;
    const currentScaleY = this.sprite.scaleY;
    this.sprite.setScale(
      Phaser.Math.Linear(currentScaleX, scaleX, 0.15),
      Phaser.Math.Linear(currentScaleY, scaleY, 0.15)
    );
  }

  private handleLanding(body: Phaser.Physics.Arcade.Body, onGround: boolean): void {
    if (onGround && !this.wasOnGround && Math.abs(this.lastVelocityY) > 100) {
      this.isLanding = true;
      const impactStrength = Math.min(Math.abs(this.lastVelocityY) / 500, 0.3);
      
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1 + impactStrength,
        scaleY: 1 - impactStrength,
        duration: 80,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          this.isLanding = false;
        }
      });
      
      this.emitLandingParticles();
      
      if (this.shadowSprite) {
        this.scene.tweens.add({
          targets: this.shadowSprite,
          scaleX: 1.5,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
      }
    }
  }

  private emitLandingParticles(): void {
    if (!this.scene.textures.exists('particle_soft')) return;
    
    const burst = this.scene.add.particles(this.sprite.x, this.sprite.y + 20, 'particle_soft', {
      speed: { min: 50, max: 150 },
      angle: { min: -150, max: -30 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0x00FFFF, 0x66FFFF],
      quantity: 8
    });
    burst.setDepth(5);
    burst.explode(8);
    
    this.scene.time.delayedCall(400, () => {
      burst.destroy();
    });
  }

  private updateTrailColor(isFlipped: boolean): void {
    if (this.trailParticles) {
      const tint = isFlipped ? [0xFF0088, 0xFF66AA, 0xFF00FF] : [0x00FFFF, 0x00DDFF, 0x66FFFF];
      this.trailParticles.setParticleTint(tint);
    }
  }

  playFlipAnimation(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      angle: this.sprite.flipY ? -360 : 360,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.setAngle(0);
      }
    });
    
    if (this.glowSprite) {
      this.scene.tweens.add({
        targets: this.glowSprite,
        scale: 2.5,
        alpha: 0.8,
        duration: 150,
        yoyo: true,
        ease: 'Power2'
      });
    }
    
    if (this.trailParticles) {
      this.trailParticles.explode(15);
    }
  }

  playCollectAnimation(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    });
    
    if (this.glowSprite) {
      this.scene.tweens.add({
        targets: this.glowSprite,
        alpha: 1,
        scale: 2,
        duration: 150,
        yoyo: true
      });
    }
  }

  playHurtAnimation(): void {
    this.sprite.setTint(0xFF0000);
    
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.sprite.clearTint();
      }
    });
    
    if (this.glowSprite) {
      this.glowSprite.setTint(0xFF0000);
      this.scene.time.delayedCall(300, () => {
        this.glowSprite?.clearTint();
      });
    }
  }

  stop(): void {
    this._active = false;
    this.sprite.setActive(false);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    
    if (this.trailParticles) {
      this.trailParticles.stop();
    }
    
    this.playVictoryAnimation();
  }

  private playVictoryAnimation(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 30,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });
    
    if (this.glowSprite) {
      this.scene.tweens.add({
        targets: this.glowSprite,
        scale: 3,
        alpha: 0.9,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  isOutOfBounds(): boolean {
    return this.sprite.y > 650 || this.sprite.y < -50;
  }

  destroy(): void {
    this.breatheTween?.destroy();
    this.bobTween?.destroy();
    this.glowTween?.destroy();
    this.glowSprite?.destroy();
    this.shadowSprite?.destroy();
    this.trailParticles?.destroy();
    this.sprite.destroy();
  }
}

