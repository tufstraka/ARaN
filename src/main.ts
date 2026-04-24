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
    // YouTube Playables SDK
    ytgame?: {
      IN_PLAYABLES_ENV: boolean;
      SDK_VERSION: string;
      game: {
        firstFrameReady: () => void;
        gameReady: () => void;
        loadData: () => Promise<string>;
        saveData: (data: string) => Promise<void>;
      };
      engagement: {
        sendScore: (score: { value: number }) => Promise<void>;
      };
      system: {
        getLanguage: () => Promise<string>;
        isAudioEnabled: () => boolean;
        onAudioEnabledChange: (callback: (enabled: boolean) => void) => () => void;
        onPause: (callback: () => void) => () => void;
        onResume: (callback: () => void) => () => void;
      };
      health: {
        logError: () => void;
        logWarning: () => void;
      };
    };
  }
}

// Platform detection
const isWavedash = !!window.Wavedash;
const isYouTubePlayables = typeof window.ytgame !== 'undefined' && window.ytgame?.IN_PLAYABLES_ENV;

let game: Phaser.Game;

async function initGame() {
  let wavedash: Awaited<typeof window.Wavedash> | null = null;
  
  // Initialize Wavedash if available
  if (isWavedash) {
    console.log('Running on Wavedash - initializing SDK...');
    wavedash = await window.Wavedash!;
    wavedash.updateLoadProgressZeroToOne(0.1);
  }
  
  // Initialize YouTube Playables if available
  if (isYouTubePlayables) {
    console.log('Running on YouTube Playables - initializing SDK...');
    
    // Set up audio toggle
    const ytgame = window.ytgame!;
    ytgame.system.onAudioEnabledChange((enabled) => {
      // Store globally for sound manager to use
      (window as any).ytAudioEnabled = enabled;
    });
    (window as any).ytAudioEnabled = ytgame.system.isAudioEnabled();
    
    // Set up pause/resume handlers
    ytgame.system.onPause(() => {
      if (game && game.scene) {
        game.scene.pause('RunnerScene');
        // Save data on pause
        const saveData = localStorage.getItem('aran_save');
        if (saveData) {
          ytgame.game.saveData(saveData).catch(() => {});
        }
      }
    });
    
    ytgame.system.onResume(() => {
      if (game && game.scene) {
        game.scene.resume('RunnerScene');
      }
    });
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
        // Wavedash ready
        if (wavedash) {
          wavedash.updateLoadProgressZeroToOne(1);
          wavedash.init({ debug: true });
          console.log('Wavedash SDK initialized!');
        }
        
        // YouTube Playables - first frame ready
        if (isYouTubePlayables) {
          window.ytgame!.game.firstFrameReady();
          console.log('YouTube Playables: firstFrameReady called');
        }
      }
    }
  };

  // Create game instance
  game = new Phaser.Game(config);
  
  // Store platform references globally
  (window as any).wavedashSDK = wavedash;
  (window as any).isYouTubePlayables = isYouTubePlayables;
  (window as any).gameInstance = game;
  
  return game;
}

// YouTube Playables helper functions (exported for use in scenes)
export function ytGameReady() {
  if (isYouTubePlayables && window.ytgame) {
    window.ytgame.game.gameReady();
    console.log('YouTube Playables: gameReady called');
  }
}

export async function ytSendScore(score: number) {
  if (isYouTubePlayables && window.ytgame) {
    try {
      await window.ytgame.engagement.sendScore({ value: Math.floor(score) });
      console.log('YouTube Playables: score sent', score);
    } catch (e) {
      console.error('Failed to send score to YouTube', e);
    }
  }
}

export async function ytSaveData(data: string) {
  if (isYouTubePlayables && window.ytgame) {
    try {
      await window.ytgame.game.saveData(data);
    } catch (e) {
      console.error('Failed to save data to YouTube', e);
    }
  }
}

export async function ytLoadData(): Promise<string | null> {
  if (isYouTubePlayables && window.ytgame) {
    try {
      return await window.ytgame.game.loadData();
    } catch (e) {
      console.error('Failed to load data from YouTube', e);
    }
  }
  return null;
}

// Initialize
initGame();

export {};
