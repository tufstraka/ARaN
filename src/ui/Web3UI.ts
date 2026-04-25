/**
 * Web3 UI Components
 * Better UX for blockchain interactions
 */

import Phaser from 'phaser';
import { web3Manager, ACHIEVEMENT_NAMES, ACHIEVEMENT_DESCRIPTIONS, AchievementType } from '../utils/Web3Manager';
import { progression } from '../managers/ProgressionManager';

const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

interface ModalElements {
  overlay: Phaser.GameObjects.Rectangle;
  container: Phaser.GameObjects.Container;
}

export class Web3UI {
  private scene: Phaser.Scene;
  private currentModal: ModalElements | null = null;
  private loadingSpinner: Phaser.GameObjects.Container | null = null;
  private toastContainer: Phaser.GameObjects.Container | null = null;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    web3Manager.on('transaction_pending', (msg: unknown) => {
      this.showLoading(msg as string);
    });
    
    web3Manager.on('transaction_success', (msg: unknown) => {
      this.hideLoading();
      this.showToast(msg as string, 'success');
    });
    
    web3Manager.on('error', (msg: unknown) => {
      this.hideLoading();
      this.showToast(msg as string, 'error');
    });
  }
  
  // === WALLET BUTTON ===
  
  createWalletButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    
    const isConnected = web3Manager.isConnected();
    const btnWidth = 140;
    const btnHeight = 36;
    
    // Background
    const bg = this.scene.add.graphics();
    this.drawWalletButton(bg, btnWidth, btnHeight, isConnected, false);
    container.add(bg);
    
    // Icon
    const icon = this.scene.add.text(-btnWidth/2 + 15, 0, isConnected ? '🔗' : '🔌', {
      fontSize: '16px'
    }).setOrigin(0, 0.5);
    container.add(icon);
    
    // Text
    const text = this.scene.add.text(5, 0, isConnected ? web3Manager.getShortAddress() : 'Connect', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(text);
    
    // Network indicator
    if (isConnected) {
      const networkDot = this.scene.add.circle(btnWidth/2 - 15, 0, 4, 0x00ff00);
      container.add(networkDot);
      
      // Pulse animation
      this.scene.tweens.add({
        targets: networkDot,
        alpha: 0.3,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Interaction
    const hitArea = this.scene.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      this.drawWalletButton(bg, btnWidth, btnHeight, isConnected, true);
    });
    
    hitArea.on('pointerout', () => {
      this.drawWalletButton(bg, btnWidth, btnHeight, isConnected, false);
    });
    
    hitArea.on('pointerdown', async () => {
      if (isConnected) {
        this.showWalletModal();
      } else {
        await this.connectWallet(text, icon, bg, btnWidth, btnHeight);
      }
    });
    
    return container;
  }
  
  private drawWalletButton(g: Phaser.GameObjects.Graphics, w: number, h: number, connected: boolean, hover: boolean): void {
    g.clear();
    
    const baseColor = connected ? 0x00aa44 : 0x9945ff;
    const alpha = hover ? 0.9 : 0.7;
    
    // Gradient-like effect
    g.fillStyle(baseColor, alpha * 0.3);
    g.fillRoundedRect(-w/2, -h/2, w, h, 8);
    
    g.lineStyle(2, baseColor, alpha);
    g.strokeRoundedRect(-w/2, -h/2, w, h, 8);
    
    if (hover) {
      g.fillStyle(baseColor, 0.1);
      g.fillRoundedRect(-w/2, -h/2, w, h, 8);
    }
  }
  
  private async connectWallet(
    text: Phaser.GameObjects.Text,
    icon: Phaser.GameObjects.Text,
    bg: Phaser.GameObjects.Graphics,
    w: number, h: number
  ): Promise<void> {
    if (!web3Manager.isAvailable()) {
      this.showNoWalletModal();
      return;
    }
    
    text.setText('Connecting...');
    icon.setText('⏳');
    
    const address = await web3Manager.connect();
    
    if (address) {
      text.setText(web3Manager.getShortAddress());
      icon.setText('🔗');
      this.drawWalletButton(bg, w, h, true, false);
      this.showToast('Wallet connected!', 'success');
    } else {
      text.setText('Connect');
      icon.setText('🔌');
    }
  }
  
  // === NO WALLET MODAL ===
  
  private showNoWalletModal(): void {
    const { width, height } = this.scene.cameras.main;
    
    const modal = this.createModal(340, 280);
    
    // Title
    const title = this.scene.add.text(0, -100, '🦊 Wallet Required', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.container.add(title);
    
    // Message
    const message = this.scene.add.text(0, -40, 
      'To use blockchain features,\nyou need a Web3 wallet.\n\nWe recommend MetaMask:', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: BODY_FONT,
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    modal.container.add(message);
    
    // MetaMask button
    const mmBtn = this.createButton(0, 40, 200, 44, '🦊 Get MetaMask', 0xff6b00, () => {
      window.open('https://metamask.io/download/', '_blank');
    });
    modal.container.add(mmBtn);
    
    // Alternative wallets note
    const altNote = this.scene.add.text(0, 90, 'Or use any Web3 wallet:\nRabby, Coinbase, Trust...', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: BODY_FONT,
      align: 'center'
    }).setOrigin(0.5);
    modal.container.add(altNote);
    
    // Close
    this.addCloseButton(modal, 0, 120);
  }
  
  // === WALLET MODAL (Connected) ===
  
  showWalletModal(): void {
    const modal = this.createModal(380, 480);
    
    // Header with address
    const addressBg = this.scene.add.graphics();
    addressBg.fillStyle(0x1a1a2e, 1);
    addressBg.fillRoundedRect(-160, -210, 320, 60, 8);
    modal.container.add(addressBg);
    
    const walletIcon = this.scene.add.text(-140, -180, '🔗', { fontSize: '24px' }).setOrigin(0, 0.5);
    modal.container.add(walletIcon);
    
    const address = this.scene.add.text(-100, -190, web3Manager.getShortAddress(), {
      fontSize: '16px',
      color: '#00ffff',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    modal.container.add(address);
    
    const networkLabel = this.scene.add.text(-100, -165, '● Sepolia Testnet', {
      fontSize: '11px',
      color: '#00ff00',
      fontFamily: BODY_FONT
    }).setOrigin(0, 0.5);
    modal.container.add(networkLabel);
    
    // Copy address button
    const copyBtn = this.scene.add.text(140, -180, '📋', { fontSize: '18px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    copyBtn.on('pointerdown', () => {
      navigator.clipboard.writeText(web3Manager.getAddress() || '');
      this.showToast('Address copied!', 'info');
    });
    modal.container.add(copyBtn);
    
    // Stats section
    this.addStatsSection(modal.container, -130);
    
    // Actions section
    const actionsY = 20;
    
    const submitBtn = this.createButton(0, actionsY, 280, 44, '📤 Submit High Score', 0x00aaff, async () => {
      const stats = progression.stats;
      if (stats.bestScore === 0) {
        this.showToast('Play a game first!', 'warning');
        return;
      }
      await web3Manager.submitScore(stats.bestScore);
    });
    modal.container.add(submitBtn);
    
    const leaderboardBtn = this.createButton(0, actionsY + 55, 280, 44, '🏆 View Leaderboard', 0x9945ff, () => {
      this.closeModal();
      this.showLeaderboardModal();
    });
    modal.container.add(leaderboardBtn);
    
    const achievementsBtn = this.createButton(0, actionsY + 110, 280, 44, '🎖️ My Achievements', 0xff6b4a, () => {
      this.closeModal();
      this.showAchievementsModal();
    });
    modal.container.add(achievementsBtn);
    
    // Disconnect button
    const disconnectBtn = this.scene.add.text(0, 200, '🔌 Disconnect', {
      fontSize: '12px',
      color: '#ff6666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    disconnectBtn.on('pointerover', () => disconnectBtn.setColor('#ff0000'));
    disconnectBtn.on('pointerout', () => disconnectBtn.setColor('#ff6666'));
    disconnectBtn.on('pointerdown', async () => {
      await web3Manager.disconnect();
      this.closeModal();
      this.showToast('Wallet disconnected', 'info');
      // Refresh the scene to update UI
      this.scene.scene.restart();
    });
    modal.container.add(disconnectBtn);
    
    this.addCloseButton(modal, 160, -200);
  }
  
  private async addStatsSection(container: Phaser.GameObjects.Container, y: number): Promise<void> {
    const stats = await web3Manager.getPlayerStats();
    
    const sectionBg = this.scene.add.graphics();
    sectionBg.fillStyle(0x0a0a15, 0.8);
    sectionBg.fillRoundedRect(-160, y, 320, 100, 8);
    container.add(sectionBg);
    
    const title = this.scene.add.text(-145, y + 15, '📊 ON-CHAIN STATS', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: BODY_FONT
    });
    container.add(title);
    
    if (stats) {
      const statsList = [
        ['High Score', stats.highScore.toLocaleString()],
        ['Games Played', stats.totalGamesPlayed.toString()],
        ['Achievements', stats.achievements.filter(a => a).length + '/5']
      ];
      
      statsList.forEach(([label, value], i) => {
        const labelText = this.scene.add.text(-145, y + 40 + i * 20, label, {
          fontSize: '11px',
          color: '#888888',
          fontFamily: BODY_FONT
        });
        container.add(labelText);
        
        const valueText = this.scene.add.text(145, y + 40 + i * 20, value, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: BODY_FONT,
          fontStyle: 'bold'
        }).setOrigin(1, 0);
        container.add(valueText);
      });
    } else {
      const noStats = this.scene.add.text(0, y + 50, 'No on-chain data yet\nSubmit a score to start!', {
        fontSize: '11px',
        color: '#666666',
        fontFamily: BODY_FONT,
        align: 'center'
      }).setOrigin(0.5);
      container.add(noStats);
    }
  }
  
  // === LEADERBOARD MODAL ===
  
  async showLeaderboardModal(): Promise<void> {
    const modal = this.createModal(400, 500);
    
    const title = this.scene.add.text(0, -220, '🏆 GLOBAL LEADERBOARD', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.container.add(title);
    
    const subtitle = this.scene.add.text(0, -195, 'On-chain high scores (Sepolia)', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    modal.container.add(subtitle);
    
    // Loading indicator
    const loadingText = this.scene.add.text(0, 0, '⏳ Loading...', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    modal.container.add(loadingText);
    
    // Fetch leaderboard
    const entries = await web3Manager.getLeaderboard(0, 10);
    loadingText.destroy();
    
    if (entries.length === 0) {
      const empty = this.scene.add.text(0, 0, 'No scores yet!\nBe the first to submit.', {
        fontSize: '14px',
        color: '#666666',
        fontFamily: BODY_FONT,
        align: 'center'
      }).setOrigin(0.5);
      modal.container.add(empty);
    } else {
      // Header
      const headerY = -160;
      this.scene.add.text(-170, headerY, 'RANK', { fontSize: '10px', color: '#666', fontFamily: BODY_FONT });
      this.scene.add.text(-100, headerY, 'PLAYER', { fontSize: '10px', color: '#666', fontFamily: BODY_FONT });
      this.scene.add.text(100, headerY, 'SCORE', { fontSize: '10px', color: '#666', fontFamily: BODY_FONT });
      
      entries.forEach((entry, i) => {
        const rowY = -130 + i * 35;
        const isMe = entry.player.toLowerCase() === web3Manager.getAddress()?.toLowerCase();
        const color = isMe ? '#00ffff' : '#ffffff';
        
        // Rank with medal
        const medals = ['🥇', '🥈', '🥉'];
        const rank = i < 3 ? medals[i] : `#${i + 1}`;
        const rankText = this.scene.add.text(-170, rowY, rank, {
          fontSize: i < 3 ? '18px' : '12px',
          color: color,
          fontFamily: BODY_FONT
        });
        modal.container.add(rankText);
        
        // Player address
        const shortAddr = `${entry.player.slice(0, 6)}...${entry.player.slice(-4)}`;
        const addrText = this.scene.add.text(-100, rowY, shortAddr + (isMe ? ' (you)' : ''), {
          fontSize: '11px',
          color: color,
          fontFamily: BODY_FONT
        });
        modal.container.add(addrText);
        
        // Score
        const scoreText = this.scene.add.text(170, rowY, entry.score.toLocaleString(), {
          fontSize: '13px',
          color: color,
          fontFamily: BODY_FONT,
          fontStyle: 'bold'
        }).setOrigin(1, 0);
        modal.container.add(scoreText);
        
        // Highlight row if it's me
        if (isMe) {
          const highlight = this.scene.add.graphics();
          highlight.fillStyle(0x00ffff, 0.1);
          highlight.fillRoundedRect(-180, rowY - 5, 360, 30, 4);
          modal.container.add(highlight);
          modal.container.sendToBack(highlight);
        }
      });
    }
    
    this.addCloseButton(modal, 0, 210);
  }
  
  // === ACHIEVEMENTS MODAL ===
  
  async showAchievementsModal(): Promise<void> {
    const modal = this.createModal(400, 500);
    
    const title = this.scene.add.text(0, -220, '🎖️ ACHIEVEMENTS', {
      fontSize: '18px',
      color: '#ff6b4a',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.container.add(title);
    
    const subtitle = this.scene.add.text(0, -195, 'Mint achievements as NFTs!', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    modal.container.add(subtitle);
    
    const stats = await web3Manager.getPlayerStats();
    const achievements = stats?.achievements || [false, false, false, false, false];
    
    const achievementTypes = [
      AchievementType.BOOT_COMPLETE,
      AchievementType.GRAVITY_MASTER,
      AchievementType.SPEED_DEMON,
      AchievementType.CHAOS_SURVIVOR,
      AchievementType.FACTORY_ESCAPE
    ];
    
    achievementTypes.forEach((type, i) => {
      const y = -140 + i * 75;
      const unlocked = achievements[type];
      
      // Card background
      const cardBg = this.scene.add.graphics();
      cardBg.fillStyle(unlocked ? 0x1a2a1a : 0x1a1a2e, 0.8);
      cardBg.fillRoundedRect(-170, y, 340, 65, 8);
      if (unlocked) {
        cardBg.lineStyle(1, 0x00ff00, 0.3);
        cardBg.strokeRoundedRect(-170, y, 340, 65, 8);
      }
      modal.container.add(cardBg);
      
      // Icon
      const icons = ['🚀', '🔄', '⚡', '🔥', '🏆'];
      const icon = this.scene.add.text(-150, y + 20, unlocked ? icons[i] : '🔒', {
        fontSize: '24px'
      });
      modal.container.add(icon);
      
      // Name
      const name = this.scene.add.text(-110, y + 10, ACHIEVEMENT_NAMES[type], {
        fontSize: '13px',
        color: unlocked ? '#ffffff' : '#666666',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
      });
      modal.container.add(name);
      
      // Description
      const desc = this.scene.add.text(-110, y + 30, ACHIEVEMENT_DESCRIPTIONS[type], {
        fontSize: '10px',
        color: unlocked ? '#888888' : '#444444',
        fontFamily: BODY_FONT
      });
      modal.container.add(desc);
      
      // Mint button if unlocked but not yet minted
      if (unlocked) {
        const mintBtn = this.scene.add.text(140, y + 20, '✨ MINT', {
          fontSize: '11px',
          color: '#ffd700',
          fontFamily: BODY_FONT,
          fontStyle: 'bold',
          backgroundColor: '#332200',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        mintBtn.on('pointerover', () => mintBtn.setColor('#ffffff'));
        mintBtn.on('pointerout', () => mintBtn.setColor('#ffd700'));
        mintBtn.on('pointerdown', async () => {
          await web3Manager.mintAchievement(type);
        });
        modal.container.add(mintBtn);
      }
    });
    
    this.addCloseButton(modal, 0, 210);
  }
  
  // === HELPERS ===
  
  private createModal(width: number, height: number): ModalElements {
    const { width: screenW, height: screenH } = this.scene.cameras.main;
    
    // Overlay
    const overlay = this.scene.add.rectangle(0, 0, screenW, screenH, 0x000000, 0.85)
      .setOrigin(0)
      .setInteractive()
      .setDepth(1000);
    
    // Container
    const container = this.scene.add.container(screenW / 2, screenH / 2).setDepth(1001);
    
    // Modal background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.98);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
    bg.lineStyle(2, 0x00ffff, 0.3);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
    container.add(bg);
    
    // Close on overlay click
    overlay.on('pointerdown', () => this.closeModal());
    
    this.currentModal = { overlay, container };
    return this.currentModal;
  }
  
  private addCloseButton(modal: ModalElements, x: number, y: number): void {
    const closeBtn = this.scene.add.text(x, y, '✕', {
      fontSize: '20px',
      color: '#666666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#666666'));
    closeBtn.on('pointerdown', () => this.closeModal());
    
    modal.container.add(closeBtn);
  }
  
  private closeModal(): void {
    if (this.currentModal) {
      this.currentModal.overlay.destroy();
      this.currentModal.container.destroy();
      this.currentModal = null;
    }
  }
  
  private createButton(
    x: number, y: number, 
    width: number, height: number, 
    text: string, 
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 0.2);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
    bg.lineStyle(2, color, 0.6);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
    container.add(bg);
    
    const label = this.scene.add.text(0, 0, text, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.4);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
      bg.lineStyle(2, color, 1);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
    });
    
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 0.2);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
      bg.lineStyle(2, color, 0.6);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
    });
    
    hitArea.on('pointerdown', onClick);
    
    return container;
  }
  
  // === LOADING SPINNER ===
  
  showLoading(message: string): void {
    if (this.loadingSpinner) return;
    
    const { width, height } = this.scene.cameras.main;
    
    this.loadingSpinner = this.scene.add.container(width / 2, height / 2).setDepth(2000);
    
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    this.loadingSpinner.add(bg);
    
    // Spinner animation
    const spinner = this.scene.add.text(0, -20, '⏳', { fontSize: '32px' }).setOrigin(0.5);
    this.loadingSpinner.add(spinner);
    
    this.scene.tweens.add({
      targets: spinner,
      rotation: Math.PI * 2,
      duration: 1500,
      repeat: -1,
      ease: 'Linear'
    });
    
    const text = this.scene.add.text(0, 30, message, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    this.loadingSpinner.add(text);
    
    const hint = this.scene.add.text(0, 55, 'Confirm in your wallet...', {
      fontSize: '11px',
      color: '#888888',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    this.loadingSpinner.add(hint);
  }
  
  hideLoading(): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.destroy();
      this.loadingSpinner = null;
    }
  }
  
  // === TOAST NOTIFICATIONS ===
  
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const { width } = this.scene.cameras.main;
    
    const colors = {
      success: { bg: 0x00aa44, icon: '✓' },
      error: { bg: 0xff4444, icon: '✕' },
      warning: { bg: 0xffaa00, icon: '⚠' },
      info: { bg: 0x0088ff, icon: 'ℹ' }
    };
    
    const config = colors[type];
    
    const toast = this.scene.add.container(width / 2, -50).setDepth(3000);
    
    const bg = this.scene.add.graphics();
    bg.fillStyle(config.bg, 0.95);
    bg.fillRoundedRect(-150, -20, 300, 40, 8);
    toast.add(bg);
    
    const icon = this.scene.add.text(-130, 0, config.icon, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    toast.add(icon);
    
    const text = this.scene.add.text(0, 0, message, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    toast.add(text);
    
    // Animate in
    this.scene.tweens.add({
      targets: toast,
      y: 60,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Animate out after delay
    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({
        targets: toast,
        y: -50,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => toast.destroy()
      });
    });
  }
}
