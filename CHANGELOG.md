# Changelog

All notable changes to the CodeStreak extension will be documented in this file.

## [1.0.0] - 2026-04-01

### Initial Release ✨

#### Added
- **Automatic Time Tracking**: Tracks coding time automatically when VS Code is open
- **Smart Idle Detection**: Pauses tracking when window loses focus for 60+ seconds
- **Daily Streak System**: Build consecutive day streaks with ≥10 minutes/day requirement
- **Persistent Storage**: Stats saved to VS Code globalState (syncs across workspaces)
- **Status Bar Display**: Real-time stats in status bar ("⏱️ 1h 20m | 🔥 3 days")
- **Detailed Stats Command**: "Show Coding Stats" command displays popup with full stats
- **Achievement Badges**:
  - 🏆 7-Day Warrior (7-day streak)
  - ⚡ 10-Hour Champion (10+ hours total)
  - 👑 Century Coder (100+ hours total)

#### Features
- Automatic session time saving every 30 seconds
- Day boundary detection and streak reset logic
- Formatted time display (e.g., "1h 20m")
- Clean TypeScript codebase with full JSDoc comments
- Debug console logging for troubleshooting

#### Technical
- Built with TypeScript and VS Code Extension API
- Uses globalState for cross-workspace persistence
- 1-second timer resolution with 10-second status bar refresh
- Zero external dependencies (pure VS Code API)

---

### Future Releases

**v1.1.0** (Planned)
- Weekly and monthly stats
- Time range filtering
- CSV export
- Configurable settings (idle threshold, streak minimum)

**v2.0.0** (Future)
- Git integration
- Cloud sync
- Analytics dashboard
- Team leaderboards
