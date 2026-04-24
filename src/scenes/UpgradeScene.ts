import Phaser from 'phaser';
import { COLORS, UPGRADES, CONFIG } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';
import { soundManager } from '../utils/SoundManager';

export class UpgradeScene extends Phaser.Scene {
  private fromGameOver: boolean = false;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data: { fromGameOver?: boolean }): void {
    this.fromGameOver = data?.fromGameOver || false;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_BOTTOM, COLORS.BG_GRADIENT_BOTTOM);
    bg.fillRect(0, 0, width, height);
    
    // Title
    this.add.text(width / 2, 40, '⚡ UPGRADES ⚡', {
      fontSize: '32px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Currency display (prominent)
    const currencyBg = this.add.graphics();
    currencyBg.fillStyle(0x1a1a2e, 0.8);
    currencyBg.fillRoundedRect(width / 2 - 80, 70, 160, 40, 8);
    currencyBg.lineStyle(2, 0xFFD700, 0.5);
    currencyBg.strokeRoundedRect(width / 2 - 80, 70, 160, 40, 8);
    
    const currencyText = this.add.text(width / 2, 90, `⚙️ ${progression.currency}`, {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Upgrade cards - calculate layout
    const startY = 130;
    const cardHeight = 75;
    const cardSpacing = 8;
    const totalCardsHeight = UPGRADES.length * (cardHeight + cardSpacing);
    const buttonsY = startY + totalCardsHeight + 15;
    
    // Create upgrade cards
    UPGRADES.forEach((upgrade, index) => {
      this.createUpgradeCard(
        width / 2,
        startY + index * (cardHeight + cardSpacing),
        upgrade,
        currencyText,
        cardHeight
      );
    });
    
    // === BOTTOM BUTTONS ===
    const buttonWidth = 140;
    const buttonHeight = 45;
    const buttonGap = 20;
    
    // PLAY button (primary)
    this.createButton(
      width / 2 - buttonWidth / 2 - buttonGap / 2, 
      buttonsY, 
      '▶ PLAY', 
      COLORS.NEON_CYAN, 
      buttonWidth,
      buttonHeight,
      () => {
        soundManager.playClick();
        this.scene.start('RunnerScene');
      }
    );
    
    // MENU button (secondary)
    this.createButton(
      width / 2 + buttonWidth / 2 + buttonGap / 2, 
      buttonsY, 
      '🏠 MENU', 
      0x666666, 
      buttonWidth,
      buttonHeight,
      () => {
        soundManager.playClick();
        this.scene.start('MenuScene');
      }
    );
    
    // If there's room, show tip
    if (height > buttonsY + 100) {
      this.add.text(width / 2, buttonsY + 70, 'Gears carry over between runs!', {
        fontSize: '12px',
        color: '#555',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }
  }

  private createUpgradeCard(
    x: number, 
    y: number, 
    upgrade: typeof UPGRADES[0],
    currencyText: Phaser.GameObjects.Text,
    cardHeight: number
  ): void {
    const { width } = this.cameras.main;
    const cardWidth = Math.min(480, width - 40);
    
    const currentLevel = progression.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const costs = CONFIG.UPGRADE_COSTS[upgrade.id as keyof typeof CONFIG.UPGRADE_COSTS] || [100, 200, 300];
    const cost = isMaxed ? 0 : costs[currentLevel];
    const canAfford = progression.currency >= cost;
    
    // Card background
    const card = this.add.graphics();
    const bgColor = isMaxed ? 0x1a3a1a : 0x1a1a2e;
    card.fillStyle(bgColor, 0.9);
    card.fillRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 8);
    
    const borderColor = isMaxed ? 0x39FF14 : (canAfford ? COLORS.NEON_CYAN : 0x333333);
    card.lineStyle(2, borderColor, 0.6);
    card.strokeRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 8);
    
    // Icon
    this.add.text(x - cardWidth / 2 + 25, y + cardHeight / 2, upgrade.icon, {
      fontSize: '28px'
    }).setOrigin(0.5);
    
    // Name + Level
    const levelStr = isMaxed ? ' (MAX)' : ` Lv.${currentLevel}`;
    this.add.text(x - cardWidth / 2 + 55, y + 12, upgrade.name + levelStr, {
      fontSize: '15px',
      color: isMaxed ? '#39FF14' : '#FFFFFF',
      fontFamily: 'monospace'
    });
    
    // Description with current effect
    const effectValue = upgrade.effect(currentLevel);
    let descText = upgrade.description.replace('{n}', effectValue.toString());
    
    this.add.text(x - cardWidth / 2 + 55, y + 32, descText, {
      fontSize: '11px',
      color: '#888',
      fontFamily: 'monospace'
    });
    
    // Level pips
    const pipsStartX = x - cardWidth / 2 + 55;
    for (let i = 0; i < upgrade.maxLevel; i++) {
      const pipColor = i < currentLevel ? 0x39FF14 : 0x333333;
      this.add.rectangle(pipsStartX + i * 18, y + 55, 12, 8, pipColor).setOrigin(0, 0.5);
    }
    
    // Buy button or MAX badge
    if (isMaxed) {
      this.add.text(x + cardWidth / 2 - 50, y + cardHeight / 2, '✓ MAX', {
        fontSize: '14px',
        color: '#39FF14',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    } else {
      const btnWidth = 70;
      const btnHeight = 32;
      const btnX = x + cardWidth / 2 - 55;
      const btnY = y + cardHeight / 2;
      
      const btn = this.add.graphics();
      const btnColor = canAfford ? COLORS.NEON_CYAN : 0x444444;
      
      btn.fillStyle(btnColor, canAfford ? 0.3 : 0.1);
      btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
      btn.lineStyle(1, btnColor, canAfford ? 0.8 : 0.3);
      btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
      
      const btnText = this.add.text(btnX, btnY, `⚙️${cost}`, {
        fontSize: '13px',
        color: canAfford ? '#FFFFFF' : '#555',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      if (canAfford) {
        const hitArea = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        
        hitArea.on('pointerdown', () => {
          if (progression.upgradeLevel(upgrade.id, upgrade.maxLevel, cost)) {
            soundManager.playCoinCollect();
            this.scene.restart();
          }
        });
        
        hitArea.on('pointerover', () => {
          soundManager.playHover();
          btn.clear();
          btn.fillStyle(btnColor, 0.5);
          btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
          btn.lineStyle(2, btnColor, 1);
          btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
        });
        
        hitArea.on('pointerout', () => {
          btn.clear();
          btn.fillStyle(btnColor, 0.3);
          btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
          btn.lineStyle(1, btnColor, 0.8);
          btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 4);
        });
      }
    }
  }

  private createButton(
    x: number, 
    y: number, 
    text: string, 
    color: number, 
    width: number,
    height: number,
    callback: () => void
  ): void {
    const btn = this.add.graphics();
    btn.fillStyle(color, 0.2);
    btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    btn.lineStyle(2, color, 0.8);
    btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    
    const label = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      soundManager.playHover();
      btn.clear();
      btn.fillStyle(color, 0.4);
      btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      btn.lineStyle(2, color, 1);
      btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    });
    
    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.2);
      btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      btn.lineStyle(2, color, 0.8);
      btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    });
    
    hitArea.on('pointerdown', callback);
  }
}
