import Phaser from 'phaser';
import { COLORS, UPGRADES } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';

// Fun fonts
const TITLE_FONT = '"Press Start 2P", "Courier New", monospace';
const BODY_FONT = '"VT323", "Courier New", monospace';

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
    
    // Title with glitch effect
    const titleText = this.runData.isNewBest ? '🎉 NEW BEST! 🎉' : 'SYSTEM FAILURE';
    const titleColor = this.runData.isNewBest ? '#FFD700' : '#FF0080';
    
    const title = this.add.text(width / 2, 100, titleText, {
      fontSize: this.runData.isNewBest ? '24px' : '20px',
      color: titleColor,
      fontFamily: TITLE_FONT,
      stroke: '#000',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: this.runData.isNewBest ? '#FF0080' : '#00FFFF',
        blur: 0,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Shake animation for failure
    if (!this.runData.isNewBest) {
      this.tweens.add({
        targets: title,
        x: title.x + Phaser.Math.Between(-3, 3),
        duration: 50,
        yoyo: true,
        repeat: 5
      });
    }
    
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
      fontSize: '10px',
      color: '#888',
      fontFamily: TITLE_FONT
    });
    this.add.text(width / 2 + 180, panelY + 20, this.runData.score.toString(), {
      fontSize: '36px',
      color: '#00FFFF',
      fontFamily: BODY_FONT
    }).setOrigin(1, 0);
    
    // Time
    const mins = Math.floor(this.runData.time / 60);
    const secs = Math.floor(this.runData.time % 60);
    this.add.text(width / 2 - 180, panelY + 70, 'TIME', {
      fontSize: '10px',
      color: '#888',
      fontFamily: TITLE_FONT
    });
    this.add.text(width / 2 + 180, panelY + 70, `${mins}:${secs.toString().padStart(2, '0')}`, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: BODY_FONT
    }).setOrigin(1, 0);
    
    // Gears collected
    this.add.text(width / 2 - 180, panelY + 110, 'GEARS', {
      fontSize: '10px',
      color: '#888',
      fontFamily: TITLE_FONT
    });
    this.add.text(width / 2 + 180, panelY + 110, `+${this.runData.gears} ⚙️`, {
      fontSize: '28px',
      color: '#F39C12',
      fontFamily: BODY_FONT
    }).setOrigin(1, 0);
    
    // Max combo
    this.add.text(width / 2 - 180, panelY + 150, 'COMBO', {
      fontSize: '10px',
      color: '#888',
      fontFamily: TITLE_FONT
    });
    this.add.text(width / 2 + 180, panelY + 150, `${this.runData.maxCombo}x`, {
      fontSize: '28px',
      color: '#FF0080',
      fontFamily: BODY_FONT
    }).setOrigin(1, 0);
    
    // Total gears
    this.add.text(width / 2, panelY + panelHeight + 30, `Total Gears: ${progression.currency} ⚙️`, {
      fontSize: '24px',
      color: '#F39C12',
      fontFamily: BODY_FONT
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
      fontSize: '10px',
      color: '#666',
      fontFamily: TITLE_FONT
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'))
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#FFF'); })
      .on('pointerout', function(this: Phaser.GameObjects.Text) { this.setColor('#666'); });
    
    // Quick restart with Space
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('RunnerScene');
    });
    
    // Touch anywhere text
    const hintText = this.add.text(width / 2, height - 40, '⬆️ SPACE to retry ⬆️', {
      fontSize: '18px',
      color: '#666',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    
    // Blink animation
    this.tweens.add({
      targets: hintText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  private createButton(x: number, y: number, text: string, color: number, callback: () => void): void {
    const btn = this.add.graphics();
    btn.fillStyle(color, 0.2);
    btn.fillRoundedRect(-80, -25, 160, 50, 8);
    btn.lineStyle(2, color, 0.8);
    btn.strokeRoundedRect(-80, -25, 160, 50, 8);
    btn.setPosition(x, y);
    
    const label = this.add.text(x, y, text, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: TITLE_FONT
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
