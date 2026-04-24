import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { RunnerScene } from './scenes/RunnerScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PauseScene } from './scenes/PauseScene';

// ===========================================
// ARAN - Factory Escape Roguelike
// Gamedev.js Jam 2026 - Theme: MACHINES
// ===========================================

// Wavedash SDK integration
declare global {
  interface Window {
    Wavedash?: Promise<{
      init: (options?: { debug?: boolean }) => void;
      updateLoadProgressZeroToOne: (progress: number) => void;
      getUser: () => { id: string; name: string } | null;
      uploadLeaderboardScore: (leaderboardId: string, score: number, ascending?: boolean) => Promise<void>;
      setAchievement: (achievementId: string) => void;
      storeStats: () => Promise<void>;
    }>;
  }
}

async function initGame() {
  // Check if running on Wavedash
  const isWavedash = !!window.Wavedash;
  let wavedash: Awaited<typeof window.Wavedash> | null = null;
  
  if (isWavedash) {
    console.log('Running on Wavedash - initializing SDK...');
    wavedash = await window.Wavedash!;
    wavedash.updateLoadProgressZeroToOne(0.1);
  }

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
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%',
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
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
    ],
    callbacks: {
      postBoot: () => {
        if (wavedash) {
          wavedash.updateLoadProgressZeroToOne(1);
          wavedash.init({ debug: true });
          console.log('Wavedash SDK initialized!');
        }
      }
    }
  };

  // Create game instance
  const game = new Phaser.Game(config);
  
  // Store wavedash reference globally for leaderboard access
  (window as any).wavedashSDK = wavedash;
  
  return game;
}

// Initialize
initGame();

export {};
