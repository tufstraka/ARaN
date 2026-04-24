import Phaser from 'phaser';
import { GAME_CONFIG, LevelData, COLORS } from '../config/constants';

export type PowerupType = 'shield' | 'magnet' | 'speed';

interface ActivePowerup {
  type: PowerupType;
  expiresAt: number;
}

/**
 * Manages powerup pickups and effects
 */
export class PowerupSystem {
  private scene: Phaser.Scene;
  public powerups: Phaser.Physics.Arcade.Group;
  private activePowerups: ActivePowerup[] = [];
  private shieldVisual?: Phaser.GameObjects.Arc;
  
  // Powerup durations (ms)
  private static DURATIONS: Record<PowerupType, number> = {
    shield: 10000,
    speed: 8000,
    magnet: 12000
  };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.powerups = scene.physics.add.group({ allowGravity: false });
  }
  
  create(levelData: LevelData): void {
    if (!levelData.powerups) return;
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    levelData.powerups.forEach(pwrDef => {
      const x = pwrDef.x * tileSize + tileSize / 2;
      const y = pwrDef.y * tileSize + tileSize / 2;
      
      const powerup = this.scene.physics.add.sprite(x, y, 'powerup');
      powerup.setData('type', pwrDef.type);
      (powerup.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      
      this.powerups.add(powerup);
      
      // Color based on type
      const color = this.getColorForType(pwrDef.type);
      powerup.setTint(color);
      
      // Floating + pulsing animation
      this.scene.tweens.add({
        targets: powerup,
        y: y - 8,
        scale: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Create icon indicator
      this.createPowerupIcon(x, y - 20, pwrDef.type);
    });
  }
  
  private getColorForType(type: PowerupType): number {
    switch (type) {
      case 'shield': return COLORS.SHIELD;
      case 'speed': return COLORS.SPEED;
      case 'magnet': return COLORS.MAGNET;
    }
  }
  
  private createPowerupIcon(x: number, y: number, type: PowerupType): void {
    const icons: Record<PowerupType, string> = {
      shield: '🛡️',
      speed: '⚡',
      magnet: '🧲'
    };
    
    this.scene.add.text(x, y, icons[type], {
      fontSize: '16px'
    }).setOrigin(0.5);
  }
  
  /**
   * Collect a powerup
   */
  collect(powerup: Phaser.Physics.Arcade.Sprite, playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const type = powerup.getData('type') as PowerupType;
    
    // Add to active powerups
    this.activePowerups.push({
      type,
      expiresAt: Date.now() + PowerupSystem.DURATIONS[type]
    });
    
    // Apply immediate effects
    this.applyPowerup(type, playerSprite);
    
    // Destroy pickup
    powerup.destroy();
    
    // Show collection effect
    this.showCollectEffect(powerup.x, powerup.y, type);
  }
  
  private applyPowerup(type: PowerupType, playerSprite: Phaser.Physics.Arcade.Sprite): void {
    switch (type) {
      case 'shield':
        this.createShieldVisual(playerSprite);
        break;
      case 'speed':
        // Speed boost handled in update
        break;
      case 'magnet':
        // Magnet effect handled in coin attraction
        break;
    }
  }
  
  private createShieldVisual(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    if (this.shieldVisual) {
      this.shieldVisual.destroy();
    }
    
    this.shieldVisual = this.scene.add.circle(0, 0, 24, COLORS.SHIELD, 0.3);
    this.shieldVisual.setStrokeStyle(2, COLORS.SHIELD, 0.8);
    
    // Follow player
    this.scene.events.on('update', () => {
      if (this.shieldVisual && playerSprite.active) {
        this.shieldVisual.setPosition(playerSprite.x, playerSprite.y);
      }
    });
  }
  
  private showCollectEffect(x: number, y: number, type: PowerupType): void {
    const text = this.scene.add.text(x, y, this.getPowerupName(type), {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }
  
  private getPowerupName(type: PowerupType): string {
    switch (type) {
      case 'shield': return '🛡️ SHIELD!';
      case 'speed': return '⚡ SPEED!';
      case 'magnet': return '🧲 MAGNET!';
    }
  }
  
  /**
   * Update powerups - remove expired, apply effects
   */
  update(): void {
    const now = Date.now();
    
    // Remove expired powerups
    this.activePowerups = this.activePowerups.filter(p => {
      if (p.expiresAt <= now) {
        this.onPowerupExpired(p.type);
        return false;
      }
      return true;
    });
  }
  
  private onPowerupExpired(type: PowerupType): void {
    if (type === 'shield' && this.shieldVisual) {
      this.shieldVisual.destroy();
      this.shieldVisual = undefined;
    }
  }
  
  /**
   * Check if player has an active powerup
   */
  hasActivePowerup(type: PowerupType): boolean {
    return this.activePowerups.some(p => p.type === type);
  }
  
  /**
   * Use shield (returns true if shield was active and absorbed hit)
   */
  useShield(): boolean {
    const shieldIndex = this.activePowerups.findIndex(p => p.type === 'shield');
    if (shieldIndex >= 0) {
      this.activePowerups.splice(shieldIndex, 1);
      this.onPowerupExpired('shield');
      return true;
    }
    return false;
  }
  
  /**
   * Get current speed multiplier
   */
  getSpeedMultiplier(): number {
    return this.hasActivePowerup('speed') ? GAME_CONFIG.PIP_SPEED_BOOSTED / GAME_CONFIG.PIP_SPEED : 1;
  }
  
  getGroup(): Phaser.Physics.Arcade.Group {
    return this.powerups;
  }
}
