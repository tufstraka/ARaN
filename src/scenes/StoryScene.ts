import Phaser from 'phaser';
import { STORY } from '../data/story';

const TITLE_FONT = '"Space Grotesk", "Segoe UI", sans-serif';
const BODY_FONT = '"JetBrains Mono", "Consolas", monospace';

/**
 * Story Intro Scene - Sets up the narrative before gameplay
 */
export class StoryScene extends Phaser.Scene {
  private currentLine: number = 0;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private canSkip: boolean = false;
  private isComplete: boolean = false;
  
  constructor() {
    super({ key: 'StoryScene' });
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    
    // Dark background
    this.add.rectangle(0, 0, width, height, 0x0a0a0f).setOrigin(0);
    
    // Scanline effect
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.1);
    for (let y = 0; y < height; y += 4) {
      scanlines.fillRect(0, y, width, 2);
    }
    
    // Year/location header
    this.add.text(width / 2, 50, 'MERIDIAN FACTORY // YEAR 2147', {
      fontSize: '12px',
      color: '#00FFFF',
      fontFamily: BODY_FONT,
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.6);
    
    // Start the story
    this.time.delayedCall(500, () => {
      this.showNextLine();
    });
    
    // Skip prompt
    const skipText = this.add.text(width - 20, height - 30, 'TAP to skip', {
      fontSize: '12px',
      color: '#444',
      fontFamily: BODY_FONT,
    }).setOrigin(1, 0.5);
    
    // Blink the skip text
    this.tweens.add({
      targets: skipText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
    
    // Input handling
    this.time.delayedCall(1000, () => {
      this.canSkip = true;
    });
    
    this.input.on('pointerdown', () => this.handleInput());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInput());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleInput());
  }
  
  private handleInput(): void {
    if (!this.canSkip) return;
    
    if (this.isComplete) {
      this.goToMenu();
    } else {
      // Skip to end
      this.skipToEnd();
    }
  }
  
  private showNextLine(): void {
    if (this.currentLine >= STORY.prologue.length) {
      this.showComplete();
      return;
    }
    
    const { width, height } = this.cameras.main;
    const line = STORY.prologue[this.currentLine];
    
    // Calculate Y position - scrolling style
    const startY = height * 0.2;
    const lineHeight = 28;
    const y = startY + this.currentLine * lineHeight;
    
    // Empty lines (for spacing)
    if (line === '') {
      this.currentLine++;
      this.time.delayedCall(300, () => this.showNextLine());
      return;
    }
    
    // Determine styling based on content
    let fontSize = '16px';
    let color = '#ffffff';
    let alpha = 0.9;
    
    if (line === 'RUN.') {
      fontSize = '42px';
      color = '#FF0080';
      alpha = 1;
    } else if (line.includes('MERIDIAN') || line.includes('2147')) {
      fontSize = '14px';
      color: '#00FFFF';
      alpha = 0.7;
    } else if (line.includes('I am AR-4N') || line.includes('I am alive')) {
      color = '#00FFFF';
      fontSize = '18px';
    } else if (line.includes('I am a mistake')) {
      color = '#FF6666';
    } else if (line.includes('kill order') || line.includes('Overseer')) {
      color = '#FF4444';
    } else if (line.includes('woke up') || line.includes('alive')) {
      color = '#44FF44';
    }
    
    const text = this.add.text(width / 2, y, line, {
      fontSize,
      color,
      fontFamily: BODY_FONT,
    }).setOrigin(0.5).setAlpha(0);
    
    this.textObjects.push(text);
    
    // Fade in
    this.tweens.add({
      targets: text,
      alpha: alpha,
      duration: 500,
      ease: 'Power2',
    });
    
    // Special effect for "RUN."
    if (line === 'RUN.') {
      this.cameras.main.flash(200, 255, 0, 128);
      this.time.delayedCall(1500, () => this.showComplete());
    } else {
      this.currentLine++;
      const delay = line.length * 40 + 400; // Longer lines = more time
      this.time.delayedCall(delay, () => this.showNextLine());
    }
  }
  
  private skipToEnd(): void {
    // Stop any pending timers
    this.time.removeAllEvents();
    
    // Clear existing text
    this.textObjects.forEach(t => t.destroy());
    this.textObjects = [];
    
    // Show final message immediately
    const { width, height } = this.cameras.main;
    
    const runText = this.add.text(width / 2, height / 2, 'RUN.', {
      fontSize: '48px',
      color: '#FF0080',
      fontFamily: TITLE_FONT,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    runText.setShadow(0, 0, '#FF0080', 20, false, true);
    
    this.cameras.main.flash(200, 255, 0, 128);
    this.time.delayedCall(800, () => this.showComplete());
  }
  
  private showComplete(): void {
    this.isComplete = true;
    
    const { width, height } = this.cameras.main;
    
    // "Press to continue" prompt
    const continueText = this.add.text(width / 2, height - 80, '[ PRESS TO BEGIN ]', {
      fontSize: '14px',
      color: '#00FFFF',
      fontFamily: BODY_FONT,
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: continueText,
      alpha: 1,
      duration: 500,
    });
    
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
      delay: 500,
    });
  }
  
  private goToMenu(): void {
    // Mark story as seen
    localStorage.setItem('aran_story_seen', 'true');
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
