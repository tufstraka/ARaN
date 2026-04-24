import Phaser from 'phaser';
import { GAME_CONFIG, LevelData } from '../config/constants';

/**
 * Manages level objects: platforms, coins, spikes, home
 */
export class LevelManager {
  private scene: Phaser.Scene;
  private levelData: LevelData;
  
  public platforms!: Phaser.Physics.Arcade.StaticGroup;
  public coins!: Phaser.Physics.Arcade.Group;
  public spikes!: Phaser.Physics.Arcade.StaticGroup;
  public home!: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, levelData: LevelData) {
    this.scene = scene;
    this.levelData = levelData;
  }

  /**
   * Create all level objects
   */
  create(): void {
    this.createPlatforms();
    this.createCoins();
    this.createSpikes();
    this.createHome();
  }

  private createPlatforms(): void {
    this.platforms = this.scene.physics.add.staticGroup();
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
    this.coins = this.scene.physics.add.group({ allowGravity: false });
    const tileSize = GAME_CONFIG.TILE_SIZE;

    this.levelData.coins.forEach(coinData => {
      const coin = this.coins.create(
        coinData.x * tileSize + tileSize / 2,
        coinData.y * tileSize + tileSize / 2,
        'coin'
      ) as Phaser.Physics.Arcade.Sprite;

      coin.setData('originalY', coin.y);

      const body = coin.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);

      // Floating animation
      this.scene.tweens.add({
        targets: coin,
        y: coin.y - 5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Rotation animation
      this.scene.tweens.add({
        targets: coin,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    });
  }

  private createSpikes(): void {
    this.spikes = this.scene.physics.add.staticGroup();
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

    this.home = this.scene.physics.add.sprite(
      this.levelData.home.x * tileSize + tileSize / 2,
      this.levelData.home.y * tileSize,
      'home'
    );

    this.home.setImmovable(true);
    (this.home.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Gentle glow animation
    this.scene.tweens.add({
      targets: this.home,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Get total coin count for this level
   */
  get totalCoins(): number {
    return this.levelData.coins.length;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.platforms.destroy(true);
    this.coins.destroy(true);
    this.spikes.destroy(true);
    this.home.destroy();
  }
}
