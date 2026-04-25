import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';
import { soundManager } from '../utils/SoundManager';
import { web3Manager } from '../utils/Web3Manager';
import { BackgroundAnimations } from '../utils/BackgroundAnimations';

// Elegant modern fonts
const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

export class MenuScene extends Phaser.Scene {
  private walletButton?: Phaser.GameObjects.Text;
  private walletStatus?: Phaser.GameObjects.Text;
  private bgAnimations?: BackgroundAnimations;
  
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
    const secondaryBtnWidth = isMobile ? Math.min(width * 0.42, 160) : 120;
    const secondaryBtnHeight = isMobile ? 50 : 40;
    const secondarySpacing = isMobile ? Math.min(width * 0.25, 90) : 100;
    
    this.createSecondaryButton(width / 2 - secondarySpacing, secondaryY, '⚡ UPGRADES', secondaryBtnWidth, secondaryBtnHeight, () => {
      this.scene.start('UpgradeScene');
    });
    
    this.createSecondaryButton(width / 2 + secondarySpacing, secondaryY, '🏆 STATS', secondaryBtnWidth, secondaryBtnHeight, () => {
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

  private createWeb3UI(): void {
    const { width, height } = this.cameras.main;
    const isMobile = width < 600;
    
    if (!web3Manager.isAvailable()) return;
    
    const btnY = isMobile ? height - 80 : height - 70;
    const btnWidth = isMobile ? 140 : 160;
    const btnHeight = 36;
    
    const bg = this.add.graphics();
    bg.setPosition(width - btnWidth / 2 - 15, btnY);
    
    const updateButtonStyle = (connected: boolean, hover: boolean = false) => {
      bg.clear();
      const color = connected ? 0x00AA00 : 0x9945FF;
      const alpha = hover ? 0.6 : 0.4;
      bg.fillStyle(color, alpha);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(2, color, hover ? 1 : 0.7);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    };
    
    updateButtonStyle(web3Manager.isConnected());
    
    const buttonText = web3Manager.isConnected()
      ? web3Manager.getShortAddress()
      : 'Connect Wallet';
    
    this.walletButton = this.add.text(width - btnWidth / 2 - 15, btnY, buttonText, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(width - btnWidth / 2 - 15, btnY, btnWidth + 10, btnHeight + 10, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      updateButtonStyle(web3Manager.isConnected(), true);
    });
    
    hitArea.on('pointerout', () => {
      updateButtonStyle(web3Manager.isConnected(), false);
    });
    
    hitArea.on('pointerdown', async () => {
      if (web3Manager.isConnected()) {
        this.showWeb3Modal();
      } else {
        this.walletButton?.setText('Connecting...');
        const address = await web3Manager.connect();
        if (address) {
          this.walletButton?.setText(web3Manager.getShortAddress());
          updateButtonStyle(true);
          this.showToast('Wallet connected!', 0x00AA00);
        } else {
          this.walletButton?.setText('Connect Wallet');
          this.showToast('Connection failed', 0xFF0000);
        }
      }
    });
    
    web3Manager.on('error', (message: unknown) => {
      this.showToast(message as string, 0xFF0000);
    });
    
    web3Manager.on('transaction_pending', (message: unknown) => {
      this.showToast(message as string, 0xFFAA00);
    });
    
    web3Manager.on('transaction_success', (message: unknown) => {
      this.showToast(message as string, 0x00AA00);
    });
  }
  
  private showWeb3Modal(): void {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
    overlay.setInteractive();
    
    const modalWidth = Math.min(400, width - 40);
    const modalHeight = 320;
    
    const modal = this.add.graphics();
    modal.fillStyle(0x1a1a2e, 0.98);
    modal.fillRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    modal.lineStyle(2, 0x9945FF, 0.6);
    modal.strokeRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    
    this.add.text(width / 2, height / 2 - modalHeight / 2 + 30, 'BLOCKCHAIN', {
      fontSize: '20px',
      color: '#9945FF',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('web3modal');
    
    const address = web3Manager.getAddress();
    if (address) {
      this.add.text(width / 2, height / 2 - modalHeight / 2 + 60, `${address.slice(0, 10)}...${address.slice(-8)}`, {
        fontSize: '12px',
        color: '#00FF00',
        fontFamily: 'monospace'
      }).setOrigin(0.5).setName('web3modal');
    }
    
    const btnY = height / 2 - 40;
    const btnSpacing = 55;
    
    this.createWeb3ModalButton(width / 2, btnY, 'Submit Score', async () => {
      const score = progression.stats.bestScore;
      if (score > 0) {
        await web3Manager.submitScore(score);
      } else {
        this.showToast('Play first to get a score!', 0xFFAA00);
      }
    });
    
    this.createWeb3ModalButton(width / 2, btnY + btnSpacing, 'View Leaderboard', async () => {
      this.closeWeb3Modal(overlay, modal);
      this.showLeaderboardModal();
    });
    
    this.createWeb3ModalButton(width / 2, btnY + btnSpacing * 2, 'My Achievements', async () => {
      this.closeWeb3Modal(overlay, modal);
      this.showAchievementsModal();
    });
    
    const disconnectBtn = this.add.text(width / 2, height / 2 + modalHeight / 2 - 50, 'Disconnect', {
      fontSize: '14px',
      color: '#FF6666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('web3modal');
    
    disconnectBtn.on('pointerover', () => disconnectBtn.setColor('#FF0000'));
    disconnectBtn.on('pointerout', () => disconnectBtn.setColor('#FF6666'));
    disconnectBtn.on('pointerdown', async () => {
      await web3Manager.disconnect();
      this.walletButton?.setText('Connect Wallet');
      this.closeWeb3Modal(overlay, modal);
      this.showToast('Wallet disconnected', 0x666666);
    });
    
    const closeBtn = this.add.text(width / 2, height / 2 + modalHeight / 2 - 20, '[ CLOSE ]', {
      fontSize: '14px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('web3modal');
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#666'));
    closeBtn.on('pointerdown', () => this.closeWeb3Modal(overlay, modal));
    
    overlay.on('pointerdown', () => this.closeWeb3Modal(overlay, modal));
  }
  
  private createWeb3ModalButton(x: number, y: number, text: string, callback: () => void): void {
    const btnWidth = 200;
    const btnHeight = 40;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x333355, 0.8);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(1, 0x9945FF, 0.5);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    bg.setName('web3modal');
    
    const btn = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('web3modal');
    
    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true }).setName('web3modal');
    
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x444477, 0.9);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0x9945FF, 1);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    });
    
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x333355, 0.8);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(1, 0x9945FF, 0.5);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    });
    
    hitArea.on('pointerdown', callback);
  }
  
  private closeWeb3Modal(overlay: Phaser.GameObjects.Rectangle, modal: Phaser.GameObjects.Graphics): void {
    this.children.list
      .filter(child => child.name === 'web3modal')
      .forEach(child => child.destroy());
    overlay.destroy();
    modal.destroy();
  }
  
  private async showLeaderboardModal(): Promise<void> {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
    overlay.setInteractive();
    
    const modalWidth = Math.min(420, width - 40);
    const modalHeight = 400;
    
    const modal = this.add.graphics();
    modal.fillStyle(0x1a1a2e, 0.98);
    modal.fillRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    modal.lineStyle(2, 0x00FFFF, 0.6);
    modal.strokeRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    
    this.add.text(width / 2, height / 2 - modalHeight / 2 + 30, 'LEADERBOARD', {
      fontSize: '20px',
      color: '#00FFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('leaderboard');
    
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '14px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('leaderboard');
    
    const entries = await web3Manager.getLeaderboard(0, 10);
    loadingText.destroy();
    
    if (entries.length === 0) {
      this.add.text(width / 2, height / 2, 'No scores yet!', {
        fontSize: '14px',
        color: '#888',
        fontFamily: 'monospace'
      }).setOrigin(0.5).setName('leaderboard');
    } else {
      const startY = height / 2 - modalHeight / 2 + 70;
      entries.forEach((entry, i) => {
        const y = startY + i * 28;
        const shortAddr = `${entry.player.slice(0, 6)}...${entry.player.slice(-4)}`;
        const color = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#FFFFFF';
        
        this.add.text(width / 2 - modalWidth / 2 + 30, y, `${i + 1}.`, {
          fontSize: '14px',
          color,
          fontFamily: 'monospace'
        }).setName('leaderboard');
        
        this.add.text(width / 2 - modalWidth / 2 + 60, y, shortAddr, {
          fontSize: '14px',
          color: '#888',
          fontFamily: 'monospace'
        }).setName('leaderboard');
        
        this.add.text(width / 2 + modalWidth / 2 - 30, y, entry.score.toString(), {
          fontSize: '14px',
          color,
          fontFamily: 'monospace'
        }).setOrigin(1, 0).setName('leaderboard');
      });
    }
    
    const closeBtn = this.add.text(width / 2, height / 2 + modalHeight / 2 - 30, '[ CLOSE ]', {
      fontSize: '14px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('leaderboard');
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#666'));
    closeBtn.on('pointerdown', () => {
      this.children.list.filter(c => c.name === 'leaderboard').forEach(c => c.destroy());
      overlay.destroy();
      modal.destroy();
    });
    
    overlay.on('pointerdown', () => {
      this.children.list.filter(c => c.name === 'leaderboard').forEach(c => c.destroy());
      overlay.destroy();
      modal.destroy();
    });
  }
  
  private async showAchievementsModal(): Promise<void> {
    const { width, height } = this.cameras.main;
    const { AchievementType, ACHIEVEMENT_NAMES, ACHIEVEMENT_DESCRIPTIONS } = await import('../utils/Web3Manager');
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
    overlay.setInteractive();
    
    const modalWidth = Math.min(420, width - 40);
    const modalHeight = 400;
    
    const modal = this.add.graphics();
    modal.fillStyle(0x1a1a2e, 0.98);
    modal.fillRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    modal.lineStyle(2, 0xFFD700, 0.6);
    modal.strokeRoundedRect(width / 2 - modalWidth / 2, height / 2 - modalHeight / 2, modalWidth, modalHeight, 16);
    
    this.add.text(width / 2, height / 2 - modalHeight / 2 + 30, 'ACHIEVEMENTS', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setName('achievements');
    
    const stats = progression.stats;
    const startY = height / 2 - modalHeight / 2 + 70;
    
    const achievementChecks = [
      { type: AchievementType.BOOT_COMPLETE, unlocked: stats.totalRuns > 0 },
      { type: AchievementType.GRAVITY_MASTER, unlocked: stats.bestScore >= 500 },
      { type: AchievementType.SPEED_DEMON, unlocked: stats.bestCombo >= 10 },
      { type: AchievementType.CHAOS_SURVIVOR, unlocked: stats.longestRun >= 30 },
      { type: AchievementType.FACTORY_ESCAPE, unlocked: stats.bestScore >= 2000 }
    ];
    
    for (let i = 0; i < achievementChecks.length; i++) {
      const { type, unlocked } = achievementChecks[i];
      const y = startY + i * 55;
      const hasMinted = await web3Manager.hasAchievement(type);
      
      const icon = hasMinted ? '✓' : unlocked ? '○' : '✗';
      const iconColor = hasMinted ? '#00FF00' : unlocked ? '#FFD700' : '#666666';
      
      this.add.text(width / 2 - modalWidth / 2 + 30, y, icon, {
        fontSize: '20px',
        color: iconColor,
        fontFamily: 'monospace'
      }).setName('achievements');
      
      this.add.text(width / 2 - modalWidth / 2 + 60, y, ACHIEVEMENT_NAMES[type], {
        fontSize: '14px',
        color: unlocked ? '#FFFFFF' : '#666666',
        fontFamily: 'monospace'
      }).setName('achievements');
      
      this.add.text(width / 2 - modalWidth / 2 + 60, y + 18, ACHIEVEMENT_DESCRIPTIONS[type], {
        fontSize: '10px',
        color: '#888888',
        fontFamily: 'monospace'
      }).setName('achievements');
      
      if (unlocked && !hasMinted) {
        const mintBtn = this.add.text(width / 2 + modalWidth / 2 - 40, y + 8, 'MINT', {
          fontSize: '12px',
          color: '#9945FF',
          fontFamily: 'monospace',
          backgroundColor: '#222233',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('achievements');
        
        mintBtn.on('pointerover', () => mintBtn.setColor('#FF00FF'));
        mintBtn.on('pointerout', () => mintBtn.setColor('#9945FF'));
        mintBtn.on('pointerdown', async () => {
          mintBtn.setText('...');
          const success = await web3Manager.mintAchievement(type);
          if (success) {
            mintBtn.setText('✓');
            mintBtn.setColor('#00FF00');
            mintBtn.disableInteractive();
          } else {
            mintBtn.setText('MINT');
          }
        });
      }
    }
    
    const closeBtn = this.add.text(width / 2, height / 2 + modalHeight / 2 - 30, '[ CLOSE ]', {
      fontSize: '14px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('achievements');
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#666'));
    closeBtn.on('pointerdown', () => {
      this.children.list.filter(c => c.name === 'achievements').forEach(c => c.destroy());
      overlay.destroy();
      modal.destroy();
    });
    
    overlay.on('pointerdown', () => {
      this.children.list.filter(c => c.name === 'achievements').forEach(c => c.destroy());
      overlay.destroy();
      modal.destroy();
    });
  }
  
  private showToast(message: string, color: number): void {
    const { width, height } = this.cameras.main;
    
    const toast = this.add.text(width / 2, height - 120, message, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: height - 140,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: height - 120,
            duration: 300,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
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
