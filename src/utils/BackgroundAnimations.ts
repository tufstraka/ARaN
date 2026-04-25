import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';

/**
 * Minimal, Elegant Factory Background
 * Clean parallax layers with subtle movement
 */
export class BackgroundAnimations {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private particles: Phaser.GameObjects.Graphics[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create clean, minimal background
   */
  create(): void {
    this.createGradient();
    this.createFactoryLayers();
    this.createSubtleParticles();
    this.createAmbientGlow();
  }
  
  /**
   * Smooth gradient background
   */
  private createGradient(): void {
    const { width, height } = this.scene.cameras.main;
    
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);
    
    // Deep industrial gradient - dark blue to near black
    bg.fillGradientStyle(
      0x1a1a2e, 0x1a1a2e,  // Top: dark blue-purple
      0x0a0a12, 0x0a0a12   // Bottom: near black
    );
    bg.fillRect(0, 0, width, height);
  }
  
  /**
   * Clean factory silhouette layers with parallax
   */
  private createFactoryLayers(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Far layer - distant city/factory skyline
    const farLayer = this.createSilhouetteLayer(
      height * 0.5,  // Y position
      0.3,           // Parallax speed
      0x12121f,      // Color - very dark
      0.6,           // Alpha
      'far'
    );
    
    // Mid layer - closer buildings
    const midLayer = this.createSilhouetteLayer(
      height * 0.6,
      0.5,
      0x1a1a2e,
      0.7,
      'mid'
    );
    
    // Near layer - closest structures
    const nearLayer = this.createSilhouetteLayer(
      height * 0.75,
      0.8,
      0x252540,
      0.8,
      'near'
    );
    
    this.layers.push(farLayer, midLayer, nearLayer);
  }
  
  /**
   * Create a factory silhouette layer
   */
  private createSilhouetteLayer(
    baseY: number,
    parallaxSpeed: number,
    color: number,
    alpha: number,
    type: 'far' | 'mid' | 'near'
  ): Phaser.GameObjects.TileSprite {
    const { width, height } = this.scene.cameras.main;
    
    // Create a texture for the silhouette
    const textureName = `factory_${type}`;
    const textureWidth = 512;
    const textureHeight = 200;
    
    // Generate factory silhouette texture
    const graphics = this.scene.add.graphics();
    // Note: fillStyle is set in each draw method
    
    if (type === 'far') {
      // Distant smokestacks and buildings
      this.drawDistantFactory(graphics, textureWidth, textureHeight, color);
    } else if (type === 'mid') {
      // Medium buildings with chimneys
      this.drawMidFactory(graphics, textureWidth, textureHeight, color);
    } else {
      // Close industrial structures
      this.drawNearFactory(graphics, textureWidth, textureHeight, color);
    }
    
    graphics.generateTexture(textureName, textureWidth, textureHeight);
    graphics.destroy();
    
    // Create tile sprite
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
  
  private drawDistantFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    // Distant skyline with smokestacks
    g.fillStyle(color);
    let x = 0;
    while (x < w) {
      const buildingW = 30 + Math.random() * 50;
      const buildingH = 40 + Math.random() * 80;
      
      // Building
      g.fillRect(x, h - buildingH, buildingW, buildingH);
      
      // Occasional smokestack
      if (Math.random() > 0.6) {
        const stackW = 8;
        const stackH = 30 + Math.random() * 40;
        g.fillRect(x + buildingW / 2 - stackW / 2, h - buildingH - stackH, stackW, stackH);
      }
      
      x += buildingW + 10 + Math.random() * 30;
    }
  }
  
  private drawMidFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    let x = 0;
    while (x < w) {
      const buildingW = 40 + Math.random() * 60;
      const buildingH = 60 + Math.random() * 100;
      
      // Main building
      g.fillStyle(color);
      g.fillRect(x, h - buildingH, buildingW, buildingH);
      
      // Roof detail
      if (Math.random() > 0.5) {
        g.fillRect(x + 5, h - buildingH - 15, buildingW - 10, 15);
      }
      
      // Windows (subtle darker rectangles)
      g.fillStyle(0x0a0a12, 0.5);
      for (let wy = h - buildingH + 20; wy < h - 20; wy += 25) {
        for (let wx = x + 8; wx < x + buildingW - 8; wx += 15) {
          g.fillRect(wx, wy, 8, 12);
        }
      }
      
      x += buildingW + 20 + Math.random() * 40;
    }
  }
  
  private drawNearFactory(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number): void {
    g.fillStyle(color);
    let x = 0;
    while (x < w) {
      const buildingW = 60 + Math.random() * 80;
      const buildingH = 80 + Math.random() * 100;
      
      // Industrial structure
      g.fillRect(x, h - buildingH, buildingW, buildingH);
      
      // Crane or antenna
      if (Math.random() > 0.7) {
        const craneH = 40 + Math.random() * 30;
        g.fillRect(x + buildingW - 10, h - buildingH - craneH, 6, craneH);
        g.fillRect(x + buildingW - 30, h - buildingH - craneH, 30, 4);
      }
      
      // Pipes on side
      if (Math.random() > 0.5) {
        g.fillRect(x + buildingW, h - buildingH + 20, 15, 8);
        g.fillRect(x + buildingW, h - buildingH + 50, 15, 8);
      }
      
      x += buildingW + 30 + Math.random() * 50;
    }
  }
  
  /**
   * Subtle floating particles (dust/sparks)
   */
  private createSubtleParticles(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Create sparse floating particles
    for (let i = 0; i < 15; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(-1);
      
      const size = 1 + Math.random() * 2;
      const alpha = 0.1 + Math.random() * 0.2;
      
      particle.fillStyle(COLORS.NEON_CYAN, alpha);
      particle.fillCircle(0, 0, size);
      
      particle.setPosition(
        Math.random() * width,
        Math.random() * height
      );
      
      // Slow drift animation
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 50 - Math.random() * 100,
        x: particle.x + (Math.random() - 0.5) * 60,
        alpha: 0,
        duration: 4000 + Math.random() * 4000,
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(Math.random() * width, height + 20);
          particle.setAlpha(alpha);
        }
      });
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Subtle ambient glow at bottom (factory glow)
   */
  private createAmbientGlow(): void {
    const { width, height } = this.scene.cameras.main;
    
    const glow = this.scene.add.graphics();
    glow.setDepth(-4);
    
    // Soft orange/cyan glow at the bottom
    const gradient = glow.createGeometryMask();
    
    // Create a subtle gradient glow
    for (let i = 0; i < 5; i++) {
      const y = height - 60 + i * 15;
      const alpha = 0.03 - i * 0.005;
      glow.fillStyle(COLORS.NEON_CYAN, alpha);
      glow.fillRect(0, y, width, 15);
    }
    
    // Subtle pulsing
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Update parallax layers (call from scene update)
   */
  update(scrollSpeed: number, delta: number): void {
    this.layers.forEach(layer => {
      const speed = layer.getData('parallaxSpeed') || 0.5;
      layer.tilePositionX += scrollSpeed * speed * (delta / 1000);
    });
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.layers.forEach(l => l.destroy());
    this.particles.forEach(p => p.destroy());
    this.layers = [];
    this.particles = [];
  }
}
