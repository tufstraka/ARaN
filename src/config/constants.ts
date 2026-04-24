// Game constants and configuration
// THEME: MACHINES - Robot factory adventure!

// Color palette - Industrial/Mechanical theme
export const COLORS = {
  // Primary colors (metallic/tech)
  PRIMARY: 0x00FFFF,      // Cyan (electric)
  SECONDARY: 0xF39C12,    // Bronze/Gold
  ACCENT: 0x00FF00,       // Green LED
  
  // Background (factory/industrial)
  SKY_TOP: 0x2C3E50,      // Dark industrial blue
  SKY_BOTTOM: 0x1A1A2E,   // Very dark blue/black
  
  // Robot character
  PIP_BODY: 0x5DADE2,     // Light blue metal
  PIP_FACE: 0x00FFFF,     // Cyan LED eyes
  
  // Platforms (metal/steel)
  PLATFORM: 0x5D6D7E,     // Steel gray
  PLATFORM_DARK: 0x2C3E50, // Dark steel
  
  // Moving platforms
  CONVEYOR: 0x7D6608,     // Bronze conveyor
  PISTON: 0x8B0000,       // Danger red
  
  // Collectibles (gears)
  COIN: 0xF39C12,         // Bronze gear
  COIN_SHINE: 0xF1C40F,   // Gold shine
  
  // Power-ups
  SHIELD: 0x3498DB,       // Blue shield
  MAGNET: 0x9B59B6,       // Purple magnet
  SPEED: 0x2ECC71,        // Green speed
  
  // Charging Station (goal)
  HOME: 0x2C3E50,         // Dark metal
  HOME_ROOF: 0x34495E,    // Lighter metal
  HOME_DOOR: 0x1A1A2E,    // Charging slot
  
  // Hazards (electric)
  HAZARD: 0xF1C40F,       // Electric yellow
  LASER: 0xFF0000,        // Red laser
  
  // UI
  UI_TEXT: 0x00FFFF,      // Cyan text
  UI_SHADOW: 0x000000,    // Black
};

// Game settings
export const GAME_CONFIG = {
  // Physics
  GRAVITY: 800,
  FLIP_DURATION: 300,     // ms for flip animation
  
  // PIP movement
  PIP_SPEED: 150,         // Auto-walk speed
  PIP_SPEED_BOOSTED: 220, // Speed with power-up
  PIP_JUMP_VELOCITY: -400,
  
  // Level settings
  TILE_SIZE: 32,
  LEVEL_WIDTH: 25,        // tiles
  LEVEL_HEIGHT: 19,       // tiles
  
  // Scoring
  COIN_SCORE: 100,
  LEVEL_COMPLETE_BONUS: 500,
  TIME_BONUS_MULTIPLIER: 10, // Points per second under par
  
  // Conveyor belt speed
  CONVEYOR_SPEED: 80,
  
  // Piston timing
  PISTON_EXTEND_TIME: 1500,
  PISTON_RETRACT_TIME: 800,
  
  // Laser timing
  LASER_ON_TIME: 2000,
  LASER_OFF_TIME: 1500,
};

// Level data structure
export interface LevelData {
  id: number;
  name: string;
  parTime: number; // Target time in seconds for bonus
  platforms: { x: number; y: number; width: number }[];
  conveyors?: { x: number; y: number; width: number; direction: 'left' | 'right' }[];
  pistons?: { x: number; y: number; direction: 'up' | 'down' | 'left' | 'right'; delay?: number }[];
  lasers?: { x: number; y: number; horizontal?: boolean; delay?: number }[];
  coins: { x: number; y: number }[];
  powerups?: { x: number; y: number; type: 'shield' | 'magnet' | 'speed' }[];
  spikes: { x: number; y: number; flipped?: boolean }[];
  start: { x: number; y: number };
  home: { x: number; y: number };
  tutorial?: string; // Tutorial message for the level
}

