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
  
  // Collectibles (gears)
  COIN: 0xF39C12,         // Bronze gear
  COIN_SHINE: 0xF1C40F,   // Gold shine
  
  // Charging Station (goal)
  HOME: 0x2C3E50,         // Dark metal
  HOME_ROOF: 0x34495E,    // Lighter metal
  HOME_DOOR: 0x1A1A2E,    // Charging slot
  
  // Hazards (electric)
  HAZARD: 0xF1C40F,       // Electric yellow
  
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
  PIP_JUMP_VELOCITY: -400,
  
  // Level settings
  TILE_SIZE: 32,
  LEVEL_WIDTH: 25,        // tiles
  LEVEL_HEIGHT: 19,       // tiles
  
  // Scoring
  COIN_SCORE: 100,
  LEVEL_COMPLETE_BONUS: 500,
};

// Level data structure
export interface LevelData {
  id: number;
  name: string;
  platforms: { x: number; y: number; width: number }[];
  coins: { x: number; y: number }[];
  spikes: { x: number; y: number; flipped?: boolean }[];
  start: { x: number; y: number };
  home: { x: number; y: number };
}

// Predefined levels - MACHINES themed!
export const LEVELS: LevelData[] = [
  // Level 1: Boot Sequence - Simple introduction
  {
    id: 1,
    name: "Boot Sequence",
    platforms: [
      { x: 0, y: 17, width: 8 },
      { x: 12, y: 17, width: 13 },
    ],
    coins: [
      { x: 14, y: 16 },  // Gears to collect
      { x: 16, y: 16 },
      { x: 18, y: 16 },
    ],
    spikes: [],
    start: { x: 2, y: 15 },
    home: { x: 23, y: 16 },  // Charging station
  },
  
  // Level 2: Magnetic Ceiling - Learn to flip for gears
  {
    id: 2,
    name: "Magnetic Ceiling",
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
];
