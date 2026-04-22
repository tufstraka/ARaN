import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { VictoryScene } from './scenes/VictoryScene';
import { PauseScene } from './scenes/PauseScene';

// Game configuration - Higher resolution, fullscreen responsive
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // Dark industrial
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE, // Responsive - fills entire screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
    min: {
      width: 800,
      height: 600
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  pixelArt: true,
  scene: [BootScene, PreloadScene, MenuScene, GameScene, PauseScene, VictoryScene]
};

// Create the game instance
const game = new Phaser.Game(config);

// Handle window resize for responsive design
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Export for potential external access
export default game;
