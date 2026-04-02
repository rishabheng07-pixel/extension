import * as vscode from 'vscode';
import { CodingStats } from './statsManager';

export class StorageManager {
  private globalState: vscode.Memento;

  // Storage key constants
  private readonly KEY_TOTAL_TIME = 'codestreak.totalTime';
  private readonly KEY_TODAY_TIME = 'codestreak.todayTime';
  private readonly KEY_STREAK = 'codestreak.streak';
  private readonly KEY_LAST_ACTIVE_DATE = 'codestreak.lastActiveDate';

  constructor(globalState: vscode.Memento) {
    this.globalState = globalState;
  }

  /**
   * Load stats from persistent storage
   * Returns default stats if nothing stored yet
   */
  public loadStats(): CodingStats {
    try {
      const stats: CodingStats = {
        totalTime: this.globalState.get<number>(this.KEY_TOTAL_TIME) ?? 0,
        todayTime: this.globalState.get<number>(this.KEY_TODAY_TIME) ?? 0,
        streak: this.globalState.get<number>(this.KEY_STREAK) ?? 0,
        lastActiveDate: this.globalState.get<string>(this.KEY_LAST_ACTIVE_DATE) ?? this.getTodayDateString(),
      };

      return stats;
    } catch (error) {
      console.error('Error loading stats from storage:', error);
      // Return default stats on error
      return {
        totalTime: 0,
        todayTime: 0,
        streak: 0,
        lastActiveDate: this.getTodayDateString(),
      };
    }
  }

  /**
   * Save stats to persistent storage
   */
  public async saveStats(stats: CodingStats): Promise<void> {
    try {
      await Promise.all([
        this.globalState.update(this.KEY_TOTAL_TIME, stats.totalTime),
        this.globalState.update(this.KEY_TODAY_TIME, stats.todayTime),
        this.globalState.update(this.KEY_STREAK, stats.streak),
        this.globalState.update(this.KEY_LAST_ACTIVE_DATE, stats.lastActiveDate),
      ]);
    } catch (error) {
      console.error('Error saving stats to storage:', error);
    }
  }

  /**
   * Clear all stored stats (for reset)
   */
  public async clearStats(): Promise<void> {
    try {
      await Promise.all([
        this.globalState.update(this.KEY_TOTAL_TIME, undefined),
        this.globalState.update(this.KEY_TODAY_TIME, undefined),
        this.globalState.update(this.KEY_STREAK, undefined),
        this.globalState.update(this.KEY_LAST_ACTIVE_DATE, undefined),
      ]);
    } catch (error) {
      console.error('Error clearing stats:', error);
    }
  }

  /**
   * Get today's date as ISO string (YYYY-MM-DD)
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
