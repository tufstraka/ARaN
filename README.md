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

## Blockchain Integration (Optional)

ARAN features optional Ethereum integration for players who want to immortalize their achievements on-chain.

### Features

- **On-Chain Leaderboard** - Submit your high score to a global, tamper-proof leaderboard
- **Achievement NFTs** - Mint commemorative NFTs for reaching milestones

### How to Use

1. Click "Connect Wallet" in the main menu (requires MetaMask)
2. After connecting, click your wallet address to access blockchain features:
   - **Submit Score** - Record your high score on-chain
   - **View Leaderboard** - See the global top 10 scores
   - **My Achievements** - View and mint achievement NFTs

### Achievements

| Achievement | Requirement |
|-------------|-------------|
| Boot Complete | Complete your first run |
| Gravity Master | Score 500+ points |
| Speed Demon | Reach 10x combo |
| Chaos Survivor | Survive 30+ seconds |
| Factory Escape | Score 2000+ points |

### Network

The game is deployed on Sepolia testnet.

**Contract Address:** `0xd21Cc9893EA6381E8b0a6DeA968532100fFd9217`

View on Etherscan: https://sepolia.etherscan.io/address/0xd21Cc9893EA6381E8b0a6DeA968532100fFd9217

Get free testnet ETH from:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

For deployment instructions, see [aran-contracts/README.md](aran-contracts/README.md).

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
- Ethers.js (optional blockchain features)
- Solidity (smart contracts)

## Project Structure

```
src/
├── config/         # Game configuration, colors, patterns
├── entities/       # Player character
├── managers/       # Effects, progression systems
├── scenes/         # Menu, Runner, GameOver, Upgrades, Pause
├── systems/        # Obstacle generation, physics, input
├── utils/          # Sound manager, Web3 manager
└── main.ts         # Entry point

aran-contracts/     # Smart contract project (Hardhat)
├── contracts/      # Solidity contracts
└── ignition/       # Deployment modules
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
