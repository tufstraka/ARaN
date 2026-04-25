import Phaser from 'phaser';
import { GAME_CONFIG, LevelData, COLORS, getDifficultyForLevel } from '../config/constants';

interface LaserData {
  beam: Phaser.GameObjects.Rectangle;
  emitterStart: Phaser.GameObjects.Arc;
  emitterEnd: Phaser.GameObjects.Arc;
  active: boolean;
  horizontal: boolean;
}

export class LaserSystem {
  private scene: Phaser.Scene;
  private lasers: LaserData[] = [];
  public laserGroup: Phaser.Physics.Arcade.Group;
  private difficulty: ReturnType<typeof getDifficultyForLevel>;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.laserGroup = scene.physics.add.group();
    this.difficulty = getDifficultyForLevel(1);
  }
  
  create(levelData: LevelData): void {
    if (!levelData.lasers) return;
    
    this.difficulty = levelData.difficulty 
      ? { ...getDifficultyForLevel(levelData.id), ...levelData.difficulty }
      : getDifficultyForLevel(levelData.id);
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    levelData.lasers.forEach((laserDef, index) => {
      const x = laserDef.x * tileSize + tileSize / 2;
      const y = laserDef.y * tileSize + tileSize / 2;
      const horizontal = laserDef.horizontal ?? false;
      
      const beamWidth = horizontal ? tileSize * 3 : 4;
      const beamHeight = horizontal ? 4 : tileSize * 6;
      
      const beam = this.scene.add.rectangle(x, y, beamWidth, beamHeight, COLORS.LASER, 0.8);
      this.scene.physics.add.existing(beam, false);
      (beam.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (beam.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      
      this.laserGroup.add(beam);
      
      const emitterStart = this.scene.add.circle(
        horizontal ? x - beamWidth / 2 : x,
        horizontal ? y : y - beamHeight / 2,
        6, COLORS.HAZARD
      );
      const emitterEnd = this.scene.add.circle(
        horizontal ? x + beamWidth / 2 : x,
        horizontal ? y : y + beamHeight / 2,
        6, COLORS.HAZARD
      );
      
      const data: LaserData = {
        beam,
        emitterStart,
        emitterEnd,
        active: true,
        horizontal
      };
      this.lasers.push(data);
      
      const delay = laserDef.delay || (index * Math.max(400, 750 - levelData.id * 30));
      this.scene.time.delayedCall(delay, () => this.startLaserCycle(data));
    });
  }
  
  private startLaserCycle(data: LaserData): void {
    this.activateLaser(data);
    
    this.scene.time.delayedCall(this.difficulty.laserOnTime, () => {
      this.deactivateLaser(data);
      
      this.scene.time.delayedCall(this.difficulty.laserOffTime, () => {
        this.startLaserCycle(data);
      });
    });
  }
  
  private activateLaser(data: LaserData): void {
    data.active = true;
    data.beam.setVisible(true);
    (data.beam.body as Phaser.Physics.Arcade.Body).enable = true;
    
    this.scene.tweens.add({
      targets: data.beam,
      alpha: 1,
      duration: 80,
      yoyo: true,
      repeat: 2
    });
    
    this.scene.tweens.add({
      targets: [data.emitterStart, data.emitterEnd],
      scale: 1.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });
  }
  
  private deactivateLaser(data: LaserData): void {
    data.active = false;
    data.beam.setVisible(false);
    (data.beam.body as Phaser.Physics.Arcade.Body).enable = false;
    
    this.scene.tweens.killTweensOf(data.emitterStart);
    this.scene.tweens.killTweensOf(data.emitterEnd);
    data.emitterStart.setScale(1);
    data.emitterEnd.setScale(1);
  }
  
  isPlayerHit(playerSprite: Phaser.Physics.Arcade.Sprite): boolean {
    for (const laser of this.lasers) {
      if (laser.active && this.scene.physics.overlap(playerSprite, laser.beam)) {
        return true;
      }
    }
    return false;
  }
  
  getGroup(): Phaser.Physics.Arcade.Group {
    return this.laserGroup;
  }
}
