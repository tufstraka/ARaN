import Phaser from 'phaser';
import { COLORS } from '../config/constants';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadAssets();
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 0.8);
    this.loadingBar.fillRect(width / 4, height / 2 - 25, width / 2, 50);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Loading text
    this.add.text(width / 2, height / 2 - 50, 'FLIP WORLD', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(COLORS.PRIMARY, 1);
      this.progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 15,
        (width / 2 - 20) * value,
        30
      );
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.loadingBar.destroy();
    });
  }

  private loadAssets(): void {
    // Generate placeholder graphics programmatically
    this.createPlaceholderGraphics();
  }

  private createPlaceholderGraphics(): void {
    // We'll generate sprites programmatically in the game scene
    // This keeps the game lightweight and allows for easy customization
  }

  create(): void {
    // Create generated textures
    this.createTextures();
    
    // Go to menu
    this.scene.start('MenuScene');
  }

  private createTextures(): void {
    // Create ROBOT texture (cute robot character - MACHINES theme!)
    const pipGraphics = this.make.graphics({ x: 0, y: 0 });
    
    // Robot body (metallic silver/blue)
    pipGraphics.fillStyle(0x5DADE2); // Light blue metal
    pipGraphics.fillRoundedRect(4, 6, 24, 22, 4);
    
    // Robot head top (antenna base)
    pipGraphics.fillStyle(0x85929E); // Gray metal
    pipGraphics.fillRect(14, 2, 4, 6);
    
    // Antenna light
    pipGraphics.fillStyle(0x00FF00); // Green LED
    pipGraphics.fillCircle(16, 2, 3);
    
    // Eye visor (screen)
    pipGraphics.fillStyle(0x1A1A2E); // Dark screen
    pipGraphics.fillRoundedRect(6, 10, 20, 8, 2);
    
    // Robot eyes (LED lights)
    pipGraphics.fillStyle(0x00FFFF); // Cyan glow
    pipGraphics.fillCircle(11, 14, 3);
    pipGraphics.fillCircle(21, 14, 3);
    
    // Eye shine
    pipGraphics.fillStyle(0xFFFFFF);
    pipGraphics.fillCircle(10, 13, 1);
    pipGraphics.fillCircle(20, 13, 1);
    
    // Robot mouth (speaker grille)
    pipGraphics.fillStyle(0x2C3E50);
    pipGraphics.fillRect(10, 20, 12, 4);
    // Grille lines
    pipGraphics.lineStyle(1, 0x1A1A2E);
    pipGraphics.lineBetween(12, 20, 12, 24);
    pipGraphics.lineBetween(16, 20, 16, 24);
    pipGraphics.lineBetween(20, 20, 20, 24);
    
    // Robot body bolts
    pipGraphics.fillStyle(0x85929E);
    pipGraphics.fillCircle(6, 8, 2);
    pipGraphics.fillCircle(26, 8, 2);
    
    pipGraphics.generateTexture('pip', 32, 32);
    pipGraphics.destroy();

    // Create METAL PLATFORM texture (industrial/factory style)
    const platformGraphics = this.make.graphics({ x: 0, y: 0 });
    // Metal base
    platformGraphics.fillStyle(0x5D6D7E); // Steel gray
    platformGraphics.fillRect(0, 0, 32, 32);
    // Rivets/bolts
    platformGraphics.fillStyle(0x85929E);
    platformGraphics.fillCircle(4, 4, 3);
    platformGraphics.fillCircle(28, 4, 3);
    platformGraphics.fillCircle(4, 28, 3);
    platformGraphics.fillCircle(28, 28, 3);
    // Metal shine
    platformGraphics.fillStyle(0x7F8C8D, 0.5);
    platformGraphics.fillRect(2, 2, 28, 2);
    // Border
    platformGraphics.lineStyle(2, 0x2C3E50);
    platformGraphics.strokeRect(1, 1, 30, 30);
    platformGraphics.generateTexture('platform', 32, 32);
    platformGraphics.destroy();

    // Create GEAR/COG texture (collectible - replaces coins)
    const coinGraphics = this.make.graphics({ x: 0, y: 0 });
    // Outer gear
    coinGraphics.fillStyle(0xF39C12); // Bronze/gold
    coinGraphics.fillCircle(12, 12, 10);
    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = 12 + Math.cos(angle) * 10;
      const y = 12 + Math.sin(angle) * 10;
      coinGraphics.fillRect(x - 2, y - 2, 4, 4);
    }
    // Inner circle
    coinGraphics.fillStyle(0xE67E22);
    coinGraphics.fillCircle(12, 12, 5);
    // Center hole
    coinGraphics.fillStyle(0x1A1A2E);
    coinGraphics.fillCircle(12, 12, 2);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // Create CHARGING STATION texture (replaces home)
    const homeGraphics = this.make.graphics({ x: 0, y: 0 });
    // Station base
    homeGraphics.fillStyle(0x2C3E50); // Dark metal
    homeGraphics.fillRect(8, 16, 32, 28);
    // Station top
    homeGraphics.fillStyle(0x34495E);
    homeGraphics.fillRect(4, 8, 40, 12);
    // Lightning bolt symbol
    homeGraphics.fillStyle(0xF1C40F); // Yellow
    homeGraphics.fillTriangle(24, 12, 20, 22, 26, 20);
    homeGraphics.fillTriangle(22, 20, 18, 30, 24, 28);
    // Status lights
    homeGraphics.fillStyle(0x00FF00); // Green LED
    homeGraphics.fillCircle(12, 14, 2);
    homeGraphics.fillStyle(0x00FF00);
    homeGraphics.fillCircle(36, 14, 2);
    // Charging slot
    homeGraphics.fillStyle(0x1A1A2E);
    homeGraphics.fillRect(18, 32, 12, 8);
    homeGraphics.generateTexture('home', 48, 48);
    homeGraphics.destroy();

    // Create ELECTRIC HAZARD texture (replaces spikes)
    const spikeGraphics = this.make.graphics({ x: 0, y: 0 });
    // Electric coil base
    spikeGraphics.fillStyle(0x7F8C8D);
    spikeGraphics.fillRect(8, 24, 16, 8);
    // Electric bolt
    spikeGraphics.fillStyle(0xF1C40F); // Yellow electric
    spikeGraphics.fillTriangle(16, 0, 8, 16, 18, 14);
    spikeGraphics.fillTriangle(14, 12, 6, 28, 20, 24);
    // Glow effect
    spikeGraphics.fillStyle(0xFFFF00, 0.3);
    spikeGraphics.fillCircle(16, 14, 8);
    spikeGraphics.generateTexture('spike', 32, 32);
    spikeGraphics.destroy();

    // Create SPARK particle texture
    const particleGraphics = this.make.graphics({ x: 0, y: 0 });
    particleGraphics.fillStyle(0x00FFFF); // Cyan spark
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.fillStyle(0xFFFFFF);
    particleGraphics.fillCircle(4, 4, 2);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }
}
