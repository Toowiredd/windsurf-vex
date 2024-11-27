import * as vscode from 'vscode';
import { Context } from '../types';
import { ContextTreeItem } from '../views/treeViewProvider';

export function createContextTreeItem(context: Context): ContextTreeItem {
    return new ContextTreeItem(
        context,
        'context',
        vscode.TreeItemCollapsibleState.Expanded
    );
}
