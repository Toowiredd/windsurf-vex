import * as vscode from 'vscode';
import { ContextManager } from './contextManager';
import { ContextTreeProvider } from './views/treeViewProvider';
import { CommandHandler } from './commands';
import { QuickActionMenu } from './views/quickActionMenu';
import { createContextTreeItem } from './utils/treeItemHelper';
import { showQuickActionMenu } from './quickActions'; // Import the quick action menu function

export async function activate(context: vscode.ExtensionContext) {
    try {
        // Initialize context manager
        const contextManager = new ContextManager();
        await contextManager.initialize();

        // Initialize tree view
        const treeProvider = new ContextTreeProvider(contextManager);
        const treeView = vscode.window.createTreeView('windsurfContext', {
            treeDataProvider: treeProvider
        });

        // Initialize command handler
        const commandHandler = new CommandHandler(contextManager, treeProvider);

        // Initialize quick action menu
        const quickActionMenu = new QuickActionMenu(commandHandler, contextManager);

        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('windsurf.createContext', () => 
                commandHandler.createContext()),
            vscode.commands.registerCommand('windsurf.switchContext', (item) => 
                commandHandler.switchContext(item)),
            vscode.commands.registerCommand('windsurf.addMemory', (item) => 
                commandHandler.addMemory(item)),
            vscode.commands.registerCommand('windsurf.startThread', (item) => 
                commandHandler.startThread(item)),
            vscode.commands.registerCommand('windsurf.changeContextState', (item) => 
                commandHandler.changeContextState(item)),
            vscode.commands.registerCommand('windsurf.deleteContext', (item) => 
                commandHandler.deleteContext(item)),
            vscode.commands.registerCommand('windsurf.refresh', () => 
                commandHandler.refreshContexts()),
            // Add new commands from CodeCortex integration
            vscode.commands.registerCommand('windsurf.analyzeCurrentFile', () => 
                commandHandler.analyzeCurrentFile()),
            vscode.commands.registerCommand('windsurf.consolidateMemories', (item) => 
                commandHandler.consolidateMemories(item)),
            // Quick action menu commands
            vscode.commands.registerCommand('windsurf.showQuickActions', () => 
                quickActionMenu.showQuickActions()),
            vscode.commands.registerCommand('windsurf.quickAddMemory', async () => {
                const currentContext = await contextManager.getCurrentContext();
                if (currentContext) {
                    await commandHandler.addMemory(createContextTreeItem(currentContext));
                }
            }),
            vscode.commands.registerCommand('windsurf.quickSwitchContext', async () => {
                const contexts = await contextManager.getAllContexts();
                const items = contexts.map(ctx => ({
                    label: ctx.name,
                    description: ctx.type,
                    context: ctx
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select context to switch to'
                });

                if (selected) {
                    await commandHandler.switchContext(createContextTreeItem(selected.context));
                }
            }),
            treeView,
            vscode.commands.registerCommand('windsurf.showQuickActions', () => showQuickActionMenu())
        );

        // Register file change listener for automatic memory updates
        const fileWatcher = vscode.workspace.onDidChangeTextDocument(async event => {
            const currentContext = await contextManager.getCurrentContext();
            if (currentContext && event.document === vscode.window.activeTextEditor?.document) {
                await commandHandler.addMemory(createContextTreeItem(currentContext));
            }
        });

        // Add context manager, quick action menu, and file watcher to extension subscriptions for cleanup
        context.subscriptions.push(
            {
                dispose: () => {
                    contextManager.dispose();
                    quickActionMenu.dispose();
                }
            },
            fileWatcher
        );

        console.log('Windsurf extension activated with quick actions menu');
    } catch (error) {
        console.error('Error activating extension:', error);
        vscode.window.showErrorMessage('Failed to activate Windsurf extension');
    }
}
