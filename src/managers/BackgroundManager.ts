import Phaser from 'phaser';
import { COLORS } from '../config/constants';

/**
 * Creates and manages background visuals
 */
export class BackgroundManager {
  private scene: Phaser.Scene;
  private gears: Phaser.GameObjects.Graphics[] = [];
  private pipes: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create the full background
   */
  create(): void {
    const { width, height } = this.scene.cameras.main;

    // Gradient background
    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(
      COLORS.SKY_TOP, COLORS.SKY_TOP,
      COLORS.SKY_BOTTOM, COLORS.SKY_BOTTOM
    );
    bg.fillRect(0, 0, width, height);
    bg.setScrollFactor(0);

    // Background gears
    for (let i = 0; i < 4; i++) {
      const gearX = Phaser.Math.Between(50, width - 50);
      const gearY = Phaser.Math.Between(50, 150);
      this.createGear(gearX, gearY, Phaser.Math.Between(20, 40));
    }

    // Background pipes
    for (let i = 0; i < 3; i++) {
      this.createPipe(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(100, 200)
      );
    }
  }

  private createGear(x: number, y: number, size: number): void {
    const gear = this.scene.add.graphics();
    gear.fillStyle(0x34495E, 0.3);
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

    // Slow rotation
    this.scene.tweens.add({
      targets: gear,
      angle: 360,
      duration: 20000,
      repeat: -1,
      ease: 'Linear'
    });

    this.gears.push(gear);
  }

  private createPipe(x: number, y: number): void {
    const pipe = this.scene.add.graphics();
    pipe.fillStyle(0x5D6D7E, 0.2);
    pipe.fillRect(-100, -8, 200, 16);
    
    // Pipe joints
    pipe.fillStyle(0x7F8C8D, 0.3);
    pipe.fillRect(-100, -10, 20, 20);
    pipe.fillRect(80, -10, 20, 20);
    pipe.setPosition(x, y);
    pipe.setScrollFactor(0.2);

    this.pipes.push(pipe);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.gears.forEach(g => g.destroy());
    this.pipes.forEach(p => p.destroy());
    this.gears = [];
    this.pipes = [];
  }
}
