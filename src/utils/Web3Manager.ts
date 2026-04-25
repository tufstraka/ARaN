import { BrowserProvider, Contract, formatEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export enum AchievementType {
  BOOT_COMPLETE = 0,
  GRAVITY_MASTER = 1,
  SPEED_DEMON = 2,
  CHAOS_SURVIVOR = 3,
  FACTORY_ESCAPE = 4
}

export const ACHIEVEMENT_NAMES: Record<AchievementType, string> = {
  [AchievementType.BOOT_COMPLETE]: 'Boot Complete',
  [AchievementType.GRAVITY_MASTER]: 'Gravity Master',
  [AchievementType.SPEED_DEMON]: 'Speed Demon',
  [AchievementType.CHAOS_SURVIVOR]: 'Chaos Survivor',
  [AchievementType.FACTORY_ESCAPE]: 'Factory Escape'
};

export const ACHIEVEMENT_DESCRIPTIONS: Record<AchievementType, string> = {
  [AchievementType.BOOT_COMPLETE]: 'Complete Level 1',
  [AchievementType.GRAVITY_MASTER]: 'Complete 5 levels',
  [AchievementType.SPEED_DEMON]: 'Reach 10x combo',
  [AchievementType.CHAOS_SURVIVOR]: 'Survive 30s in Chaos Mode',
  [AchievementType.FACTORY_ESCAPE]: 'Complete all levels'
};

const CONTRACT_ABI = [
  "function submitScore(uint256 score) external",
  "function mintAchievement(uint8 achievementType) external",
  "function hasAchievement(address player, uint8 achievementType) external view returns (bool)",
  "function getPlayerStats(address player) external view returns (uint256 highScore, uint256 totalGamesPlayed, uint256 lastPlayed, bool[5] memory achievements)",
  "function getLeaderboard(uint256 offset, uint256 limit) external view returns (address[] memory players, uint256[] memory scores, uint256[] memory timestamps)",
  "function getLeaderboardSize() external view returns (uint256)",
  "event ScoreSubmitted(address indexed player, uint256 score, uint256 rank)",
  "event AchievementMinted(address indexed player, uint8 achievementType, uint256 tokenId)"
];

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const BASE_SEPOLIA_CHAIN_ID = '0x14a34';

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: number;
}

interface PlayerStats {
  highScore: number;
  totalGamesPlayed: number;
  lastPlayed: number;
  achievements: boolean[];
}

class Web3Manager {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;
  private address: string | null = null;
  private chainId: string | null = null;
  
  private contractAddress: string = '';
  private targetChainId: string = SEPOLIA_CHAIN_ID;
  
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    const savedAddress = localStorage.getItem('aran_contract_address');
    const savedChainId = localStorage.getItem('aran_chain_id');
    
