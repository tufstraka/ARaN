import Phaser from 'phaser';
import { soundManager } from '../utils/SoundManager';

export class PauseScene extends Phaser.Scene {
  private resumeKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Animated blur/dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, width, height);
    
    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 300
    });

    // Modern glassmorphism panel
    const panelWidth = 380;
    const panelHeight = 420;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    // Panel with blur effect simulation
    const panel = this.add.graphics();
    panel.setAlpha(0);
    
    // Panel background
    panel.fillStyle(0x0d1b2a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 24);
    
    // Gradient border effect
    panel.lineStyle(1, 0x00d4ff, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 24);
    
    // Top accent line
    panel.fillStyle(0x00d4ff, 0.8);
    panel.fillRoundedRect(panelX + 40, panelY, panelWidth - 80, 3, 2);

    // Animate panel in
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Title with modern styling
    const title = this.add.text(width / 2, panelY + 50, 'PAUSED', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: panelY + 50,
      duration: 400,
      delay: 100
    });

    // Modern button styling
    const buttonConfigs = [
      { text: 'RESUME', y: panelY + 130, color: 0x00d4ff, action: () => this.resumeGame() },
      { text: 'RESTART', y: panelY + 195, color: 0xf39c12, action: () => this.restartLevel() },
      { text: 'MAIN MENU', y: panelY + 260, color: 0xe74c3c, action: () => this.goToMainMenu() }
    ];

    buttonConfigs.forEach((config, index) => {
      this.createModernButton(
        width / 2,
        config.y,
        config.text,
        config.color,
        config.action,
        index * 50
      );
    });

    // Controls section with elegant divider
    const dividerY = panelY + 310;
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x2d3748, 1);
    divider.lineBetween(panelX + 40, dividerY, panelX + panelWidth - 40, dividerY);
    divider.setAlpha(0);
    
    this.tweens.add({
      targets: divider,
      alpha: 1,
      duration: 300,
      delay: 300
    });

    // Controls title
    const controlsTitle = this.add.text(width / 2, dividerY + 25, 'CONTROLS', {
      fontSize: '12px',
      color: '#4a5568',
      fontFamily: 'Arial',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: controlsTitle,
      alpha: 1,
      duration: 300,
      delay: 350
    });

    // Control hints with icons
    const controls = [
      { key: 'SPACE / TAP', action: 'Flip Polarity' },
      { key: 'R', action: 'Restart' },
      { key: 'ESC', action: 'Pause' }
    ];

    controls.forEach((ctrl, i) => {
      const y = dividerY + 55 + i * 22;
      
      const keyText = this.add.text(width / 2 - 60, y, ctrl.key, {
        fontSize: '11px',
        color: '#00d4ff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5).setAlpha(0);

      const actionText = this.add.text(width / 2 - 40, y, ctrl.action, {
        fontSize: '11px',
        color: '#718096',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5).setAlpha(0);

      this.tweens.add({
        targets: [keyText, actionText],
        alpha: 1,
        duration: 300,
        delay: 400 + i * 50
      });
    });

    // Keyboard input
    this.resumeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private createModernButton(
    x: number,
    y: number,
    text: string,
    accentColor: number,
    action: () => void,
    delay: number
  ): void {
    const buttonWidth = 200;
    const buttonHeight = 48;

    // Button container
    const container = this.add.container(x, y);
    container.setAlpha(0);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a2332, 1);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
    
    // Button border
    bg.lineStyle(1, accentColor, 0.5);
    bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);

    // Left accent bar
    const accent = this.add.graphics();
    accent.fillStyle(accentColor, 1);
    accent.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 + 8, 3, buttonHeight - 16, 2);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    container.add([bg, accent, buttonText]);

    // Interactive zone
    const zone = this.add.zone(x, y, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150
      });
      buttonText.setColor(Phaser.Display.Color.IntegerToColor(accentColor).rgba);
    });

    zone.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
      buttonText.setColor('#ffffff');
    });

    zone.on('pointerdown', action);

    // Animate in
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      delay: 150 + delay,
      ease: 'Back.easeOut'
    });
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.resumeKey)) {
      this.resumeGame();
    }
  }

  private resumeGame(): void {
    // Play resume sound
    soundManager.playResume();
    
    // Elegant fade out
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }

  private restartLevel(): void {
    // Play click sound
    soundManager.playClick();
    
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene', { level: 1 });
      this.scene.stop();
    });
  }

  private goToMainMenu(): void {
    // Play click sound
    soundManager.playClick();
    
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
      this.scene.stop();
    });
  }
}
