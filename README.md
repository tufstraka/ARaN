# FLIP BOT - Factory Escape 🤖

> **Gamedev.js Jam 2026** | Theme: **MACHINES**

A one-button endless runner where you play as a robot escaping a malfunctioning factory. **Tap or press SPACE to flip gravity** — that's it. Survive as long as you can!

## 🎮 Play Now

[Play on itch.io](https://tufstraka.itch.io/flip-bot) *(link coming soon)*

## ✨ Features

- **One-Button Gameplay** - Simple to learn, hard to master
- **Roguelike Progression** - Collect gears, unlock permanent upgrades
- **Dynamic Difficulty** - Factory goes from "Boot Sequence" to "Chaos Mode"
- **Combo System** - Chain gear pickups for massive score multipliers
- **5 Upgrades** - Shields, Speed Boost, Gear Magnet, Score Multiplier, Combo Extender
- **10+ Achievements** - Track your progress
- **Procedural Obstacles** - Spikes, crushers, lasers, and gaps

## 🕹️ Controls

| Input | Action |
|-------|--------|
| Space / Click / Tap | Flip gravity |
| ESC | Pause |

## 🏭 The Factory

The factory gets progressively more dangerous:

1. **Boot Sequence** (0-15s) - Learn the basics
2. **Warming Up** (15-30s) - Alternating obstacles
3. **Factory Floor** (30-60s) - Crushers and gaps appear
4. **Danger Zone** (60-90s) - Lasers online
5. **Meltdown** (90-120s) - Everything at once
6. **Chaos Mode** (120s+) - Good luck.

## ⚡ Upgrades

| Upgrade | Description |
|---------|-------------|
| 🛡️ Emergency Shield | Start with shields that absorb hits |
| ⏱️ Time Dilation | Slow time near obstacles |
| 🧲 Gear Magnet | Attract gears from distance |
| ⚡ Overclocked CPU | Bonus score multiplier |
| 🔥 Combo Buffer | Combos last longer |

## 🛠️ Tech Stack

- **Phaser 3** - Game framework
- **TypeScript** - Type safety
- **Vite** - Build tool

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 Game Design Philosophy

Inspired by:
- **Vampire Survivors** - Roguelike upgrade loop
- **Geometry Dash** - Rhythm and timing
- **Flappy Bird** - One-button simplicity
- **Getting Over It** - Mastery through failure

The goal was to create a game that's:
- Instantly understandable
- Hard to put down ("one more run")
- Rewarding both skill and persistence

## 📁 Project Structure

```
src/
├── config/
│   └── gameConfig.ts      # All game constants and data
├── scenes/
│   ├── BootScene.ts       # Asset loading
│   ├── PreloadScene.ts    # Texture generation
│   ├── MenuScene.ts       # Main menu + stats
│   ├── RunnerScene.ts     # Core gameplay
│   ├── GameOverScene.ts   # Results screen
│   ├── UpgradeScene.ts    # Upgrade shop
│   └── PauseScene.ts      # Pause menu
├── systems/
│   └── ObstacleGenerator.ts  # Procedural obstacles
├── managers/
│   └── ProgressionManager.ts # Save/load + achievements
└── utils/
    └── SoundManager.ts    # Audio
```

## 👤 Credits

Made by **tufstraka** (Keith Kadima)

- GitHub: [@tufstraka](https://github.com/tufstraka)
- Email: keithkadima@gmail.com

## 📜 License

MIT License - Feel free to use this code as reference for your own projects!

---

*Made for Gamedev.js Jam 2026 🎮*