    if (savedAddress) this.contractAddress = savedAddress;
    if (savedChainId) this.targetChainId = savedChainId;
  }
  
  setContractAddress(address: string): void {
    this.contractAddress = address;
    localStorage.setItem('aran_contract_address', address);
    if (this.provider && this.address) {
      this.initContract();
    }
  }
  
  setTargetChain(chainId: string): void {
    this.targetChainId = chainId;
    localStorage.setItem('aran_chain_id', chainId);
  }
  
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }
  
  isConnected(): boolean {
    return !!this.address;
  }
  
  getAddress(): string | null {
    return this.address;
  }
  
  getShortAddress(): string {
    if (!this.address) return '';
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }
  
  async connect(): Promise<string | null> {
    if (!this.isAvailable()) {
      this.emit('error', 'No wallet detected. Please install MetaMask.');
      return null;
    }
    
    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      }) as string[];
      
      if (accounts.length === 0) {
        this.emit('error', 'No accounts found');
        return null;
      }
      
      this.address = accounts[0];
      this.provider = new BrowserProvider(window.ethereum!);
      
      this.chainId = await window.ethereum!.request({
        method: 'eth_chainId'
      }) as string;
      
      if (this.chainId !== this.targetChainId) {
        await this.switchChain();
      }
      
      this.initContract();
      this.setupListeners();
      
      this.emit('connected', this.address);
      return this.address;
    } catch (error) {
      const err = error as Error;
      this.emit('error', err.message || 'Failed to connect wallet');
      return null;
    }
  }
  
  async disconnect(): Promise<void> {
    this.address = null;
    this.provider = null;
    this.contract = null;
    this.removeListeners();
    this.emit('disconnected');
  }
  
  private async switchChain(): Promise<void> {
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.targetChainId }]
      });
      this.chainId = this.targetChainId;
    } catch (error) {
      const err = error as { code: number };
      if (err.code === 4902) {
        await this.addChain();
      } else {
        throw error;
      }
    }
  }
  
  private async addChain(): Promise<void> {
    const chainParams = this.targetChainId === BASE_SEPOLIA_CHAIN_ID
      ? {
          chainId: BASE_SEPOLIA_CHAIN_ID,
          chainName: 'Base Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org']
        }
      : {
          chainId: SEPOLIA_CHAIN_ID,
          chainName: 'Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        };
    
    await window.ethereum!.request({
      method: 'wallet_addEthereumChain',
      params: [chainParams]
    });
  }
  
  private initContract(): void {
    if (!this.provider || !this.contractAddress) return;
    
    this.contract = new Contract(
      this.contractAddress,
      CONTRACT_ABI,
      this.provider
    );
  }
  
  private setupListeners(): void {
    if (!window.ethereum) return;
    
    window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
    window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
  }
  
  private removeListeners(): void {
    if (!window.ethereum) return;
    
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged.bind(this));
    window.ethereum.removeListener('chainChanged', this.handleChainChanged.bind(this));
  }
  
  private handleAccountsChanged(accounts: unknown): void {
    const accs = accounts as string[];
    if (accs.length === 0) {
      this.disconnect();
    } else {
      this.address = accs[0];
      this.emit('accountChanged', this.address);
    }
  }
  
  private handleChainChanged(chainId: unknown): void {
    this.chainId = chainId as string;
    this.emit('chainChanged', this.chainId);
    window.location.reload();
  }
  
  async submitScore(score: number): Promise<boolean> {
    if (!this.contract || !this.provider) {
      this.emit('error', 'Not connected');
      return false;
    }
    
    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer) as Contract;
      
      this.emit('transaction_pending', 'Submitting score...');
      
      const tx = await contractWithSigner.submitScore(score);
      await tx.wait();
      
      this.emit('transaction_success', 'Score submitted!');
      return true;
    } catch (error) {
      const err = error as Error;
      this.emit('error', err.message || 'Failed to submit score');
      return false;
    }
  }
  
  async mintAchievement(achievementType: AchievementType): Promise<boolean> {
    if (!this.contract || !this.provider) {
      this.emit('error', 'Not connected');
      return false;
    }
    
    try {
      const hasIt = await this.hasAchievement(achievementType);
      if (hasIt) {
        this.emit('error', 'Achievement already minted');
        return false;
      }
      
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer) as Contract;
      
      this.emit('transaction_pending', `Minting ${ACHIEVEMENT_NAMES[achievementType]}...`);
      
      const tx = await contractWithSigner.mintAchievement(achievementType);
      await tx.wait();
      
      this.emit('transaction_success', 'Achievement minted!');
      return true;
    } catch (error) {
      const err = error as Error;
      this.emit('error', err.message || 'Failed to mint achievement');
      return false;
    }
  }
  
  async hasAchievement(achievementType: AchievementType): Promise<boolean> {
    if (!this.contract || !this.address) return false;
    
    try {
      return await this.contract.hasAchievement(this.address, achievementType);
    } catch {
      return false;
    }
  }
  
  async getPlayerStats(): Promise<PlayerStats | null> {
    if (!this.contract || !this.address) return null;
    
    try {
      const result = await this.contract.getPlayerStats(this.address);
      return {
        highScore: Number(result.highScore),
        totalGamesPlayed: Number(result.totalGamesPlayed),
        lastPlayed: Number(result.lastPlayed),
        achievements: result.achievements
      };
    } catch {
      return null;
    }
  }
  
  async getLeaderboard(offset: number = 0, limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.contract) return [];
    
    try {
      const result = await this.contract.getLeaderboard(offset, limit);
      const entries: LeaderboardEntry[] = [];
      
      for (let i = 0; i < result.players.length; i++) {
        entries.push({
          player: result.players[i],
          score: Number(result.scores[i]),
          timestamp: Number(result.timestamps[i])
        });
      }
      
      return entries.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }
  
  async getLeaderboardSize(): Promise<number> {
    if (!this.contract) return 0;
    
    try {
      return Number(await this.contract.getLeaderboardSize());
    } catch {
      return 0;
    }
  }
  
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
  
  off(event: string, callback: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }
  
  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach(callback => callback(...args));
  }
}

export const web3Manager = new Web3Manager();
