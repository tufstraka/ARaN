import Phaser from 'phaser';

export class VictoryScene extends Phaser.Scene {
  private finalScore: number = 0;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: { score?: number }): void {
    this.finalScore = data.score || 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Modern dark background
    this.createModernBackground(width, height);

    // Celebration particles
    this.createCelebrationParticles(width, height);

    // Glassmorphism panel
    const panelWidth = 450;
    const panelHeight = 400;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1b2a, 0.9);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 24);
    panel.lineStyle(1, 0x00ff88, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 24);
    
    // Top accent
    panel.fillStyle(0x00ff88, 0.8);
    panel.fillRoundedRect(panelX + 60, panelY, panelWidth - 120, 3, 2);

    // Success icon (checkmark circle)
    const iconY = panelY + 70;
    const iconCircle = this.add.graphics();
    iconCircle.lineStyle(3, 0x00ff88, 1);
    iconCircle.strokeCircle(width / 2, iconY, 35);
    
    // Animated checkmark
    const checkmark = this.add.text(width / 2, iconY, '✓', {
      fontSize: '40px',
      color: '#00ff88',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: checkmark,
      scale: 1,
      duration: 500,
      delay: 300,
      ease: 'Back.easeOut'
    });

    // Victory title
    const title = this.add.text(width / 2, panelY + 140, 'MISSION COMPLETE', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, panelY + 175, 'Robot successfully recharged!', {
      fontSize: '14px',
      color: '#718096',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Score display with modern styling
    const scoreContainer = this.add.graphics();
    scoreContainer.fillStyle(0x1a2332, 1);
    scoreContainer.fillRoundedRect(width / 2 - 100, panelY + 200, 200, 60, 12);
    scoreContainer.lineStyle(1, 0x00d4ff, 0.3);
    scoreContainer.strokeRoundedRect(width / 2 - 100, panelY + 200, 200, 60, 12);

    this.add.text(width / 2, panelY + 215, 'GEARS COLLECTED', {
      fontSize: '10px',
      color: '#4a5568',
      fontFamily: 'Arial',
      letterSpacing: 2
    }).setOrigin(0.5);

    const scoreText = this.add.text(width / 2, panelY + 242, '0', {
      fontSize: '28px',
      color: '#00d4ff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate score counting
    this.tweens.addCounter({
      from: 0,
      to: this.finalScore,
      duration: 1500,
      delay: 500,
      onUpdate: (tween) => {
        const value = tween.getValue();
        if (value !== null) {
          scoreText.setText(Math.floor(value).toString());
        }
      }
    });

    // Play again button
    const buttonY = panelY + 320;
    this.createModernButton(width / 2, buttonY, 'PLAY AGAIN', 0x00d4ff, () => this.playAgain());

    // Robot celebration
    const pip = this.add.image(width / 2, panelY + 70, 'pip').setScale(0);
    
    this.tweens.add({
      targets: pip,
      scale: 2.5,
      duration: 500,
      delay: 200,
      ease: 'Back.easeOut'
    });

    // Floating animation
    this.tweens.add({
      targets: pip,
      y: panelY + 60,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 700
    });

    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', this.playAgain, this);
  }

  private createModernBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e17, 1);
    bg.fillRect(0, 0, width, height);
    
    // Subtle radial gradient effect
    const gradient = this.add.graphics();
    gradient.fillStyle(0x00ff88, 0.05);
    gradient.fillCircle(width / 2, height / 2, 300);
  }

  private createCelebrationParticles(width: number, height: number): void {
    const colors = [0x00ff88, 0x00d4ff, 0xf39c12, 0xe74c3c];
    
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const startY = height + 50;
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];
      const size = Phaser.Math.Between(3, 6);
      
      const particle = this.add.graphics();
      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, startY);
      
      this.tweens.add({
        targets: particle,
        y: -50,
        x: x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(Phaser.Math.Between(0, width), height + 50);
          particle.setAlpha(0.8);
        }
      });
    }
  }

  private createModernButton(x: number, y: number, text: string, color: number, action: () => void): void {
    const buttonWidth = 180;
    const buttonHeight = 50;

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.2);
    bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 25);
    bg.lineStyle(2, color, 0.8);
    bg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 25);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      buttonText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
      this.tweens.add({
        targets: bg,
        alpha: 1.2,
        duration: 150
      });
    });

    zone.on('pointerout', () => {
      buttonText.setColor('#ffffff');
    });

    zone.on('pointerdown', action);

    // Pulsing animation
    this.tweens.add({
      targets: bg,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private playAgain(): void {
    this.cameras.main.fadeOut(500, 10, 14, 23);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}
