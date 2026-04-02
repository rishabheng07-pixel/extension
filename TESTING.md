# Testing Guide

This guide walks you through manual testing of the CodeStreak extension.

## Pre-Test Setup

1. Ensure all files are compiled:
   ```bash
   npm run compile
   ```

2. Launch the extension in debug mode:
   - Press **F5** in VS Code

3. A new VS Code window opens (Extension Host)
   - This is where you'll test the extension

## Test Checklist

### ✅ Phase 1: Activation

**Objective**: Verify extension activates on startup

1. Look at the Debug Console in the main VS Code window
2. You should see:
   ```
   CodeStreak extension activating...
   Time tracker started
   CodeStreak extension activated successfully
   ```

3. A popup appears in the Extension Host window:
   ```
   "CodeStreak activated! 🔥 Your coding streak tracker is ready."
   ```

4. Check the status bar (bottom right) in Extension Host:
   - Should show "⏱️ 0m | No streak" (or your persisted time)

### ✅ Phase 2: Time Tracking

**Objective**: Verify timer increments when window is focused

1. In the Extension Host window, type some code (e.g., open a file and edit it)
2. Wait 15-20 seconds
3. Check status bar on the right side:
   - Should show increased time (e.g., "⏱️ 0m 15s" → "⏱️ 0m 20s")
4. **Expected**: Timer increments every 1 second

### ✅ Phase 3: Idle Detection

**Objective**: Verify timer pauses when window loses focus

1. In Extension Host, note the current time in status bar (e.g., "0m 30s")
2. Click on the main (parent) VS Code window to shift focus away
3. Wait 70 seconds (must exceed 60-second idle threshold)
4. Click back to Extension Host window
5. Check status bar:
   - **Expected**: Time should NOT have increased much (paused during unfocused period)
   - Should resume incrementing once you refocus the window

### ✅ Phase 4: Show Stats Command

**Objective**: Verify the "Show Coding Stats" command works

1. In Extension Host, press **Ctrl+Shift+P** to open Command Palette
2. Type "CodeStreak: Show Coding Stats"
3. Press Enter
4. A popup should appear showing:
   ```
   📊 CodeStreak Stats
   
   Today: 45m
   Total: 45m
   🔥 Streak: 0 days
   ```

5. **Expected**: Formatted stats match the time you've tracked
6. If you've reached any badges (7-day, 10-hour, 100-hour), they should appear

### ✅ Phase 5: Status Bar Click

**Objective**: Verify clicking status bar opens stats

1. In Extension Host, click the status bar (right side, "⏱️ ... | 🔥 ...")
2. Same stats popup should appear as Phase 4

### ✅ Phase 6: Persistence

**Objective**: Verify stats persist across reloads

1. In Extension Host, note your current stats (e.g., "⏱️ 5m | 🔥 0 days")
2. Reload the extension: **Ctrl+Shift+P** → "Developer: Reload Window"
3. Wait for extension to reactivate
4. Check status bar:
   - **Expected**: Time should be the same or slightly increased (accounting for reload time)
   - Stats should persist from globalState

### ✅ Phase 7: Manual Time Trigger (Advanced)

**Objective**: Verify auto-save is working

1. Code for exactly 30+ seconds in Extension Host (to exceed auto-save interval)
2. Without reloading, open Developer Console (**Ctrl+Shift+K**)
3. You should see logs like:
   ```
   Stats auto-saved
   ```

4. Reload the window and verify time persisted

### ✅ Phase 8: Day Boundary (Simulation)

**Objective**: Verify streak reset logic on day change

This requires manual manipulation. For now:

1. If you've coded ≥10 minutes in a day, your streak should be 1
2. To test day boundary crossing, you would need to:
   - Wait until midnight tomorrow, OR
   - Manually edit localState file (advanced)

For this release, rely on the streak logic reviewed in code.

## Debugging Tips

### Enable Debug Console Logs

1. Open Debug Console in main VS Code: **Ctrl+Shift+Y**
2. Watch for extension lifecycle logs:
   ```
   CodeStreak extension activating...
   [phase descriptions]
   CodeStreak extension activated successfully
   Time tracker started
   Stats auto-saved
   ```

### Check globalState

globalState is stored in:
```
%APPDATA%\Code\User\globalState
```

To manually inspect/edit (advanced users only):
- Use VS Code Developer Tools (Ctrl+Shift+K)
- globalState is not directly editable in UI, but logs confirm saves

### Test Idle Detection Manually

1. Focus Extension Host window (coding)
2. After 15 seconds, click parent window
3. Wait 65+ seconds
4. Check status bar time is frozen
5. Click back to Extension Host
6. Wait 5 seconds - time resumes incrementing

## Performance Checklist

- [ ] Extension activates in <2 seconds
- [ ] Status bar updates every 10 seconds (no lag)
- [ ] Timer increments smoothly (no jumps)
- [ ] No visible lag when switching focus
- [ ] Command palette response is instant
- [ ] No console errors or warnings

## Success Criteria

All 8 test phases should pass:
1. ✅ Activation message visible
2. ✅ Timer increments when focused
3. ✅ Timer pauses when idle
4. ✅ Show Stats command displays popup
5. ✅ Status bar click shows stats
6. ✅ Stats persist after reload
7. ✅ Auto-save logs visible
8. ✅ Streak logic behaves correctly

**Extension is ready for use once all tests pass!** 🎉

---

## Reporting Issues

If any test fails:

1. Check the Debug Console for error messages
2. Verify you followed up-to-date compilation step
3. Note the specific test phase that failed
4. File an issue with:
   - Test phase number
   - Expected vs. actual behavior
   - Debug console output
   - Steps to reproduce
