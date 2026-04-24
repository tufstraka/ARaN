import Phaser from 'phaser';
import { soundManager } from '../utils/SoundManager';

export class MenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Graphics[] = [];
  private time_elapsed: number = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Create stunning animated background
    this.createAnimatedBackground(width, height);

    // Create floating tech particles
    this.createTechParticles(width, height);

    // Create the main content
    this.createMainContent(width, height);

    // Input handlers
    this.input.keyboard?.on('keydown-SPACE', this.startGame, this);
  }

  private createAnimatedBackground(width: number, height: number): void {
    // Deep space gradient
    const bg = this.add.graphics();
    
    // Multi-layer gradient for depth
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0f1628, 0x0f1628, 1);
    bg.fillRect(0, 0, width, height);

    // Animated nebula-like glow spots
    const glowSpots = [
      { x: width * 0.2, y: height * 0.3, color: 0x00d4ff, size: 200 },
      { x: width * 0.8, y: height * 0.7, color: 0x7c3aed, size: 180 },
      { x: width * 0.5, y: height * 0.5, color: 0x06b6d4, size: 250 },
    ];

    glowSpots.forEach((spot, i) => {
      const glow = this.add.graphics();
      glow.fillStyle(spot.color, 0.03);
      glow.fillCircle(spot.x, spot.y, spot.size);
      glow.fillStyle(spot.color, 0.02);
      glow.fillCircle(spot.x, spot.y, spot.size * 1.5);
      
      // Subtle pulsing
      this.tweens.add({
        targets: glow,
        alpha: 0.5,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Animated scan lines (subtle)
    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0xffffff, 0.02);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineBetween(0, y, width, y);
    }

    // Animated horizontal light beam
    const beam = this.add.graphics();
    beam.fillStyle(0x00d4ff, 0.05);
    beam.fillRect(0, height * 0.4, width, 2);
    
    this.tweens.add({
      targets: beam,
      y: height * 0.2,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createTechParticles(width: number, height: number): void {
    // Floating geometric shapes
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
      const isSquare = Math.random() > 0.5;
      
      const particle = this.add.graphics();
      particle.fillStyle(0x00d4ff, alpha);
      
      if (isSquare) {
        particle.fillRect(-size/2, -size/2, size, size);
      } else {
        particle.fillCircle(0, 0, size);
      }
      
      particle.setPosition(x, y);
      this.particles.push(particle);
      
      // Floating animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(30, 80),
        x: x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 8000),
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(
            Phaser.Math.Between(0, width),
            height + 20
          );
          particle.setAlpha(alpha);
        }
      });
    }

    // Circuit-like connecting lines
    const circuits = this.add.graphics();
    circuits.lineStyle(1, 0x00d4ff, 0.1);
    
    for (let i = 0; i < 5; i++) {
      const startX = Phaser.Math.Between(0, width);
      const startY = Phaser.Math.Between(0, height);
      circuits.moveTo(startX, startY);
      
      for (let j = 0; j < 3; j++) {
        const nextX = startX + Phaser.Math.Between(-100, 100);
        const nextY = startY + Phaser.Math.Between(-50, 50);
        circuits.lineTo(nextX, nextY);
      }
    }
    circuits.strokePath();
  }

  private createMainContent(width: number, height: number): void {
    // Logo/Title section with dramatic entrance
    const titleContainer = this.add.container(width / 2, height * 0.32);
    
    // Glowing backdrop for title
    const titleGlow = this.add.graphics();
    titleGlow.fillStyle(0x00d4ff, 0.1);
    titleGlow.fillEllipse(0, 0, 400, 120);
    titleContainer.add(titleGlow);

    // Main title with custom styling
    const title = this.add.text(0, -20, 'FLIP', {
      fontSize: '96px',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const titleBot = this.add.text(0, 50, 'BOT', {
      fontSize: '96px',
      color: '#00d4ff',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add glow effect
    title.setShadow(0, 0, '#00d4ff', 15, true, true);
    titleBot.setShadow(0, 0, '#00d4ff', 25, true, true);

    titleContainer.add([title, titleBot]);

    // Animate title entrance
    titleContainer.setAlpha(0);
    titleContainer.setY(height * 0.32 - 30);
    
    this.tweens.add({
      targets: titleContainer,
      alpha: 1,
      y: height * 0.32,
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Tagline with typewriter effect
    const tagline = this.add.text(width / 2, height * 0.52, '', {
      fontSize: '16px',
      color: '#64748b',
      fontFamily: 'Arial',
      letterSpacing: 6
    }).setOrigin(0.5);

    const taglineText = 'REVERSE POLARITY. DEFY GRAVITY.';
    let charIndex = 0;
    
    this.time.addEvent({
      delay: 50,
      repeat: taglineText.length - 1,
      callback: () => {
        tagline.setText(taglineText.substring(0, ++charIndex));
      }
    });

    // Robot character showcase
    const robotContainer = this.add.container(width / 2, height * 0.65);
    
    // Platform for robot
    const platform = this.add.graphics();
    platform.fillStyle(0x1e293b, 1);
    platform.fillEllipse(0, 40, 120, 20);
    platform.fillStyle(0x00d4ff, 0.3);
    platform.fillEllipse(0, 40, 80, 12);
    robotContainer.add(platform);

    // Robot with glow
    const robotGlow = this.add.graphics();
    robotGlow.fillStyle(0x00d4ff, 0.2);
    robotGlow.fillCircle(0, 0, 45);
    robotContainer.add(robotGlow);

    const robot = this.add.image(0, 0, 'pip').setScale(3);
    robotContainer.add(robot);

    // Robot floating animation
    this.tweens.add({
      targets: [robot, robotGlow],
      y: -8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Entrance animation for robot
    robotContainer.setAlpha(0);
    robotContainer.setScale(0.5);
    
    this.tweens.add({
      targets: robotContainer,
      alpha: 1,
      scale: 1,
      duration: 800,
      delay: 500,
      ease: 'Back.easeOut'
    });

    // Modern CTA button
    this.createModernButton(width / 2, height * 0.85);

    // Footer info
    const _footer = this.add.text(width / 2, height - 25, 'GAMEDEV.JS JAM 2026', {
      fontSize: '11px',
      color: '#374151',
      fontFamily: 'Arial',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Version/controls hint
    this.add.text(width / 2, height * 0.92, 'SPACE • CLICK • TAP', {
      fontSize: '12px',
      color: '#475569',
      fontFamily: 'Arial',
      letterSpacing: 2
    }).setOrigin(0.5);
  }

  private createModernButton(x: number, y: number): void {
    const buttonWidth = 220;
    const buttonHeight = 56;

    // Button container
    const buttonContainer = this.add.container(x, y);
    buttonContainer.setAlpha(0);

    // Outer glow
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0x00d4ff, 0.15);
    outerGlow.fillRoundedRect(-buttonWidth/2 - 8, -buttonHeight/2 - 8, buttonWidth + 16, buttonHeight + 16, 36);
    buttonContainer.add(outerGlow);

    // Button background with gradient effect
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x0ea5e9, 1);
    buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 28);
    
    // Highlight on top
    buttonBg.fillStyle(0x38bdf8, 0.5);
    buttonBg.fillRoundedRect(-buttonWidth/2 + 4, -buttonHeight/2 + 4, buttonWidth - 8, buttonHeight/2 - 4, 24);
    
    buttonContainer.add(buttonBg);

    // Button text
    const buttonText = this.add.text(0, 0, 'PLAY NOW', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);
    buttonContainer.add(buttonText);

    // Arrow icon
    const arrow = this.add.text(70, 0, '→', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    buttonContainer.add(arrow);

    // Arrow animation
    this.tweens.add({
      targets: arrow,
      x: 78,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Interactive zone
    const zone = this.add.zone(x, y, buttonWidth + 20, buttonHeight + 20)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      });
      this.tweens.add({
        targets: outerGlow,
        alpha: 1,
        duration: 150
      });
    });

    zone.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1,
        duration: 150
      });
      this.tweens.add({
        targets: outerGlow,
        alpha: 0.5,
        duration: 150
      });
    });

    zone.on('pointerdown', () => this.startGame());

    // Entrance animation
    this.tweens.add({
      targets: buttonContainer,
      alpha: 1,
      y: y,
      duration: 600,
      delay: 800,
      ease: 'Back.easeOut'
    });

    // Subtle pulse animation
    this.tweens.add({
      targets: outerGlow,
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      delay: 1500
    });
  }

  private startGame(): void {
    // Play start sound
    soundManager.playStart();
    
    // Screen flash effect
    this.cameras.main.flash(200, 0, 212, 255, true);
    
    // Elegant fade out
    this.time.delayedCall(200, () => {
      this.cameras.main.fadeOut(600, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { level: 1 });
      });
    });
  }

  update(_time: number, delta: number): void {
    this.time_elapsed += delta;
  }
}
