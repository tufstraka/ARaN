import Phaser from 'phaser';
import { COLORS, UPGRADES, CONFIG } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';
import { soundManager } from '../utils/SoundManager';

const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

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
    const isMobile = width < 500;
    const isCompact = height < 580;
    
    // Padding
    const padding = isMobile ? 15 : 30;
    const contentWidth = width - padding * 2;
    
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a15, 0x0a0a15, 0x151525, 0x151525);
    bg.fillRect(0, 0, width, height);
    
    // Title
    const titleY = padding + 15;
    this.add.text(width / 2, titleY, '⚡ UPGRADES', {
      fontSize: isMobile ? '22px' : '28px',
      color: '#00FFFF',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Currency display
    const currencyY = titleY + (isMobile ? 35 : 45);
    const currencyBg = this.add.graphics();
    currencyBg.fillStyle(0x1a1a2e, 0.9);
    currencyBg.fillRoundedRect(width / 2 - 80, currencyY - 18, 160, 36, 8);
    currencyBg.lineStyle(2, 0xFFD700, 0.6);
    currencyBg.strokeRoundedRect(width / 2 - 80, currencyY - 18, 160, 36, 8);
    
    const currencyText = this.add.text(width / 2, currencyY, `⚙️ ${progression.currency} GEARS`, {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Calculate card layout with proportional spacing
    const cardsStartY = currencyY + 40;
    const bottomButtonsHeight = 70;
    const availableHeight = height - cardsStartY - bottomButtonsHeight - padding;
    
    const numCards = UPGRADES.length;
    const minCardHeight = 60;
    const maxCardHeight = 85;
    const cardSpacing = 12;
    
    // Calculate card height to fit available space
    const totalSpacing = (numCards - 1) * cardSpacing;
    const cardHeight = Math.min(maxCardHeight, Math.max(minCardHeight, (availableHeight - totalSpacing) / numCards));
    const totalCardsHeight = numCards * cardHeight + totalSpacing;
    
    // Center cards vertically in available space
    const cardsY = cardsStartY + (availableHeight - totalCardsHeight) / 2;
    
    // Create upgrade cards with proportional spacing
    UPGRADES.forEach((upgrade, index) => {
      this.createUpgradeCard(
        width / 2,
        cardsY + index * (cardHeight + cardSpacing),
        upgrade,
        currencyText,
        cardHeight,
        contentWidth,
        isMobile
      );
    });
    
    // === BOTTOM BUTTONS ===
    const buttonsY = height - padding - 25;
    const buttonWidth = Math.min(140, (contentWidth - 20) / 2);
    const buttonHeight = 45;
    const buttonGap = 20;
    
    // PLAY button (primary)
    this.createButton(
      width / 2 - buttonGap / 2 - buttonWidth / 2, 
      buttonsY, 
      '▶ PLAY', 
      0x00aaff, 
      buttonWidth,
      buttonHeight,
      () => {
        soundManager.playClick();
        this.scene.start('RunnerScene');
      }
    );
    
    // MENU button (secondary)
    this.createButton(
      width / 2 + buttonGap / 2 + buttonWidth / 2, 
      buttonsY, 
      '🏠 MENU', 
      0x555555, 
      buttonWidth,
      buttonHeight,
      () => {
        soundManager.playClick();
        this.scene.start('MenuScene');
      }
    );
  }

  private createUpgradeCard(
    x: number, 
    y: number, 
    upgrade: typeof UPGRADES[0],
    currencyText: Phaser.GameObjects.Text,
    cardHeight: number,
    cardWidth: number,
    isMobile: boolean = false
  ): void {
    const currentLevel = progression.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const costs = CONFIG.UPGRADE_COSTS[upgrade.id as keyof typeof CONFIG.UPGRADE_COSTS] || [100, 200, 300];
    const cost = isMaxed ? 0 : costs[currentLevel];
    const canAfford = progression.currency >= cost;
    
    // Card background
    const card = this.add.graphics();
    const bgColor = isMaxed ? 0x1a2a1a : 0x12121f;
    card.fillStyle(bgColor, 0.95);
    card.fillRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 10);
    
    const borderColor = isMaxed ? 0x39FF14 : (canAfford ? 0x00ffff : 0x333344);
    card.lineStyle(2, borderColor, isMaxed ? 0.8 : 0.5);
    card.strokeRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 10);
    
    // Left section: Icon
    const iconX = x - cardWidth / 2 + 25;
    this.add.text(iconX, y + cardHeight / 2, upgrade.icon, {
      fontSize: isMobile ? '22px' : '26px'
    }).setOrigin(0.5);
    
    // Middle section: Name, description, pips
    const textX = iconX + 35;
    const textWidth = cardWidth - 170;
    
    // Name
    const nameText = this.add.text(textX, y + 12, upgrade.name, {
      fontSize: isMobile ? '13px' : '15px',
      color: isMaxed ? '#39FF14' : '#FFFFFF',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    });
    
    // Level badge - positioned after name text
    const nameWidth = nameText.width;
    const badgeColor = isMaxed ? 0x39FF14 : 0x00ffff;
    const badge = this.add.graphics();
    badge.fillStyle(badgeColor, 0.2);
    const badgeX = textX + nameWidth + 10;
    const levelStr = isMaxed ? 'MAX' : `Lv.${currentLevel + 1}`;
    badge.fillRoundedRect(badgeX, y + 10, 45, 18, 4);
    this.add.text(badgeX + 22, y + 19, levelStr, {
      fontSize: '10px',
      color: isMaxed ? '#39FF14' : '#00ffff',
      fontFamily: BODY_FONT
    }).setOrigin(0.5);
    
    // Description
    const effectValue = upgrade.effect(currentLevel);
    const descText = upgrade.description.replace('{n}', effectValue.toString());
    this.add.text(textX, y + 32, descText, {
      fontSize: '10px',
      color: '#777',
      fontFamily: BODY_FONT,
      wordWrap: { width: textWidth }
    });
    
    // Level pips
    const pipY = y + cardHeight - 15;
    const pipWidth = 20;
    const pipHeight = 5;
    const pipGap = 4;
    for (let i = 0; i < upgrade.maxLevel; i++) {
      const pipColor = i < currentLevel ? 0x39FF14 : 0x333344;
      const pip = this.add.graphics();
      pip.fillStyle(pipColor, i < currentLevel ? 1 : 0.5);
      pip.fillRoundedRect(textX + i * (pipWidth + pipGap), pipY, pipWidth, pipHeight, 2);
    }
    
    // Right section: Buy button or MAX badge
    const btnX = x + cardWidth / 2 - 50;
    const btnY = y + cardHeight / 2;
    const btnWidth = 70;
    const btnHeight = 36;
    
    if (isMaxed) {
      const maxBadge = this.add.graphics();
      maxBadge.fillStyle(0x39FF14, 0.2);
      maxBadge.fillRoundedRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 6);
      this.add.text(btnX, btnY, '✓ MAX', {
        fontSize: '13px',
        color: '#39FF14',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      const btn = this.add.graphics();
      const btnColor = canAfford ? 0x00ffff : 0x444444;
      
      btn.fillStyle(btnColor, canAfford ? 0.3 : 0.1);
      btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
      btn.lineStyle(2, btnColor, canAfford ? 0.8 : 0.3);
      btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
      
      const btnText = this.add.text(btnX, btnY, `⚙️${cost}`, {
        fontSize: '14px',
        color: canAfford ? '#FFFFFF' : '#555',
        fontFamily: BODY_FONT,
        fontStyle: 'bold'
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
          btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
          btn.lineStyle(2, btnColor, 1);
          btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
        });
        
        hitArea.on('pointerout', () => {
          btn.clear();
          btn.fillStyle(btnColor, 0.3);
          btn.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
          btn.lineStyle(2, btnColor, 0.8);
          btn.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
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
    btn.fillStyle(color, 0.3);
    btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    btn.lineStyle(2, color, 0.8);
    btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    
    const label = this.add.text(x, y, text, {
      fontSize: '15px',
      color: '#FFFFFF',
      fontFamily: BODY_FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      soundManager.playHover();
      btn.clear();
      btn.fillStyle(color, 0.5);
      btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      btn.lineStyle(3, color, 1);
      btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      label.setScale(1.05);
    });
    
    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(color, 0.3);
      btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      btn.lineStyle(2, color, 0.8);
      btn.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      label.setScale(1);
    });
    
    hitArea.on('pointerdown', callback);
  }
}
