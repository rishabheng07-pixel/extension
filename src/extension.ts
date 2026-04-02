import * as vscode from 'vscode';
import { TimeTracker } from './timeTracker';
import { IdleDetector } from './idleDetector';
import { StatsManager } from './statsManager';
import { StorageManager } from './storage';
import { StatusBarManager } from './statusBarManager';
import { registerShowStatsCommand } from './commands';

let timeTracker: TimeTracker;
let idleDetector: IdleDetector;
let statsManager: StatsManager;
let storageManager: StorageManager;
let statusBarManager: StatusBarManager;

const SAVE_INTERVAL = 30 * 1000; // Save stats every 30 seconds
const DAY_CHECK_INTERVAL = 60 * 1000; // Check for day boundary every minute

let saveIntervalId: NodeJS.Timeout | null = null;
let dayCheckIntervalId: NodeJS.Timeout | null = null;
let lastSavedStats: any = null;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('CodeStreak extension activating...');

  try {
    // Initialize storage
    storageManager = new StorageManager(context.globalState);

    // Load persisted stats
    const loadedStats = storageManager.loadStats();
    console.log('Loaded stats:', loadedStats);

    // Initialize stats manager
    statsManager = new StatsManager(loadedStats);

    // Initialize time tracker
    timeTracker = new TimeTracker();

    // Initialize idle detector
    idleDetector = new IdleDetector();

    // Initialize status bar
    statusBarManager = new StatusBarManager(statsManager);
    statusBarManager.show();

    // Register commands
    registerShowStatsCommand(context, statsManager);

    // Setup idle detection listener
    idleDetector.startMonitoring((isIdle: boolean) => {
      if (isIdle) {
        console.log('Idle detected - pausing timer');
        timeTracker.pauseTracking();
      } else {
        console.log('Activity detected - resuming timer');
        timeTracker.resumeTracking();
      }
      statusBarManager.updateDisplay();
    });

    // Start time tracking
    timeTracker.startTracking();
    console.log('Time tracker started');

    // Periodic save of stats (every 30 seconds)
    saveIntervalId = setInterval(() => {
      const sessionTime = timeTracker.getSessionTime();
      if (sessionTime > 0) {
        // Add accumulated session time to today's total
        statsManager.recordSession(sessionTime);
        timeTracker.resetSessionTime();

        // Save to storage
        storageManager.saveStats(statsManager.getStats());
        console.log('Stats auto-saved');
      }
    }, SAVE_INTERVAL);

    // Check for day boundary (every minute)
    dayCheckIntervalId = setInterval(() => {
      const currentStats = statsManager.getStats();
      const today = new Date().toISOString().split('T')[0];

      // If date changed since last save, reset today time
      if (currentStats.lastActiveDate !== today && currentStats.todayTime < 600) {
        console.log('Day boundary detected');
        statsManager.onNewDay();
        statusBarManager.updateDisplay();
      }
    }, DAY_CHECK_INTERVAL);

    // Cleanup on deactivation
    context.subscriptions.push({
      dispose: () => {
        console.log('Cleaning up CodeStreak extension');
        cleanup();
      },
    });

    console.log('CodeStreak extension activated successfully');
    vscode.window.showInformationMessage('CodeStreak activated! 🔥 Your coding streak tracker is ready.');
  } catch (error) {
    console.error('Error activating CodeStreak:', error);
    vscode.window.showErrorMessage('CodeStreak failed to activate. Check console for details.');
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('CodeStreak extension deactivating...');
  cleanup();
}

/**
 * Cleanup resources and save state
 */
function cleanup() {
  // Stop intervals
  if (saveIntervalId !== null) {
    clearInterval(saveIntervalId);
  }
  if (dayCheckIntervalId !== null) {
    clearInterval(dayCheckIntervalId);
  }

  // Save final session time
  if (timeTracker) {
    const sessionTime = timeTracker.getSessionTime();
    if (sessionTime > 0) {
      statsManager.recordSession(sessionTime);
      storageManager.saveStats(statsManager.getStats());
      console.log('Final stats saved on deactivation');
    }
  }

  // Stop tracking
  if (timeTracker) {
    timeTracker.stopTracking();
  }

  // Stop idle detection
  if (idleDetector) {
    idleDetector.stopMonitoring();
  }

  // Hide and dispose status bar
  if (statusBarManager) {
    statusBarManager.hide();
    statusBarManager.dispose();
  }

  console.log('CodeStreak extension cleaned up');
}
