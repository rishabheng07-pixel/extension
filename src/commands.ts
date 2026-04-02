import * as vscode from 'vscode';
import { StatsManager } from './statsManager';

/**
 * Register "Show Coding Stats" command
 * Displays detailed stats in a popup message
 */
export function registerShowStatsCommand(context: vscode.ExtensionContext, statsManager: StatsManager): void {
  const disposable = vscode.commands.registerCommand('codestreak.showStats', async () => {
    const statsMessage = statsManager.getDetailedString();
    await vscode.window.showInformationMessage(`📊 CodeStreak Stats\n\n${statsMessage}`);
  });

  context.subscriptions.push(disposable);
}
