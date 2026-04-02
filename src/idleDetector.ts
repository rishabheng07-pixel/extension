import * as vscode from 'vscode';

export type IdleStateChangeCallback = (isIdle: boolean) => void;

export class IdleDetector {
  private isIdle: boolean = false;
  private idleThresholdMs: number = 60 * 1000; // 60 seconds in milliseconds
  private lastActivityTime: number = Date.now();
  private idleCheckIntervalId: NodeJS.Timeout | null = null;
  private onIdleStateChange: IdleStateChangeCallback | null = null;

  constructor() {
    this.lastActivityTime = Date.now();
  }

  /**
   * Start idle detection monitoring
   * Listens to window focus changes and periodically checks for idle state
   *
   * @param callback Function to call when idle state changes (true = idle, false = active)
   */
  public startMonitoring(callback: IdleStateChangeCallback): void {
    this.onIdleStateChange = callback;

    // Listen for window state changes (focus/blur)
    const disposable = vscode.window.onDidChangeWindowState((state) => {
      if (state.focused) {
        // Window gained focus - mark as active
        this.setActive();
      } else {
        // Window lost focus - may trigger idle after threshold
        // Idle detection will be handled by the periodic check below
      }
    });

    // Periodic check for idle state (every 5 seconds)
    this.idleCheckIntervalId = setInterval(() => {
      this.checkIdleState();
    }, 5000);

    // Note: Disposable is managed at extension level
  }

  /**
   * Mark activity as detected (window focus regained)
   */
  private setActive(): void {
    this.lastActivityTime = Date.now();

    // If was idle, transition to active
    if (this.isIdle) {
      this.isIdle = false;
      if (this.onIdleStateChange) {
        this.onIdleStateChange(false); // false = active
      }
    }
  }

  /**
   * Check if idle threshold has been exceeded
   */
  private checkIdleState(): void {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    const shouldBeIdle = timeSinceLastActivity >= this.idleThresholdMs;

    // Only trigger callback on state change
    if (shouldBeIdle && !this.isIdle) {
      this.isIdle = true;
      if (this.onIdleStateChange) {
        this.onIdleStateChange(true); // true = idle
      }
    } else if (!shouldBeIdle && this.isIdle) {
      // Re-activate if threshold reset (shouldn't happen in typical flow)
      this.isIdle = false;
      if (this.onIdleStateChange) {
        this.onIdleStateChange(false); // false = active
      }
    }
  }

  /**
   * Get current idle state
   */
  public getIdleState(): boolean {
    return this.isIdle;
  }

  /**
   * Stop idle detection monitoring
   */
  public stopMonitoring(): void {
    if (this.idleCheckIntervalId !== null) {
      clearInterval(this.idleCheckIntervalId);
      this.idleCheckIntervalId = null;
    }
  }

  /**
   * Get time since last activity (in milliseconds)
   */
  public getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime;
  }

  /**
   * Set custom idle threshold (in milliseconds)
   */
  public setIdleThreshold(ms: number): void {
    this.idleThresholdMs = Math.max(1000, ms); // Minimum 1 second
  }
}
