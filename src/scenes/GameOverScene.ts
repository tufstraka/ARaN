import Phaser from 'phaser';
import { COLORS, UPGRADES } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';

interface GameOverData {
  score: number;
  gears: number;
  time: number;
  maxCombo: number;
  isNewBest: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private runData!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.runData = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Send score to YouTube Playables
    if ((window as any).isYouTubePlayables && (window as any).ytgame) {
      (window as any).ytgame.engagement.sendScore({ value: Math.floor(this.runData.score) })
        .then(() => console.log('YouTube Playables: score sent', this.runData.score))
        .catch((e: any) => console.error('Failed to send score', e));
    }
    
    // Dark overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0);
    
    // Title
    const titleText = this.runData.isNewBest ? '🎉 NEW BEST! 🎉' : 'SYSTEM FAILURE';
    const titleColor = this.runData.isNewBest ? '#FFD700' : '#FF0080';
    
    this.add.text(width / 2, 100, titleText, {
      fontSize: '48px',
      color: titleColor,
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Stats panel
    const panelY = 180;
    const panelHeight = 200;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.9);
    panel.fillRoundedRect(width / 2 - 200, panelY, 400, panelHeight, 16);
    panel.lineStyle(2, COLORS.NEON_CYAN, 0.5);
    panel.strokeRoundedRect(width / 2 - 200, panelY, 400, panelHeight, 16);
    
    // Score
    this.add.text(width / 2 - 180, panelY + 20, 'SCORE', {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 + 180, panelY + 20, this.runData.score.toString(), {
      fontSize: '32px',
      color: '#00FFFF',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);
    
    // Time
    const mins = Math.floor(this.runData.time / 60);
    const secs = Math.floor(this.runData.time % 60);
    this.add.text(width / 2 - 180, panelY + 70, 'TIME', {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 + 180, panelY + 70, `${mins}:${secs.toString().padStart(2, '0')}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);
    
    // Gears collected
    this.add.text(width / 2 - 180, panelY + 110, 'GEARS', {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 + 180, panelY + 110, `+${this.runData.gears} ⚙️`, {
      fontSize: '24px',
      color: '#F39C12',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);
    
    // Max combo
    this.add.text(width / 2 - 180, panelY + 150, 'BEST COMBO', {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'monospace'
    });
    this.add.text(width / 2 + 180, panelY + 150, `${this.runData.maxCombo}x`, {
      fontSize: '24px',
      color: '#FF0080',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);
    
    // Total gears
    this.add.text(width / 2, panelY + panelHeight + 30, `Total Gears: ${progression.currency} ⚙️`, {
      fontSize: '20px',
      color: '#F39C12',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Buttons
    const buttonY = panelY + panelHeight + 100;
    
    // Play Again
    this.createButton(width / 2 - 120, buttonY, 'RETRY', COLORS.NEON_CYAN, () => {
      this.scene.start('RunnerScene');
    });
    
    // Upgrades
    this.createButton(width / 2 + 120, buttonY, 'UPGRADES', COLORS.NEON_PINK, () => {
      this.scene.start('UpgradeScene');
    });
    
    // Menu (smaller, below)
    this.add.text(width / 2, buttonY + 80, '[ MENU ]', {
      fontSize: '16px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'))
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#FFF'); })
      .on('pointerout', function(this: Phaser.GameObjects.Text) { this.setColor('#666'); });
    
    // Quick restart with Space
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('RunnerScene');
    });
    
    // Touch anywhere text
    this.add.text(width / 2, height - 40, 'Press SPACE to retry', {
      fontSize: '14px',
      color: '#444',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, color: number, callback: () => void): void {
    const btn = this.add.graphics();
    btn.fillStyle(color, 0.2);
    btn.fillRoundedRect(-80, -25, 160, 50, 8);
    btn.lineStyle(2, color, 0.8);
    btn.strokeRoundedRect(-80, -25, 160, 50, 8);
    btn.setPosition(x, y);
    
    const label = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Make interactive
    const hitArea = this.add.rectangle(x, y, 160, 50, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(color, 0.4);
      btn.fillRoundedRect(-80, -25, 160, 50, 8);
      btn.lineStyle(2, color, 1);
      btn.strokeRoundedRect(-80, -25, 160, 50, 8);
    });
    
    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.2);
      btn.fillRoundedRect(-80, -25, 160, 50, 8);
      btn.lineStyle(2, color, 0.8);
      btn.strokeRoundedRect(-80, -25, 160, 50, 8);
    });
    
    hitArea.on('pointerdown', callback);
  }
}
