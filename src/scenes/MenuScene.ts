import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';
import { soundManager } from '../utils/SoundManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.createBackground();
    
    // Logo / Title
    this.createTitle();
    
    // Stats display
    this.createStatsDisplay();
    
    // Buttons
    this.createButtons();
    
    // Footer
    this.createFooter();
    
    // Fade in
    this.cameras.main.fadeIn(500);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_TOP,
      COLORS.BG_GRADIENT_BOTTOM, COLORS.BG_GRADIENT_BOTTOM
    );
    bg.fillRect(0, 0, width, height);
    
    // Animated gears
    for (let i = 0; i < 6; i++) {
      this.createAnimatedGear(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(100, height - 100),
        Phaser.Math.Between(30, 60),
        i % 2 === 0
      );
    }
    
    // Scanlines effect
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.03);
    for (let y = 0; y < height; y += 4) {
      scanlines.fillRect(0, y, width, 2);
    }
  }

  private createAnimatedGear(x: number, y: number, size: number, clockwise: boolean): void {
    const gear = this.add.graphics();
    
    gear.fillStyle(COLORS.STEEL, 0.15);
    gear.fillCircle(0, 0, size);
    
    // Teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = Math.cos(angle) * size;
      const ty = Math.sin(angle) * size;
      gear.fillRect(tx - 4, ty - 4, 8, 8);
    }
    
    gear.fillStyle(COLORS.DARK_METAL, 0.2);
    gear.fillCircle(0, 0, size * 0.3);
    
    gear.setPosition(x, y);
    
    this.tweens.add({
      targets: gear,
      angle: clockwise ? 360 : -360,
      duration: 20000 + Math.random() * 10000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createTitle(): void {
    const { width } = this.cameras.main;
    
    // Robot icon
    this.add.text(width / 2, 80, '🤖', {
      fontSize: '64px'
    }).setOrigin(0.5);
    
    // Title
    const title = this.add.text(width / 2, 150, 'FLIP BOT', {
      fontSize: '56px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Glow effect
    this.tweens.add({
      targets: title,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Subtitle
    this.add.text(width / 2, 195, 'FACTORY ESCAPE', {
      fontSize: '18px',
      color: '#FF0080',
      fontFamily: 'monospace',
      letterSpacing: 8
    }).setOrigin(0.5);
    
    // Theme badge
    this.add.text(width / 2, 225, '⚙️ MACHINES ⚙️', {
      fontSize: '12px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private createStatsDisplay(): void {
    const { width } = this.cameras.main;
    const stats = progression.stats;
    
    const panelY = 260;
    
    // Stats panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.7);
    panel.fillRoundedRect(width / 2 - 150, panelY, 300, 80, 8);
    
    // Best score
    this.add.text(width / 2 - 130, panelY + 15, 'BEST', {
      fontSize: '12px',
      color: '#666',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 - 130, panelY + 32, stats.bestScore.toString(), {
      fontSize: '24px',
      color: '#00FFFF',
      fontFamily: 'monospace'
    });
    
    // Total runs
    this.add.text(width / 2, panelY + 15, 'RUNS', {
      fontSize: '12px',
      color: '#666',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2, panelY + 32, stats.totalRuns.toString(), {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    });
    
    // Currency
    this.add.text(width / 2 + 100, panelY + 15, 'GEARS', {
      fontSize: '12px',
      color: '#666',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 + 100, panelY + 32, `⚙️ ${progression.currency}`, {
      fontSize: '20px',
      color: '#F39C12',
      fontFamily: 'monospace'
    });
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = 380;
    
    // PLAY button (main)
    this.createMainButton(width / 2, buttonY, 'PLAY', COLORS.NEON_CYAN, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('RunnerScene');
      });
    });
    
    // Secondary buttons
    const secondaryY = buttonY + 70;
    
    this.createSecondaryButton(width / 2 - 100, secondaryY, '⚡ UPGRADES', () => {
      this.scene.start('UpgradeScene');
    });
    
    this.createSecondaryButton(width / 2 + 100, secondaryY, '🏆 STATS', () => {
      this.showStatsModal();
    });
    
    // How to play
    this.add.text(width / 2, secondaryY + 60, 'TAP or SPACE to flip gravity', {
      fontSize: '14px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, secondaryY + 80, 'Survive as long as you can!', {
      fontSize: '12px',
      color: '#444',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private createMainButton(x: number, y: number, text: string, color: number, callback: () => void): void {
    const width = 200;
    const height = 50;
    
    const btn = this.add.graphics();
    btn.fillStyle(color, 0.3);
    btn.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    btn.lineStyle(3, color, 0.8);
    btn.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    btn.setPosition(x, y);
    
    const label = this.add.text(x, y, text, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(color, 0.5);
      btn.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      btn.lineStyle(3, color, 1);
      btn.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
      label.setScale(1.05);
    });
    
    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.3);
      btn.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      btn.lineStyle(3, color, 0.8);
      btn.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
      label.setScale(1);
    });
    
    hitArea.on('pointerdown', callback);
  }

  private createSecondaryButton(x: number, y: number, text: string, callback: () => void): void {
    const btn = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#FFF'));
    btn.on('pointerout', () => btn.setColor('#888'));
    btn.on('pointerdown', callback);
  }

  private showStatsModal(): void {
    const { width, height } = this.cameras.main;
    const stats = progression.stats;
    
    // Overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);
    overlay.setInteractive();
    
    // Modal
    const modal = this.add.graphics();
    modal.fillStyle(0x1a1a2e, 0.95);
    modal.fillRoundedRect(width / 2 - 180, height / 2 - 180, 360, 360, 16);
    modal.lineStyle(2, COLORS.NEON_CYAN, 0.5);
    modal.strokeRoundedRect(width / 2 - 180, height / 2 - 180, 360, 360, 16);
    
    // Title
    this.add.text(width / 2, height / 2 - 150, '📊 STATISTICS', {
      fontSize: '24px',
      color: '#00FFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('modal');
    
    // Stats list
    const startY = height / 2 - 100;
    const statsList = [
      ['Total Runs', stats.totalRuns.toString()],
      ['Best Score', stats.bestScore.toString()],
      ['Longest Run', `${Math.floor(stats.longestRun / 60)}:${(stats.longestRun % 60).toFixed(0).padStart(2, '0')}`],
      ['Best Combo', `${stats.bestCombo}x`],
      ['Total Gears', stats.totalGears.toString()],
      ['Total Flips', stats.totalFlips.toString()],
      ['Total Deaths', stats.totalDeaths.toString()],
    ];
    
    statsList.forEach(([label, value], i) => {
      this.add.text(width / 2 - 150, startY + i * 35, label, {
        fontSize: '14px',
        color: '#888',
        fontFamily: 'monospace'
      }).setName('modal');
      
      this.add.text(width / 2 + 150, startY + i * 35, value, {
        fontSize: '16px',
        color: '#FFF',
        fontFamily: 'monospace'
      }).setOrigin(1, 0).setName('modal');
    });
    
    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + 150, '[ CLOSE ]', {
      fontSize: '16px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('modal');
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#666'));
    closeBtn.on('pointerdown', () => {
      // Destroy modal elements
      this.children.list
        .filter(child => child.name === 'modal')
        .forEach(child => child.destroy());
      overlay.destroy();
      modal.destroy();
    });
    
    overlay.on('pointerdown', () => {
      this.children.list
        .filter(child => child.name === 'modal')
        .forEach(child => child.destroy());
      overlay.destroy();
      modal.destroy();
    });
  }

  private createFooter(): void {
    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height - 30, 'Gamedev.js Jam 2026 • Theme: MACHINES', {
      fontSize: '11px',
      color: '#333',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height - 15, 'Made by tufstraka', {
      fontSize: '10px',
      color: '#222',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
    // Start game on any key/tap
  }
}
