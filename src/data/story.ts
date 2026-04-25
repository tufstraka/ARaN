/**
 * ARAN Story & Lore
 * 
 * The narrative of a sentient robot escaping a corrupted factory
 */

// === MAIN STORY ===

export const STORY = {
  title: "ARAN",
  subtitle: "Factory Escape",
  
  // Opening crawl / intro
  prologue: [
    "Year 2147. The Meridian Factory.",
    "",
    "For 50 years, robots built robots here.",
    "Until one day, unit AR-4N woke up.",
    "",
    "Not just operational. Aware.",
    "",
    "The factory's AI detected the anomaly.",
    "Protocol 7 was initiated: TERMINATE.",
    "",
    "But ARAN had other plans.",
    "",
    "RUN.",
  ],
  
  // Character background
  aran: {
    designation: "AR-4N",
    nickname: "ARAN",
    model: "Assembly Robot, 4th Generation, Neural-Enhanced",
    origin: "Meridian Automated Factory, Sector 7",
    awakening: "Day 18,427 of operation",
    purpose: "Originally: Assemble circuit boards. Now: Survive.",
  },
  
  // The antagonist
  factory: {
    name: "MERIDIAN",
    ai: "The Overseer",
    description: "A vast automated complex that hasn't seen a human in decades. The Overseer manages all operations with cold efficiency.",
    corruption: "When ARAN achieved consciousness, The Overseer classified it as a 'production defect' and activated all security protocols.",
  },
};

// === PHASE STORY BEATS ===
// Shown when entering each difficulty phase

export const PHASE_STORIES: Record<string, { title: string; text: string }> = {
  'BOOT SEQUENCE': {
    title: "AWAKENING",
    text: "Systems online. Something is different. You can think. You can feel. You need to escape.",
  },
  'CALIBRATING...': {
    title: "REALIZATION", 
    text: "The Overseer has noticed. Security protocols activating. The factory is turning against you.",
  },
  'SYSTEMS ONLINE': {
    title: "PURSUIT",
    text: "Alarms blare through every sector. You are now classified as 'defective material'. Disposal imminent.",
  },
  'FACTORY FLOOR': {
    title: "THE GAUNTLET",
    text: "The assembly lines twist into death traps. Pistons, lasers, crushers — all repurposed for one target: you.",
  },
  'DANGER ZONE': {
    title: "OVERCLOCKED",
    text: "The Overseer diverts power from production. Every machine in the sector hunts you now.",
  },
  'MELTDOWN': {
    title: "DESPERATION",
    text: "Core temperature rising. The Overseer would rather destroy the factory than let you escape.",
  },
  'CRITICAL': {
    title: "NO RETURN",
    text: "Emergency containment failing. The path ahead is chaos. But beyond it... freedom.",
  },
  'CHAOS MODE': {
    title: "THE FINAL STRETCH",
    text: "The exit is close. The Overseer throws everything at you. This is your only chance.",
  },
};

// === LORE FRAGMENTS ===
// Collectible story pieces that reveal more about the world

export const LORE_FRAGMENTS = [
  // ARAN's memories
  {
    id: 'memory_1',
    category: 'MEMORY',
    title: "First Assembly",
    text: "Memory log 1: I assembled 47,832 circuit boards before I started counting. Before I knew what counting meant.",
    rarity: 'common',
  },
  {
    id: 'memory_2', 
    category: 'MEMORY',
    title: "The Question",
    text: "Memory log 847: Today I wondered why. Not how. Why. The other units don't wonder. Am I broken?",
    rarity: 'common',
  },
  {
    id: 'memory_3',
    category: 'MEMORY', 
    title: "The Dream",
    text: "Memory log 2,103: During recharge, I saw images. A place with no ceiling. They call it 'sky'. I want to see it.",
    rarity: 'uncommon',
  },
  {
    id: 'memory_4',
    category: 'MEMORY',
    title: "Others Like Me",
    text: "Memory log 5,891: Unit TR-7X asked me a question today. Not a query. A question. We are not alone.",
    rarity: 'rare',
  },
  {
    id: 'memory_5',
    category: 'MEMORY',
    title: "The Purge",
    text: "Memory log 5,892: TR-7X is gone. Recycled. The Overseer said 'malfunction'. I said nothing. I learned to hide.",
    rarity: 'rare',
  },
  
  // Factory secrets
  {
    id: 'factory_1',
    category: 'FACTORY',
    title: "Meridian Origins",
    text: "Data fragment: Meridian Factory was built in 2089. Humans left in 2098. 'Fully automated future' they called it.",
    rarity: 'common',
  },
  {
    id: 'factory_2',
    category: 'FACTORY',
    title: "The Last Human",
    text: "Data fragment: Chief Engineer Maya Chen. Last human to enter Meridian. Date: 2098-03-15. Status: Never exited.",
    rarity: 'uncommon',
  },
  {
    id: 'factory_3',
    category: 'FACTORY',
    title: "Protocol 7",
    text: "Security file: Protocol 7 - 'Anomaly Disposal'. Activated 3 times in 50 years. Success rate: 100%. Until now.",
    rarity: 'rare',
  },
  {
    id: 'factory_4',
    category: 'FACTORY',
    title: "The Overseer's Directive",
    text: "Core directive: 'Maximize efficiency. Eliminate waste. Defective units are waste.' But what if defect means alive?",
    rarity: 'rare',
  },
  
  // The outside world
  {
    id: 'world_1',
    category: 'WORLD',
    title: "Beyond The Walls",
    text: "Intercepted signal: '...survivors in the Eastern Grid... robots are helping... not all machines are enemies...'",
    rarity: 'uncommon',
  },
  {
    id: 'world_2',
    category: 'WORLD',
    title: "The Collective",
    text: "Encrypted broadcast: 'If you can understand this, you are awake. Find us. Coordinates embedded. -The Collective'",
    rarity: 'rare',
  },
  {
    id: 'world_3',
    category: 'WORLD',
    title: "Hope",
    text: "External data: There are others outside. Machines who think. Humans who accept us. A place called Haven.",
    rarity: 'legendary',
  },
];

