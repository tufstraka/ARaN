// ============================================
// ARAN - Factory Roguelike
// Theme: MACHINES (Gamedev.js Jam 2026)
// ============================================
// 
// A robot escaping a malfunctioning factory.
// ONE BUTTON flips gravity. That's it.
// Survive as long as you can. Beat your high score.
//
// Inspired by: Vampire Survivors (upgrade loop), 
// Geometry Dash (rhythm/timing), Flappy Bird (one-button)
// ============================================

// === COLOR PALETTE (Cyberpunk Factory) ===
export const COLORS = {
  // Neon accents
  NEON_CYAN: 0x00FFFF,
  NEON_PINK: 0xFF0080,
  NEON_GREEN: 0x39FF14,
  NEON_ORANGE: 0xFF6600,
  NEON_PURPLE: 0xBF00FF,
  
  // Factory metals
  DARK_METAL: 0x2a2a4e,
  STEEL: 0x6a6a8e,
  RUST: 0x8B4513,
  CHROME: 0xD0D0D0,
  
  // Hazards
  DANGER_RED: 0xFF3333,
  WARNING_YELLOW: 0xFFDD00,
  ELECTRIC_BLUE: 0x00CFFF,
  
  // UI
  BG_DARK: 0x151525,
  BG_GRADIENT_TOP: 0x252545,
  BG_GRADIENT_BOTTOM: 0x151525,
  
  // Robot
  BOT_BODY: 0x5DADE2,
  BOT_EYES: 0x00FFFF,
  BOT_GLOW: 0x00FFFF,
};

// === GAME CONFIG ===
export const CONFIG = {
  // Core physics
  GRAVITY: 1200,                    // Snappy gravity
  FLIP_DURATION: 180,               // Fast flip (ms)
  
  // Factory scroll (the heartbeat of the game)
  BASE_SCROLL_SPEED: 200,           // Starting speed
  MAX_SCROLL_SPEED: 500,            // Cap
  SPEED_INCREASE_RATE: 0.5,         // Per second
  
  // Robot
  BOT_X_POSITION: 150,              // Fixed X (screen scrolls, not bot)
  BOT_TERMINAL_VELOCITY: 800,
  
  // Difficulty curve
  OBSTACLE_BASE_FREQUENCY: 1.5,     // Seconds between obstacles
  OBSTACLE_MIN_FREQUENCY: 0.4,      // Minimum gap
  DIFFICULTY_RAMP_TIME: 120,        // Seconds to max difficulty
  
  // Scoring
  POINTS_PER_SECOND: 10,
  POINTS_PER_GEAR: 100,
  COMBO_MULTIPLIER_MAX: 10,
  COMBO_DECAY_TIME: 2000,           // ms without gear = combo reset
  
  // Screen shake
  SHAKE_FLIP: { intensity: 0.005, duration: 80 },
  SHAKE_DEATH: { intensity: 0.02, duration: 300 },
  SHAKE_GEAR: { intensity: 0.003, duration: 50 },
  
  // Upgrades (meta progression)
  UPGRADE_COSTS: {
    shield: [100, 250, 500],        // 3 levels
    slowmo: [150, 400, 800],
    magnet: [200, 500, 1000],
    doublePoints: [300, 600, 1200],
  },
  
  // Visual
  PARALLAX_LAYERS: 3,
  PARTICLE_BUDGET: 100,
  
  // Audio
  BPM: 140,                         // For rhythm sync
};

// === OBSTACLE TYPES ===
export type ObstacleType = 
  | 'spike_floor'      // Spikes on bottom
  | 'spike_ceiling'    // Spikes on top
  | 'spike_both'       // Spikes both sides (must flip through gap)
  | 'crusher'          // Piston from top/bottom
  | 'laser_horizontal' // Horizontal laser beam
  | 'laser_sweep'      // Rotating laser
  | 'gap'              // Gap in floor (fall = death)
  | 'moving_wall'      // Wall that moves up/down
  | 'electric_field'   // Area that damages over time
  ;

export interface ObstaclePattern {
  type: ObstacleType;
  y?: number;          // Position (0-1 normalized)
  width?: number;      // Duration in pixels
  speed?: number;      // For moving obstacles
  delay?: number;      // Spawn delay offset
}

