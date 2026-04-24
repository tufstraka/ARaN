import Phaser from 'phaser';
import { COLORS, UPGRADES, CONFIG } from '../config/gameConfig';
import { progression } from '../managers/ProgressionManager';

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(0, 0, width, height, COLORS.BG_DARK).setOrigin(0);
    
    // Title
    this.add.text(width / 2, 50, 'UPGRADES', {
      fontSize: '36px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Currency display
    const currencyText = this.add.text(width / 2, 95, `⚙️ ${progression.currency}`, {
      fontSize: '24px',
      color: '#F39C12',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Upgrade cards
    const startY = 150;
    const cardHeight = 90;
    const cardSpacing = 10;
    
    UPGRADES.forEach((upgrade, index) => {
      this.createUpgradeCard(
        width / 2,
        startY + index * (cardHeight + cardSpacing),
        upgrade,
        currencyText
      );
    });
    
    // Back button
    const backY = startY + UPGRADES.length * (cardHeight + cardSpacing) + 30;
    this.add.text(width / 2, backY, '[ BACK ]', {
      fontSize: '20px',
      color: '#666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'))
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#FFF'); })
      .on('pointerout', function(this: Phaser.GameObjects.Text) { this.setColor('#666'); });
  }

  private createUpgradeCard(
    x: number, 
    y: number, 
    upgrade: typeof UPGRADES[0],
    currencyText: Phaser.GameObjects.Text
  ): void {
    const cardWidth = 500;
    const cardHeight = 80;
    
    const currentLevel = progression.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const costs = CONFIG.UPGRADE_COSTS[upgrade.id as keyof typeof CONFIG.UPGRADE_COSTS] || [100, 200, 300];
    const cost = isMaxed ? 0 : costs[currentLevel];
    const canAfford = progression.currency >= cost;
    
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x1a1a2e, 0.9);
    card.fillRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 8);
    card.lineStyle(2, isMaxed ? 0x39FF14 : (canAfford ? COLORS.NEON_CYAN : 0x444444), 0.6);
    card.strokeRoundedRect(x - cardWidth / 2, y, cardWidth, cardHeight, 8);
    
    // Icon
    this.add.text(x - cardWidth / 2 + 30, y + cardHeight / 2, upgrade.icon, {
      fontSize: '32px'
    }).setOrigin(0.5);
    
    // Name
    this.add.text(x - cardWidth / 2 + 70, y + 15, upgrade.name, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'monospace'
    });
    
    // Description with current effect
    const effectValue = upgrade.effect(currentLevel);
    const nextEffectValue = upgrade.effect(currentLevel + 1);
    let descText = upgrade.description.replace('{n}', effectValue.toString());
    
    if (!isMaxed) {
      descText += ` → ${nextEffectValue}`;
    }
    
    this.add.text(x - cardWidth / 2 + 70, y + 40, descText, {
      fontSize: '12px',
      color: '#888',
      fontFamily: 'monospace'
    });
    
    // Level indicators
    for (let i = 0; i < upgrade.maxLevel; i++) {
      const dotX = x + cardWidth / 2 - 150 + i * 20;
      const dotColor = i < currentLevel ? 0x39FF14 : 0x333333;
      this.add.circle(dotX, y + 25, 6, dotColor);
    }
    
    // Buy button / Status
    if (isMaxed) {
      this.add.text(x + cardWidth / 2 - 60, y + cardHeight / 2, 'MAX', {
        fontSize: '16px',
        color: '#39FF14',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    } else {
      const btnColor = canAfford ? COLORS.NEON_CYAN : 0x444444;
      
      const btn = this.add.graphics();
      btn.fillStyle(btnColor, 0.3);
      btn.fillRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
      btn.lineStyle(1, btnColor, 0.8);
      btn.strokeRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
      
      const btnText = this.add.text(x + cardWidth / 2 - 60, y + cardHeight / 2, `⚙️${cost}`, {
        fontSize: '14px',
        color: canAfford ? '#FFFFFF' : '#666',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      if (canAfford) {
        const hitArea = this.add.rectangle(
          x + cardWidth / 2 - 60, 
          y + cardHeight / 2, 
          80, 30, 0x000000, 0
        ).setInteractive({ useHandCursor: true });
        
        hitArea.on('pointerdown', () => {
          if (progression.upgradeLevel(upgrade.id, upgrade.maxLevel, cost)) {
            // Refresh scene
            this.scene.restart();
          }
        });
        
        hitArea.on('pointerover', () => {
          btn.clear();
          btn.fillStyle(btnColor, 0.5);
          btn.fillRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
          btn.lineStyle(1, btnColor, 1);
          btn.strokeRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
        });
        
        hitArea.on('pointerout', () => {
          btn.clear();
          btn.fillStyle(btnColor, 0.3);
          btn.fillRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
          btn.lineStyle(1, btnColor, 0.8);
          btn.strokeRoundedRect(x + cardWidth / 2 - 100, y + cardHeight / 2 - 15, 80, 30, 4);
        });
      }
    }
  }
}
