import * as vscode from 'vscode';

export class SettingsManager {
  loadSettings() {
    const config = vscode.workspace.getConfiguration('windsurf');
    return {
      enabled: config.get<boolean>('enabled', true),
      contextSwitchThreshold: config.get<number>('contextSwitchThreshold', 15),
      fileGroupThreshold: config.get<number>('fileGroupThreshold', 30),
      excludePatterns: config.get<string[]>('excludePatterns', [
        '**/node_modules/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/out/**'
      ])
    };
  }

  saveSettings(settings: { enabled: boolean, contextSwitchThreshold: number, fileGroupThreshold: number, excludePatterns: string[] }) {
    const config = vscode.workspace.getConfiguration('windsurf');
    config.update('enabled', settings.enabled, vscode.ConfigurationTarget.Global);
    config.update('contextSwitchThreshold', settings.contextSwitchThreshold, vscode.ConfigurationTarget.Global);
    config.update('fileGroupThreshold', settings.fileGroupThreshold, vscode.ConfigurationTarget.Global);
    config.update('excludePatterns', settings.excludePatterns, vscode.ConfigurationTarget.Global);
  }

  validateSettings(settings: { contextSwitchThreshold: number, fileGroupThreshold: number }): boolean {
    // Example validation logic
    if (settings.contextSwitchThreshold <= 0 || settings.fileGroupThreshold <= 0) {
      vscode.window.showErrorMessage('Threshold values must be greater than 0.');
      return false;
    }
    return true;
  }

  applySettingChanges() {
    const settings = this.loadSettings();
    if (this.validateSettings(settings)) {
      this.saveSettings(settings);
    }
  }
}
