import * as vscode from 'vscode';
import { ContextManager } from './contextManager';
import { ContextTreeProvider, ContextTreeItem } from './views/treeViewProvider';
import { Context, ContextType, ContextState } from './types';
import { CodeAnalysisService } from './services/codeAnalysisService';
import { MemoryService } from './services/memoryService';

export class CommandHandler {
    private codeAnalysisService: CodeAnalysisService;
    private memoryService: MemoryService;

    constructor(
        private contextManager: ContextManager,
        private treeProvider: ContextTreeProvider
    ) {
        this.codeAnalysisService = new CodeAnalysisService();
        this.memoryService = new MemoryService();
    }

    async createContext() {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter context name',
            placeHolder: 'e.g., Feature: User Authentication'
        });
        if (!name) return;

        const typeOptions = Object.values(ContextType);
        const type = await vscode.window.showQuickPick(typeOptions, {
            placeHolder: 'Select context type'
        });
        if (!type) return;

        const description = await vscode.window.showInputBox({
            prompt: 'Enter context description',
            placeHolder: 'Brief description of the context'
        });
        if (!description) return;

        await this.contextManager.createContext(name, type as ContextType, description);
        vscode.window.showInformationMessage(`Created new context: ${name}`);
    }

    async switchContext(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const context = item.context;

        // Update all other contexts to PAUSED
        const contexts = await this.contextManager.getAllContexts();
        for (const ctx of contexts) {
            if (ctx.id !== context.id && ctx.state === ContextState.ACTIVE) {
                await this.contextManager.updateContext(ctx.id, { state: ContextState.PAUSED });
            }
        }

        // Activate selected context
        await this.contextManager.updateContext(context.id, {
            state: ContextState.ACTIVE
        });

        vscode.window.showInformationMessage(`Switched to context: ${context.name}`);
    }

    async addMemory(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Use code analysis to generate memory content
            const memory = await this.memoryService.processFileChange(editor.document, item.context);
            await this.contextManager.addMemory(item.context.id, memory.content);
            vscode.window.showInformationMessage('Memory added with code analysis');
        } else {
            // Fallback to manual memory input
            const content = await vscode.window.showInputBox({
                prompt: 'Enter memory content',
                placeHolder: 'What would you like to remember about this context?'
            });
            if (!content) return;

            await this.contextManager.addMemory(item.context.id, content);
            vscode.window.showInformationMessage('Memory added successfully');
        }
    }

    async startThread(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const name = await vscode.window.showInputBox({
            prompt: 'Enter thread name',
            placeHolder: 'e.g., Bug Investigation'
        });
        if (!name) return;

        const threadId = await this.contextManager.startThread(item.context.id, name);
        vscode.window.showInformationMessage(`Started new thread: ${name}`);
    }

    async changeContextState(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const stateOptions = Object.values(ContextState);
        const newState = await vscode.window.showQuickPick(stateOptions, {
            placeHolder: 'Select new state'
        });
        if (!newState) return;

        await this.contextManager.updateContext(item.context.id, {
            state: newState as ContextState
        });

        vscode.window.showInformationMessage(`Changed context state to: ${newState}`);
    }

    async refreshContexts() {
        this.treeProvider.refresh();
    }

    async deleteContext(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to delete context: ${item.context.name}?`,
            { modal: true },
            'Yes',
            'No'
        );

        if (confirm !== 'Yes') return;

        await this.contextManager.updateContext(item.context.id, {
            state: ContextState.ARCHIVED
        });

        vscode.window.showInformationMessage(`Archived context: ${item.context.name}`);
    }

    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to analyze');
            return;
        }

        const currentContext = await this.contextManager.getCurrentContext();
        if (!currentContext) {
            vscode.window.showErrorMessage('No active context found');
            return;
        }

        const analysis = this.codeAnalysisService.analyzeCode(
            editor.document.getText(),
            editor.document.fileName
        );

        const detail = [
            `Summary: ${analysis.summary}`,
            `Complexity: ${analysis.complexity}`,
            `Dependencies: ${analysis.dependencies.join(', ')}`,
            `Tags: ${analysis.suggestedTags.join(', ')}`
        ].join('\n');

        vscode.window.showInformationMessage('Code Analysis Complete', { detail });
    }

    async consolidateMemories(item: ContextTreeItem) {
        if (!item || item.type !== 'context') {
            vscode.window.showErrorMessage('Please select a valid context');
            return;
        }

        const consolidated = this.memoryService.consolidateMemories(item.context);
        const originalCount = item.context.memories.length;
        const consolidatedCount = consolidated.length;

        if (consolidatedCount < originalCount) {
            await this.contextManager.updateContext(item.context.id, {
                memories: consolidated
            });
            vscode.window.showInformationMessage(
                `Consolidated ${originalCount} memories into ${consolidatedCount} memories`
            );
        } else {
            vscode.window.showInformationMessage('No memories needed consolidation');
        }
    }
}
