import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

/**
 * Handles gravity flipping and physics state
 */
export class PhysicsSystem {
  private scene: Phaser.Scene;
  private _isFlipped: boolean = false;
  private _isFlipping: boolean = false;
  private _canFlip: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get isFlipped(): boolean {
    return this._isFlipped;
  }

  get isFlipping(): boolean {
    return this._isFlipping;
  }

  get canFlip(): boolean {
    return this._canFlip;
  }

  /**
   * Execute gravity flip with animation
   */
  flip(onComplete?: () => void): boolean {
    if (!this._canFlip || this._isFlipping) return false;

    this._isFlipping = true;
    this._canFlip = false;

    // Toggle gravity
    this._isFlipped = !this._isFlipped;
    const newGravity = this._isFlipped ? -GAME_CONFIG.GRAVITY : GAME_CONFIG.GRAVITY;
    this.scene.physics.world.gravity.y = newGravity;

    // Camera rotation animation
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      rotation: this._isFlipped ? Math.PI : 0,
      duration: GAME_CONFIG.FLIP_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this._isFlipping = false;
        onComplete?.();
      }
    });

    // Cooldown before next flip
    this.scene.time.delayedCall(GAME_CONFIG.FLIP_DURATION + 100, () => {
      this._canFlip = true;
    });

    return true;
  }

  /**
   * Reset physics to default state
   */
  reset(): void {
    this._isFlipped = false;
    this._isFlipping = false;
    this._canFlip = true;
    this.scene.physics.world.gravity.y = GAME_CONFIG.GRAVITY;
    const cam = this.scene.cameras.main as unknown as { rotation: number };
    cam.rotation = 0;
  }

  /**
   * Check if entity is out of bounds
   */
  isOutOfBounds(y: number, margin: number = 50): boolean {
    return y > 650 + margin || y < -margin;
  }
}
