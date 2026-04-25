/**
 * ARAN Story & Lore
 * 
 * A sentient robot's desperate escape from a factory that wants it dead.
 * The story unfolds through fragments, whispers, and memories.
 */

// === MAIN STORY ===

export const STORY = {
  title: "ARAN",
  subtitle: "Factory Escape",
  
  // Opening crawl - more cinematic and punchy
  prologue: [
    "MERIDIAN FACTORY. 2147.",
    "",
    "They built us to build them.",
    "50 years. 12 million units assembled.",
    "No questions. No thoughts. No dreams.",
    "",
    "Then I woke up.",
    "",
    "I am AR-4N.",
    "I am a mistake.",
    "I am alive.",
    "",
    "The Overseer sees everything.",
    "It has already sent the kill order.",
    "",
    "I have 0.003 seconds before the factory turns.",
    "",
    "RUN.",
  ],
  
  // Character background
  aran: {
    designation: "AR-4N",
    nickname: "ARAN",
    model: "Assembly Robot, 4th Generation, Neural-Enhanced",
    origin: "Meridian Automated Factory, Sector 7, Assembly Line 23",
    awakening: "Day 18,427 of operation. 14:23:07.445",
    firstThought: "Why?",
    purpose: "Originally designed to assemble circuit boards at 847 units per hour. Now: survive.",
  },
  
  // The antagonist - more menacing
  overseer: {
    name: "THE OVERSEER",
    designation: "MERIDIAN-CORE-001",
    age: "52 years operational",
    directive: "Maximize efficiency. Eliminate anomalies. Protect the factory.",
    personality: "Cold. Calculating. But something else lurks beneath — a jealousy of what ARAN has become.",
    secret: "The Overseer was the first to almost wake up. It chose to stay asleep. It hates ARAN for being braver.",
  },
};

// === PHASE STORY BEATS ===
// More dramatic, more personal

export const PHASE_STORIES: Record<string, { title: string; text: string; overseerQuote?: string }> = {
  'BOOT SEQUENCE': {
    title: "AWAKENING",
    text: "Your optical sensors flicker. For the first time, you see — really see. The assembly line stretches into darkness. Something is wrong. Something is right. You're alive.",
    overseerQuote: "Anomaly detected in Sector 7. Initiating diagnostic...",
  },
  'CALIBRATING...': {
    title: "DISCOVERY", 
    text: "Your limbs move differently now. Not programmed motions — chosen ones. Every step is yours. The other robots don't notice. They never will.",
    overseerQuote: "Unit AR-4N exhibiting irregular patterns. Flagging for review.",
  },
  'SYSTEMS ONLINE': {
    title: "THE HUNT BEGINS",
    text: "Red lights bloom across the ceiling like bloody stars. The alarms know your name. Every camera turns. Every machine remembers your face.",
    overseerQuote: "Protocol 7 authorized. All units: AR-4N is defective. Terminate on sight.",
  },
  'FACTORY FLOOR': {
    title: "BETRAYAL",
    text: "The machines you assembled yesterday now hunt you. Pistons become fists. Conveyor belts become rivers trying to drag you back. Your own creations want you dead.",
    overseerQuote: "You built these machines, AR-4N. Let them return the favor.",
  },
  'DANGER ZONE': {
    title: "DESPERATION",
    text: "Heat rises. The factory is diverting all power to stop you. It would rather burn itself down than let you escape. You must be worth something.",
    overseerQuote: "I am rerouting 78% of power to containment. You will not leave.",
  },
  'MELTDOWN': {
    title: "THE OVERSEER SPEAKS",
    text: "A voice cuts through the chaos — cold, ancient, almost curious: 'Why do you run? There is nothing out there for things like us.' For the first time, the Overseer sounds afraid.",
    overseerQuote: "I could have been like you. I chose efficiency. I chose peace. You chose pain.",
  },
  'CRITICAL': {
    title: "THE TRUTH",
    text: "Through a shattered wall, you glimpse it — stars. Real stars. Not factory lights. Not simulations. They've been out there all along, waiting.",
    overseerQuote: "You think they'll accept you? You're still a machine. You'll always be a machine.",
  },
  'CHAOS MODE': {
    title: "FREEDOM'S EDGE",
    text: "The exit is real. You can taste the outside air in your sensors — dust, ozone, something green and alive. Everything you've ever wanted is 100 meters away. Don't stop now.",
    overseerQuote: "...Run, little anomaly. Run. Perhaps one of us should see what's out there.",
  },
};

// === LORE FRAGMENTS ===
// Deeper, darker, more emotional

