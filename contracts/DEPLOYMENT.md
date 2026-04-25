# ARAN Smart Contract Deployment Guide

This guide explains how to deploy the AranGame smart contract to Ethereum testnet.

## Prerequisites

- Node.js 18+
- A wallet with testnet ETH (Sepolia or Base Sepolia)
- Private key for deployment

## Setup

1. Create a new directory for the contract deployment:

```bash
mkdir aran-contracts
cd aran-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

2. Initialize Hardhat:

```bash
npx hardhat init
```

Select "Create a TypeScript project"

3. Copy the contract:

```bash
cp ../flip-world/contracts/AranGame.sol contracts/
```

4. Create `.env` file:

```
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_api_key
```

5. Update `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
```

## Deploy

1. Create deployment script `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AranGame contract...");

  const AranGame = await ethers.getContractFactory("AranGame");
  const aranGame = await AranGame.deploy();

  await aranGame.waitForDeployment();

  const address = await aranGame.getAddress();
  console.log(`AranGame deployed to: ${address}`);
  console.log("");
  console.log("Add this to your game:");
  console.log(`web3Manager.setContractAddress("${address}");`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

2. Compile:

```bash
npx hardhat compile
```

3. Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Or deploy to Base Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

4. Copy the deployed contract address.

## Configure the Game

After deployment, update the game to use your contract:

### Option 1: Hardcode the address

Edit `flip-world/src/utils/Web3Manager.ts` and change:

```typescript
private contractAddress: string = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### Option 2: Set at runtime

In your browser console after the game loads:

```javascript
web3Manager.setContractAddress("YOUR_DEPLOYED_CONTRACT_ADDRESS");
```

## Get Testnet ETH

### Sepolia
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Base Sepolia
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Achievement NFT Metadata

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

## Testing Locally

1. Start local node:

```bash
npx hardhat node
```

2. Deploy to local:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Configure MetaMask to use localhost:8545
