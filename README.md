# ARAN - Factory Escape

A one-button endless runner built for Gamedev.js Jam 2026 (Theme: MACHINES).

You are ARAN, a sentient robot escaping a malfunctioning factory. Tap or press SPACE to flip gravity, survive the chaos, and beat your high score.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Features

- **One-button gameplay** - Tap or press SPACE to flip gravity
- **Gravity-flipping mechanic** - Walk on floors and ceilings
- **Gear collection** - Build combos up to 10x multiplier
- **5 Upgrades** - Shields, time dilation, magnet, score boost, combo buffer
- **8 Difficulty phases** - From Boot Sequence to Chaos Mode
- **Auto-save** - Progress saved locally
- **Procedural audio** - All sounds generated with Web Audio API

## Difficulty Phases

| Time | Phase |
|------|-------|
| 0s | Boot Sequence |
| 10s | Calibrating |
| 25s | Systems Online |
| 40s | Factory Floor |
| 60s | Danger Zone |
| 80s | Meltdown |
| 100s | Critical |
| 120s+ | Chaos Mode |

## Tech Stack

- Phaser 3
- TypeScript
- Vite
- Web Audio API

## Project Structure

```
src/
├── config/         # Game configuration, colors, patterns
├── entities/       # Player character
├── managers/       # Effects, progression systems
├── scenes/         # Menu, Runner, GameOver, Upgrades, Pause
├── systems/        # Obstacle generation, physics, input
├── utils/          # Sound manager
└── main.ts         # Entry point
```

## Game Loop

1. **Play** - Auto-run through the endless factory
2. **Survive** - Flip gravity to avoid obstacles
3. **Collect** - Grab gears for score and currency
4. **Die** - Hit an obstacle
5. **Upgrade** - Spend gears on permanent upgrades
6. **Repeat** - Get further each time

## Credits

Made by **tufstraka** (Keith K. Kadima)

GitHub: [@tufstraka](https://github.com/tufstraka)

## License

MIT
