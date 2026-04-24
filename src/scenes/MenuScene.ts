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
    
    // YouTube Playables: Signal game is ready for interaction
    if ((window as any).isYouTubePlayables && (window as any).ytgame) {
      (window as any).ytgame.game.gameReady();
      console.log('YouTube Playables: gameReady called from MenuScene');
    }
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
    const { width, height } = this.cameras.main;
    const isMobile = width < 600;
    const scale = isMobile ? 0.75 : 1;
    
    // Robot icon with glow
    const robotY = isMobile ? 50 : 70;
    const robot = this.add.text(width / 2, robotY, '🤖', {
      fontSize: isMobile ? '48px' : '72px'
    }).setOrigin(0.5);
    
    // Subtle bounce
    this.tweens.add({
      targets: robot,
      y: robotY - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Title - ARAN in stylized text
    const titleY = isMobile ? 105 : 155;
    const title = this.add.text(width / 2, titleY, 'ARAN', {
      fontSize: isMobile ? '48px' : '72px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      stroke: '#003333',
      strokeThickness: isMobile ? 5 : 8
    }).setOrigin(0.5);
    
    // Glow pulse
    this.tweens.add({
      targets: title,
      alpha: 0.85,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Subtitle
    const subY = isMobile ? 145 : 205;
    this.add.text(width / 2, subY, 'FACTORY ESCAPE', {
      fontSize: isMobile ? '12px' : '16px',
      color: '#FF0080',
      fontFamily: 'monospace',
      letterSpacing: isMobile ? 3 : 6
    }).setOrigin(0.5);
    
    // Theme badge - hide on very small screens
    if (!isMobile || height > 450) {
      const badgeY = isMobile ? 170 : 235;
      this.add.text(width / 2, badgeY, '⚙️ GAMEDEV.JS JAM 2026 • MACHINES ⚙️', {
        fontSize: isMobile ? '8px' : '10px',
        color: '#555',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }
  }

  private createStatsDisplay(): void {
    const { width, height } = this.cameras.main;
    const stats = progression.stats;
    const isMobile = width < 600;
    
    // Hide stats panel on very small screens
    if (isMobile && height < 500) return;
    
    const panelY = isMobile ? 190 : 260;
    const panelWidth = isMobile ? Math.min(width - 40, 280) : 300;
    const panelHeight = isMobile ? 60 : 80;
    
    // Stats panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.7);
    panel.fillRoundedRect(width / 2 - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
    
    const fontSize = isMobile ? '10px' : '12px';
    const valueSize = isMobile ? '18px' : '24px';
    const spacing = panelWidth / 3;
    const startX = width / 2 - spacing;
    const labelY = panelY + (isMobile ? 10 : 15);
    const valueY = panelY + (isMobile ? 25 : 32);
    
    // Best score
    this.add.text(startX, labelY, 'BEST', {
      fontSize,
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
    this.add.text(startX, valueY, stats.bestScore.toString(), {
      fontSize: valueSize,
      color: '#00FFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
    
    // Total runs
    this.add.text(width / 2, labelY, 'RUNS', {
      fontSize,
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
    this.add.text(width / 2, valueY, stats.totalRuns.toString(), {
      fontSize: valueSize,
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
    
    // Currency
    this.add.text(startX + spacing * 2, labelY, 'GEARS', {
      fontSize,
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
    this.add.text(startX + spacing * 2, valueY, `⚙️ ${progression.currency}`, {
      fontSize: isMobile ? '14px' : '20px',
      color: '#F39C12',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const isMobile = width < 600;
    const buttonY = isMobile ? Math.min(height * 0.55, 350) : 380;
    
    // PLAY button (main) - bigger on mobile
    const playBtnWidth = isMobile ? Math.min(width * 0.7, 280) : 200;
    const playBtnHeight = isMobile ? 60 : 50;
    
    this.createMainButton(width / 2, buttonY, '▶  PLAY', COLORS.NEON_CYAN, playBtnWidth, playBtnHeight, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('RunnerScene');
      });
    });
    
    // Secondary buttons - stack vertically on mobile
    const secondaryY = buttonY + (isMobile ? 80 : 70);
    const secondaryBtnWidth = isMobile ? Math.min(width * 0.42, 160) : 120;
    const secondaryBtnHeight = isMobile ? 50 : 40;
    const secondarySpacing = isMobile ? Math.min(width * 0.25, 90) : 100;
    
    this.createSecondaryButton(width / 2 - secondarySpacing, secondaryY, '⚡ UPGRADES', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.scene.start('UpgradeScene');
    });
    
    this.createSecondaryButton(width / 2 + secondarySpacing, secondaryY, '🏆 STATS', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.showStatsModal();
    });
    
    // How to play - adjust for mobile
    const instructY = secondaryY + (isMobile ? 70 : 60);
    const instructSize = isMobile ? '16px' : '14px';
    
    this.add.text(width / 2, instructY, 'TAP or SPACE to flip gravity', {
      fontSize: instructSize,
      color: '#888',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    if (!isMobile || height > 500) {
      this.add.text(width / 2, instructY + 25, 'Survive as long as you can!', {
        fontSize: '12px',
        color: '#555',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }
  }

  private createMainButton(x: number, y: number, text: string, color: number, btnWidth: number, btnHeight: number, callback: () => void): void {
    const btn = this.add.graphics();
    btn.fillStyle(color, 0.3);
    btn.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
    btn.lineStyle(3, color, 0.8);
    btn.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
    btn.setPosition(x, y);
    
    const fontSize = btnHeight > 55 ? '32px' : '28px';
    const label = this.add.text(x, y, text, {
      fontSize,
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, btnWidth + 20, btnHeight + 20, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(color, 0.5);
      btn.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
      btn.lineStyle(3, color, 1);
      btn.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
      label.setScale(1.05);
    });
    
    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.3);
      btn.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
      btn.lineStyle(3, color, 0.8);
      btn.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
      label.setScale(1);
    });
    
    hitArea.on('pointerdown', callback);
  }

  private createSecondaryButton(x: number, y: number, text: string, btnWidth: number, btnHeight: number, callback: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x333344, 0.5);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, 0x555566, 0.6);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    bg.setPosition(x, y);
    
    const fontSize = btnHeight > 45 ? '16px' : '14px';
    const btn = this.add.text(x, y, text, {
      fontSize,
      color: '#AAA',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, btnWidth + 10, btnHeight + 10, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      btn.setColor('#FFF');
      bg.clear();
      bg.fillStyle(0x444455, 0.7);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0x00FFFF, 0.6);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    });
    hitArea.on('pointerout', () => {
      btn.setColor('#AAA');
      bg.clear();
      bg.fillStyle(0x333344, 0.5);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0x555566, 0.6);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    });
    hitArea.on('pointerdown', callback);
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