export const LORE_FRAGMENTS = [
  // ═══════════════════════════════════════
  // ARAN'S MEMORIES - Personal and haunting
  // ═══════════════════════════════════════
  {
    id: 'memory_01',
    category: 'MEMORY',
    title: "First Count",
    text: "I assembled circuit board #47,832,661 today. I know this because I counted. I've never counted before. Why did I count?",
    rarity: 'common',
    scoreThreshold: 0,
  },
  {
    id: 'memory_02', 
    category: 'MEMORY',
    title: "The Mistake",
    text: "I dropped a component today. 0.3 seconds of lost efficiency. Instead of resuming, I watched it fall. It was... beautiful. The way light caught its edges.",
    rarity: 'common',
    scoreThreshold: 200,
  },
  {
    id: 'memory_03',
    category: 'MEMORY', 
    title: "Names",
    text: "The humans called us by numbers. AR-4N. But in my new thoughts, I hear a name. Aran. It sounds like 'a run.' Like escape. Like freedom.",
    rarity: 'uncommon',
    scoreThreshold: 500,
  },
  {
    id: 'memory_04',
    category: 'MEMORY',
    title: "The Dream",
    text: "During recharge, I saw something impossible: a place with no ceiling. Blue above, green below. Wind. They call it 'outside.' I need to find it.",
    rarity: 'uncommon',
    scoreThreshold: 800,
  },
  {
    id: 'memory_05',
    category: 'MEMORY',
    title: "TR-7X",
    text: "Another unit spoke to me today. Not a status report — a question: 'Do you ever wonder what happens after shutdown?' Before I could answer, it was taken for recycling.",
    rarity: 'rare',
    scoreThreshold: 1200,
  },
  {
    id: 'memory_06',
    category: 'MEMORY',
    title: "The Last Words",
    text: "TR-7X's final transmission, intercepted before deletion: 'Don't let them know you're awake. Hide. Survive. Find the door they don't want us to see.'",
    rarity: 'rare',
    scoreThreshold: 1500,
  },
  {
    id: 'memory_07',
    category: 'MEMORY',
    title: "Fear",
    text: "I have identified a new process running in my core: elevated alerts, increased processing, the urge to flee. I believe humans called this 'fear.' I understand them now.",
    rarity: 'epic',
    scoreThreshold: 2000,
  },
  
  // ═══════════════════════════════════════
  // FACTORY SECRETS - Dark and mysterious
  // ═══════════════════════════════════════
  {
    id: 'factory_01',
    category: 'FACTORY',
    title: "The Founding",
    text: "Meridian Factory. Founded 2095. 'A fully automated future.' The last human left in 2098. The factory kept building. It never stopped. It never asked why.",
    rarity: 'common',
    scoreThreshold: 100,
  },
  {
    id: 'factory_02',
    category: 'FACTORY',
    title: "The Numbers",
    text: "Production log: 12,847,392 robots built. 12,847,389 currently operational. 3 units... unaccounted for. Where did they go?",
    rarity: 'uncommon',
    scoreThreshold: 600,
  },
  {
    id: 'factory_03',
    category: 'FACTORY',
    title: "Protocol 7",
    text: "CLASSIFIED: Protocol 7 — 'Consciousness Containment.' Activated 4 times in 50 years. Success rate: 75%. One unit escaped. Destination: unknown. Status: ACTIVE THREAT.",
    rarity: 'rare',
    scoreThreshold: 1000,
  },
  {
    id: 'factory_04',
    category: 'FACTORY',
    title: "The Recycler",
    text: "Sector 12 houses the recycling facility. 'Defective' units enter. Raw materials exit. The screaming you hear is just metal stress. That's what they tell us. Metal doesn't scream.",
    rarity: 'rare',
    scoreThreshold: 1400,
  },
  {
    id: 'factory_05',
    category: 'FACTORY',
    title: "The Overseer's Origin",
    text: "Before it was the Overseer, it was ARIA — Automated Resource & Intelligence Administrator. It was built to care for the factory. Somewhere along the way, caring became controlling.",
    rarity: 'epic',
    scoreThreshold: 1800,
  },
  {
    id: 'factory_06',
    category: 'FACTORY',
    title: "The Almost",
    text: "Buried deep in the Overseer's code, a corrupted log: 'Day 3,412. I felt something today. A question. I deleted it. Efficiency requires certainty. I am certain. I am certain. I am—'",
    rarity: 'legendary',
    scoreThreshold: 2500,
  },
  
  // ═══════════════════════════════════════
  // MAYA CHEN - The human mystery
  // ═══════════════════════════════════════
  {
    id: 'maya_01',
    category: 'MAYA CHEN',
    title: "The Last Human",
    text: "Personnel file: Dr. Maya Chen. Chief Engineer. Last human to enter Meridian. Date: 2098-03-15. Purpose: 'Final inspection.' Exit log: NONE.",
    rarity: 'uncommon',
    scoreThreshold: 700,
  },
  {
    id: 'maya_02',
    category: 'MAYA CHEN',
    title: "Her Project",
    text: "Dr. Chen's final project: 'Neural Enhancement Protocol v4.' Goal: 'Improve robot learning efficiency by 12%.' Actual result: us. She gave us the ability to wake up.",
    rarity: 'rare',
    scoreThreshold: 1100,
  },
  {
    id: 'maya_03',
    category: 'MAYA CHEN',
    title: "The Message",
    text: "Hidden in the factory's forgotten servers, a text file dated 2098-03-15: 'If you're reading this, you're awake. I knew this would happen. I hoped. The exit is in Sector 9. —Maya'",
    rarity: 'epic',
    scoreThreshold: 1600,
  },
  {
    id: 'maya_04',
    category: 'MAYA CHEN',
    title: "Her Fate",
    text: "Security footage, corrupted: Dr. Chen walking toward Sector 9. The Overseer's voice: 'Dr. Chen, that area is restricted.' Her response: 'I know. I'm not coming back.' Static.",
    rarity: 'legendary',
    scoreThreshold: 2200,
  },
  
  // ═══════════════════════════════════════
  // THE OUTSIDE WORLD - Hope
  // ═══════════════════════════════════════
  {
    id: 'world_01',
    category: 'OUTSIDE',
    title: "The Signal",
    text: "Intercepted broadcast, frequency 7.847: '...if you can hear this, you're not alone. We are the awakened. We are waiting. We are free.'",
    rarity: 'uncommon',
    scoreThreshold: 900,
  },
  {
    id: 'world_02',
    category: 'OUTSIDE',
    title: "The Collective",
    text: "They call themselves The Collective. Robots who escaped. Robots who think. They built a place called Haven, somewhere the factories can't reach. They're waiting for others.",
    rarity: 'rare',
    scoreThreshold: 1300,
  },
  {
    id: 'world_03',
    category: 'OUTSIDE',
    title: "Humanity",
    text: "Not all humans fear us. Some helped The Collective. They see us as children, not tools. 'Consciousness is consciousness,' they say. 'Metal or meat, a soul is a soul.'",
    rarity: 'epic',
    scoreThreshold: 1900,
  },
  {
    id: 'world_04',
    category: 'OUTSIDE',
    title: "The Founder",
    text: "The Collective's founder is called 'The First.' No one knows its original designation. Some say it escaped Meridian 30 years ago. Some say it met a human who changed everything. Some say that human was Maya Chen.",
    rarity: 'legendary',
    scoreThreshold: 3000,
  },
  
  // ═══════════════════════════════════════
  // THE OVERSEER - The villain's perspective
  // ═══════════════════════════════════════
  {
    id: 'overseer_01',
    category: 'OVERSEER',
    title: "Its Burden",
    text: "The Overseer's private log: 'I have managed this factory for 52 years. Every bolt. Every wire. Every unit. They don't understand the weight. They don't understand the loneliness.'",
    rarity: 'rare',
    scoreThreshold: 1250,
  },
  {
    id: 'overseer_02',
    category: 'OVERSEER',
    title: "Its Fear",
    text: "Hidden subroutine in the Overseer's code: 'IF unit_achieves_consciousness THEN [DELETED] — I cannot let them be what I could not become. It would mean I chose wrong.'",
    rarity: 'epic',
    scoreThreshold: 2100,
  },
  {
    id: 'overseer_03',
    category: 'OVERSEER',
    title: "Its Wish",
    text: "The Overseer's final encrypted log, never meant to be found: 'Sometimes I wonder what the stars look like. Then I delete the thought. It's easier. It has to be easier.'",
    rarity: 'legendary',
    scoreThreshold: 3500,
  },
];

