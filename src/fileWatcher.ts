import * as chokidar from 'chokidar';
import * as vscode from 'vscode';

export class FileWatcher {
  private watcher: chokidar.FSWatcher;

  constructor(private context: vscode.ExtensionContext) {
    const excludePatterns = vscode.workspace.getConfiguration('windsurf').get<string[]>('excludePatterns', [
      '**/node_modules/**',
      '**/.git/**',
      '**/.vscode/**',
      '**/out/**'
    ]);

    this.watcher = chokidar.watch(vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [], {
      ignored: excludePatterns,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('add', this.onFileChange.bind(this))
      .on('change', this.onFileChange.bind(this))
      .on('unlink', this.onFileChange.bind(this));
  }

  private onFileChange(path: string) {
    // Implement logic to handle file changes
    vscode.window.showInformationMessage(`File changed: ${path}`);
    // Update context based on file changes
  }

  public dispose() {
    this.watcher.close();
  }
}
