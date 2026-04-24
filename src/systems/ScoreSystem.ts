import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

/**
 * Handles score tracking and UI updates
 */
export class ScoreSystem {
  private scene: Phaser.Scene;
  private _score: number = 0;
  private _coinsCollected: number = 0;
  
  // UI elements
  private scoreText?: Phaser.GameObjects.Text;
  private _levelText?: Phaser.GameObjects.Text;
  private flipIndicator?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get score(): number {
    return this._score;
  }

  get coinsCollected(): number {
    return this._coinsCollected;
  }

  /**
   * Create UI elements
   */
  createUI(currentLevel: number): void {
    const { width } = this.scene.cameras.main;

    // Score display
    this.scoreText = this.scene.add.text(20, 20, `Score: ${this._score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    // Level display
    this._levelText = this.scene.add.text(width - 20, 20, `Level ${currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Flip indicator
    this.flipIndicator = this.scene.add.text(width / 2, 50, '⬆ NORMAL ⬆', {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  /**
   * Add points for coin collection
   */
  addCoinScore(): void {
    this._score += GAME_CONFIG.COIN_SCORE;
    this._coinsCollected++;
    this.updateScoreDisplay();
  }

  /**
   * Add level completion bonus
   */
  addLevelBonus(): void {
    this._score += GAME_CONFIG.LEVEL_COMPLETE_BONUS;
    this.updateScoreDisplay();
  }

  /**
   * Update score text
   */
  private updateScoreDisplay(): void {
    this.scoreText?.setText(`Score: ${this._score}`);
  }

  /**
   * Update flip indicator
   */
  updateFlipIndicator(isFlipped: boolean): void {
    this.flipIndicator?.setText(isFlipped ? '⬇ FLIPPED ⬇' : '⬆ NORMAL ⬆');
  }

  /**
   * Show score popup at position
   */
  showScorePopup(x: number, y: number, points: number = GAME_CONFIG.COIN_SCORE): void {
    const popup = this.scene.add.text(x, y, `+${points}`, {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy()
    });
  }

  /**
   * Reset score state
   */
  reset(): void {
    this._score = 0;
    this._coinsCollected = 0;
  }
}