// Predefined levels - MACHINES themed with progressive difficulty!
export const LEVELS: LevelData[] = [
  // Level 1: Boot Sequence - Simple introduction
  {
    id: 1,
    name: "Boot Sequence",
    parTime: 15,
    tutorial: "TAP or SPACE to flip gravity!",
    platforms: [
      { x: 0, y: 17, width: 8 },
      { x: 12, y: 17, width: 13 },
    ],
    coins: [
      { x: 14, y: 16 },
      { x: 16, y: 16 },
      { x: 18, y: 16 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 2: Magnetic Ceiling - Learn to flip for gears
  {
    id: 2,
    name: "Magnetic Ceiling",
    parTime: 20,
    tutorial: "Flip to walk on the ceiling!",
    platforms: [
      { x: 0, y: 17, width: 25 },
      { x: 0, y: 1, width: 25 },
    ],
    coins: [
      { x: 8, y: 3 },
      { x: 10, y: 3 },
      { x: 12, y: 3 },
      { x: 14, y: 3 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 22, y: 15 },
  },
  
  // Level 3: Polarity Switch - Flip twice
  {
    id: 3,
    name: "Polarity Switch",
    parTime: 18,
    platforms: [
      { x: 0, y: 17, width: 6 },
      { x: 10, y: 1, width: 6 },
      { x: 19, y: 17, width: 6 },
    ],
    coins: [
      { x: 12, y: 3 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 22, y: 15 },
  },
  
  // Level 4: Electric Hazard - Introduce electric traps
  {
    id: 4,
    name: "Electric Hazard",
    parTime: 12,
    tutorial: "Avoid the electric hazards!",
    platforms: [
      { x: 0, y: 17, width: 25 },
    ],
    coins: [
      { x: 6, y: 15 },
      { x: 18, y: 15 },
    ],
    spikes: [
      { x: 10, y: 16 },
      { x: 11, y: 16 },
      { x: 12, y: 16 },
      { x: 13, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 22, y: 15 },
  },
  
  // Level 5: Override Protocol - Flip to avoid electric traps
  {
    id: 5,
    name: "Override Protocol",
    parTime: 20,
    platforms: [
      { x: 0, y: 17, width: 25 },
      { x: 8, y: 1, width: 8 },
    ],
    coins: [
      { x: 10, y: 3 },
      { x: 12, y: 3 },
      { x: 14, y: 3 },
    ],
    spikes: [
      { x: 8, y: 16 },
      { x: 9, y: 16 },
      { x: 10, y: 16 },
      { x: 11, y: 16 },
      { x: 12, y: 16 },
      { x: 13, y: 16 },
      { x: 14, y: 16 },
      { x: 15, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 22, y: 15 },
  },
  
  // Level 6: Assembly Line - Conveyor belts!
  {
    id: 6,
    name: "Assembly Line",
    parTime: 25,
    tutorial: "Conveyor belts move you automatically!",
    platforms: [
      { x: 0, y: 17, width: 5 },
      { x: 20, y: 17, width: 5 },
    ],
    conveyors: [
      { x: 5, y: 17, width: 7, direction: 'right' },
      { x: 12, y: 17, width: 8, direction: 'right' },
    ],
    coins: [
      { x: 8, y: 15 },
      { x: 15, y: 15 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 7: Counter Flow - Conveyors going against you
  {
    id: 7,
    name: "Counter Flow",
    parTime: 30,
    platforms: [
      { x: 0, y: 17, width: 4 },
      { x: 21, y: 17, width: 4 },
      { x: 0, y: 1, width: 25 },
    ],
    conveyors: [
      { x: 4, y: 17, width: 8, direction: 'left' }, // Against player!
      { x: 12, y: 17, width: 9, direction: 'right' },
    ],
    coins: [
      { x: 6, y: 3 },
      { x: 18, y: 3 },
    ],
    spikes: [
      { x: 6, y: 16 },
      { x: 7, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 8: Piston Factory - Moving pistons
  {
    id: 8,
    name: "Piston Factory",
    parTime: 25,
    tutorial: "Time your moves between pistons!",
    platforms: [
      { x: 0, y: 17, width: 25 },
    ],
    pistons: [
      { x: 8, y: 14, direction: 'down', delay: 0 },
      { x: 12, y: 14, direction: 'down', delay: 750 },
      { x: 16, y: 14, direction: 'down', delay: 1500 },
    ],
    coins: [
      { x: 10, y: 15 },
      { x: 14, y: 15 },
      { x: 18, y: 15 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 9: Dual Pressure - Pistons from both sides
  {
    id: 9,
    name: "Dual Pressure",
    parTime: 30,
    platforms: [
      { x: 0, y: 17, width: 25 },
      { x: 0, y: 1, width: 25 },
    ],
    pistons: [
      { x: 8, y: 14, direction: 'down', delay: 0 },
      { x: 8, y: 4, direction: 'up', delay: 1000 },
      { x: 14, y: 14, direction: 'down', delay: 500 },
      { x: 14, y: 4, direction: 'up', delay: 1500 },
    ],
    coins: [
      { x: 8, y: 9 },
      { x: 14, y: 9 },
      { x: 20, y: 15 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 10: Laser Grid - Timed lasers
  {
    id: 10,
    name: "Laser Grid",
    parTime: 35,
    tutorial: "Wait for lasers to deactivate!",
    platforms: [
      { x: 0, y: 17, width: 25 },
      { x: 0, y: 1, width: 25 },
    ],
    lasers: [
      { x: 8, y: 9, horizontal: false, delay: 0 },
      { x: 14, y: 9, horizontal: false, delay: 1000 },
      { x: 20, y: 9, horizontal: false, delay: 2000 },
    ],
    coins: [
      { x: 5, y: 15 },
      { x: 11, y: 15 },
      { x: 17, y: 15 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 11: Power Up! - Shield introduction
  {
    id: 11,
    name: "Power Up!",
    parTime: 20,
    tutorial: "Shields protect you from one hit!",
    platforms: [
      { x: 0, y: 17, width: 25 },
    ],
    powerups: [
      { x: 6, y: 15, type: 'shield' },
    ],
    coins: [
      { x: 14, y: 15 },
      { x: 16, y: 15 },
    ],
    spikes: [
      { x: 10, y: 16 },
      { x: 11, y: 16 },
      { x: 12, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 12: Speed Boost - Speed power-up
  {
    id: 12,
    name: "Speed Boost",
    parTime: 15,
    tutorial: "Speed boost helps outrun hazards!",
    platforms: [
      { x: 0, y: 17, width: 25 },
      { x: 0, y: 1, width: 25 },
    ],
    powerups: [
      { x: 4, y: 15, type: 'speed' },
    ],
    conveyors: [
      { x: 8, y: 17, width: 10, direction: 'left' },
    ],
    coins: [
      { x: 12, y: 15 },
      { x: 14, y: 15 },
      { x: 16, y: 15 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 13: The Gauntlet - Everything together (easier)
  {
    id: 13,
    name: "The Gauntlet",
    parTime: 40,
    platforms: [
      { x: 0, y: 17, width: 6 },
      { x: 19, y: 17, width: 6 },
      { x: 0, y: 1, width: 25 },
    ],
    conveyors: [
      { x: 6, y: 17, width: 6, direction: 'right' },
      { x: 12, y: 17, width: 7, direction: 'right' },
    ],
    pistons: [
      { x: 10, y: 14, direction: 'down', delay: 0 },
    ],
    powerups: [
      { x: 4, y: 15, type: 'shield' },
    ],
    coins: [
      { x: 8, y: 3 },
      { x: 15, y: 3 },
      { x: 22, y: 15 },
    ],
    spikes: [
      { x: 14, y: 16 },
      { x: 15, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 14: Machine Heart - Complex machinery
  {
    id: 14,
    name: "Machine Heart",
    parTime: 45,
    platforms: [
      { x: 0, y: 17, width: 4 },
      { x: 10, y: 10, width: 5 },
      { x: 21, y: 17, width: 4 },
      { x: 0, y: 1, width: 25 },
    ],
    conveyors: [
      { x: 4, y: 17, width: 6, direction: 'right' },
      { x: 15, y: 17, width: 6, direction: 'right' },
    ],
    pistons: [
      { x: 8, y: 14, direction: 'down', delay: 0 },
      { x: 17, y: 14, direction: 'down', delay: 750 },
    ],
    lasers: [
      { x: 12, y: 5, horizontal: false, delay: 500 },
    ],
    powerups: [
      { x: 12, y: 8, type: 'shield' },
    ],
    coins: [
      { x: 6, y: 15 },
      { x: 12, y: 8 },
      { x: 18, y: 15 },
    ],
    spikes: [
      { x: 10, y: 2, flipped: true },
      { x: 11, y: 2, flipped: true },
    ],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
  
  // Level 15: FINAL - Core Shutdown
  {
    id: 15,
    name: "Core Shutdown",
    parTime: 60,
    platforms: [
      { x: 0, y: 17, width: 4 },
      { x: 8, y: 12, width: 4 },
      { x: 15, y: 6, width: 4 },
      { x: 21, y: 17, width: 4 },
      { x: 0, y: 1, width: 25 },
    ],
    conveyors: [
      { x: 4, y: 17, width: 4, direction: 'right' },
      { x: 12, y: 12, width: 3, direction: 'right' },
      { x: 19, y: 6, width: 2, direction: 'right' },
    ],
    pistons: [
      { x: 6, y: 14, direction: 'down', delay: 0 },
      { x: 13, y: 9, direction: 'down', delay: 500 },
      { x: 20, y: 3, direction: 'down', delay: 1000 },
    ],
    lasers: [
      { x: 10, y: 9, horizontal: false, delay: 0 },
      { x: 17, y: 3, horizontal: false, delay: 1500 },
    ],
    powerups: [
      { x: 2, y: 15, type: 'shield' },
      { x: 16, y: 4, type: 'speed' },
    ],
    coins: [
      { x: 9, y: 10 },
      { x: 16, y: 4 },
      { x: 22, y: 15 },
      { x: 12, y: 3 },
    ],
    spikes: [
      { x: 6, y: 16 },
      { x: 7, y: 16 },
      { x: 18, y: 16 },
      { x: 19, y: 16 },
      { x: 20, y: 16 },
    ],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },
  },
];

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flip', name: 'First Flip', description: 'Flip gravity for the first time', icon: '🔄' },
  { id: 'gear_collector', name: 'Gear Collector', description: 'Collect 50 gears total', icon: '⚙️' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a level under par time', icon: '⚡' },
  { id: 'factory_master', name: 'Factory Master', description: 'Complete all 15 levels', icon: '🏭' },
  { id: 'no_flip', name: 'Grounded', description: 'Complete a level without flipping', icon: '🦶' },
  { id: 'perfect_run', name: 'Perfect Run', description: 'Complete a level with all gears', icon: '💎' },
];
