import Phaser from 'phaser';
import { GAME_CONFIG, LevelData } from '../config/constants';

/**
 * Conveyor belt that moves the player
 */
export class Conveyor extends Phaser.Physics.Arcade.Sprite {
  public direction: 'left' | 'right';
  
  constructor(scene: Phaser.Scene, x: number, y: number, direction: 'left' | 'right') {
    super(scene, x, y, 'conveyor');
    this.direction = direction;
    
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static
    
    this.setImmovable(true);
  }
  
  /**
   * Apply conveyor force to player
   */
  applyForce(playerBody: Phaser.Physics.Arcade.Body): void {
    const force = this.direction === 'right' ? GAME_CONFIG.CONVEYOR_SPEED : -GAME_CONFIG.CONVEYOR_SPEED;
    playerBody.setVelocityX(playerBody.velocity.x + force * 0.1);
  }
}

/**
 * Manages all conveyor belts in a level
 */
export class ConveyorSystem {
  private scene: Phaser.Scene;
  public conveyors: Phaser.Physics.Arcade.StaticGroup;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.conveyors = scene.physics.add.staticGroup();
  }
  
  create(levelData: LevelData): void {
    if (!levelData.conveyors) return;
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    levelData.conveyors.forEach(conv => {
      for (let i = 0; i < conv.width; i++) {
        const x = (conv.x + i) * tileSize + tileSize / 2;
        const y = conv.y * tileSize + tileSize / 2;
        
        const conveyor = new Conveyor(this.scene, x, y, conv.direction);
        this.conveyors.add(conveyor);
        
        // Visual: animated arrows
        this.createConveyorVisual(x, y, conv.direction);
      }
    });
  }
  
  private createConveyorVisual(x: number, y: number, direction: 'left' | 'right'): void {
    const arrow = this.scene.add.text(x, y, direction === 'right' ? '→' : '←', {
      fontSize: '20px',
      color: '#F39C12'
    }).setOrigin(0.5);
    
    // Animate arrows
    this.scene.tweens.add({
      targets: arrow,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  /**
   * Check and apply conveyor effects to player
   */
  update(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;
    
    this.conveyors.getChildren().forEach(child => {
      const conveyor = child as Conveyor;
      if (this.scene.physics.overlap(playerSprite, conveyor)) {
        conveyor.applyForce(playerBody);
      }
    });
  }
}
