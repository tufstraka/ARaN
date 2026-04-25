import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';

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
    this.add.text(width / 2, height / 2 - 50, 'ARAN', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(COLORS.NEON_CYAN, 1);
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
    
    // Check if story has been seen
    const storySeen = localStorage.getItem('aran_story_seen');
    
    if (storySeen) {
      // Returning player - go straight to menu
      this.scene.start('MenuScene');
    } else {
      // New player - show story first
      this.scene.start('StoryScene');
    }
  }

  private createTextures(): void {
    const pipGraphics = this.make.graphics({ x: 0, y: 0 });
    const cx = 32, cy = 32; // Center
    
    pipGraphics.fillStyle(0x00FFFF, 0.05);
    pipGraphics.fillCircle(cx, cy, 34);
    pipGraphics.fillStyle(0x00FFFF, 0.08);
    pipGraphics.fillCircle(cx, cy, 30);
    pipGraphics.fillStyle(0x00FFFF, 0.12);
    pipGraphics.fillCircle(cx, cy, 26);
    
    pipGraphics.fillStyle(0x2a3a4a);
    pipGraphics.fillRoundedRect(cx - 14, cy + 14, 9, 16, 2);
    pipGraphics.fillStyle(0x3d5a73);
    pipGraphics.fillRoundedRect(cx - 13, cy + 14, 8, 15, 2);
    pipGraphics.fillStyle(0x5a7a9a, 0.6);
    pipGraphics.fillRoundedRect(cx - 12, cy + 15, 3, 12, 1);
    pipGraphics.fillStyle(0x4a6a8a);
    pipGraphics.fillRoundedRect(cx - 16, cy + 28, 12, 5, 2);
    pipGraphics.fillStyle(0x00FFFF, 0.4);
    pipGraphics.fillRect(cx - 14, cy + 30, 8, 2);
    
    pipGraphics.fillStyle(0x2a3a4a);
    pipGraphics.fillRoundedRect(cx + 5, cy + 12, 9, 18, 2);
    pipGraphics.fillStyle(0x3d5a73);
    pipGraphics.fillRoundedRect(cx + 6, cy + 12, 8, 17, 2);
    pipGraphics.fillStyle(0x5a7a9a, 0.6);
    pipGraphics.fillRoundedRect(cx + 7, cy + 13, 3, 14, 1);
    pipGraphics.fillStyle(0x4a6a8a);
    pipGraphics.fillRoundedRect(cx + 4, cy + 28, 12, 5, 2);
    pipGraphics.fillStyle(0x00FFFF, 0.4);
    pipGraphics.fillRect(cx + 6, cy + 30, 8, 2);
    
    pipGraphics.fillStyle(0x2a3a4a);
    pipGraphics.fillRoundedRect(cx - 24, cy - 10, 7, 18, 3);
    pipGraphics.fillStyle(0x3d5a73);
    pipGraphics.fillRoundedRect(cx - 23, cy - 10, 6, 17, 3);
    pipGraphics.fillStyle(0x00FFFF, 0.5);
    pipGraphics.fillRect(cx - 21, cy - 6, 2, 10);
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillCircle(cx - 20, cy - 14, 7);
    pipGraphics.fillStyle(0x66EEFF);
    pipGraphics.fillCircle(cx - 20, cy - 14, 5);
    pipGraphics.fillStyle(0xFFFFFF, 0.8);
    pipGraphics.fillCircle(cx - 21, cy - 15, 2);
    
    pipGraphics.fillStyle(0x2a3a4a);
    pipGraphics.fillRoundedRect(cx + 17, cy - 4, 7, 16, 3);
    pipGraphics.fillStyle(0x3d5a73);
    pipGraphics.fillRoundedRect(cx + 18, cy - 4, 6, 15, 3);
    pipGraphics.fillStyle(0x00FFFF, 0.5);
    pipGraphics.fillRect(cx + 20, cy, 2, 8);
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillCircle(cx + 21, cy + 14, 6);
    pipGraphics.fillStyle(0x66EEFF);
    pipGraphics.fillCircle(cx + 21, cy + 14, 4);
    pipGraphics.fillStyle(0xFFFFFF, 0.8);
    pipGraphics.fillCircle(cx + 20, cy + 13, 2);
    
    pipGraphics.fillStyle(0x000000, 0.25);
    pipGraphics.fillRoundedRect(cx - 15, cy - 12, 30, 30, 8);
    pipGraphics.fillStyle(0x2a4a6a);
    pipGraphics.fillRoundedRect(cx - 16, cy - 14, 32, 32, 10);
    pipGraphics.fillStyle(0x4a8ab0);
    pipGraphics.fillRoundedRect(cx - 14, cy - 12, 28, 28, 8);
    pipGraphics.fillStyle(0x7ac0e0, 0.6);
    pipGraphics.fillRoundedRect(cx - 11, cy - 10, 22, 10, 5);
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillRoundedRect(cx - 14, cy - 12, 28, 3, 2);
    
    pipGraphics.fillStyle(0x00FFFF, 0.2);
    pipGraphics.fillCircle(cx, cy + 4, 10);
    pipGraphics.fillStyle(0x00FFFF, 0.4);
    pipGraphics.fillCircle(cx, cy + 4, 8);
    pipGraphics.fillStyle(0x00DDFF);
    pipGraphics.fillCircle(cx, cy + 4, 6);
    pipGraphics.fillStyle(0x66FFFF);
    pipGraphics.fillCircle(cx, cy + 4, 4);
    pipGraphics.fillStyle(0xFFFFFF, 0.9);
    pipGraphics.fillCircle(cx - 1, cy + 2, 2);
    
    pipGraphics.fillStyle(0x00FFFF, 0.4);
    pipGraphics.fillRect(cx - 10, cy - 4, 2, 8);
    pipGraphics.fillRect(cx + 8, cy - 4, 2, 8);
    
    pipGraphics.fillStyle(0x2a3a4a);
    pipGraphics.fillRoundedRect(cx - 6, cy - 20, 12, 8, 2);
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillRect(cx - 2, cy - 18, 4, 6);
    
    pipGraphics.fillStyle(0x000000, 0.2);
    pipGraphics.fillRoundedRect(cx - 14, cy - 42, 28, 24, 8);
    pipGraphics.fillStyle(0x3a5a7a);
    pipGraphics.fillRoundedRect(cx - 15, cy - 44, 30, 26, 10);
    pipGraphics.fillStyle(0x5a8aaa);
    pipGraphics.fillRoundedRect(cx - 13, cy - 42, 26, 22, 8);
    pipGraphics.fillStyle(0x8ac0e0, 0.5);
    pipGraphics.fillRoundedRect(cx - 10, cy - 40, 20, 6, 4);
    
    pipGraphics.fillStyle(0x4a5a6a);
    pipGraphics.fillRoundedRect(cx - 3, cy - 50, 6, 8, 2);
    pipGraphics.fillStyle(0x00FF88, 0.3);
    pipGraphics.fillCircle(cx, cy - 54, 7);
    pipGraphics.fillStyle(0x00FF88, 0.5);
    pipGraphics.fillCircle(cx, cy - 54, 5);
    pipGraphics.fillStyle(0x00FF88);
    pipGraphics.fillCircle(cx, cy - 54, 4);
    pipGraphics.fillStyle(0xAAFFCC);
    pipGraphics.fillCircle(cx, cy - 54, 3);
    pipGraphics.fillStyle(0xFFFFFF, 0.9);
    pipGraphics.fillCircle(cx - 1, cy - 55, 1.5);
    
    pipGraphics.fillStyle(0x0a1520);
    pipGraphics.fillRoundedRect(cx - 12, cy - 38, 24, 14, 5);
    pipGraphics.fillStyle(0x001830);
    pipGraphics.fillRoundedRect(cx - 10, cy - 36, 20, 10, 4);
    
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillCircle(cx - 5, cy - 32, 6);
    pipGraphics.fillStyle(0x00DDFF);
    pipGraphics.fillCircle(cx - 5, cy - 32, 4);
    pipGraphics.fillStyle(0x66FFFF);
    pipGraphics.fillCircle(cx - 5, cy - 32, 3);
    pipGraphics.fillStyle(0xFFFFFF);
    pipGraphics.fillCircle(cx - 4, cy - 33, 1.5);
    
    pipGraphics.fillStyle(0x00FFFF, 0.3);
    pipGraphics.fillCircle(cx + 5, cy - 31, 7);
    pipGraphics.fillStyle(0x00DDFF);
    pipGraphics.fillCircle(cx + 5, cy - 31, 5);
    pipGraphics.fillStyle(0x66FFFF);
    pipGraphics.fillCircle(cx + 5, cy - 31, 4);
    pipGraphics.fillStyle(0xFFFFFF);
    pipGraphics.fillCircle(cx + 6, cy - 32, 2);
    
    pipGraphics.fillStyle(0xFFFFFF, 0.8);
    pipGraphics.fillCircle(cx - 6, cy - 34, 1);
    pipGraphics.fillCircle(cx + 4, cy - 34, 1);
    
    pipGraphics.lineStyle(2, 0x00AACC, 0.6);
    pipGraphics.beginPath();
    pipGraphics.arc(cx, cy - 25, 5, 0.4, Math.PI - 0.4);
    pipGraphics.strokePath();
    
    pipGraphics.fillStyle(0xFF6699, 0.25);
    pipGraphics.fillCircle(cx - 10, cy - 28, 3);
    pipGraphics.fillCircle(cx + 10, cy - 28, 3);
    
    pipGraphics.fillStyle(0x3a5a7a);
    pipGraphics.fillCircle(cx - 16, cy - 32, 5);
    pipGraphics.fillCircle(cx + 16, cy - 32, 5);
    pipGraphics.fillStyle(0x4a6a8a);
    pipGraphics.fillCircle(cx - 16, cy - 32, 4);
    pipGraphics.fillCircle(cx + 16, cy - 32, 4);
    pipGraphics.fillStyle(0xFF0088, 0.6);
    pipGraphics.fillCircle(cx - 16, cy - 32, 2);
    pipGraphics.fillCircle(cx + 16, cy - 32, 2);
    pipGraphics.fillStyle(0xFF66AA);
    pipGraphics.fillCircle(cx - 16, cy - 32, 1.5);
    pipGraphics.fillCircle(cx + 16, cy - 32, 1.5);
    
    pipGraphics.fillStyle(0x00FFFF, 0.4);
    pipGraphics.fillCircle(cx - 11, cy - 6, 3);
    pipGraphics.fillCircle(cx + 11, cy - 6, 3);
    pipGraphics.fillCircle(cx - 11, cy + 10, 3);
    pipGraphics.fillCircle(cx + 11, cy + 10, 3);
    pipGraphics.fillStyle(0xAADDFF);
    pipGraphics.fillCircle(cx - 11, cy - 6, 2);
    pipGraphics.fillCircle(cx + 11, cy - 6, 2);
    pipGraphics.fillCircle(cx - 11, cy + 10, 2);
    pipGraphics.fillCircle(cx + 11, cy + 10, 2);
    
    pipGraphics.generateTexture('pip', 64, 64);
    pipGraphics.destroy();
    
    const pipGlowGraphics = this.make.graphics({ x: 0, y: 0 });
    for (let i = 32; i > 0; i--) {
      const alpha = (i / 32) * 0.3;
      pipGlowGraphics.fillStyle(0x00FFFF, alpha);
      pipGlowGraphics.fillCircle(32, 32, i);
    }
    pipGlowGraphics.generateTexture('pip_glow', 64, 64);
    pipGlowGraphics.destroy();

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

    // Create GEAR/COG texture - BRIGHT GOLD!
    const coinGraphics = this.make.graphics({ x: 0, y: 0 });
    // Glow
    coinGraphics.fillStyle(0xFFD700, 0.3);
    coinGraphics.fillCircle(12, 12, 14);
    // Outer gear
    coinGraphics.fillStyle(0xFFD700);
    coinGraphics.fillCircle(12, 12, 10);
    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = 12 + Math.cos(angle) * 10;
      const y = 12 + Math.sin(angle) * 10;
      coinGraphics.fillRect(x - 3, y - 3, 6, 6);
    }
    // Inner circle
    coinGraphics.fillStyle(0xFFA500);
    coinGraphics.fillCircle(12, 12, 5);
    // Shine
    coinGraphics.fillStyle(0xFFFFFF, 0.6);
    coinGraphics.fillCircle(9, 9, 3);
    // Center hole
    coinGraphics.fillStyle(0x333333);
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

    // Create CONVEYOR BELT texture
    const conveyorGraphics = this.make.graphics({ x: 0, y: 0 });
    conveyorGraphics.fillStyle(0x7D6608); // Bronze conveyor
    conveyorGraphics.fillRect(0, 0, 32, 32);
    // Belt ridges
    conveyorGraphics.fillStyle(0x5D4E06);
    for (let i = 0; i < 4; i++) {
      conveyorGraphics.fillRect(i * 8 + 2, 8, 4, 16);
    }
    // Metal edges
    conveyorGraphics.fillStyle(0x5D6D7E);
    conveyorGraphics.fillRect(0, 0, 32, 4);
    conveyorGraphics.fillRect(0, 28, 32, 4);
    conveyorGraphics.generateTexture('conveyor', 32, 32);
    conveyorGraphics.destroy();

    // Create PISTON texture
    const pistonGraphics = this.make.graphics({ x: 0, y: 0 });
    // Piston head (danger!)
    pistonGraphics.fillStyle(0x8B0000); // Dark red
    pistonGraphics.fillRect(4, 4, 24, 24);
    // Warning stripes
    pistonGraphics.fillStyle(0xF1C40F);
    pistonGraphics.fillRect(4, 8, 24, 4);
    pistonGraphics.fillRect(4, 20, 24, 4);
    // Metal border
    pistonGraphics.lineStyle(2, 0x5D6D7E);
    pistonGraphics.strokeRect(4, 4, 24, 24);
    pistonGraphics.generateTexture('piston', 32, 32);
    pistonGraphics.destroy();

    // Create POWERUP texture (generic, will be tinted)
    const powerupGraphics = this.make.graphics({ x: 0, y: 0 });
    // Glowing orb
    powerupGraphics.fillStyle(0xFFFFFF, 0.8);
    powerupGraphics.fillCircle(12, 12, 10);
    // Inner glow
    powerupGraphics.fillStyle(0xFFFFFF);
    powerupGraphics.fillCircle(12, 12, 6);
    // Shine
    powerupGraphics.fillStyle(0xFFFFFF);
    powerupGraphics.fillCircle(8, 8, 2);
    powerupGraphics.generateTexture('powerup', 24, 24);
    powerupGraphics.destroy();
  }
}
