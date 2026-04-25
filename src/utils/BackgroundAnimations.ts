import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';

/**
 * Machine Factory Background
 * Parallax layers with industrial machinery silhouettes
 */
export class BackgroundAnimations {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private particles: Phaser.GameObjects.Graphics[] = [];
  private gears: Phaser.GameObjects.Graphics[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create(): void {
    this.createGradient();
    this.createFactoryLayers();
    this.createBackgroundGears();
    this.createSubtleParticles();
    this.createAmbientGlow();
  }
  
  private createGradient(): void {
    const { width, height } = this.scene.cameras.main;
    
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);
    
    // Deep industrial gradient
    bg.fillGradientStyle(
      0x1a1a2e, 0x1a1a2e,
      0x0a0a12, 0x0a0a12
    );
    bg.fillRect(0, 0, width, height);
  }
  
  private createFactoryLayers(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Far layer - distant machinery
    const farLayer = this.createMachineLayer(
      height * 0.45,
      0.2,
      0x0f0f1a,
      0.5,
      'far'
    );
    
    // Mid layer - medium machinery
    const midLayer = this.createMachineLayer(
      height * 0.55,
      0.4,
      0x161625,
      0.6,
      'mid'
    );
    
    // Near layer - close machinery
    const nearLayer = this.createMachineLayer(
      height * 0.7,
      0.7,
      0x1e1e30,
      0.7,
      'near'
    );
    
    this.layers.push(farLayer, midLayer, nearLayer);
  }
  
  private createMachineLayer(
    baseY: number,
    parallaxSpeed: number,
    color: number,
    alpha: number,
    type: 'far' | 'mid' | 'near'
  ): Phaser.GameObjects.TileSprite {
    const { width } = this.scene.cameras.main;
    
    const textureName = `machine_${type}_${Date.now()}`;
    const textureWidth = 800;
    const textureHeight = 250;
    
    const graphics = this.scene.add.graphics();
    
    if (type === 'far') {
      this.drawDistantMachinery(graphics, textureWidth, textureHeight, color);
    } else if (type === 'mid') {
      this.drawMidMachinery(graphics, textureWidth, textureHeight, color);
    } else {
      this.drawNearMachinery(graphics, textureWidth, textureHeight, color);
    }
    
    graphics.generateTexture(textureName, textureWidth, textureHeight);
    graphics.destroy();
    
    const layer = this.scene.add.tileSprite(
      0, baseY,
      width + textureWidth,
      textureHeight,
      textureName
    );
    layer.setOrigin(0, 0);
    layer.setAlpha(alpha);
    layer.setDepth(-5 + (type === 'far' ? 0 : type === 'mid' ? 1 : 2));
    layer.setData('parallaxSpeed', parallaxSpeed);
    
    return layer;
  }
  
  /**
   * Distant: Smokestacks, large tanks, industrial towers
   */
  private drawDistantMachinery(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.3) {
        // Smokestack
        const stackW = 15 + Math.random() * 10;
        const stackH = 100 + Math.random() * 80;
        g.fillRect(x, h - stackH, stackW, stackH);
        // Top rim
        g.fillRect(x - 3, h - stackH, stackW + 6, 8);
      } else if (type < 0.6) {
        // Storage tank (cylinder-ish)
        const tankW = 40 + Math.random() * 30;
        const tankH = 60 + Math.random() * 50;
        g.fillRect(x, h - tankH, tankW, tankH);
        // Dome top
        g.fillRect(x + 5, h - tankH - 10, tankW - 10, 12);
        g.fillRect(x + 10, h - tankH - 15, tankW - 20, 8);
      } else {
        // Industrial tower
        const towerW = 25 + Math.random() * 20;
        const towerH = 120 + Math.random() * 60;
        g.fillRect(x, h - towerH, towerW, towerH);
        // Antenna/spire
        g.fillRect(x + towerW/2 - 2, h - towerH - 30, 4, 30);
        // Platforms
        for (let py = h - towerH + 30; py < h - 20; py += 40) {
          g.fillRect(x - 5, py, towerW + 10, 4);
        }
      }
      
