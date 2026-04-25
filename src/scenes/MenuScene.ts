import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';
import { soundManager } from '../utils/SoundManager';
import { web3Manager } from '../utils/Web3Manager';
import { BackgroundAnimations } from '../utils/BackgroundAnimations';
import { Web3UI } from '../ui/Web3UI';

// Elegant modern fonts
const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

export class MenuScene extends Phaser.Scene {
  private walletButton?: Phaser.GameObjects.Container;
  private bgAnimations?: BackgroundAnimations;
  private web3UI?: Web3UI;
  
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    this.createBackground();
    this.createTitle();
    this.createStatsDisplay();
    this.createButtons();
    this.createWeb3UI();
    this.createFooter();
    
    this.cameras.main.fadeIn(500);
    
    // YouTube Playables: Signal game is ready for interaction
    if ((window as any).isYouTubePlayables && (window as any).ytgame) {
      (window as any).ytgame.game.gameReady();
      console.log('YouTube Playables: gameReady called from MenuScene');
    }
  }

  private createBackground(): void {
    // Minimal animated factory background with parallax
    this.bgAnimations = new BackgroundAnimations(this);
    this.bgAnimations.create();
  }

  private createTitle(): void {
    const { width, height } = this.cameras.main;
    const isMobile = width < 600;
    
    // Robot icon with subtle glow
    const robotY = isMobile ? 50 : 70;
    const robotContainer = this.add.container(width / 2, robotY);
    
    // Subtle glow behind robot
    const glow = this.add.graphics();
    glow.fillStyle(COLORS.NEON_CYAN, 0.1);
    glow.fillCircle(0, 0, isMobile ? 30 : 40);
    robotContainer.add(glow);
    
    const robot = this.add.text(0, 0, '🤖', {
      fontSize: isMobile ? '48px' : '64px'
    }).setOrigin(0.5);
    robotContainer.add(robot);
    
    // Gentle float animation
    this.tweens.add({
      targets: robotContainer,
      y: robotY - 6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Title - ARAN in elegant font
    const titleY = isMobile ? 110 : 155;
    const title = this.add.text(width / 2, titleY, 'ARAN', {
      fontSize: isMobile ? '42px' : '64px',
      color: '#00FFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold',
      letterSpacing: 12
    }).setOrigin(0.5);
    
    // Subtle glow effect
    title.setShadow(0, 0, '#00FFFF', 15, false, true);
    
    // Subtitle
    const subY = isMobile ? 155 : 215;
    this.add.text(width / 2, subY, 'FACTORY ESCAPE', {
      fontSize: isMobile ? '10px' : '12px',
      color: '#FF0080',
      fontFamily: BODY_FONT,
      letterSpacing: isMobile ? 4 : 8
    }).setOrigin(0.5).setAlpha(0.8);
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
      color: '#888',
      fontFamily: TITLE_FONT
    }).setOrigin(0.5, 0);
    this.add.text(startX, valueY, stats.bestScore.toString(), {
      fontSize: valueSize,
      color: '#00FFFF',
      fontFamily: BODY_FONT
    }).setOrigin(0.5, 0);
    
    // Total runs
    this.add.text(width / 2, labelY, 'RUNS', {
      fontSize,
      color: '#888',
      fontFamily: TITLE_FONT
    }).setOrigin(0.5, 0);
    this.add.text(width / 2, valueY, stats.totalRuns.toString(), {
      fontSize: valueSize,
      color: '#FFFFFF',
      fontFamily: BODY_FONT
    }).setOrigin(0.5, 0);
    
    // Currency
    this.add.text(startX + spacing * 2, labelY, 'GEARS', {
      fontSize,
      color: '#888',
      fontFamily: TITLE_FONT
    }).setOrigin(0.5, 0);
    this.add.text(startX + spacing * 2, valueY, `⚙️ ${progression.currency}`, {
      fontSize: isMobile ? '14px' : '20px',
      color: '#F39C12',
      fontFamily: BODY_FONT
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
    const secondaryBtnWidth = isMobile ? Math.min(width * 0.3, 110) : 90;
    const secondaryBtnHeight = isMobile ? 45 : 38;
    const secondarySpacing = isMobile ? Math.min(width * 0.22, 85) : 80;
    
    this.createSecondaryButton(width / 2 - secondarySpacing * 1.1, secondaryY, '⚡ UPGRADES', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.scene.start('UpgradeScene');
    });
    
    this.createSecondaryButton(width / 2, secondaryY, '📜 STORY', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.scene.start('StoryScene');
    });
    
    this.createSecondaryButton(width / 2 + secondarySpacing * 1.1, secondaryY, '🏆 STATS', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.showStatsModal();
    });
    
    // How to play - minimal
    const instructY = secondaryY + (isMobile ? 70 : 60);
    
    const instructText = this.add.text(width / 2, instructY, 'TAP or SPACE to flip gravity', {
      fontSize: '14px',
      color: '#666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    
    if (!isMobile || height > 500) {
      this.add.text(width / 2, instructY + 25, 'Survive as long as you can', {
        fontSize: '12px',
        color: '#444',
        fontFamily: BODY_FONT
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
    
    const fontSize = btnHeight > 55 ? '20px' : '18px';
    const label = this.add.text(x, y, text, {
      fontSize,
      color: '#FFFFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
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
    
    const fontSize = btnHeight > 45 ? '14px' : '12px';
    const btn = this.add.text(x, y, text, {
      fontSize,
      color: '#AAA',
      fontFamily: BODY_FONT
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
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
    overlay.setInteractive();
    
    // Modal - larger for more stats
    const modalHeight = 420;
    const modal = this.add.graphics();
    modal.fillStyle(0x0a0a15, 0.98);
    modal.fillRoundedRect(width / 2 - 190, height / 2 - modalHeight/2, 380, modalHeight, 16);
    modal.lineStyle(2, COLORS.NEON_CYAN, 0.4);
    modal.strokeRoundedRect(width / 2 - 190, height / 2 - modalHeight/2, 380, modalHeight, 16);
    
    // Title
    this.add.text(width / 2, height / 2 - modalHeight/2 + 30, 'AR-4N STATUS REPORT', {
      fontSize: '18px',
      color: '#00FFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5).setName('modal');
    
    // Subtitle
    this.add.text(width / 2, height / 2 - modalHeight/2 + 52, 'Escape Attempt Data', {
      fontSize: '10px',
      color: '#666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5).setName('modal');
    
    // Calculate derived stats
    const avgScore = stats.totalRuns > 0 ? Math.floor(stats.totalScore / stats.totalRuns) : 0;
    const avgTime = stats.totalRuns > 0 ? stats.totalTimePlayed / stats.totalRuns : 0;
    const totalMinutes = Math.floor((stats.totalTimePlayed || 0) / 60);
    const deathsPerMin = stats.totalTimePlayed > 60 ? (stats.totalDeaths / (stats.totalTimePlayed / 60)).toFixed(1) : '—';
    const gearsPerRun = stats.totalRuns > 0 ? (stats.totalGears / stats.totalRuns).toFixed(1) : '0';
    
    // Find highest phase reached
    let highestPhase = 'BOOT SEQUENCE';
    const phaseOrder = ['BOOT SEQUENCE', 'CALIBRATING...', 'SYSTEMS ONLINE', 'FACTORY FLOOR', 'DANGER ZONE', 'MELTDOWN', 'CRITICAL', 'CHAOS MODE'];
    if (stats.phasesReached) {
      for (let i = phaseOrder.length - 1; i >= 0; i--) {
        if (stats.phasesReached[phaseOrder[i]]) {
          highestPhase = phaseOrder[i];
          break;
        }
      }
    }
    
    // Stats list - more interesting grouping
    const startY = height / 2 - modalHeight/2 + 75;
    
    // Section: Performance
    this.add.text(width / 2 - 160, startY, '[ PERFORMANCE ]', {
      fontSize: '9px',
      color: '#00FFFF',
      fontFamily: BODY_FONT
    }).setName('modal');
    
    const perfStats = [
      ['Best Score', stats.bestScore.toLocaleString()],
      ['Longest Survival', this.formatTime(stats.longestRun)],
      ['Best Combo', `${stats.bestCombo}x`],
      ['Highest Phase', highestPhase],
    ];
    
    perfStats.forEach(([label, value], i) => {
      this.add.text(width / 2 - 150, startY + 18 + i * 26, label, {
        fontSize: '12px',
        color: '#888',
        fontFamily: BODY_FONT
      }).setName('modal');
      
      this.add.text(width / 2 + 160, startY + 18 + i * 26, value, {
        fontSize: '13px',
        color: '#FFF',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
      }).setOrigin(1, 0).setName('modal');
    });
    
    // Section: Totals
    const section2Y = startY + 125;
    this.add.text(width / 2 - 160, section2Y, '[ TOTALS ]', {
      fontSize: '9px',
      color: '#FF6B4A',
      fontFamily: BODY_FONT
    }).setName('modal');
    
    const totalStats = [
      ['Escape Attempts', stats.totalRuns.toString()],
      ['Time in Factory', `${totalMinutes} min`],
      ['Gears Collected', stats.totalGears.toLocaleString()],
      ['Gravity Flips', stats.totalFlips.toLocaleString()],
      ['Terminations', stats.totalDeaths.toString()],
    ];
    
    totalStats.forEach(([label, value], i) => {
      this.add.text(width / 2 - 150, section2Y + 18 + i * 26, label, {
        fontSize: '12px',
        color: '#888',
        fontFamily: BODY_FONT
      }).setName('modal');
      
      this.add.text(width / 2 + 160, section2Y + 18 + i * 26, value, {
        fontSize: '13px',
        color: '#FFF',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
      }).setOrigin(1, 0).setName('modal');
    });
    
    // Section: Averages
    const section3Y = section2Y + 150;
    this.add.text(width / 2 - 160, section3Y, '[ AVERAGES ]', {
      fontSize: '9px',
      color: '#44FF44',
      fontFamily: BODY_FONT
    }).setName('modal');
    
    const avgStats = [
      ['Avg Score/Run', avgScore.toLocaleString()],
      ['Avg Survival', this.formatTime(avgTime)],
      ['Deaths/Min', deathsPerMin],
      ['Gears/Run', gearsPerRun],
    ];
    
    avgStats.forEach(([label, value], i) => {
      this.add.text(width / 2 - 150, section3Y + 18 + i * 26, label, {
        fontSize: '12px',
        color: '#888',
        fontFamily: BODY_FONT
      }).setName('modal');
      
      this.add.text(width / 2 + 160, section3Y + 18 + i * 26, value, {
        fontSize: '13px',
        color: '#FFF',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
      }).setOrigin(1, 0).setName('modal');
    });
    
    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + modalHeight/2 - 30, '[ CLOSE ]', {
      fontSize: '14px',
      color: '#666',
      fontFamily: BODY_FONT
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
  
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private createWeb3UI(): void {
    const { width, height } = this.cameras.main;
    const isMobile = width < 600;
    
    if (!web3Manager.isAvailable()) {
      // Show "No Wallet" indicator
      this.add.text(width - 15, height - 70, '🔌 No Wallet', {
        fontSize: '11px',
        color: '#666666',
        fontFamily: BODY_FONT
      }).setOrigin(1, 0.5);
      return;
    }
    
    // Initialize Web3 UI system
    this.web3UI = new Web3UI(this);
    
    const btnY = isMobile ? height - 80 : height - 70;
    this.walletButton = this.web3UI.createWalletButton(width - 85, btnY);
  }

  private createFooter(): void {
    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height - 20, 'Made by tufstraka', {
      fontSize: '10px',
      color: '#333',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
  }
}