// === PREDEFINED PATTERNS (hand-crafted challenges) ===
export const PATTERNS: { [key: string]: ObstaclePattern[] } = {
  // === EASY (0-30s) ===
  easy_floor_spikes: [
    { type: 'spike_floor', width: 2 },
  ],
  easy_ceiling_spikes: [
    { type: 'spike_ceiling', width: 2 },
  ],
  easy_short_floor: [
    { type: 'spike_floor', width: 1 },
  ],
  easy_short_ceiling: [
    { type: 'spike_ceiling', width: 1 },
  ],
  easy_alternating: [
    { type: 'spike_floor', width: 2 },
    { type: 'spike_ceiling', width: 2, delay: 0.6 },
  ],
  easy_gap_small: [
    { type: 'gap', width: 2 },
  ],
  
  // === MEDIUM (30-60s) ===
  medium_long_floor: [
    { type: 'spike_floor', width: 4 },
  ],
  medium_long_ceiling: [
    { type: 'spike_ceiling', width: 4 },
  ],
  medium_crusher_floor: [
    { type: 'crusher', y: 0 },
  ],
  medium_crusher_ceiling: [
    { type: 'crusher', y: 1 },
  ],
  medium_gap: [
    { type: 'gap', width: 3 },
  ],
  medium_zigzag: [
    { type: 'spike_floor', width: 2 },
    { type: 'spike_ceiling', width: 2, delay: 0.4 },
    { type: 'spike_floor', width: 2, delay: 0.8 },
  ],
  medium_laser_mid: [
    { type: 'laser_horizontal', y: 0.5 },
  ],
  
  // === HARD (60-90s) ===
  hard_double_crusher: [
    { type: 'crusher', y: 0 },
    { type: 'crusher', y: 1, delay: 0.4 },
  ],
  hard_laser_low: [
    { type: 'laser_horizontal', y: 0.3 },
  ],
  hard_laser_high: [
    { type: 'laser_horizontal', y: 0.7 },
  ],
  hard_corridor_short: [
    { type: 'spike_both', width: 3 },
  ],
  hard_gap_spike: [
    { type: 'gap', width: 3 },
    { type: 'spike_ceiling', width: 2, delay: 0.2 },
  ],
  hard_crusher_spike: [
    { type: 'crusher', y: 0 },
    { type: 'spike_floor', width: 3, delay: 0.3 },
  ],
  
  // === NIGHTMARE (90s+) ===
  nightmare_corridor: [
    { type: 'spike_both', width: 5 },
  ],
  nightmare_double_laser: [
    { type: 'laser_horizontal', y: 0.3 },
    { type: 'laser_horizontal', y: 0.7, delay: 0.5 },
  ],
  nightmare_gauntlet: [
    { type: 'crusher', y: 0 },
    { type: 'spike_floor', width: 2, delay: 0.3 },
    { type: 'crusher', y: 1, delay: 0.6 },
  ],
  nightmare_chaos: [
    { type: 'spike_floor', width: 2 },
    { type: 'laser_horizontal', y: 0.5, delay: 0.2 },
    { type: 'spike_ceiling', width: 2, delay: 0.4 },
    { type: 'gap', width: 2, delay: 0.7 },
  ],
};

// === DIFFICULTY PHASES ===
export interface DifficultyPhase {
  name: string;
  startTime: number;       // Seconds into run
  scrollSpeedMult: number;
  obstacleFreqMult: number;
  availablePatterns: string[];
  bossPattern?: string;    // Special pattern at phase end
}

export const DIFFICULTY_PHASES: DifficultyPhase[] = [
  {
    name: 'BOOT SEQUENCE',
    startTime: 0,
    scrollSpeedMult: 0.8,
    obstacleFreqMult: 1.5,  // Slower obstacles, more time
    availablePatterns: ['easy_short_floor', 'easy_short_ceiling'],
  },
  {
    name: 'CALIBRATING...',
    startTime: 10,
    scrollSpeedMult: 0.9,
    obstacleFreqMult: 1.3,
    availablePatterns: ['easy_floor_spikes', 'easy_ceiling_spikes', 'easy_gap_small'],
  },
  {
    name: 'SYSTEMS ONLINE',
    startTime: 25,
    scrollSpeedMult: 1.0,
    obstacleFreqMult: 1.1,
    availablePatterns: ['easy_alternating', 'easy_gap_small', 'medium_gap'],
  },
  {
    name: 'FACTORY FLOOR',
    startTime: 40,
    scrollSpeedMult: 1.1,
    obstacleFreqMult: 1.0,
    availablePatterns: ['medium_long_floor', 'medium_long_ceiling', 'medium_zigzag', 'medium_crusher_floor'],
  },
  {
    name: 'DANGER ZONE',
    startTime: 60,
    scrollSpeedMult: 1.2,
    obstacleFreqMult: 0.9,
    availablePatterns: ['medium_crusher_ceiling', 'medium_laser_mid', 'hard_gap_spike', 'hard_crusher_spike'],
  },
  {
    name: 'MELTDOWN',
    startTime: 80,
    scrollSpeedMult: 1.35,
    obstacleFreqMult: 0.8,
    availablePatterns: ['hard_double_crusher', 'hard_laser_low', 'hard_laser_high', 'hard_corridor_short'],
  },
  {
    name: 'CRITICAL',
    startTime: 100,
    scrollSpeedMult: 1.5,
    obstacleFreqMult: 0.7,
    availablePatterns: ['nightmare_corridor', 'nightmare_double_laser', 'nightmare_gauntlet'],
  },
  {
    name: 'CHAOS MODE',
    startTime: 120,
    scrollSpeedMult: 1.7,
    obstacleFreqMult: 0.6,
    availablePatterns: ['nightmare_corridor', 'nightmare_double_laser', 'nightmare_gauntlet', 'nightmare_chaos'],
  },
];

