# ARAN - Factory Escape

> **One-button endless runner for Gamedev.js Jam 2026 (Theme: MACHINES)**

You are **ARAN**, a sentient robot escaping a malfunctioning factory. TAP or SPACE to flip gravity. Survive chaos. Beat your high score!

## 🎮 Play

```bash
npm install
npm run dev
```

Open http://localhost:3000

## ✨ Features

- 🎮 **One-button gameplay** - TAP/SPACE to flip gravity
- 🔄 **Gravity-flipping mechanic** - Walk on floors AND ceilings
- ⚙️ **Gear collection** - Build combos up to 10x multiplier
- ⬆️ **5 Upgrades** - Shields, time dilation, magnet, score boost, combo buffer
- 🏆 **8 Difficulty phases** - Boot Sequence → Chaos Mode
- 💾 **Auto-save** - Progress saved locally
- 🎵 **Procedural audio** - All sounds generated with Web Audio API

## 🏭 Difficulty Phases

| Time | Phase |
|------|-------|
| 0s | BOOT SEQUENCE |
| 10s | CALIBRATING... |
| 25s | SYSTEMS ONLINE |
| 40s | FACTORY FLOOR |
| 60s | DANGER ZONE |
| 80s | MELTDOWN |
| 100s | CRITICAL |
| 120s+ | CHAOS MODE |

## 🛠️ Tech Stack

- Phaser 3
- TypeScript
- Vite
- Web Audio API

## 📁 Project Structure

```
src/
├── config/         # Game configuration, colors, patterns
├── managers/       # Effects, progression systems
├── scenes/         # Menu, Runner, GameOver, Upgrades, Pause
├── systems/        # Obstacle generation
├── utils/          # Sound manager
└── main.ts         # Entry point
```

## 🎯 Game Loop

1. **Play** - Auto-run through endless factory
2. **Survive** - Flip gravity to avoid obstacles
3. **Collect** - Grab gears for score + currency
4. **Die** - Hit an obstacle
5. **Upgrade** - Spend gears on permanent upgrades
6. **Repeat** - Get further each time!

## 👤 Credits

Made by **tufstraka** (Keith Kadima)

- GitHub: [@tufstraka](https://github.com/tufstraka)
- Theme: **MACHINES** ⚙️

## 📜 License

MIT
