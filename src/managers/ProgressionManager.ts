import Phaser from 'phaser';
import { CONFIG, COLORS, SaveData, DEFAULT_SAVE, GameStats, ACHIEVEMENTS } from '../config/gameConfig';

/**
 * Manages save data, stats tracking, and achievements
 */
export class ProgressionManager {
  private data: SaveData;
  private static STORAGE_KEY = 'flipbot_save';
  
  constructor() {
    this.data = this.load();
  }
  
  // === PERSISTENCE ===
  
  private load(): SaveData {
    try {
      const saved = localStorage.getItem(ProgressionManager.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SaveData;
        // Merge with defaults for forward compatibility
        return { ...DEFAULT_SAVE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return { ...DEFAULT_SAVE };
  }
  
  save(): void {
    try {
      localStorage.setItem(ProgressionManager.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }
  
  reset(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
  
  // === STATS ===
  
  get stats(): GameStats {
    return this.data.stats;
  }
  
  get currency(): number {
    return this.data.currency;
  }
  
  addCurrency(amount: number): void {
    this.data.currency += amount;
    this.data.stats.totalGears += amount;
    this.save();
  }
  
  spendCurrency(amount: number): boolean {
    if (this.data.currency >= amount) {
      this.data.currency -= amount;
      this.save();
      return true;
    }
    return false;
  }
  
  recordRun(score: number, time: number, gears: number, flips: number, maxCombo: number, finalPhase?: string): void {
    const stats = this.data.stats;
    
    stats.totalRuns++;
    stats.totalScore += score;
    stats.totalFlips += flips;
    stats.totalDeaths++;
    stats.totalTimePlayed = (stats.totalTimePlayed || 0) + time;
    
    // Track phase reached
    if (finalPhase) {
      if (!stats.phasesReached) stats.phasesReached = {};
      stats.phasesReached[finalPhase] = (stats.phasesReached[finalPhase] || 0) + 1;
    }
    
    if (score > stats.bestScore) stats.bestScore = score;
    if (time > stats.longestRun) stats.longestRun = time;
    if (maxCombo > stats.bestCombo) stats.bestCombo = maxCombo;
    
    // Add collected gears to currency
    this.addCurrency(gears);
    
    // Check achievements
    this.checkAchievements();
    
    this.save();
  }
  
  // === UPGRADES ===
  
  getUpgradeLevel(id: string): number {
    return this.data.upgrades[id] || 0;
  }
  
  upgradeLevel(id: string, maxLevel: number, cost: number): boolean {
    const current = this.getUpgradeLevel(id);
    if (current >= maxLevel) return false;
    if (!this.spendCurrency(cost)) return false;
    
    this.data.upgrades[id] = current + 1;
    this.save();
    return true;
  }
  
  // === ACHIEVEMENTS ===
  
  get unlockedAchievements(): string[] {
    return this.data.achievements;
  }
  
  private checkAchievements(): string[] {
    const newlyUnlocked: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (this.data.achievements.includes(achievement.id)) continue;
      
      if (achievement.condition(this.data.stats)) {
        this.data.achievements.push(achievement.id);
        this.data.currency += achievement.reward;
        newlyUnlocked.push(achievement.id);
      }
    }
    
    return newlyUnlocked;
  }
  
  // === SETTINGS ===
  
  get settings() {
    return this.data.settings;
  }
  
  updateSettings(partial: Partial<SaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
  }
}

// Singleton instance
export const progression = new ProgressionManager();
