export interface CodingStats {
  totalTime: number; // Total time across all days (seconds)
  todayTime: number; // Time tracked today (seconds)
  streak: number; // Current consecutive day streak
  lastActiveDate: string; // ISO date string of last active day
}

export class StatsManager {
  private stats: CodingStats;
  private readonly MIN_STREAK_THRESHOLD = 600; // 10 minutes in seconds

  constructor(initialStats?: CodingStats) {
    this.stats = initialStats || this.getDefaultStats();
  }

  /**
   * Get default stats object
   */
  private getDefaultStats(): CodingStats {
    return {
      totalTime: 0,
      todayTime: 0,
      streak: 0,
      lastActiveDate: this.getTodayDateString(),
    };
  }

  /**
   * Get today's date as ISO string (YYYY-MM-DD)
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date as ISO string
   */
  private getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  /**
   * Calculate days elapsed between two ISO date strings
   */
  private daysBetween(dateStr1: string, dateStr2: string): number {
    const date1 = new Date(dateStr1 + 'T00:00:00Z');
    const date2 = new Date(dateStr2 + 'T00:00:00Z');
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Record coding session (typically called at end of day or on deactivation)
   * Updates totals and triggers streak calculation
   *
   * @param sessionTimeSeconds Time tracked in current session (seconds)
   */
  public recordSession(sessionTimeSeconds: number): void {
    const today = this.getTodayDateString();

    // Add to today's time
    this.stats.todayTime += sessionTimeSeconds;
    // Add to total time
    this.stats.totalTime += sessionTimeSeconds;

    // Update streak if minimum threshold met
    this.updateStreak();
  }

  /**
   * Update streak based on current date and lastActiveDate
   * Logic:
   * - If today == lastActiveDate: continue current streak (already counted)
   * - If today == yesterday: increment streak by 1
   * - If gap >= 2 days: reset streak to 0, start new streak at 1
   */
  private updateStreak(): void {
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();
    const daysSinceLastActive = this.daysBetween(this.stats.lastActiveDate, today);

    // Only count streak if today's coding time >= threshold
    if (this.stats.todayTime >= this.MIN_STREAK_THRESHOLD) {
      if (this.stats.lastActiveDate === today) {
        // Already active today, streak already counted
        return;
      } else if (this.stats.lastActiveDate === yesterday) {
        // Continuous streak, extend by 1
        this.stats.streak += 1;
        this.stats.lastActiveDate = today;
      } else if (daysSinceLastActive >= 2) {
        // Streak broken, reset to 1
        this.stats.streak = 1;
        this.stats.lastActiveDate = today;
      }
    }
  }

  /**
   * Called when day boundary is crossed (midnight)
   * Resets today's time and checks if streak should reset
   */
  public onNewDay(): void {
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    // If today's time is below threshold and we haven't updated lastActiveDate, reset streak
    if (
      this.stats.todayTime < this.MIN_STREAK_THRESHOLD &&
      this.stats.lastActiveDate === yesterday
    ) {
      this.stats.streak = 0;
    }

    // Reset today's time
    this.stats.todayTime = 0;
  }

  /**
   * Add time to today's session
   */
  public addTimeToday(seconds: number): void {
    this.stats.todayTime += seconds;
  }

  /**
   * Get current stats
   */
  public getStats(): CodingStats {
    return { ...this.stats };
  }

  /**
   * Update stats from loaded data (e.g., from persistence)
   */
  public setStats(stats: CodingStats): void {
    // Validate and sanitize
    this.stats = {
      totalTime: Math.max(0, stats.totalTime || 0),
      todayTime: Math.max(0, stats.todayTime || 0),
      streak: Math.max(0, stats.streak || 0),
      lastActiveDate: stats.lastActiveDate || this.getTodayDateString(),
    };

    // Check if day has changed since last save
    this.handleDayBoundary();
  }

  /**
   * Handle day boundary when extending from last session
   * If last session was yesterday and today's time < threshold, reset streak
   */
  private handleDayBoundary(): void {
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    // If we were active yesterday but today is a new day
    if (this.stats.lastActiveDate === yesterday) {
      // If we haven't met threshold today, streak resets
      if (this.stats.todayTime < this.MIN_STREAK_THRESHOLD) {
        this.stats.streak = 0;
      }
    } else if (this.stats.lastActiveDate !== today) {
      // If more than 1 day gap, reset streak
      const daysSinceActive = this.daysBetween(this.stats.lastActiveDate, today);
      if (daysSinceActive >= 2) {
        this.stats.streak = 0;
      }
    }
  }

  /**
   * Get formatted string for status bar display
   * Returns format like "1h 20m | 🔥 3 days"
   */
  public getStatusBarString(): string {
    const totalFormatted = this.formatSeconds(this.stats.totalTime);
    const streakEmoji = this.stats.streak > 0 ? '🔥' : '';
    const streakText = this.stats.streak > 0 ? `${this.stats.streak} ${this.getPluralDays(this.stats.streak)}` : 'No streak';

    if (streakEmoji) {
      return `⏱️ ${totalFormatted} | ${streakEmoji} ${streakText}`;
    }
    return `⏱️ ${totalFormatted} | ${streakText}`;
  }

  /**
   * Get formatted string for detailed stats popup
   */
  public getDetailedString(): string {
    const todayFormatted = this.formatSeconds(this.stats.todayTime);
    const totalFormatted = this.formatSeconds(this.stats.totalTime);
    const badges = this.getAchievementBadges();

    let detailed = `Today: ${todayFormatted}\nTotal: ${totalFormatted}\n🔥 Streak: ${this.stats.streak} ${this.getPluralDays(this.stats.streak)}`;

    if (badges.length > 0) {
      detailed += `\n\nBadges: ${badges.join(', ')}`;
    }

    return detailed;
  }

  /**
   * Get achievement badges based on current stats
   */
  private getAchievementBadges(): string[] {
    const badges: string[] = [];

    // 7-day streak badge
    if (this.stats.streak >= 7) {
      badges.push('🏆 7-Day Warrior');
    }

    // 10 hours total badge
    if (this.stats.totalTime >= 36000) {
      badges.push('⚡ 10-Hour Champion');
    }

    // 100 hours total badge
    if (this.stats.totalTime >= 360000) {
      badges.push('👑 Century Coder');
    }

    return badges;
  }

  /**
   * Format seconds to readable time (e.g., "1h 20m")
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
   * Get plural form of "day(s)"
   */
  private getPluralDays(count: number): string {
    return count === 1 ? 'day' : 'days';
  }

  /**
   * Reset all stats (for testing or user request)
   */
  public reset(): void {
    this.stats = this.getDefaultStats();
  }
}
