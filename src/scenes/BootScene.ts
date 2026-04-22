import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Boot scene loads minimal assets needed for the loading screen
  }

  create(): void {
    // Set up any global game settings
    this.scale.on('resize', this.resize, this);
    
    // Proceed to preload scene
    this.scene.start('PreloadScene');
  }

  private resize(): void {
    // Handle window resize if needed
  }
}
