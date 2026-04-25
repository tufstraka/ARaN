import Phaser from 'phaser';
import { GAME_CONFIG, LevelData, getDifficultyForLevel } from '../config/constants';

interface PistonData {
  sprite: Phaser.Physics.Arcade.Sprite;
  baseX: number;
  baseY: number;
  direction: 'up' | 'down' | 'left' | 'right';
  extended: boolean;
}

export class PistonSystem {
  private scene: Phaser.Scene;
  public pistons: Phaser.Physics.Arcade.Group;
  private pistonData: PistonData[] = [];
  private difficulty: ReturnType<typeof getDifficultyForLevel>;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.pistons = scene.physics.add.group();
    this.difficulty = getDifficultyForLevel(1);
  }
  
  create(levelData: LevelData): void {
    if (!levelData.pistons) return;
    
    this.difficulty = levelData.difficulty 
      ? { ...getDifficultyForLevel(levelData.id), ...levelData.difficulty }
      : getDifficultyForLevel(levelData.id);
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    levelData.pistons.forEach((pistonDef, index) => {
      const x = pistonDef.x * tileSize + tileSize / 2;
      const y = pistonDef.y * tileSize + tileSize / 2;
      
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
      
      this.createPistonBase(x, y, pistonDef.direction);
      
      const delay = pistonDef.delay || (index * Math.max(300, 500 - levelData.id * 20));
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
      duration: 100,
      ease: 'Power3',
      onComplete: () => {
        this.scene.time.delayedCall(this.difficulty.pistonExtendTime, () => {
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
      duration: this.difficulty.pistonRetractTime,
      ease: 'Power1',
      onComplete: () => {
        this.scene.time.delayedCall(this.difficulty.pistonWaitTime, () => {
          this.extendPiston(data);
        });
      }
    });
  }
  
  getGroup(): Phaser.Physics.Arcade.Group {
    return this.pistons;
  }
}