      x += 60 + Math.random() * 80;
    }
  }
  
  /**
   * Mid: Conveyor structures, machinery housings, pipes
   */
  private drawMidMachinery(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.35) {
        // Machinery housing with gear outline
        const boxW = 60 + Math.random() * 40;
        const boxH = 70 + Math.random() * 50;
        g.fillRect(x, h - boxH, boxW, boxH);
        
        // Circular gear suggestion (lighter)
        g.fillStyle(color);
        const gearX = x + boxW / 2;
        const gearY = h - boxH / 2;
        const gearR = Math.min(boxW, boxH) * 0.3;
        g.fillCircle(gearX, gearY, gearR);
        // Gear center hole (darker)
        g.fillStyle(0x0a0a12);
        g.fillCircle(gearX, gearY, gearR * 0.3);
        g.fillStyle(color);
        
      } else if (type < 0.65) {
        // Conveyor belt structure
        const convW = 80 + Math.random() * 60;
        const convH = 30 + Math.random() * 20;
        const legH = 40 + Math.random() * 30;
        
        // Belt
        g.fillRect(x, h - legH - convH, convW, convH);
        // Legs
        g.fillRect(x + 10, h - legH, 12, legH);
        g.fillRect(x + convW - 22, h - legH, 12, legH);
        // Wheels at ends
        g.fillCircle(x + 10, h - legH - convH/2, convH/2 - 2);
        g.fillCircle(x + convW - 10, h - legH - convH/2, convH/2 - 2);
        
      } else {
        // Pipe assembly
        const pipeH = 50 + Math.random() * 40;
        const baseW = 50 + Math.random() * 30;
        
        // Vertical pipe
        g.fillRect(x + 20, h - pipeH - 60, 15, 60);
        // Horizontal pipes
        g.fillRect(x, h - pipeH, baseW + 40, 12);
        g.fillRect(x, h - pipeH + 25, baseW + 20, 12);
        // Valve wheel
        g.fillCircle(x + baseW/2, h - pipeH - 30, 10);
        g.fillStyle(0x0a0a12);
        g.fillCircle(x + baseW/2, h - pipeH - 30, 4);
        g.fillStyle(color);
      }
      
      x += 100 + Math.random() * 80;
    }
  }
  
  /**
   * Near: Large machines, robotic arms, presses
   */
  private drawNearMachinery(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.3) {
        // Industrial press / stamper
        const baseW = 80 + Math.random() * 50;
        const baseH = 40;
        const pressH = 100 + Math.random() * 50;
        
        // Base
        g.fillRect(x, h - baseH, baseW, baseH);
        // Vertical frame
        g.fillRect(x + 10, h - pressH, 15, pressH - baseH);
        g.fillRect(x + baseW - 25, h - pressH, 15, pressH - baseH);
        // Top beam
        g.fillRect(x, h - pressH, baseW, 20);
        // Press head
        g.fillRect(x + 20, h - pressH + 30, baseW - 40, 25);
        
      } else if (type < 0.6) {
        // Robotic arm silhouette
        const baseW = 40;
        const baseH = 30;
        
        // Base
        g.fillRect(x, h - baseH, baseW, baseH);
        // Arm segment 1 (angled up)
        g.fillRect(x + 15, h - baseH - 50, 12, 55);
        // Joint
        g.fillCircle(x + 21, h - baseH - 50, 10);
        // Arm segment 2
        g.fillRect(x + 25, h - baseH - 80, 10, 35);
        // Gripper
        g.fillRect(x + 20, h - baseH - 95, 20, 15);
        g.fillRect(x + 18, h - baseH - 100, 8, 8);
        g.fillRect(x + 34, h - baseH - 100, 8, 8);
        
      } else {
        // Large gear mechanism
        const gearR = 35 + Math.random() * 25;
        const housingW = gearR * 2.5;
        const housingH = gearR * 2.2;
        
        // Housing
        g.fillRect(x, h - housingH, housingW, housingH);
        
        // Main gear (visible portion)
        const gearX = x + housingW / 2;
        const gearY = h - housingH / 2;
        g.fillCircle(gearX, gearY, gearR);
        
        // Gear teeth suggestion
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const toothX = gearX + Math.cos(angle) * gearR;
          const toothY = gearY + Math.sin(angle) * gearR;
          g.fillRect(toothX - 4, toothY - 4, 8, 8);
        }
        
        // Center axle
        g.fillStyle(0x0a0a12);
        g.fillCircle(gearX, gearY, gearR * 0.25);
        g.fillStyle(color);
        
        // Smaller connected gear
        const smallGearX = gearX + gearR + 15;
        const smallGearY = gearY + 10;
        const smallR = gearR * 0.5;
        g.fillCircle(smallGearX, smallGearY, smallR);
        g.fillStyle(0x0a0a12);
        g.fillCircle(smallGearX, smallGearY, smallR * 0.3);
        g.fillStyle(color);
      }
      
      x += 140 + Math.random() * 100;
    }
  }
  
  /**
   * Animated gears in background
   */
  private createBackgroundGears(): void {
    const { width, height } = this.scene.cameras.main;
    
    const gearConfigs = [
      { x: width * 0.15, y: height * 0.3, r: 35, speed: 15000, cw: true },
      { x: width * 0.15 + 45, y: height * 0.3 + 28, r: 22, speed: 9500, cw: false },
      { x: width * 0.8, y: height * 0.4, r: 40, speed: 18000, cw: false },
      { x: width * 0.5, y: height * 0.2, r: 25, speed: 12000, cw: true },
    ];
    
    gearConfigs.forEach(cfg => {
      const gear = this.createGear(cfg.r, 0x1a1a2e, 0.3);
      gear.setPosition(cfg.x, cfg.y);
      gear.setDepth(-6);
      
      this.scene.tweens.add({
        targets: gear,
        angle: cfg.cw ? 360 : -360,
        duration: cfg.speed,
        repeat: -1,
        ease: 'Linear'
      });
      
      this.gears.push(gear);
    });
  }
  
  private createGear(radius: number, color: number, alpha: number): Phaser.GameObjects.Graphics {
    const gear = this.scene.add.graphics();
    const teeth = Math.floor(radius / 5);
    
    gear.fillStyle(color, alpha);
    gear.fillCircle(0, 0, radius);
    
    // Teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      gear.fillRect(tx - 3, ty - 3, 6, 6);
    }
    
    // Center hole
    gear.fillStyle(0x0a0a12, alpha);
    gear.fillCircle(0, 0, radius * 0.3);
    
    return gear;
  }
  
  private createSubtleParticles(): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(-1);
      
      const size = 1 + Math.random() * 1.5;
      const alpha = 0.15 + Math.random() * 0.15;
      
      // Orange/yellow sparks - more industrial
      const sparkColor = Math.random() > 0.5 ? 0xFF6600 : COLORS.NEON_CYAN;
      particle.fillStyle(sparkColor, alpha);
      particle.fillCircle(0, 0, size);
      
      particle.setPosition(
        Math.random() * width,
        Math.random() * height
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 40 - Math.random() * 80,
        x: particle.x + (Math.random() - 0.5) * 40,
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(Math.random() * width, height + 10);
          particle.setAlpha(alpha);
        }
      });
      
      this.particles.push(particle);
    }
  }
  
  private createAmbientGlow(): void {
    const { width, height } = this.scene.cameras.main;
    
    const glow = this.scene.add.graphics();
    glow.setDepth(-4);
    
    // Industrial orange glow at bottom
    for (let i = 0; i < 5; i++) {
      const y = height - 60 + i * 12;
      const alpha = 0.04 - i * 0.007;
      glow.fillStyle(0xFF6600, alpha);
      glow.fillRect(0, y, width, 12);
    }
    
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.6,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  update(scrollSpeed: number, delta: number): void {
    this.layers.forEach(layer => {
      const speed = layer.getData('parallaxSpeed') || 0.5;
      layer.tilePositionX += scrollSpeed * speed * (delta / 1000);
    });
  }
  
  destroy(): void {
    this.layers.forEach(l => l.destroy());
    this.particles.forEach(p => p.destroy());
    this.gears.forEach(g => g.destroy());
    this.layers = [];
    this.particles = [];
    this.gears = [];
  }
}
