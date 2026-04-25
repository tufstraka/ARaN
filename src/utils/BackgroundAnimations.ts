import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';

/**
 * Realistic Industrial Factory Background
 * Multi-layer parallax with atmospheric effects, lighting, and motion
 */
export class BackgroundAnimations {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private particles: Phaser.GameObjects.Graphics[] = [];
  private gears: Phaser.GameObjects.Graphics[] = [];
  private smokeEmitters: { x: number; y: number; timer: Phaser.Time.TimerEvent }[] = [];
  private windowLights: Phaser.GameObjects.Graphics[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create(): void {
    this.createSkyGradient();
    this.createAtmosphericHaze();
    this.createFactoryLayers();
    this.createBackgroundGears();
    this.createWindowLights();
    this.createSmoke();
    this.createSparks();
    this.createFurnaceGlow();
    this.createForegroundHaze();
  }
  
  /**
   * Deep industrial sky with subtle color variation
   */
  private createSkyGradient(): void {
    const { width, height } = this.scene.cameras.main;
    
    const bg = this.scene.add.graphics();
    bg.setDepth(-20);
    
    // Night sky with industrial haze
    bg.fillGradientStyle(
      0x0d0d1a, 0x0d0d1a,  // Top: deep night
      0x1a1520, 0x1a1520   // Bottom: slightly warmer (furnace reflection)
    );
    bg.fillRect(0, 0, width, height);
    
    // Subtle stars/distant lights
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.4);
      const size = 0.5 + Math.random() * 1;
      const alpha = 0.1 + Math.random() * 0.2;
      
      bg.fillStyle(0xffffff, alpha);
      bg.fillCircle(x, y, size);
    }
  }
  
  /**
   * Atmospheric depth - haze between layers
   */
  private createAtmosphericHaze(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Far haze layer
    const haze = this.scene.add.graphics();
    haze.setDepth(-15);
    
    haze.fillGradientStyle(
      0x1a1a2e, 0x1a1a2e,
      0x0d0d1a, 0x0d0d1a,
      0.0, 0.0, 0.15, 0.15
    );
    haze.fillRect(0, height * 0.3, width, height * 0.7);
  }
  
  /**
   * Factory silhouette layers with detailed machinery
   */
  private createFactoryLayers(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Very far - distant city/industrial glow
    const veryFar = this.createMachineLayer(height * 0.35, 0.1, 0x08080f, 0.4, 'veryfar');
    
    // Far layer
    const farLayer = this.createMachineLayer(height * 0.42, 0.2, 0x0c0c16, 0.5, 'far');
    
    // Mid-far
    const midFar = this.createMachineLayer(height * 0.5, 0.35, 0x10101c, 0.6, 'midfar');
    
    // Mid layer
    const midLayer = this.createMachineLayer(height * 0.58, 0.5, 0x151522, 0.7, 'mid');
    
    // Near layer
    const nearLayer = this.createMachineLayer(height * 0.68, 0.75, 0x1a1a2a, 0.8, 'near');
    
    this.layers.push(veryFar, farLayer, midFar, midLayer, nearLayer);
  }
  
  private createMachineLayer(
    baseY: number,
    parallaxSpeed: number,
    color: number,
    alpha: number,
    type: string
  ): Phaser.GameObjects.TileSprite {
    const { width } = this.scene.cameras.main;
    
    const textureName = `factory_${type}_${Date.now()}`;
    const textureWidth = 1024;
    const textureHeight = 300;
    
    const graphics = this.scene.add.graphics();
    
    // Draw based on layer depth
    if (type === 'veryfar') {
      this.drawVeryDistantFactory(graphics, textureWidth, textureHeight, color);
    } else if (type === 'far') {
      this.drawDistantFactory(graphics, textureWidth, textureHeight, color);
    } else if (type === 'midfar') {
      this.drawMidFarFactory(graphics, textureWidth, textureHeight, color);
    } else if (type === 'mid') {
      this.drawMidFactory(graphics, textureWidth, textureHeight, color);
    } else {
      this.drawNearFactory(graphics, textureWidth, textureHeight, color);
    }
    
    graphics.generateTexture(textureName, textureWidth, textureHeight);
    graphics.destroy();
    
    const layer = this.scene.add.tileSprite(0, baseY, width + textureWidth, textureHeight, textureName);
    layer.setOrigin(0, 0);
    layer.setAlpha(alpha);
    layer.setDepth(-10 + (type === 'veryfar' ? 0 : type === 'far' ? 1 : type === 'midfar' ? 2 : type === 'mid' ? 3 : 4));
    layer.setData('parallaxSpeed', parallaxSpeed);
    
    return layer;
  }
  
  /**
   * Very distant - just shapes and glow
   */
  private drawVeryDistantFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const bw = 20 + Math.random() * 40;
      const bh = 30 + Math.random() * 60;
      g.fillRect(x, h - bh, bw, bh);
      
      // Tall thin smokestacks
      if (Math.random() > 0.7) {
        g.fillRect(x + bw/2 - 3, h - bh - 40, 6, 40);
      }
      
      x += bw + 15 + Math.random() * 30;
    }
  }
  
  /**
   * Distant smokestacks and cooling towers
   */
  private drawDistantFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.3) {
        // Cooling tower shape
        const baseW = 40 + Math.random() * 20;
        const topW = baseW * 0.7;
        const towerH = 80 + Math.random() * 40;
        
        // Hyperbolic shape approximation
        g.fillRect(x + (baseW - topW)/2, h - towerH, topW, 15);
        g.fillRect(x + 5, h - towerH + 15, baseW - 10, towerH - 15);
        g.fillRect(x, h - 20, baseW, 20);
        
      } else if (type < 0.6) {
        // Tall smokestack
        const stackW = 12 + Math.random() * 8;
        const stackH = 100 + Math.random() * 60;
        g.fillRect(x, h - stackH, stackW, stackH);
        g.fillRect(x - 3, h - stackH, stackW + 6, 8);
        g.fillRect(x - 2, h - 15, stackW + 4, 15);
        
      } else {
        // Industrial building block
        const bw = 50 + Math.random() * 40;
        const bh = 50 + Math.random() * 40;
        g.fillRect(x, h - bh, bw, bh);
        
        // Rooftop equipment
        g.fillRect(x + 10, h - bh - 10, 15, 10);
        g.fillRect(x + bw - 20, h - bh - 15, 10, 15);
      }
      
      x += 60 + Math.random() * 50;
    }
  }
  
  /**
   * Mid-far: More detailed structures
   */
  private drawMidFarFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.35) {
        // Storage silos
        const siloW = 30 + Math.random() * 20;
        const siloH = 70 + Math.random() * 50;
        g.fillRect(x, h - siloH, siloW, siloH);
        // Dome top
        g.fillCircle(x + siloW/2, h - siloH, siloW/2);
        // Ladder
        g.fillRect(x + siloW - 5, h - siloH + 10, 4, siloH - 15);
        
      } else if (type < 0.65) {
        // Factory building with sawtooth roof
        const bw = 80 + Math.random() * 50;
        const bh = 60 + Math.random() * 40;
        g.fillRect(x, h - bh, bw, bh);
        
        // Sawtooth roof
        const toothW = 20;
        for (let tx = x; tx < x + bw; tx += toothW) {
          g.fillRect(tx, h - bh - 12, toothW - 2, 12);
          g.fillRect(tx, h - bh - 18, 8, 8);
        }
        
      } else {
        // Crane/gantry
        const gantryW = 60 + Math.random() * 40;
        const gantryH = 90 + Math.random() * 40;
        
        // Legs
        g.fillRect(x, h - gantryH, 8, gantryH);
        g.fillRect(x + gantryW - 8, h - gantryH, 8, gantryH);
        // Top beam
        g.fillRect(x - 10, h - gantryH, gantryW + 20, 10);
        // Trolley
        g.fillRect(x + gantryW/2 - 10, h - gantryH + 10, 20, 15);
        // Cable
        g.fillRect(x + gantryW/2 - 1, h - gantryH + 25, 2, 30);
      }
      
      x += 100 + Math.random() * 60;
    }
  }
  
  /**
   * Mid: Detailed machinery
   */
  private drawMidFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.3) {
        // Conveyor system
        const convW = 100 + Math.random() * 60;
        const convH = 25;
        const legH = 50 + Math.random() * 30;
        
        // Support structure
        g.fillRect(x + 10, h - legH, 10, legH);
        g.fillRect(x + convW - 20, h - legH, 10, legH);
        g.fillRect(x + convW/2 - 5, h - legH, 10, legH);
        
        // Belt
        g.fillRect(x, h - legH - convH, convW, convH);
        // Rollers
        g.fillCircle(x + 12, h - legH - convH/2, 10);
        g.fillCircle(x + convW - 12, h - legH - convH/2, 10);
        
      } else if (type < 0.6) {
        // Large gear housing
        const boxW = 70 + Math.random() * 40;
        const boxH = 80 + Math.random() * 40;
        g.fillRect(x, h - boxH, boxW, boxH);
        
        // Gear visible through opening
        const gearR = Math.min(boxW, boxH) * 0.3;
        const gearX = x + boxW/2;
        const gearY = h - boxH/2;
        
        // Darker opening
        g.fillStyle(0x050508);
        g.fillRect(x + 10, h - boxH + 15, boxW - 20, boxH - 30);
        g.fillStyle(color);
        
        // Gear silhouette
        g.fillCircle(gearX, gearY, gearR);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          g.fillRect(
            gearX + Math.cos(angle) * gearR - 4,
            gearY + Math.sin(angle) * gearR - 4,
            8, 8
          );
        }
        
      } else {
        // Industrial press
        const pressW = 50 + Math.random() * 30;
        const pressH = 100 + Math.random() * 40;
        
        // Frame
        g.fillRect(x, h - pressH, 12, pressH);
        g.fillRect(x + pressW - 12, h - pressH, 12, pressH);
        g.fillRect(x, h - pressH, pressW, 15);
        g.fillRect(x, h - 20, pressW, 20);
        
        // Ram
        g.fillRect(x + 15, h - pressH + 30, pressW - 30, 25);
        // Hydraulic cylinder
        g.fillRect(x + pressW/2 - 8, h - pressH + 15, 16, 20);
      }
      
      x += 120 + Math.random() * 80;
    }
  }
  
  /**
   * Near: Large detailed machinery
   */
  private drawNearFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    
    while (x < w) {
      const type = Math.random();
      
      if (type < 0.35) {
        // Robotic arm assembly
        const baseW = 50;
        const baseH = 35;
        
        g.fillRect(x, h - baseH, baseW, baseH);
        
        // Arm segments
        g.fillRect(x + 20, h - baseH - 60, 14, 65);
        g.fillCircle(x + 27, h - baseH - 60, 12);
        g.fillRect(x + 30, h - baseH - 90, 12, 35);
        g.fillCircle(x + 36, h - baseH - 90, 10);
        
        // End effector
        g.fillRect(x + 32, h - baseH - 105, 20, 18);
        g.fillRect(x + 30, h - baseH - 115, 8, 12);
        g.fillRect(x + 44, h - baseH - 115, 8, 12);
        
      } else if (type < 0.65) {
        // Large gear mechanism
        const housingW = 100 + Math.random() * 40;
        const housingH = 120 + Math.random() * 40;
        
        g.fillRect(x, h - housingH, housingW, housingH);
        
        // Main gear
        const mainR = housingH * 0.35;
        const mainX = x + housingW * 0.4;
        const mainY = h - housingH * 0.5;
        
        g.fillCircle(mainX, mainY, mainR);
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          g.fillRect(
            mainX + Math.cos(angle) * mainR - 5,
            mainY + Math.sin(angle) * mainR - 5,
            10, 10
          );
        }
        
        // Smaller meshed gear
        const smallR = mainR * 0.6;
        const smallX = mainX + mainR + smallR - 5;
        const smallY = mainY + 15;
        
        g.fillCircle(smallX, smallY, smallR);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          g.fillRect(
            smallX + Math.cos(angle) * smallR - 4,
            smallY + Math.sin(angle) * smallR - 4,
            8, 8
          );
        }
        
        // Axle holes
        g.fillStyle(0x050508);
        g.fillCircle(mainX, mainY, mainR * 0.15);
        g.fillCircle(smallX, smallY, smallR * 0.15);
        g.fillStyle(color);
        
      } else {
        // Furnace/boiler
        const furnaceW = 80 + Math.random() * 40;
        const furnaceH = 100 + Math.random() * 50;
        
        g.fillRect(x, h - furnaceH, furnaceW, furnaceH);
        
        // Rivets along edges
        for (let ry = h - furnaceH + 15; ry < h - 10; ry += 20) {
          g.fillCircle(x + 8, ry, 3);
          g.fillCircle(x + furnaceW - 8, ry, 3);
        }
        
        // Door/hatch
        g.fillStyle(0x050508);
        g.fillRect(x + 15, h - 60, 30, 40);
        g.fillStyle(color);
        g.fillRect(x + 15, h - 60, 30, 4);
        
        // Pipes coming out
        g.fillRect(x + furnaceW, h - furnaceH + 20, 25, 12);
        g.fillRect(x + furnaceW, h - furnaceH + 50, 20, 10);
        
        // Stack on top
        g.fillRect(x + furnaceW/2 - 10, h - furnaceH - 40, 20, 45);
      }
      
      x += 150 + Math.random() * 100;
    }
  }
  
  /**
   * Animated spinning gears
   */
  private createBackgroundGears(): void {
    const { width, height } = this.scene.cameras.main;
    
    const gearConfigs = [
      { x: width * 0.12, y: height * 0.35, r: 40, speed: 20000, cw: true, alpha: 0.15 },
      { x: width * 0.12 + 52, y: height * 0.35 + 32, r: 25, speed: 12500, cw: false, alpha: 0.15 },
      { x: width * 0.85, y: height * 0.45, r: 50, speed: 25000, cw: false, alpha: 0.12 },
      { x: width * 0.85 + 65, y: height * 0.45, r: 30, speed: 15000, cw: true, alpha: 0.12 },
      { x: width * 0.5, y: height * 0.25, r: 30, speed: 18000, cw: true, alpha: 0.1 },
    ];
    
    gearConfigs.forEach(cfg => {
      const gear = this.createGear(cfg.r, 0x1a1a30, cfg.alpha);
      gear.setPosition(cfg.x, cfg.y);
      gear.setDepth(-8);
      
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
    const teeth = Math.floor(radius / 4);
    
    gear.fillStyle(color, alpha);
    gear.fillCircle(0, 0, radius);
    
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      gear.fillRect(tx - 4, ty - 4, 8, 8);
    }
    
    gear.fillStyle(0x080810, alpha);
    gear.fillCircle(0, 0, radius * 0.25);
    
    return gear;
  }
  
  /**
   * Flickering window lights
   */
  private createWindowLights(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Scatter window lights across mid-ground
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = height * 0.5 + Math.random() * (height * 0.3);
      
      const light = this.scene.add.graphics();
      light.setDepth(-3);
      
      const lightColor = Math.random() > 0.7 ? 0xff6600 : 0xffcc00;
      light.fillStyle(lightColor, 0.3 + Math.random() * 0.3);
      light.fillRect(-3, -4, 6, 8);
      
      light.setPosition(x, y);
      
      // Flicker
      this.scene.tweens.add({
        targets: light,
        alpha: 0.2 + Math.random() * 0.3,
        duration: 100 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
      
      this.windowLights.push(light);
    }
  }
  
  /**
   * Rising smoke from stacks
   */
  private createSmoke(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Smoke emission points
    const smokePoints = [
      { x: width * 0.2, y: height * 0.35 },
      { x: width * 0.45, y: height * 0.4 },
      { x: width * 0.7, y: height * 0.38 },
      { x: width * 0.9, y: height * 0.42 },
    ];
    
    smokePoints.forEach(point => {
      const timer = this.scene.time.addEvent({
        delay: 300 + Math.random() * 200,
        callback: () => this.emitSmoke(point.x, point.y),
        loop: true
      });
      this.smokeEmitters.push({ ...point, timer });
    });
  }
  
  private emitSmoke(x: number, y: number): void {
    const smoke = this.scene.add.graphics();
    smoke.setDepth(-2);
    
    const size = 8 + Math.random() * 12;
    smoke.fillStyle(0x2a2a3a, 0.2);
    smoke.fillCircle(0, 0, size);
    
    smoke.setPosition(x + (Math.random() - 0.5) * 10, y);
    
    this.scene.tweens.add({
      targets: smoke,
      y: y - 80 - Math.random() * 60,
      x: x + (Math.random() - 0.5) * 50,
      alpha: 0,
      scale: 2 + Math.random(),
      duration: 3000 + Math.random() * 2000,
      ease: 'Sine.easeOut',
      onComplete: () => smoke.destroy()
    });
  }
  
  /**
   * Industrial sparks
   */
  private createSparks(): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(-1);
      
      const size = 1 + Math.random() * 1.5;
      const isOrange = Math.random() > 0.3;
      
      particle.fillStyle(isOrange ? 0xff6600 : 0xffcc00, 0.4 + Math.random() * 0.4);
      particle.fillCircle(0, 0, size);
      
      const startX = Math.random() * width;
      const startY = height * 0.6 + Math.random() * (height * 0.3);
      particle.setPosition(startX, startY);
      
      this.scene.tweens.add({
        targets: particle,
        y: startY - 30 - Math.random() * 50,
        x: startX + (Math.random() - 0.5) * 30,
        alpha: 0,
        duration: 1500 + Math.random() * 1500,
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(Math.random() * width, height * 0.6 + Math.random() * (height * 0.3));
          particle.setAlpha(0.4 + Math.random() * 0.4);
        }
      });
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Furnace glow at bottom
   */
  private createFurnaceGlow(): void {
    const { width, height } = this.scene.cameras.main;
    
    const glow = this.scene.add.graphics();
    glow.setDepth(-5);
    
    // Orange/red furnace glow
    for (let i = 0; i < 8; i++) {
      const y = height - 60 + i * 10;
      const alpha = 0.06 - i * 0.006;
      glow.fillStyle(0xff4400, alpha);
      glow.fillRect(0, y, width, 10);
    }
    
    // Pulsing
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Foreground atmospheric haze
   */
  private createForegroundHaze(): void {
    const { width, height } = this.scene.cameras.main;
    
    const haze = this.scene.add.graphics();
    haze.setDepth(5);
    
    // Very subtle foreground haze
    haze.fillGradientStyle(
      0x1a1520, 0x1a1520,
      0x1a1520, 0x1a1520,
      0.0, 0.0, 0.08, 0.08
    );
    haze.fillRect(0, height * 0.7, width, height * 0.3);
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
    this.windowLights.forEach(w => w.destroy());
    this.smokeEmitters.forEach(e => e.timer.destroy());
    this.layers = [];
    this.particles = [];
    this.gears = [];
    this.windowLights = [];
    this.smokeEmitters = [];
  }
}
