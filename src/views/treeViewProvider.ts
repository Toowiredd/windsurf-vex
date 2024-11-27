import * as vscode from 'vscode';
import { ContextManager } from '../contextManager';
import { Context, ContextState } from '../types';

export class ContextTreeItem extends vscode.TreeItem {
    constructor(
        public readonly context: Context,
        public readonly type: 'context' | 'memory' | 'conversation' | 'milestone' | 'thread',
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(context.name, collapsibleState);

        if (type === 'context') {
            this.iconPath = new vscode.ThemeIcon(this.getContextIcon(context));
            this.description = `${context.type} - ${context.state}`;
            this.tooltip = this.buildContextTooltip(context);
        } else if (type === 'memory') {
            this.iconPath = new vscode.ThemeIcon('lightbulb');
        } else if (type === 'conversation') {
            this.iconPath = new vscode.ThemeIcon('comment-discussion');
        } else if (type === 'milestone') {
            this.iconPath = new vscode.ThemeIcon('milestone');
        } else if (type === 'thread') {
            this.iconPath = new vscode.ThemeIcon('git-branch');
        }
    }

    private getContextIcon(context: Context): string {
        switch (context.state) {
            case ContextState.ACTIVE:
                return 'play-circle';
            case ContextState.PAUSED:
                return 'debug-pause';
            case ContextState.COMPLETED:
                return 'check';
            case ContextState.ARCHIVED:
                return 'archive';
            default:
                return 'circle-outline';
        }
    }

    private buildContextTooltip(context: Context): string {
        return [
            `Type: ${context.type}`,
            `State: ${context.state}`,
            `Description: ${context.description}`,
            `Created: ${context.createdAt.toLocaleDateString()}`,
            `Updated: ${context.updatedAt.toLocaleDateString()}`
        ].join('\n');
    }
}

export class ContextTreeProvider implements vscode.TreeDataProvider<ContextTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ContextTreeItem | undefined | null | void> = new vscode.EventEmitter<ContextTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ContextTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private contextManager: ContextManager) {
        this.contextManager.onDidChangeContext(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContextTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ContextTreeItem): Promise<ContextTreeItem[]> {
        if (!element) {
            const contexts = await this.contextManager.getAllContexts();
            return contexts.map(context => new ContextTreeItem(
                context,
                'context',
                vscode.TreeItemCollapsibleState.Collapsed
            ));
        }

        if (element.type === 'context') {
            const items: ContextTreeItem[] = [];

            // Add memories group
            if (element.context.memories.length > 0) {
                items.push(new ContextTreeItem(
                    { ...element.context, name: 'Memories' },
                    'memory',
                    vscode.TreeItemCollapsibleState.Collapsed
                ));
            }

            // Add conversations group
            if (element.context.conversations.length > 0) {
                items.push(new ContextTreeItem(
                    { ...element.context, name: 'Conversations' },
                    'conversation',
                    vscode.TreeItemCollapsibleState.Collapsed
                ));
            }

            // Add milestones group
            if (element.context.roadmap?.milestones.length) {
                items.push(new ContextTreeItem(
                    { ...element.context, name: 'Milestones' },
                    'milestone',
                    vscode.TreeItemCollapsibleState.Collapsed
                ));
            }

            // Add active thread if exists
            if (element.context.activeThreadId) {
                items.push(new ContextTreeItem(
                    { ...element.context, name: 'Active Thread' },
                    'thread',
                    vscode.TreeItemCollapsibleState.None
                ));
            }

            return items;
        }

        if (element.type === 'memory') {
            return element.context.memories.map(memory => new ContextTreeItem(
                { ...element.context, name: this.truncateText(memory.content) },
                'memory',
                vscode.TreeItemCollapsibleState.None
            ));
        }

        if (element.type === 'conversation') {
            return element.context.conversations.map(conv => new ContextTreeItem(
                { ...element.context, name: conv.summary || 'Conversation' },
                'conversation',
                vscode.TreeItemCollapsibleState.None
            ));
        }

        if (element.type === 'milestone') {
            return element.context.roadmap!.milestones.map(milestone => new ContextTreeItem(
                { ...element.context, name: milestone.title },
                'milestone',
                vscode.TreeItemCollapsibleState.None
            ));
        }

        return [];
    }

    private truncateText(text: string, maxLength: number = 50): string {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Register TreeView provider in the extension activation function
export function activate(context: vscode.ExtensionContext) {
    const contextManager = new ContextManager();
    const contextTreeProvider = new ContextTreeProvider(contextManager);
    vscode.window.registerTreeDataProvider('windsurfContext', contextTreeProvider);
    vscode.commands.registerCommand('windsurf.refresh', () => contextTreeProvider.refresh());

    context.subscriptions.push(
        vscode.window.createTreeView('windsurfContext', { treeDataProvider: contextTreeProvider })
    );
}
