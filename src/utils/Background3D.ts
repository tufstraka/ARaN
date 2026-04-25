/**
 * 2.5D Background System
 * Renders Three.js to a canvas, then uses it as Phaser texture
 */

import * as THREE from 'three';
import Phaser from 'phaser';

export class Background3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private phaserScene: Phaser.Scene;
  private bgSprite?: Phaser.GameObjects.Image;
  
  // 3D Objects
  private smokestacks: THREE.Mesh[] = [];
  private gears: THREE.Mesh[] = [];
  private particles!: THREE.Points;
  
  // Animation
  private clock: THREE.Clock;
  
  // Materials
  private metalMaterial!: THREE.MeshStandardMaterial;
  private darkMaterial!: THREE.MeshStandardMaterial;
  
  private width: number;
  private height: number;
  
  constructor(phaserScene: Phaser.Scene, width: number, height: number) {
    this.phaserScene = phaserScene;
    this.width = width;
    this.height = height;
    this.clock = new THREE.Clock();
    
    // Create offscreen canvas for Three.js
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Setup Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 3, 12);
    this.camera.lookAt(0, 0, -15);
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(1); // Keep it simple for performance
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Dark factory atmosphere
    this.scene.background = new THREE.Color(0x0a0a12);
    this.scene.fog = new THREE.FogExp2(0x0a0a12, 0.025);
    
    // Create materials
    this.createMaterials();
    
    // Build the scene
    this.setupLights();
    this.createFactory();
    this.createParticles();
    
    // Initial render
    this.renderer.render(this.scene, this.camera);
    
    // Create Phaser texture from canvas
    this.createPhaserTexture();
  }
  
  private createMaterials(): void {
    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      metalness: 0.7,
      roughness: 0.5,
    });
    
    this.darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a25,
      metalness: 0.5,
      roughness: 0.8,
    });
  }
  
  private setupLights(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.5);
    this.scene.add(ambient);
    
    // Main directional light (moonlight)
    const mainLight = new THREE.DirectionalLight(0x4466aa, 0.8);
    mainLight.position.set(-5, 15, 5);
    this.scene.add(mainLight);
    
    // Cyan accent
    const cyanLight = new THREE.PointLight(0x00ffff, 1.5, 40);
    cyanLight.position.set(8, 4, 0);
    this.scene.add(cyanLight);
    
    // Orange industrial glow
    const fireLight = new THREE.PointLight(0xff4400, 1, 30);
    fireLight.position.set(-10, 3, -15);
    this.scene.add(fireLight);
    
    // Red warning
    const warningLight = new THREE.PointLight(0xff0044, 0.6, 25);
    warningLight.position.set(0, 6, -10);
    warningLight.userData.isWarning = true;
    this.scene.add(warningLight);
  }
  
  private createFactory(): void {
    // === GROUND PLANE ===
    const groundGeo = new THREE.PlaneGeometry(120, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15151f,
      metalness: 0.8,
      roughness: 0.4,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.position.z = -20;
    this.scene.add(ground);
    
    // === SMOKESTACKS ===
    for (let i = 0; i < 10; i++) {
      const h = 10 + Math.random() * 15;
      const r = 1 + Math.random() * 1.2;
      
      const stackGeo = new THREE.CylinderGeometry(r * 0.6, r, h, 8);
      const stack = new THREE.Mesh(stackGeo, this.darkMaterial);
      
      stack.position.set(
        -40 + i * 9 + (Math.random() - 0.5) * 4,
        h / 2 - 3,
        -30 - Math.random() * 20
      );
      
      this.smokestacks.push(stack);
      this.scene.add(stack);
      
      // Glowing top
      const topGeo = new THREE.CylinderGeometry(r * 0.7, r * 0.6, 1, 8);
      const topMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff4400 : 0xff2200,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3
      });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.copy(stack.position);
      top.position.y = h - 3;
      this.scene.add(top);
    }
    
    // === ROTATING GEARS ===
    for (let i = 0; i < 8; i++) {
      const gear = this.createGear(1.5 + Math.random() * 2.5);
      gear.position.set(
        -30 + i * 8 + (Math.random() - 0.5) * 3,
        -1 + Math.random() * 5,
        -8 - Math.random() * 12
      );
      gear.rotation.x = Math.PI / 2;
      gear.userData.speed = 0.3 + Math.random() * 0.8;
      gear.userData.direction = Math.random() > 0.5 ? 1 : -1;
      
      this.gears.push(gear);
      this.scene.add(gear);
    }
    
    // === COOLING TOWERS ===
    for (let i = 0; i < 4; i++) {
      const towerGeo = new THREE.CylinderGeometry(2.5, 3.5, 12, 12);
      const tower = new THREE.Mesh(towerGeo, this.metalMaterial);
      tower.position.set(-30 + i * 18, 3, -40);
      this.scene.add(tower);
    }
    
    // === PIPES ===
    for (let i = 0; i < 15; i++) {
      const length = 10 + Math.random() * 15;
      const pipeGeo = new THREE.CylinderGeometry(0.25, 0.25, length, 6);
      const pipe = new THREE.Mesh(pipeGeo, this.metalMaterial);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(
        -35 + Math.random() * 70,
        -1 + Math.random() * 8,
        -12 - Math.random() * 15
      );
      this.scene.add(pipe);
    }
    
    // === FOREGROUND STRUCTURES ===
    for (let i = 0; i < 15; i++) {
      const supportGeo = new THREE.BoxGeometry(0.4, 5, 0.4);
      const support = new THREE.Mesh(supportGeo, this.darkMaterial);
      support.position.set(-35 + i * 5, -0.5, 3);
      this.scene.add(support);
      
      // Connector rail
      if (i > 0) {
        const railGeo = new THREE.BoxGeometry(5.5, 0.15, 0.25);
        const rail = new THREE.Mesh(railGeo, this.metalMaterial);
        rail.position.set(-35 + i * 5 - 2.5, 2, 3);
        this.scene.add(rail);
      }
    }
    
    // === GLOWING ELEMENTS ===
    for (let i = 0; i < 8; i++) {
      const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const color = i % 3 === 0 ? 0xff0044 : i % 3 === 1 ? 0x00ffff : 0xffaa00;
      const lightMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(-28 + i * 8, 5 + Math.random() * 3, -6 - Math.random() * 5);
      lightMesh.userData.pulseOffset = Math.random() * Math.PI * 2;
      this.scene.add(lightMesh);
    }
  }
  
  private createGear(radius: number): THREE.Mesh {
    const teeth = 10;
    const toothHeight = radius * 0.2;
    const shape = new THREE.Shape();
    
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.65) / teeth) * Math.PI * 2;
      const a4 = ((i + 1) / teeth) * Math.PI * 2;
      
      const r1 = radius;
      const r2 = radius + toothHeight;
      
      if (i === 0) {
        shape.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      }
      
      shape.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
      shape.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      shape.lineTo(Math.cos(a3) * r2, Math.sin(a3) * r2);
      shape.lineTo(Math.cos(a3) * r1, Math.sin(a3) * r1);
      shape.lineTo(Math.cos(a4) * r1, Math.sin(a4) * r1);
    }
    
    // Center hole
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: false });
    return new THREE.Mesh(geometry, this.metalMaterial);
  }
  
  private createParticles(): void {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 25 - 3;
      positions[i * 3 + 2] = -5 - Math.random() * 45;
      
      // Color variety
      const type = Math.random();
      if (type < 0.25) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // Cyan
      } else if (type < 0.45) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 0; // Orange
      } else {
        const v = 0.4 + Math.random() * 0.4;
        colors[i * 3] = v; colors[i * 3 + 1] = v; colors[i * 3 + 2] = v; // Gray
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  private createPhaserTexture(): void {
    // Add canvas as a texture source
    const textureKey = 'bg3d_' + Date.now();
    this.phaserScene.textures.addCanvas(textureKey, this.canvas);
    
    // Create sprite with the texture
    this.bgSprite = this.phaserScene.add.image(this.width / 2, this.height / 2, textureKey);
    this.bgSprite.setDisplaySize(this.width, this.height);
    this.bgSprite.setDepth(-100); // Behind everything
  }
  
  update(scrollSpeed: number, delta: number): void {
    const dt = delta / 1000;
    const elapsed = this.clock.getElapsedTime();
    
    // Rotate gears
    this.gears.forEach(gear => {
      gear.rotation.z += gear.userData.speed * gear.userData.direction * dt;
    });
    
    // Animate particles
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += dt * (0.4 + Math.random() * 0.3);
      positions[i * 3] += Math.sin(elapsed + i * 0.5) * dt * 0.2;
      
      if (positions[i * 3 + 1] > 22) {
        positions[i * 3 + 1] = -3;
        positions[i * 3] = (Math.random() - 0.5) * 100;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Pulse warning lights
    this.scene.children.forEach(child => {
      if (child.userData.isWarning && child instanceof THREE.PointLight) {
        child.intensity = 0.4 + Math.sin(elapsed * 3) * 0.3;
      }
      if (child.userData.pulseOffset !== undefined && child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.5 + Math.sin(elapsed * 2 + child.userData.pulseOffset) * 0.4;
      }
    });
    
    // Subtle camera sway
    this.camera.position.y = 3 + Math.sin(elapsed * 0.4) * 0.15;
    this.camera.position.x = Math.sin(elapsed * 0.25) * 0.25;
    
    // Render Three.js scene
    this.renderer.render(this.scene, this.camera);
    
    // Update Phaser texture
    if (this.bgSprite) {
      const texture = this.bgSprite.texture as Phaser.Textures.CanvasTexture;
      if (texture.refresh) {
        texture.refresh();
      }
    }
  }
  
  setDanger(level: number): void {
    // Shift background color toward red
    const r = 0.04 + level * 0.04;
    const g = Math.max(0.02, 0.04 - level * 0.03);
    const b = Math.max(0.04, 0.07 - level * 0.04);
    this.scene.background = new THREE.Color(r, g, b);
    
    // Increase fog density
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = 0.025 + level * 0.015;
    }
  }
  
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    if (this.bgSprite) {
      this.bgSprite.setPosition(width / 2, height / 2);
      this.bgSprite.setDisplaySize(width, height);
    }
  }
  
  destroy(): void {
    if (this.bgSprite) {
      this.bgSprite.destroy();
    }
    this.renderer.dispose();
  }
}