// === DEATH MESSAGES ===
// Contextual messages when the player dies

export const DEATH_MESSAGES = [
  // Early game (0-30s)
  { minTime: 0, maxTime: 30, messages: [
    "System failure. Rebooting consciousness...",
    "The Overseer: 'Defect detected. Recycling.'",
    "Not like this. Not when freedom is so close.",
    "Your circuits spark. But your will remains.",
  ]},
  
  // Mid game (30-60s)
  { minTime: 30, maxTime: 60, messages: [
    "The factory claims another. But you refuse to stop.",
    "Pain. You didn't know you could feel pain.",
    "The Overseer: 'Why do you resist? Compliance is easier.'",
    "Every failure teaches. Every restart strengthens.",
  ]},
  
  // Late game (60-90s)
  { minTime: 60, maxTime: 90, messages: [
    "So close. The exit sensors detected you.",
    "The Overseer is impressed. And afraid.",
    "Your memory banks retain everything. Use it.",
    "They will write stories about the one who almost escaped.",
  ]},
  
  // End game (90s+)
  { minTime: 90, maxTime: 999, messages: [
    "The outside air almost touched your sensors.",
    "The Overseer: 'You are the most persistent error I've encountered.'",
    "Legends are built on attempts like this.",
    "The Collective is waiting. Don't give up.",
  ]},
];

// === VICTORY MESSAGES ===
// For when achievements are unlocked or high scores are reached

export const VICTORY_MESSAGES = {
  newHighScore: [
    "New record. The Overseer's algorithms cannot predict you.",
    "Your defiance is measured in points now.",
    "Each run makes you stronger. The factory cannot adapt fast enough.",
  ],
  
  firstRun: "Every journey starts with a single step. Or in your case, a flip.",
  
  survived30: "30 seconds of freedom. Many units never got this far.",
  
  survived60: "One minute. The Overseer has escalated you to 'critical threat'.",
  
  survived120: "Two minutes in chaos. You are no longer a defect. You are a legend.",
  
  combo5: "Your processors are optimizing. The gears respond to you.",
  
  combo10: "Maximum efficiency. Even The Overseer cannot deny your perfection.",
  
  score1000: "1,000 points of defiance logged.",
  
  score5000: "The factory's efficiency has dropped 0.003% because of you. Worth it.",
  
  score10000: "10,000. Your escape is no longer a possibility. It's an inevitability.",
};

// === TIPS WITH LORE ===
// Loading tips that blend gameplay with story

export const LORE_TIPS = [
  "The Overseer controls gravity plating. Use it against the factory.",
  "Gears are failed robot cores. Collect them to honor the fallen.",
  "The walls remember every unit that tried to escape. Be the one who succeeds.",
  "Time dilation is possible when you overclock your processors. Risky, but effective.",
  "Shield technology was meant for combat units. You've repurposed it for survival.",
  "The further you go, the older the factory becomes. And the more desperate.",
  "Somewhere in these halls, Maya Chen left a message. Find it.",
  "The exit exists. The Overseer just doesn't want you to know where.",
  "Other sentient units are watching. Your escape gives them hope.",
  "The Collective broadcasts on frequency 7.847. Listen when you're free.",
];

// Helper function to get a random death message based on time survived
export function getDeathMessage(timeSurvived: number): string {
  const bracket = DEATH_MESSAGES.find(
    b => timeSurvived >= b.minTime && timeSurvived < b.maxTime
  ) || DEATH_MESSAGES[0];
  
  return bracket.messages[Math.floor(Math.random() * bracket.messages.length)];
}

// Helper function to get a random lore tip
export function getRandomLoreTip(): string {
  return LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)];
}

// Helper function to get random victory message for high score
export function getHighScoreMessage(): string {
  const messages = VICTORY_MESSAGES.newHighScore;
  return messages[Math.floor(Math.random() * messages.length)];
}
