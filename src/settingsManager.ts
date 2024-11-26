import * as vscode from 'vscode';

class SettingsManager {
    private configuration: vscode.WorkspaceConfiguration;

    constructor() {
        this.configuration = vscode.workspace.getConfiguration('windsurf');
    }

    public loadSettings(): any {
        return {
            enabled: this.configuration.get('enabled', true),
            contextSwitchThreshold: this.configuration.get('contextSwitchThreshold', 15),
            fileGroupThreshold: this.configuration.get('fileGroupThreshold', 30),
            excludePatterns: this.configuration.get('excludePatterns', ["**/node_modules/**", "**/.git/**", "**/.vscode/**", "**/out/**"])
        };
    }

    public saveSettings(settings: any): void {
        this.configuration.update('enabled', settings.enabled, vscode.ConfigurationTarget.Global);
        this.configuration.update('contextSwitchThreshold', settings.contextSwitchThreshold, vscode.ConfigurationTarget.Global);
        this.configuration.update('fileGroupThreshold', settings.fileGroupThreshold, vscode.ConfigurationTarget.Global);
        this.configuration.update('excludePatterns', settings.excludePatterns, vscode.ConfigurationTarget.Global);
    }

    public validateSettings(settings: any): boolean {
        if (typeof settings.enabled !== 'boolean') return false;
        if (typeof settings.contextSwitchThreshold !== 'number' || settings.contextSwitchThreshold <= 0) return false;
        if (typeof settings.fileGroupThreshold !== 'number' || settings.fileGroupThreshold <= 0) return false;
        if (!Array.isArray(settings.excludePatterns)) return false;
        return true;
    }

    public applySettingChanges(): void {
        const settings = this.loadSettings();
        if (this.validateSettings(settings)) {
            this.saveSettings(settings);
        } else {
            vscode.window.showErrorMessage('Invalid settings');
        }
    }

    public handleWorkspaceSettings(): void {
        this.configuration = vscode.workspace.getConfiguration('windsurf');
    }
}

export default SettingsManager;
