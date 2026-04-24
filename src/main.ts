import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { RunnerScene } from './scenes/RunnerScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PauseScene } from './scenes/PauseScene';

// ===========================================
// FLIP BOT - Factory Escape Roguelike
// Gamedev.js Jam 2026 - Theme: MACHINES
// ===========================================
// 
// ONE BUTTON GAME - Tap/Space to flip gravity
// Survive the malfunctioning factory as long as you can!
// Collect gears, unlock upgrades, beat your high score!
//
// ===========================================

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#0D0D1A',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Managed per-object
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1600,
      height: 1200
    }
  },
  pixelArt: true,
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    RunnerScene,
    GameOverScene,
    UpgradeScene,
    PauseScene
  ]
};

// Create game instance
const game = new Phaser.Game(config);

// Responsive resize
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

export default game;
