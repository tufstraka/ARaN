import Phaser from 'phaser';
import { GAME_CONFIG, LevelData } from '../config/constants';

interface PistonData {
  sprite: Phaser.Physics.Arcade.Sprite;
  baseX: number;
  baseY: number;
  direction: 'up' | 'down' | 'left' | 'right';
  extended: boolean;
}

/**
 * Manages pistons that extend and retract
 */
export class PistonSystem {
  private scene: Phaser.Scene;
  public pistons: Phaser.Physics.Arcade.Group;
  private pistonData: PistonData[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.pistons = scene.physics.add.group();
  }
  
  create(levelData: LevelData): void {
    if (!levelData.pistons) return;
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    levelData.pistons.forEach((pistonDef, index) => {
      const x = pistonDef.x * tileSize + tileSize / 2;
      const y = pistonDef.y * tileSize + tileSize / 2;
      
      // Create piston head (the dangerous part)
      const piston = this.scene.physics.add.sprite(x, y, 'piston');
      piston.setImmovable(true);
      (piston.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      
      this.pistons.add(piston);
      
      const data: PistonData = {
        sprite: piston,
        baseX: x,
        baseY: y,
        direction: pistonDef.direction,
        extended: false
      };
      this.pistonData.push(data);
      
      // Create piston base visual
      this.createPistonBase(x, y, pistonDef.direction);
      
      // Start piston cycle with delay
      const delay = pistonDef.delay || (index * 500);
      this.scene.time.delayedCall(delay, () => this.startPistonCycle(data));
    });
  }
  
  private createPistonBase(x: number, y: number, direction: string): void {
    const base = this.scene.add.graphics();
    base.fillStyle(0x5D6D7E, 1);
    
    switch (direction) {
      case 'down':
        base.fillRect(x - 16, y - 40, 32, 20);
        break;
      case 'up':
        base.fillRect(x - 16, y + 20, 32, 20);
        break;
      case 'left':
        base.fillRect(x + 20, y - 16, 20, 32);
        break;
      case 'right':
        base.fillRect(x - 40, y - 16, 20, 32);
        break;
    }
  }
  
  private startPistonCycle(data: PistonData): void {
    this.extendPiston(data);
  }
  
  private extendPiston(data: PistonData): void {
    data.extended = true;
    
    const extendDistance = GAME_CONFIG.TILE_SIZE * 2;
    let targetX = data.baseX;
    let targetY = data.baseY;
    
    switch (data.direction) {
      case 'down': targetY += extendDistance; break;
      case 'up': targetY -= extendDistance; break;
      case 'left': targetX -= extendDistance; break;
      case 'right': targetX += extendDistance; break;
    }
    
    this.scene.tweens.add({
      targets: data.sprite,
      x: targetX,
      y: targetY,
      duration: 150, // Fast extend
      ease: 'Power2',
      onComplete: () => {
        // Hold extended, then retract
        this.scene.time.delayedCall(GAME_CONFIG.PISTON_EXTEND_TIME, () => {
          this.retractPiston(data);
        });
      }
    });
  }
  
  private retractPiston(data: PistonData): void {
    data.extended = false;
    
    this.scene.tweens.add({
      targets: data.sprite,
      x: data.baseX,
      y: data.baseY,
      duration: GAME_CONFIG.PISTON_RETRACT_TIME,
      ease: 'Power1',
      onComplete: () => {
        // Wait then extend again
        this.scene.time.delayedCall(500, () => {
          this.extendPiston(data);
        });
      }
    });
  }
  
  /**
   * Get the physics group for collision detection
   */
  getGroup(): Phaser.Physics.Arcade.Group {
    return this.pistons;
  }
}
