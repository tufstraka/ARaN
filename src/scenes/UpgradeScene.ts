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
    const isCompact = height < 580;
    
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_BOTTOM, COLORS.BG_GRADIENT_BOTTOM);
    bg.fillRect(0, 0, width, height);
    
    // Title
    this.add.text(width / 2, isCompact ? 20 : 40, '⚡ UPGRADES ⚡', {
      fontSize: isCompact ? '24px' : '32px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Currency display (prominent)
    const currencyY = isCompact ? 45 : 70;
    const currencyBg = this.add.graphics();
    currencyBg.fillStyle(0x1a1a2e, 0.8);
    currencyBg.fillRoundedRect(width / 2 - 70, currencyY, 140, 32, 6);
    currencyBg.lineStyle(2, 0xFFD700, 0.5);
    currencyBg.strokeRoundedRect(width / 2 - 70, currencyY, 140, 32, 6);
    
    const currencyText = this.add.text(width / 2, currencyY + 16, `⚙️ ${progression.currency}`, {
      fontSize: isCompact ? '18px' : '24px',
      color: '#FFD700',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Upgrade cards - calculate compact layout
    const startY = isCompact ? 85 : 130;
    const cardHeight = isCompact ? 55 : 75;
    const cardSpacing = isCompact ? 4 : 8;
    const totalCardsHeight = UPGRADES.length * (cardHeight + cardSpacing);
    const buttonsY = Math.min(startY + totalCardsHeight + 10, height - 55);
    
    // Create upgrade cards
    UPGRADES.forEach((upgrade, index) => {
      this.createUpgradeCard(
        width / 2,
        startY + index * (cardHeight + cardSpacing),
        upgrade,
        currencyText,
        cardHeight,
        isCompact
      );
    });
    
    // === BOTTOM BUTTONS ===
    const buttonWidth = isCompact ? 110 : 140;
    const buttonHeight = isCompact ? 36 : 45;
    const buttonGap = isCompact ? 15 : 20;
    
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
    cardHeight: number,
    isCompact: boolean = false
  ): void {
    const { width } = this.cameras.main;
    const cardWidth = Math.min(isCompact ? 420 : 480, width - 30);
    
    const currentLevel = progression.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const costs = CONFIG.UPGRADE_COSTS[upgrade.id as keyof typeof CONFIG.UPGRADE_COSTS] || [100, 200, 300];
    const cost = isMaxed ? 0 : costs[currentLevel];
    const canAfford = progression.currency >= cost;
    
    // Card background
    const card = this.add.graphics();
    const bgColor = isMaxed ? 0x1a3a1a : 0x1a1a2e;
    card.fillStyle(bgColor, 0.9);
    card.fillRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 6);
    
    const borderColor = isMaxed ? 0x39FF14 : (canAfford ? COLORS.NEON_CYAN : 0x333333);
    card.lineStyle(2, borderColor, 0.6);
    card.strokeRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 6);
    
    // Icon
    const iconSize = isCompact ? '20px' : '28px';
    this.add.text(x - cardWidth / 2 + 20, y + cardHeight / 2, upgrade.icon, {
      fontSize: iconSize
    }).setOrigin(0.5);
    
    // Name + Level
    const levelStr = isMaxed ? ' (MAX)' : ` Lv.${currentLevel}`;
    const nameSize = isCompact ? '12px' : '15px';
    this.add.text(x - cardWidth / 2 + 42, y + (isCompact ? 8 : 12), upgrade.name + levelStr, {
      fontSize: nameSize,
      color: isMaxed ? '#39FF14' : '#FFFFFF',
      fontFamily: 'monospace'
    });
    
    // Description with current effect (hide on compact if needed)
    const effectValue = upgrade.effect(currentLevel);
    let descText = upgrade.description.replace('{n}', effectValue.toString());
    
    if (!isCompact) {
      this.add.text(x - cardWidth / 2 + 42, y + 32, descText, {
        fontSize: '11px',
        color: '#888',
        fontFamily: 'monospace'
      });
    }
    
    // Level pips
    const pipsStartX = x - cardWidth / 2 + 42;
    const pipY = isCompact ? y + 28 : y + 55;
    const pipSize = isCompact ? 10 : 12;
    const pipSpacing = isCompact ? 14 : 18;
    for (let i = 0; i < upgrade.maxLevel; i++) {
      const pipColor = i < currentLevel ? 0x39FF14 : 0x333333;
      this.add.rectangle(pipsStartX + i * pipSpacing, pipY, pipSize, 6, pipColor).setOrigin(0, 0.5);
    }
    
    // Buy button or MAX badge
    if (isMaxed) {
      this.add.text(x + cardWidth / 2 - 40, y + cardHeight / 2, '✓ MAX', {
        fontSize: isCompact ? '11px' : '14px',
        color: '#39FF14',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    } else {
      const btnWidth = isCompact ? 55 : 70;
      const btnHeight = isCompact ? 26 : 32;
      const btnX = x + cardWidth / 2 - (isCompact ? 40 : 55);
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