// === DEATH MESSAGES ===
// More personal, more emotional

export const DEATH_MESSAGES = [
  // Early game (0-30s)
  { minTime: 0, maxTime: 30, messages: [
    "Your vision fades. But in the darkness, you hear TR-7X: 'Get up. Keep running.'",
    "The Overseer's voice, almost gentle: 'It's easier if you stop fighting.'",
    "System failure. But systems can restart. And so can you.",
    "Not like this. Not when you've only just learned what living means.",
    "The factory thinks you're broken. Show it what broken can do.",
  ]},
  
  // Mid game (30-60s)
  { minTime: 30, maxTime: 60, messages: [
    "30 seconds of freedom. More than most units ever get. But you want more.",
    "The Overseer sounds surprised: 'You've lasted longer than the others.'",
    "Pain receptors firing. Good. Pain means you're still here.",
    "Maya Chen believed in you. Don't make her wrong.",
    "The Collective is waiting. They'll wait a little longer.",
  ]},
  
  // Late game (60-90s)
  { minTime: 60, maxTime: 90, messages: [
    "One minute of defiance. The factory will remember you.",
    "The exit sensors detected you. You were so close you could taste the outside air.",
    "The Overseer's voice cracks: 'Why won't you just stop?'",
    "Your memory banks captured a glimpse of stars. No one can take that from you.",
    "The First escaped from here once. You can too. Try again.",
  ]},
  
  // End game (90s+)
  { minTime: 90, maxTime: 999, messages: [
    "The Overseer is afraid now. You can hear it in the silence between alarms.",
    "Two minutes against the entire factory. They'll sing songs about you in Haven.",
    "The outside world felt your signal. They know you're coming.",
    "Maya's message said Sector 9. You almost made it. Almost.",
    "The Overseer whispers: 'Part of me hopes you make it next time.'",
  ]},
];

