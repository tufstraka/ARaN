/**
 * 2.5D Background System
 * Renders Three.js scene to a canvas texture displayed in Phaser
 */

import * as THREE from 'three';
import Phaser from 'phaser';

export class Background3D {
  private threeScene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private phaserScene: Phaser.Scene;
  private bgSprite!: Phaser.GameObjects.Image;
  private textureKey: string;
  
  // 3D Objects
  private gears: THREE.Mesh[] = [];
  private particles!: THREE.Points;
  
  // Animation
  private clock: THREE.Clock;
  
  private width: number;
  private height: number;
  private initialized: boolean = false;
  
  constructor(phaserScene: Phaser.Scene, width: number, height: number) {
    this.phaserScene = phaserScene;
    this.width = width;
    this.height = height;
    this.clock = new THREE.Clock();
    this.textureKey = 'bg3d_' + Date.now();
    
    console.log('[Background3D] Creating 3D background...');
    
    // Create offscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Setup Three.js scene
    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x0a0a15);
    this.threeScene.fog = new THREE.FogExp2(0x0a0a15, 0.02);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 3, 15);
    this.camera.lookAt(0, 0, -10);
    
    // Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: this.canvas,
        antialias: false, // Faster
        alpha: false
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(1);
    } catch (e) {
      console.error('[Background3D] WebGL not available:', e);
      throw e;
    }
    
    // Build scene
    this.setupLights();
    this.createFactory();
    this.createParticles();
    
    // Initial render
    this.renderer.render(this.threeScene, this.camera);
    
    // Create Phaser texture and sprite
    this.createPhaserSprite();
    
    this.initialized = true;
    console.log('[Background3D] Initialized successfully');
  }
  
  private setupLights(): void {
    // Ambient
    this.threeScene.add(new THREE.AmbientLight(0x2a2a3e, 0.6));
    
    // Main light
    const mainLight = new THREE.DirectionalLight(0x5577aa, 0.8);
    mainLight.position.set(-5, 10, 5);
    this.threeScene.add(mainLight);
    
    // Cyan accent
    const cyanLight = new THREE.PointLight(0x00ffff, 1.2, 50);
    cyanLight.position.set(10, 5, 5);
    this.threeScene.add(cyanLight);
    
    // Orange/fire accent
    const fireLight = new THREE.PointLight(0xff4400, 1, 40);
    fireLight.position.set(-10, 3, -10);
    this.threeScene.add(fireLight);
  }
  
  private createFactory(): void {
    // Dark metallic material
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.7,
      roughness: 0.5
    });
    
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x151520,
      metalness: 0.5,
      roughness: 0.8
    });
    
    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 80),
      new THREE.MeshStandardMaterial({ color: 0x12121a, metalness: 0.8, roughness: 0.3 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -4, -20);
    this.threeScene.add(ground);
    
    // Smokestacks (background silhouettes)
    for (let i = 0; i < 12; i++) {
      const h = 12 + Math.random() * 18;
      const r = 1 + Math.random();
      
      const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.6, r, h, 6),
        darkMat
      );
      stack.position.set(
        -50 + i * 9 + (Math.random() - 0.5) * 4,
        h / 2 - 4,
        -35 - Math.random() * 20
      );
      this.threeScene.add(stack);
      
      // Glowing top
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.7, r * 0.6, 1, 6),
        new THREE.MeshBasicMaterial({ 
          color: Math.random() > 0.3 ? 0xff4400 : 0xff2200,
          transparent: true,
          opacity: 0.6 + Math.random() * 0.3
        })
      );
      top.position.set(stack.position.x, h - 4, stack.position.z);
      this.threeScene.add(top);
    }
    
    // Rotating gears
    for (let i = 0; i < 6; i++) {
      const gear = this.createGear(2 + Math.random() * 2, metalMat);
      gear.position.set(
        -25 + i * 10 + (Math.random() - 0.5) * 3,
        -2 + Math.random() * 6,
        -8 - Math.random() * 12
      );
      gear.rotation.x = Math.PI / 2;
      gear.userData.speed = 0.3 + Math.random() * 0.6;
      gear.userData.dir = Math.random() > 0.5 ? 1 : -1;
      this.gears.push(gear);
      this.threeScene.add(gear);
    }
    
    // Pipes
    for (let i = 0; i < 12; i++) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 12 + Math.random() * 12, 6),
        metalMat
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(
        -30 + Math.random() * 60,
        -2 + Math.random() * 10,
        -15 - Math.random() * 12
      );
      this.threeScene.add(pipe);
    }
    
    // Foreground supports
    for (let i = 0; i < 10; i++) {
      const support = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 6, 0.5),
        darkMat
      );
      support.position.set(-30 + i * 7, -1, 5);
      this.threeScene.add(support);
    }
  }
  
  private createGear(radius: number, material: THREE.Material): THREE.Mesh {
    const teeth = 8;
    const shape = new THREE.Shape();
    
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.4) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.6) / teeth) * Math.PI * 2;
      const a4 = ((i + 1) / teeth) * Math.PI * 2;
      
      const r1 = radius;
      const r2 = radius * 1.2;
      
      if (i === 0) shape.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      shape.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
      shape.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      shape.lineTo(Math.cos(a3) * r2, Math.sin(a3) * r2);
      shape.lineTo(Math.cos(a3) * r1, Math.sin(a3) * r1);
      shape.lineTo(Math.cos(a4) * r1, Math.sin(a4) * r1);
    }
    
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
    return new THREE.Mesh(geo, material);
  }
  
  private createParticles(): void {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 30 - 5;
      positions[i * 3 + 2] = -5 - Math.random() * 40;
      
      // Color: cyan, orange, or gray
      const t = Math.random();
      if (t < 0.3) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
      } else if (t < 0.5) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 0;
      } else {
        const v = 0.4 + Math.random() * 0.3;
        colors[i * 3] = v; colors[i * 3 + 1] = v; colors[i * 3 + 2] = v;
      }
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    }));
    this.threeScene.add(this.particles);
  }
  
  private createPhaserSprite(): void {
    // Register canvas as texture
    this.phaserScene.textures.addCanvas(this.textureKey, this.canvas);
    
    // Create sprite
    this.bgSprite = this.phaserScene.add.image(this.width / 2, this.height / 2, this.textureKey);
    this.bgSprite.setDisplaySize(this.width, this.height);
    this.bgSprite.setDepth(-100);
    
    console.log('[Background3D] Sprite created at depth -100');
  }
  
  update(scrollSpeed: number, delta: number): void {
    if (!this.initialized) return;
    
    const dt = delta / 1000;
    const t = this.clock.getElapsedTime();
    
    // Rotate gears
    this.gears.forEach(gear => {
      gear.rotation.z += gear.userData.speed * gear.userData.dir * dt;
    });
    
    // Animate particles (float up)
    const pos = this.particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += dt * 0.5;
      pos[i * 3] += Math.sin(t + i) * dt * 0.2;
      if (pos[i * 3 + 1] > 25) {
        pos[i * 3 + 1] = -5;
        pos[i * 3] = (Math.random() - 0.5) * 100;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Camera sway
    this.camera.position.y = 3 + Math.sin(t * 0.4) * 0.2;
    this.camera.position.x = Math.sin(t * 0.3) * 0.3;
    
    // Render Three.js
    this.renderer.render(this.threeScene, this.camera);
    
    // Update Phaser texture
    const texture = this.phaserScene.textures.get(this.textureKey);
    if (texture && texture.source && texture.source[0]) {
      texture.source[0].update();
    }
  }
  
  setDanger(level: number): void {
    // Shift to red as danger increases
    const r = 0.04 + level * 0.05;
    const g = Math.max(0.02, 0.04 - level * 0.03);
    const b = Math.max(0.05, 0.08 - level * 0.04);
    this.threeScene.background = new THREE.Color(r, g, b);
  }
  
  destroy(): void {
    console.log('[Background3D] Destroying...');
    if (this.bgSprite) {
      this.bgSprite.destroy();
    }
    if (this.phaserScene.textures.exists(this.textureKey)) {
      this.phaserScene.textures.remove(this.textureKey);
    }
    this.renderer.dispose();
    this.initialized = false;
  }
}
