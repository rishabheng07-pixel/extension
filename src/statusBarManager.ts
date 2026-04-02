import * as vscode from 'vscode';
import { StatsManager } from './statsManager';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private statsManager: StatsManager;
  private updateIntervalId: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 10 * 1000; // 10 seconds

  constructor(statsManager: StatsManager) {
    this.statsManager = statsManager;

    // Create status bar item on the right side
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100 // Priority: shown before other items
    );

    this.statusBarItem.command = 'codestreak.showStats'; // Click to show stats
  }

  /**
   * Show the status bar item and start periodic updates
   */
  public show(): void {
    this.statusBarItem.show();
    this.startUpdating();
  }

  /**
   * Hide the status bar item and stop updates
   */
  public hide(): void {
    this.stopUpdating();
    this.statusBarItem.hide();
  }

  /**
   * Update status bar display immediately
   */
  public updateDisplay(): void {
    const stats = this.statsManager.getStats();
    this.statusBarItem.text = this.statsManager.getStatusBarString();
    this.statusBarItem.tooltip = `Total: ${this.formatSeconds(stats.totalTime)}\nToday: ${this.formatSeconds(stats.todayTime)}\nStreak: ${stats.streak} days`;
  }

  /**
   * Start periodic updates (10 second interval)
   */
  private startUpdating(): void {
    if (this.updateIntervalId !== null) {
      return; // Already updating
    }

    this.updateDisplay(); // Initial update

    this.updateIntervalId = setInterval(() => {
      this.updateDisplay();
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Stop periodic updates
   */
  private stopUpdating(): void {
    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }

  /**
   * Format seconds to readable time
   */
  private formatSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return '0m';
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.stopUpdating();
    this.statusBarItem.dispose();
  }
}
