import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';

/**
 * Animated Machine Background Elements
 * Creates fun, playful factory-themed SVG-style animations
 */
export class BackgroundAnimations {
  private scene: Phaser.Scene;
  private elements: Phaser.GameObjects.GameObject[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create all background animations
   */
  create(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Create layered animated elements
    this.createSteamVents();
    this.createAnimatedPipes();
    this.createSpinningCogs();
    this.createMovingPistons();
    this.createConveyorBelts();
    this.createFloatingBolts();
    this.createElectricSparks();
    this.createScanlines();
  }
  
  /**
   * Steam vents that periodically puff
   */
  private createSteamVents(): void {
    const { width, height } = this.scene.cameras.main;
    const ventPositions = [
      { x: width * 0.1, y: height - 60, direction: -1 },
      { x: width * 0.85, y: 60, direction: 1 },
      { x: width * 0.5, y: height - 60, direction: -1 },
    ];
    
    ventPositions.forEach((pos, i) => {
      // Vent pipe
      const vent = this.scene.add.graphics();
      vent.fillStyle(0x4a5568, 0.8);
      vent.fillRoundedRect(-15, 0, 30, 25, 4);
      vent.fillStyle(0x2d3748);
      vent.fillCircle(0, pos.direction > 0 ? 25 : 0, 12);
      vent.setPosition(pos.x, pos.y);
      vent.setDepth(5);
      
      // Steam particles container
      const steamContainer = this.scene.add.container(pos.x, pos.y);
      steamContainer.setDepth(4);
      
      // Create steam puff animation
      this.scene.time.addEvent({
        delay: 2000 + i * 700,
        callback: () => this.createSteamPuff(steamContainer, pos.direction),
        loop: true
      });
      
      this.elements.push(vent, steamContainer);
    });
  }
  
  private createSteamPuff(container: Phaser.GameObjects.Container, direction: number): void {
    for (let i = 0; i < 5; i++) {
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.3);
      const size = 8 + Math.random() * 12;
      cloud.fillCircle(0, 0, size);
      cloud.setPosition(
        (Math.random() - 0.5) * 20,
        direction * 10
      );
      cloud.setAlpha(0);
      
      container.add(cloud);
      
      this.scene.tweens.add({
        targets: cloud,
        y: direction * (50 + Math.random() * 30),
        x: cloud.x + (Math.random() - 0.5) * 40,
        alpha: { from: 0.4, to: 0 },
        scale: { from: 0.5, to: 1.5 },
        duration: 800 + Math.random() * 400,
        delay: i * 50,
        onComplete: () => cloud.destroy()
      });
    }
  }
  
  /**
   * Animated pipes with flowing liquid effect
   */
  private createAnimatedPipes(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Horizontal pipe across top
    const pipe1 = this.createPipe(0, 80, width, true);
    
    // Vertical pipe on left
    const pipe2 = this.createPipe(50, 80, height - 140, false);
    
    // Diagonal connector
    const pipe3 = this.createDiagonalPipe(50, height - 60, width * 0.3, height * 0.4);
    
    this.elements.push(pipe1, pipe2, pipe3);
  }
  
  private createPipe(x: number, y: number, length: number, horizontal: boolean): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    container.setDepth(3);
    
    // Pipe body
    const pipe = this.scene.add.graphics();
    pipe.fillStyle(0x4a5568, 0.6);
    
    if (horizontal) {
      pipe.fillRoundedRect(0, -10, length, 20, 5);
      // Rivets
      for (let rx = 20; rx < length; rx += 60) {
        pipe.fillStyle(0x9CA3AF, 0.8);
        pipe.fillCircle(rx, -5, 3);
        pipe.fillCircle(rx, 5, 3);
      }
    } else {
      pipe.fillRoundedRect(-10, 0, 20, length, 5);
      for (let ry = 20; ry < length; ry += 60) {
        pipe.fillStyle(0x9CA3AF, 0.8);
        pipe.fillCircle(-5, ry, 3);
        pipe.fillCircle(5, ry, 3);
      }
    }
    
    container.add(pipe);
    
    // Flowing liquid effect
    const liquidMask = this.scene.add.graphics();
    liquidMask.fillStyle(COLORS.NEON_CYAN, 0.3);
    
    const liquidLength = horizontal ? 40 : 40;
    let liquidPos = 0;
    
    this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        liquidMask.clear();
        liquidMask.fillStyle(COLORS.NEON_CYAN, 0.2);
        
