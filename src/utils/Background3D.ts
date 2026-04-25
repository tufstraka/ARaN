/**
 * 2.5D Background System
 * Combines Phaser 2D gameplay with Three.js 3D background
 */

import * as THREE from 'three';

export class Background3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  
  // 3D Objects
  private factoryElements: THREE.Group;
  private smokestacks: THREE.Mesh[] = [];
  private gears: THREE.Mesh[] = [];
  private conveyors: THREE.Mesh[] = [];
  private particles!: THREE.Points;
  private fog: THREE.FogExp2;
  
  // Animation
  private clock: THREE.Clock;
  private scrollOffset: number = 0;
  
  // Materials
  private metalMaterial: THREE.MeshStandardMaterial;
  private glowMaterial: THREE.MeshBasicMaterial;
  private darkMaterial: THREE.MeshStandardMaterial;
  
  constructor(width: number, height: number) {
    this.clock = new THREE.Clock();
    
    // Create canvas for Three.js (will be placed behind Phaser)
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'three-bg';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;
    
    // Setup Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 10);
    this.camera.lookAt(0, 0, -20);
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    
    // Fog for depth
    this.fog = new THREE.FogExp2(0x0a0a15, 0.035);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0x0a0a15);
    
    // Materials
    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.8,
      roughness: 0.4,
    });
    
    this.darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x151520,
      metalness: 0.6,
      roughness: 0.7,
    });
    
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    
    // Build scene
    this.setupLights();
    this.createFactory();
    this.createParticles();
    
    // Container group for scrolling
    this.factoryElements = new THREE.Group();
    this.scene.add(this.factoryElements);
  }
  
  private setupLights(): void {
    // Ambient
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4);
    this.scene.add(ambient);
    
    // Main directional (moonlight feel)
    const mainLight = new THREE.DirectionalLight(0x4466aa, 0.6);
    mainLight.position.set(-10, 20, 10);
    this.scene.add(mainLight);
    
    // Cyan accent from machines
    const cyanLight = new THREE.PointLight(0x00ffff, 1, 30);
    cyanLight.position.set(5, 3, 0);
    this.scene.add(cyanLight);
    
    // Orange/red industrial glow
    const fireLight = new THREE.PointLight(0xff4400, 0.8, 25);
    fireLight.position.set(-8, 2, -10);
    this.scene.add(fireLight);
    
    // Warning light (animated)
    const warningLight = new THREE.PointLight(0xff0040, 0.5, 20);
    warningLight.position.set(0, 5, -5);
    warningLight.userData.isWarning = true;
    this.scene.add(warningLight);
  }
  
  private createFactory(): void {
    // === FLOOR (conveyor belt style) ===
    const floorGeo = new THREE.PlaneGeometry(100, 40, 20, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a25,
      metalness: 0.9,
      roughness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.position.z = -20;
    this.scene.add(floor);
    
    // === SMOKESTACKS (silhouettes in background) ===
    for (let i = 0; i < 8; i++) {
      const height = 8 + Math.random() * 12;
      const width = 1 + Math.random() * 1.5;
      
      const stackGeo = new THREE.CylinderGeometry(width * 0.7, width, height, 8);
      const stack = new THREE.Mesh(stackGeo, this.darkMaterial);
      
      stack.position.set(
        -30 + i * 8 + Math.random() * 4,
        height / 2 - 2,
        -25 - Math.random() * 15
      );
      
      this.smokestacks.push(stack);
      this.scene.add(stack);
      
      // Smoke emission point (glowing top)
      const topGeo = new THREE.CylinderGeometry(width * 0.8, width * 0.7, 0.5, 8);
      const top = new THREE.Mesh(topGeo, new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3
      }));
      top.position.set(stack.position.x, height - 2, stack.position.z);
      this.scene.add(top);
    }
    
    // === ROTATING GEARS ===
    for (let i = 0; i < 6; i++) {
      const gear = this.createGear(1 + Math.random() * 2);
      gear.position.set(
        -20 + i * 8 + Math.random() * 4,
        Math.random() * 4,
        -10 - Math.random() * 10
      );
      gear.rotation.x = Math.PI / 2;
      gear.userData.speed = 0.5 + Math.random() * 1;
      gear.userData.direction = Math.random() > 0.5 ? 1 : -1;
      
      this.gears.push(gear);
      this.scene.add(gear);
    }
    
    // === INDUSTRIAL STRUCTURES ===
    // Cooling towers
    for (let i = 0; i < 3; i++) {
      const towerGeo = new THREE.CylinderGeometry(3, 4, 10, 16);
      const tower = new THREE.Mesh(towerGeo, this.metalMaterial);
      tower.position.set(-25 + i * 20, 3, -35);
      this.scene.add(tower);
    }
    
    // Pipes
    for (let i = 0; i < 10; i++) {
      const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 15 + Math.random() * 10, 8);
      const pipe = new THREE.Mesh(pipeGeo, this.metalMaterial);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(
        -30 + Math.random() * 60,
        1 + Math.random() * 6,
        -15 - Math.random() * 10
      );
      this.scene.add(pipe);
    }
    
    // === CONVEYOR SUPPORTS (foreground) ===
    for (let i = 0; i < 12; i++) {
      const supportGeo = new THREE.BoxGeometry(0.5, 4, 0.5);
      const support = new THREE.Mesh(supportGeo, this.darkMaterial);
      support.position.set(-30 + i * 5, 0, 2);
      this.scene.add(support);
      
      // Top rail
      const railGeo = new THREE.BoxGeometry(5.5, 0.2, 0.3);
      const rail = new THREE.Mesh(railGeo, this.metalMaterial);
      rail.position.set(-30 + i * 5 + 2.5, 2, 2);
      this.scene.add(rail);
    }
    
    // === GLOWING ELEMENTS ===
    // Warning lights
    for (let i = 0; i < 5; i++) {
      const lightGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const lightMesh = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff0040 : 0x00ffff,
        transparent: true,
        opacity: 0.8
      }));
      lightMesh.position.set(-20 + i * 10, 6, -8);
      lightMesh.userData.pulseOffset = Math.random() * Math.PI * 2;
      this.scene.add(lightMesh);
    }
  }
  
  private createGear(radius: number): THREE.Mesh {
    const shape = new THREE.Shape();
    const teeth = 12;
    const toothHeight = radius * 0.2;
    
    for (let i = 0; i < teeth; i++) {
      const angle1 = (i / teeth) * Math.PI * 2;
      const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
      const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
      const angle4 = ((i + 0.8) / teeth) * Math.PI * 2;
      
      const r1 = radius;
      const r2 = radius + toothHeight;
      
      if (i === 0) {
        shape.moveTo(Math.cos(angle1) * r1, Math.sin(angle1) * r1);
      }
      
      shape.lineTo(Math.cos(angle2) * r1, Math.sin(angle2) * r1);
      shape.lineTo(Math.cos(angle2) * r2, Math.sin(angle2) * r2);
      shape.lineTo(Math.cos(angle3) * r2, Math.sin(angle3) * r2);
      shape.lineTo(Math.cos(angle4) * r1, Math.sin(angle4) * r1);
    }
    
    const extrudeSettings = { depth: 0.3, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    return new THREE.Mesh(geometry, this.metalMaterial);
  }
  
  private createParticles(): void {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = -10 - Math.random() * 40;
      
      // Color (mix of cyan, orange sparks, and white ash)
      const type = Math.random();
      if (type < 0.3) {
        // Cyan
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (type < 0.5) {
        // Orange spark
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0;
      } else {
        // White/gray ash
        const v = 0.5 + Math.random() * 0.5;
        colors[i * 3] = v;
        colors[i * 3 + 1] = v;
        colors[i * 3 + 2] = v;
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  mount(container: HTMLElement): void {
    // Insert canvas before the Phaser canvas
    const phaserCanvas = container.querySelector('canvas');
    if (phaserCanvas) {
      container.insertBefore(this.canvas, phaserCanvas);
    } else {
      container.appendChild(this.canvas);
    }
  }
  
  unmount(): void {
    this.canvas.remove();
    this.renderer.dispose();
  }
  
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  update(scrollSpeed: number, delta: number): void {
    const dt = delta / 1000;
    this.scrollOffset += scrollSpeed * dt * 0.01;
    
    // Rotate gears
    this.gears.forEach(gear => {
      gear.rotation.z += gear.userData.speed * gear.userData.direction * dt;
    });
    
    // Animate particles (drift up like smoke/sparks)
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += dt * (0.5 + Math.random() * 0.5); // Rise
      positions[i * 3] += Math.sin(this.clock.elapsedTime + i) * dt * 0.3; // Sway
      
      // Reset particles that go too high
      if (positions[i * 3 + 1] > 20) {
        positions[i * 3 + 1] = -2;
        positions[i * 3] = (Math.random() - 0.5) * 80;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Pulse warning lights
    this.scene.children.forEach(child => {
      if (child.userData.isWarning) {
        const light = child as THREE.PointLight;
        light.intensity = 0.3 + Math.sin(this.clock.elapsedTime * 3) * 0.3;
      }
      if (child.userData.pulseOffset !== undefined) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.4 + Math.sin(this.clock.elapsedTime * 2 + child.userData.pulseOffset) * 0.4;
      }
    });
    
    // Subtle camera movement (breathe effect)
    this.camera.position.y = 2 + Math.sin(this.clock.elapsedTime * 0.5) * 0.1;
    this.camera.position.x = Math.sin(this.clock.elapsedTime * 0.3) * 0.2;
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
  
  // Intensity effects for gameplay events
  flash(color: number = 0xff0040): void {
    const originalBg = (this.scene.background as THREE.Color).getHex();
    this.scene.background = new THREE.Color(color);
    
    setTimeout(() => {
      this.scene.background = new THREE.Color(originalBg);
    }, 50);
  }
  
  setDanger(level: number): void {
    // Increase red fog as danger increases
    const r = 0.04 + level * 0.02;
    const g = 0.04 - level * 0.02;
    const b = 0.08 - level * 0.03;
    this.scene.background = new THREE.Color(r, Math.max(0, g), Math.max(0, b));
    this.fog.density = 0.035 + level * 0.01;
  }
}
