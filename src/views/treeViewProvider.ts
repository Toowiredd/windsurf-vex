import * as vscode from 'vscode';
import ContextTracker from '../cascade/tracker';

class TreeViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private contextTracker: ContextTracker;

    constructor() {
        this.contextTracker = new ContextTracker();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve(this.getContextHistoryItems());
        } else {
            return Promise.resolve(this.getCurrentContextItems());
        }
    }

    private getCurrentContextItems(): vscode.TreeItem[] {
        const currentContext = this.contextTracker.getContextSummaries().slice(-1)[0];
        if (!currentContext) {
            return [new vscode.TreeItem('No current context')];
        }

        const items: vscode.TreeItem[] = [];
        currentContext.fileGroups.forEach(group => {
            const groupItem = new vscode.TreeItem(group.groupName, vscode.TreeItemCollapsibleState.Collapsed);
            group.files.forEach(file => {
                const fileItem = new vscode.TreeItem(file.filePath);
                groupItem.children = groupItem.children || [];
                groupItem.children.push(fileItem);
            });
            items.push(groupItem);
        });

        return items;
    }

    private getContextHistoryItems(): vscode.TreeItem[] {
        const contextSummaries = this.contextTracker.getContextSummaries();
        if (contextSummaries.length === 0) {
            return [new vscode.TreeItem('No context history')];
        }

        const items: vscode.TreeItem[] = [];
        contextSummaries.forEach(summary => {
            const summaryItem = new vscode.TreeItem(summary.contextName, vscode.TreeItemCollapsibleState.Collapsed);
            summary.fileGroups.forEach(group => {
                const groupItem = new vscode.TreeItem(group.groupName, vscode.TreeItemCollapsibleState.Collapsed);
                group.files.forEach(file => {
                    const fileItem = new vscode.TreeItem(file.filePath);
                    groupItem.children = groupItem.children || [];
                    groupItem.children.push(fileItem);
                });
                summaryItem.children = summaryItem.children || [];
                summaryItem.children.push(groupItem);
            });
            items.push(summaryItem);
        });

        return items;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const treeViewProvider = new TreeViewProvider();
    vscode.window.registerTreeDataProvider('windsurfContext', treeViewProvider);
    vscode.window.registerTreeDataProvider('windsurfHistory', treeViewProvider);

    vscode.commands.registerCommand('windsurf.refresh', () => treeViewProvider.refresh());
}

export function deactivate() {}