        if (horizontal) {
          liquidMask.fillRect(liquidPos, -6, liquidLength, 12);
          liquidPos = (liquidPos + 5) % length;
        } else {
          liquidMask.fillRect(-6, liquidPos, 12, liquidLength);
          liquidPos = (liquidPos + 5) % length;
        }
      },
      loop: true
    });
    
    container.add(liquidMask);
    
    return container;
  }
  
  private createDiagonalPipe(x1: number, y1: number, x2: number, y2: number): Phaser.GameObjects.Graphics {
    const pipe = this.scene.add.graphics();
    pipe.setDepth(2);
    
    pipe.lineStyle(18, 0x4a5568, 0.5);
    pipe.lineBetween(x1, y1, x2, y2);
    
    pipe.lineStyle(12, 0x374151, 0.4);
    pipe.lineBetween(x1, y1, x2, y2);
    
    return pipe;
  }
  
  /**
   * Spinning cogs of various sizes
   */
  private createSpinningCogs(): void {
    const { width, height } = this.scene.cameras.main;
    
    const cogConfigs = [
      { x: width * 0.15, y: height * 0.25, size: 45, speed: 8000, clockwise: true, teeth: 10 },
      { x: width * 0.15 + 58, y: height * 0.25 + 35, size: 30, speed: 5300, clockwise: false, teeth: 8 },
      { x: width * 0.8, y: height * 0.7, size: 55, speed: 10000, clockwise: false, teeth: 12 },
      { x: width * 0.8 + 70, y: height * 0.7, size: 35, speed: 6300, clockwise: true, teeth: 8 },
      { x: width * 0.5, y: height * 0.15, size: 25, speed: 4000, clockwise: true, teeth: 6 },
      { x: width * 0.35, y: height * 0.8, size: 40, speed: 7000, clockwise: false, teeth: 10 },
    ];
    
    cogConfigs.forEach(config => {
      const cog = this.createCog(config.size, config.teeth);
      cog.setPosition(config.x, config.y);
      cog.setDepth(2);
      
      this.scene.tweens.add({
        targets: cog,
        angle: config.clockwise ? 360 : -360,
        duration: config.speed,
        repeat: -1,
        ease: 'Linear'
      });
      
      this.elements.push(cog);
    });
  }
  
  private createCog(size: number, teeth: number): Phaser.GameObjects.Graphics {
    const cog = this.scene.add.graphics();
    
    // Outer ring with teeth
    cog.fillStyle(COLORS.STEEL, 0.25);
    cog.fillCircle(0, 0, size);
    
    // Teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const toothSize = size * 0.25;
      const tx = Math.cos(angle) * size;
      const ty = Math.sin(angle) * size;
      
      cog.fillStyle(COLORS.STEEL, 0.3);
      cog.save();
      cog.fillRect(tx - toothSize / 2, ty - toothSize / 2, toothSize, toothSize);
      cog.restore();
    }
    
    // Inner ring
    cog.fillStyle(COLORS.DARK_METAL, 0.3);
    cog.fillCircle(0, 0, size * 0.6);
    
    // Center hole
    cog.fillStyle(0x1a1a2e, 0.8);
    cog.fillCircle(0, 0, size * 0.2);
    
    // Spokes
    cog.lineStyle(3, COLORS.STEEL, 0.2);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      cog.lineBetween(
        Math.cos(angle) * size * 0.25,
        Math.sin(angle) * size * 0.25,
        Math.cos(angle) * size * 0.55,
        Math.sin(angle) * size * 0.55
      );
    }
    
    return cog;
  }
  
  /**
   * Moving pistons that pump up and down
   */
  private createMovingPistons(): void {
    const { width, height } = this.scene.cameras.main;
    
    const pistonConfigs = [
      { x: width * 0.25, y: height - 60, size: 20, range: 40, speed: 600, phase: 0 },
      { x: width * 0.25 + 50, y: height - 60, size: 20, range: 40, speed: 600, phase: 300 },
      { x: width * 0.7, y: 60, size: 25, range: 50, speed: 800, phase: 200, flip: true },
    ];
    
    pistonConfigs.forEach(config => {
      const piston = this.createPiston(config.size, config.flip);
      piston.setPosition(config.x, config.y);
      piston.setDepth(4);
      
      this.scene.tweens.add({
        targets: piston,
        y: config.y + (config.flip ? config.range : -config.range),
        duration: config.speed,
        yoyo: true,
        repeat: -1,
        delay: config.phase,
        ease: 'Sine.easeInOut'
      });
      
      this.elements.push(piston);
    });
  }
  
  private createPiston(size: number, flip: boolean = false): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    
    // Piston shaft
    const shaft = this.scene.add.graphics();
    shaft.fillStyle(0x6B7280, 0.7);
    shaft.fillRect(-size / 4, flip ? 0 : -size * 2, size / 2, size * 2);
    
    // Piston head
    const head = this.scene.add.graphics();
    head.fillStyle(0x9CA3AF, 0.8);
    head.fillRoundedRect(-size / 2, flip ? -size / 2 : -size * 2 - size / 2, size, size, 4);
    
    // Highlight
    head.fillStyle(0xFFFFFF, 0.2);
    head.fillRect(-size / 2 + 3, flip ? -size / 2 + 3 : -size * 2 - size / 2 + 3, size - 6, 4);
    
    container.add([shaft, head]);
    
    return container;
  }
  
  /**
   * Conveyor belts with moving segments
   */
  private createConveyorBelts(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Bottom conveyor hint
    const conveyor = this.createConveyor(width * 0.6, height - 45, 150);
    this.elements.push(conveyor);
  }
  
  private createConveyor(x: number, y: number, length: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    container.setDepth(3);
    
    // Belt base
    const base = this.scene.add.graphics();
    base.fillStyle(0x374151, 0.6);
    base.fillRoundedRect(0, -8, length, 16, 8);
    container.add(base);
    
    // Rolling segments
    const segmentWidth = 15;
    const segments: Phaser.GameObjects.Graphics[] = [];
    
    for (let i = 0; i < Math.ceil(length / segmentWidth) + 2; i++) {
      const segment = this.scene.add.graphics();
      segment.fillStyle(0x1F2937, 0.8);
      segment.fillRect(0, -6, segmentWidth - 3, 12);
      segment.setPosition(i * segmentWidth - segmentWidth, 0);
      segments.push(segment);
      container.add(segment);
    }
    
    // Animate segments
    this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        segments.forEach(seg => {
          seg.x -= 2;
          if (seg.x < -segmentWidth) {
            seg.x = length;
          }
        });
      },
      loop: true
    });
    
    // End wheels
    const wheel1 = this.scene.add.graphics();
    wheel1.fillStyle(0x6B7280, 0.8);
    wheel1.fillCircle(8, 0, 10);
    wheel1.fillStyle(0x374151);
    wheel1.fillCircle(8, 0, 5);
    container.add(wheel1);
    
    const wheel2 = this.scene.add.graphics();
    wheel2.fillStyle(0x6B7280, 0.8);
    wheel2.fillCircle(length - 8, 0, 10);
    wheel2.fillStyle(0x374151);
    wheel2.fillCircle(length - 8, 0, 5);
    container.add(wheel2);
    
    // Animate wheel rotation
    this.scene.tweens.add({
      targets: [wheel1, wheel2],
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
    
    return container;
  }
  
  /**
   * Floating bolts and nuts
   */
  private createFloatingBolts(): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < 8; i++) {
      const bolt = this.createBolt();
      bolt.setPosition(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(100, height - 100)
      );
      bolt.setDepth(1);
      bolt.setAlpha(0.3);
      
      // Gentle floating animation
      this.scene.tweens.add({
        targets: bolt,
        y: bolt.y + Phaser.Math.Between(-20, 20),
        x: bolt.x + Phaser.Math.Between(-10, 10),
        angle: Phaser.Math.Between(-30, 30),
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.elements.push(bolt);
    }
  }
  
  private createBolt(): Phaser.GameObjects.Graphics {
    const bolt = this.scene.add.graphics();
    
    if (Math.random() > 0.5) {
      // Hex bolt
      bolt.fillStyle(0x9CA3AF, 0.8);
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        points.push({
          x: Math.cos(angle) * 8,
          y: Math.sin(angle) * 8
        });
      }
      bolt.fillPoints(points, true);
      bolt.fillStyle(0x6B7280);
      bolt.fillCircle(0, 0, 4);
    } else {
      // Nut
      bolt.fillStyle(0xD97706, 0.8);
      bolt.fillCircle(0, 0, 6);
      bolt.fillStyle(0x1a1a2e);
      bolt.fillCircle(0, 0, 3);
    }
    
    return bolt;
  }
  
  /**
   * Electric sparks that occasionally flash
   */
  private createElectricSparks(): void {
    const { width, height } = this.scene.cameras.main;
    
    const sparkPoints = [
      { x: width * 0.2, y: height * 0.3 },
      { x: width * 0.75, y: height * 0.5 },
      { x: width * 0.4, y: 60 },
    ];
    
    sparkPoints.forEach((point, i) => {
      this.scene.time.addEvent({
        delay: 3000 + i * 1500,
        callback: () => this.createSpark(point.x, point.y),
        loop: true
      });
    });
  }
  
  private createSpark(x: number, y: number): void {
    const spark = this.scene.add.graphics();
    spark.setPosition(x, y);
    spark.setDepth(10);
    
    // Draw lightning bolt
    spark.lineStyle(3, COLORS.ELECTRIC_BLUE, 0.8);
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 8 },
      { x: -3, y: 12 },
      { x: 8, y: 22 },
    ];
    
    spark.beginPath();
    spark.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => spark.lineTo(p.x, p.y));
    spark.strokePath();
    
    // Glow
    spark.lineStyle(6, COLORS.ELECTRIC_BLUE, 0.3);
    spark.beginPath();
    spark.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => spark.lineTo(p.x, p.y));
    spark.strokePath();
    
    // Fade out
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      duration: 200,
      onComplete: () => spark.destroy()
    });
  }
  
  /**
   * CRT-style scanlines overlay
   */
  private createScanlines(): void {
    const { width, height } = this.scene.cameras.main;
    
    const scanlines = this.scene.add.graphics();
    scanlines.setDepth(50);
    scanlines.fillStyle(0x000000, 0.02);
    
    for (let y = 0; y < height; y += 3) {
      scanlines.fillRect(0, y, width, 1);
    }
    
    this.elements.push(scanlines);
  }
  
  /**
   * Cleanup all elements
   */
  destroy(): void {
    this.elements.forEach(el => el.destroy());
    this.elements = [];
  }
}
