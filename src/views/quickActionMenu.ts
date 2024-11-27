import * as vscode from 'vscode';
import { CommandHandler } from '../commands';
import { ContextManager } from '../contextManager';
import { createContextTreeItem } from '../utils/treeItemHelper';

export class QuickActionMenu {
    private statusBarItems: vscode.StatusBarItem[] = [];
    private floatingButton: vscode.StatusBarItem;

    constructor(
        private commandHandler: CommandHandler,
        private contextManager: ContextManager
    ) {
        // Create main floating action button
        this.floatingButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            1000
        );
        this.floatingButton.text = "$(brain) Windsurf";
        this.floatingButton.tooltip = "Quick Actions Menu";
        this.floatingButton.command = 'windsurf.showQuickActions';
        this.floatingButton.show();

        // Create quick action status bar items
        this.createQuickActionButtons();
    }

    private createQuickActionButtons() {
        // Add Memory button
        const addMemoryButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            999
        );
        addMemoryButton.text = "$(bookmark) Add Memory";
        addMemoryButton.tooltip = "Add current file/selection to context memory";
        addMemoryButton.command = 'windsurf.quickAddMemory';
        this.statusBarItems.push(addMemoryButton);

        // Analyze Code button
        const analyzeButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            998
        );
        analyzeButton.text = "$(microscope) Analyze";
        analyzeButton.tooltip = "Analyze current file";
        analyzeButton.command = 'windsurf.analyzeCurrentFile';
        this.statusBarItems.push(analyzeButton);

        // Context Switch button
        const switchButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            997
        );
        switchButton.text = "$(git-branch) Context";
        switchButton.tooltip = "Switch Context";
        switchButton.command = 'windsurf.quickSwitchContext';
        this.statusBarItems.push(switchButton);
    }

    public async showQuickActions() {
        const currentContext = await this.contextManager.getCurrentContext();
        const contextName = currentContext ? currentContext.name : 'No active context';

        const items = [
            {
                label: '$(bookmark) Add Memory',
                description: 'Add current file/selection to context',
                action: async () => {
                    if (currentContext) {
                        await this.commandHandler.addMemory(createContextTreeItem(currentContext));
                    } else {
                        vscode.window.showErrorMessage('No active context. Create or activate a context first.');
                    }
                }
            },
            {
                label: '$(microscope) Analyze Code',
                description: 'Analyze current file',
                action: () => this.commandHandler.analyzeCurrentFile()
            },
            {
                label: '$(git-branch) Switch Context',
                description: 'Quick switch between contexts',
                action: async () => {
                    const contexts = await this.contextManager.getAllContexts();
                    const items = contexts.map(ctx => ({
                        label: ctx.name,
                        description: ctx.type,
                        context: ctx
                    }));

                    const selected = await vscode.window.showQuickPick(items, {
                        placeHolder: 'Select context to switch to'
                    });

                    if (selected) {
                        await this.commandHandler.switchContext(createContextTreeItem(selected.context));
                    }
                }
            },
            {
                label: '$(add) New Context',
                description: 'Create a new context',
                action: () => this.commandHandler.createContext()
            },
            {
                label: '$(notebook) Consolidate Memories',
                description: 'Clean up and organize context memories',
                action: async () => {
                    if (currentContext) {
                        await this.commandHandler.consolidateMemories(createContextTreeItem(currentContext));
                    }
                }
            }
        ];

        // Show current context in status bar
        vscode.window.setStatusBarMessage(`Current Context: ${contextName}`, 3000);

        // Show quick pick menu
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Current Context: ${contextName}`,
            matchOnDescription: true
        });

        if (selected) {
            await selected.action();
        }
    }

    public toggleQuickActionButtons(show: boolean) {
        this.statusBarItems.forEach(item => {
            if (show) {
                item.show();
            } else {
                item.hide();
            }
        });
    }

    public dispose() {
        this.floatingButton.dispose();
        this.statusBarItems.forEach(item => item.dispose());
    }
}
