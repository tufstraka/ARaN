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

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0D0D1A',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,  // Full responsive
    width: '100%',
    height: '100%',
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,           // Smooth rendering for polish
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
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

export default game;
