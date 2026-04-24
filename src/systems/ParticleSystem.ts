import Phaser from 'phaser';
import { COLORS } from '../config/constants';

/**
 * Handles all particle effects
 */
export class ParticleSystem {
  private scene: Phaser.Scene;
  private flipEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private coinEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private deathEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create all particle emitters
   */
  create(): void {
    // Flip particles - cyan electric burst
    this.flipEmitter = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      tint: COLORS.PRIMARY,
      emitting: false
    });

    // Coin collection particles - gold burst
    this.coinEmitter = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      tint: COLORS.COIN,
      emitting: false
    });

    // Death particles - red burst
    this.deathEmitter = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 150, max: 300 },
      scale: { start: 1.2, end: 0 },
      lifespan: 600,
      tint: COLORS.HAZARD,
      emitting: false
    });
  }

  /**
   * Emit flip effect at position
   */
  emitFlip(x: number, y: number, count: number = 20): void {
    this.flipEmitter?.setPosition(x, y);
    this.flipEmitter?.explode(count);
  }

  /**
   * Emit coin collect effect at position
   */
  emitCoinCollect(x: number, y: number, count: number = 10): void {
    this.coinEmitter?.setPosition(x, y);
    this.coinEmitter?.explode(count);
  }

  /**
   * Emit death effect at position
   */
  emitDeath(x: number, y: number, count: number = 25): void {
    this.deathEmitter?.setPosition(x, y);
    this.deathEmitter?.explode(count);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.flipEmitter?.destroy();
    this.coinEmitter?.destroy();
    this.deathEmitter?.destroy();
  }
}
