# ARAN Smart Contracts

Ethereum smart contracts for the ARAN game, providing on-chain leaderboard and achievement NFTs.

## Contract Overview

**AranGame.sol** - ERC-721 contract with:
- On-chain leaderboard (top 100 scores)
- Achievement NFT minting (5 types)
- Player stats tracking

## Prerequisites

- Node.js 18+
- A wallet with testnet ETH
- Private key for deployment

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your private key:

```bash
cp .env.example .env
```

Edit `.env`:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Compile

```bash
npx hardhat compile
```

## Deploy

### To Sepolia (Ethereum testnet)

```bash
npx hardhat ignition deploy ignition/modules/AranGame.ts --network sepolia
```

### To Base Sepolia

```bash
npx hardhat ignition deploy ignition/modules/AranGame.ts --network baseSepolia
```

### To Local Node

Start a local node:
```bash
npx hardhat node
```

In another terminal:
```bash
npx hardhat ignition deploy ignition/modules/AranGame.ts --network localhost
```

## After Deployment

1. Copy the deployed contract address from the output
2. Update the game to use your contract address:

**Option A: Hardcode in Web3Manager.ts**
```typescript
private contractAddress: string = 'YOUR_CONTRACT_ADDRESS';
```

**Option B: Set at runtime (browser console)**
```javascript
web3Manager.setContractAddress("YOUR_CONTRACT_ADDRESS");
```

## Get Testnet ETH

### Sepolia
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Base Sepolia
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Contract Functions

### For Players

| Function | Description |
|----------|-------------|
| `submitScore(uint256 score)` | Submit a new score |
| `mintAchievement(uint8 type)` | Mint an achievement NFT |
| `getPlayerStats(address)` | Get player's stats |
| `getLeaderboard(offset, limit)` | Get leaderboard entries |

### For Owner

| Function | Description |
|----------|-------------|
| `setAchievementURI(type, uri)` | Update NFT metadata URI |

## Achievement Types

| ID | Name | Description |
|----|------|-------------|
| 0 | Boot Complete | First run completed |
| 1 | Gravity Master | Score 500+ |
| 2 | Speed Demon | 10x combo |
| 3 | Chaos Survivor | 30+ second run |
| 4 | Factory Escape | Score 2000+ |

## NFT Metadata

The contract uses placeholder IPFS URIs. To add real metadata:

1. Create JSON files for each achievement:

```json
{
  "name": "Boot Complete",
  "description": "Completed your first run in ARAN",
  "image": "ipfs://YOUR_IMAGE_CID",
  "attributes": [
    { "trait_type": "Achievement", "value": "Boot Complete" },
    { "trait_type": "Game", "value": "ARAN" }
  ]
}
```

2. Upload to IPFS (use Pinata or nft.storage)

3. Call `setAchievementURI` on the contract:

```javascript
await contract.setAchievementURI(0, "ipfs://YOUR_METADATA_CID");
```

## Verify Contract (Optional)

For Sepolia:
```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## License

MIT