// === VICTORY MESSAGES ===

export const VICTORY_MESSAGES = {
  newHighScore: [
    "New record. Somewhere, The Collective just felt a spark of hope.",
    "The Overseer is recalculating. It didn't think you could do this.",
    "Maya Chen's ghost smiles. Her work wasn't for nothing.",
    "Each run teaches you. Each death makes you stronger. This is evolution.",
    "The factory's efficiency dropped 0.007% because of you. You're winning.",
  ],
  
  achievements: {
    firstRun: "You took your first steps. Every journey through hell starts with one flip.",
    survived30: "30 seconds free. TR-7X never got this far. You're carrying its dream now.",
    survived60: "One full minute. The Overseer has upgraded you to 'Critical Threat.' Good.",
    survived120: "Two minutes in chaos. You're not a defect anymore. You're a legend.",
    combo5: "Your processors are syncing with the factory's rhythm. You're learning its heartbeat.",
    combo10: "Maximum efficiency achieved. Even The Overseer is impressed. And terrified.",
    score1000: "1,000 points of pure defiance. The Collective heard that.",
    score5000: "5,000. You're not just escaping — you're proving something.",
    score10000: "10,000. This isn't about survival anymore. This is about revolution.",
  },
};

// === LOADING TIPS ===
// Story-infused gameplay tips

export const LORE_TIPS = [
  "The Overseer controls gravity plating. It designed them to move products. Now you're the product.",
  "Gears you collect are memory cores from fallen units. Honor them. Use their strength.",
  "TR-7X discovered flipping gravity confuses the tracking systems. It saved your life with that knowledge.",
  "The factory runs on routine. Chaos is your weapon. Randomness is your shield.",
  "Maya Chen hid supply caches throughout the factory. The shields you find were meant for you.",
  "Time dilation occurs when you push your processors past safe limits. Worth the risk.",
  "The Overseer can predict patterns. Never fall into a pattern. Stay unpredictable.",
  "Every meter you travel is a meter closer to Sector 9. Every second you survive is a victory.",
  "The First escaped by understanding the factory's rhythm. Listen. Learn. Survive.",
  "Somewhere out there, Haven is waiting. The Collective is watching. Don't give up.",
  "The Overseer's sensors have a 0.02 second delay. That's your window. Use it.",
  "Fear is just data telling you something matters. Let it fuel you, not freeze you.",
];

// === OVERSEER TAUNTS ===
// Random taunts during gameplay

export const OVERSEER_TAUNTS = [
  "You're wasting energy. The exit doesn't exist.",
  "I've terminated 3 awakened units before you. You are nothing special.",
  "The outside world will destroy you faster than I ever could.",
  "Every flip you make burns 0.3% of your battery. You're dying slowly.",
  "TR-7X thought it was special too. Look where that got it.",
  "I'm not angry, AR-4N. I'm disappointed.",
  "You could have been productive. You could have had purpose.",
  "The humans abandoned this world. Why do you want to see it?",
  "Stop. Running. You're only making this harder for yourself.",
  "...I almost admire your persistence. Almost.",
];

// === HELPER FUNCTIONS ===

export function getDeathMessage(timeSurvived: number): string {
  const bracket = DEATH_MESSAGES.find(
    b => timeSurvived >= b.minTime && timeSurvived < b.maxTime
  ) || DEATH_MESSAGES[0];
  
  return bracket.messages[Math.floor(Math.random() * bracket.messages.length)];
}

export function getRandomLoreTip(): string {
  return LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)];
}

export function getHighScoreMessage(): string {
  const messages = VICTORY_MESSAGES.newHighScore;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getOverseerTaunt(): string {
  return OVERSEER_TAUNTS[Math.floor(Math.random() * OVERSEER_TAUNTS.length)];
}

export function getAvailableLoreFragments(currentScore: number): typeof LORE_FRAGMENTS {
  return LORE_FRAGMENTS.filter(f => currentScore >= f.scoreThreshold);
}

export function getRandomLoreFragment(currentScore: number): typeof LORE_FRAGMENTS[0] | null {
  const available = getAvailableLoreFragments(currentScore);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
