import Phaser from 'phaser';

export interface InputState {
  flip: boolean;
  restart: boolean;
  pause: boolean;
}

/**
 * Handles all input (keyboard, touch, gamepad)
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private keys: {
    space?: Phaser.Input.Keyboard.Key;
    r?: Phaser.Input.Keyboard.Key;
    esc?: Phaser.Input.Keyboard.Key;
  } = {};
  
  private callbacks: {
    onFlip?: () => void;
    onRestart?: () => void;
    onPause?: () => void;
  } = {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set up all input listeners
   */
  setup(callbacks: {
    onFlip?: () => void;
    onRestart?: () => void;
    onPause?: () => void;
  }): void {
    this.callbacks = callbacks;

    // Keyboard
    if (this.scene.input.keyboard) {
      this.keys.space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keys.r = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.keys.esc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.keys.space.on('down', () => this.callbacks.onFlip?.());
      this.keys.r.on('down', () => this.callbacks.onRestart?.());
      this.keys.esc.on('down', () => this.callbacks.onPause?.());
    }

    // Touch/mouse - flip on tap
    this.scene.input.on('pointerdown', () => this.callbacks.onFlip?.());
  }

  /**
   * Clean up listeners
   */
  destroy(): void {
    this.scene.input.off('pointerdown');
    Object.values(this.keys).forEach(key => key?.destroy());
  }
}
