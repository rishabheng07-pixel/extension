export class TimeTracker {
  private sessionTime: number = 0; // Total accumulated time in seconds
  private isTracking: boolean = false;
  private isPaused: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastTickTime: number = 0; // Timestamp of last tick for delta calculation

  /**
   * Start tracking time with 1-second intervals
   */
  public startTracking(): void {
    if (this.isTracking) {
      return; // Already tracking
    }

    this.isTracking = true;
    this.isPaused = false;
    this.lastTickTime = Date.now();

    // Tick every 1 second
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.isTracking) {
        const now = Date.now();
        const deltaMs = now - this.lastTickTime;
        const deltaSeconds = Math.floor(deltaMs / 1000);

        if (deltaSeconds > 0) {
          this.sessionTime += deltaSeconds;
          this.lastTickTime = now;
        }
      }
    }, 1000);
  }

  /**
   * Pause tracking (keeps accumulated time, stops incrementing)
   */
  public pauseTracking(): void {
    if (!this.isTracking || this.isPaused) {
      return;
    }
    this.isPaused = true;
  }

  /**
   * Resume tracking from paused state
   */
  public resumeTracking(): void {
    if (!this.isTracking || !this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.lastTickTime = Date.now();
  }

  /**
   * Stop tracking completely and clear timer
   */
  public stopTracking(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    this.isPaused = false;
  }

  /**
   * Get current session time in seconds
   */
  public getSessionTime(): number {
    return this.sessionTime;
  }

  /**
   * Get session time formatted as "1h 20m"
   */
  public getFormattedSessionTime(): string {
    const hours = Math.floor(this.sessionTime / 3600);
    const minutes = Math.floor((this.sessionTime % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Reset session time to 0
   */
  public resetSessionTime(): void {
    this.sessionTime = 0;
    this.lastTickTime = Date.now();
  }

  /**
   * Check if currently tracking
   */
  public isCurrentlyTracking(): boolean {
    return this.isTracking && !this.isPaused;
  }

  /**
   * Check if currently paused
   */
  public isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Add time manually (for testing or manual adjustments)
   */
  public addTime(seconds: number): void {
    this.sessionTime += seconds;
  }

  /**
   * Set time directly (for restoring from persistent storage)
   */
  public setSessionTime(seconds: number): void {
    this.sessionTime = Math.max(0, seconds);
  }
}
