import Phaser from 'phaser';
import { GAME_CONFIG, LevelData } from '../config/constants';

/**
 * Player character (PIP the robot)
 */
export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private _active: boolean = true;

  constructor(scene: Phaser.Scene, levelData: LevelData) {
    const tileSize = GAME_CONFIG.TILE_SIZE;

    this.sprite = scene.physics.add.sprite(
      levelData.start.x * tileSize + tileSize / 2,
      levelData.start.y * tileSize + tileSize / 2,
      'pip'
    );

    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    this.sprite.setDragX(100);

    // Set up physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 28);
    body.setOffset(4, 2);
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

  /**
   * Update player each frame
   */
  update(isFlipped: boolean, isFlipping: boolean, speedMultiplier: number = 1): void {
    if (!this.sprite || !this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Auto-walk: PIP always moves right
    if (!isFlipping) {
      body.setVelocityX(GAME_CONFIG.PIP_SPEED * speedMultiplier);
    }

    // Flip sprite based on gravity direction
    this.sprite.setFlipY(isFlipped);
  }

  /**
   * Stop player movement (for victory)
   */
  stop(): void {
    this._active = false;
    this.sprite.setActive(false);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  /**
   * Check if player is out of bounds
   */
  isOutOfBounds(): boolean {
    return this.sprite.y > 650 || this.sprite.y < -50;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.sprite.destroy();
  }
}