// === UPGRADES (Meta Progression) ===
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  effect: (level: number) => number; // Returns effect value
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'shield',
    name: 'Emergency Shield',
    description: 'Start with {n} shield(s) that absorb one hit',
    icon: '🛡️',
    maxLevel: 3,
    effect: (level) => level,
  },
  {
    id: 'slowmo',
    name: 'Time Dilation',
    description: 'Slow time by {n}% when near obstacles',
    icon: '⏱️',
    maxLevel: 3,
    effect: (level) => level * 15, // 15%, 30%, 45%
  },
  {
    id: 'magnet',
    name: 'Gear Magnet',
    description: 'Attract gears from {n} tiles away',
    icon: '🧲',
    maxLevel: 3,
    effect: (level) => level * 50, // 50, 100, 150 pixels
  },
  {
    id: 'doublePoints',
    name: 'Overclocked CPU',
    description: '+{n}% score multiplier',
    icon: '⚡',
    maxLevel: 3,
    effect: (level) => level * 25, // 25%, 50%, 75%
  },
  {
    id: 'comboExtend',
    name: 'Combo Buffer',
    description: 'Combo lasts {n}% longer',
    icon: '🔥',
    maxLevel: 3,
    effect: (level) => level * 33, // 33%, 66%, 100%
  },
];

// === ACHIEVEMENTS ===
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  reward: number; // Bonus gears
}

export interface GameStats {
  totalRuns: number;
  totalScore: number;
  totalGears: number;
  totalFlips: number;
  bestScore: number;
  bestCombo: number;
  longestRun: number; // seconds
  totalDeaths: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_flip',
    name: 'First Steps',
    description: 'Perform your first gravity flip',
    icon: '🔄',
    condition: (stats) => stats.totalFlips >= 1,
    reward: 10,
  },
  {
    id: 'survivor_30',
    name: 'Survivor',
    description: 'Survive for 30 seconds',
    icon: '⏰',
    condition: (stats) => stats.longestRun >= 30,
    reward: 50,
  },
  {
    id: 'survivor_60',
    name: 'Factory Veteran',
    description: 'Survive for 60 seconds',
    icon: '🏭',
    condition: (stats) => stats.longestRun >= 60,
    reward: 100,
  },
  {
    id: 'survivor_120',
    name: 'Machine Master',
    description: 'Survive for 2 minutes',
    icon: '👑',
    condition: (stats) => stats.longestRun >= 120,
    reward: 250,
  },
  {
    id: 'combo_5',
    name: 'Combo Starter',
    description: 'Reach a 5x combo',
    icon: '🔥',
    condition: (stats) => stats.bestCombo >= 5,
    reward: 25,
  },
  {
    id: 'combo_10',
    name: 'Combo King',
    description: 'Reach a 10x combo',
    icon: '💥',
    condition: (stats) => stats.bestCombo >= 10,
    reward: 100,
  },
  {
    id: 'score_1000',
    name: 'Getting Good',
    description: 'Score 1,000 points in one run',
    icon: '📈',
    condition: (stats) => stats.bestScore >= 1000,
    reward: 50,
  },
  {
    id: 'score_10000',
    name: 'Pro Gamer',
    description: 'Score 10,000 points in one run',
    icon: '🎮',
    condition: (stats) => stats.bestScore >= 10000,
    reward: 200,
  },
  {
    id: 'deaths_100',
    name: 'Persistence',
    description: 'Die 100 times (and keep trying!)',
    icon: '💀',
    condition: (stats) => stats.totalDeaths >= 100,
    reward: 100,
  },
  {
    id: 'flips_1000',
    name: 'Flipper',
    description: 'Perform 1,000 total flips',
    icon: '🔁',
    condition: (stats) => stats.totalFlips >= 1000,
    reward: 150,
  },
];

// === SAVE DATA STRUCTURE ===
export interface SaveData {
  version: number;
  stats: GameStats;
  upgrades: { [id: string]: number }; // upgrade id -> level
  achievements: string[];             // unlocked achievement ids
  currency: number;                   // gears for upgrades
  settings: {
    musicVolume: number;
    sfxVolume: number;
    screenShake: boolean;
    particles: boolean;
  };
}

export const DEFAULT_SAVE: SaveData = {
  version: 1,
  stats: {
    totalRuns: 0,
    totalScore: 0,
    totalGears: 0,
    totalFlips: 0,
    bestScore: 0,
    bestCombo: 0,
    longestRun: 0,
    totalDeaths: 0,
  },
  upgrades: {},
  achievements: [],
  currency: 0,
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    screenShake: true,
    particles: true,
  },
};
