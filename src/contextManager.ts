import * as vscode from 'vscode';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { createDatabaseClient, connectToDatabase } from './database';
import {
    Context,
    ContextType,
    ContextState,
    Memory,
    Conversation
} from './types';

export class ContextManager {
    private client: Client;
    private _onDidChangeContext: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeContext: vscode.Event<void> = this._onDidChangeContext.event;

    constructor() {
        this.client = createDatabaseClient();
    }

    async initialize(): Promise<void> {
        await connectToDatabase(this.client);
    }

    async getCurrentContext(): Promise<Context | null> {
        try {
            const result = await this.client.query(
                'SELECT * FROM contexts WHERE state = $1 ORDER BY updated_at DESC LIMIT 1',
                [ContextState.ACTIVE]
            );
            return result.rows[0] ? this.mapDatabaseContextToType(result.rows[0]) : null;
        } catch (error) {
            console.error('Error fetching current context:', error);
            throw error;
        }
    }

    async getAllContexts(): Promise<Context[]> {
        try {
            const result = await this.client.query(
                'SELECT * FROM contexts ORDER BY updated_at DESC'
            );
            return result.rows.map(row => this.mapDatabaseContextToType(row));
        } catch (error) {
            console.error('Error fetching contexts:', error);
            throw error;
        }
    }

    async createContext(name: string, type: ContextType, description: string): Promise<void> {
        try {
            const context: Context = {
                id: uuidv4(),
                name,
                type,
                state: ContextState.ACTIVE,
                description,
                projectRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                references: [],
                ideConfig: {},
                memories: [],
                conversations: [],
                relatedContexts: [],
                tags: new Set(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.client.query(
                'INSERT INTO contexts (id, name, type, state, description, project_root, data) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [context.id, context.name, context.type, context.state, context.description, context.projectRoot, JSON.stringify(context)]
            );
            this._onDidChangeContext.fire();
        } catch (error) {
            console.error('Error creating context:', error);
            throw error;
        }
    }

    async updateContext(contextId: string, updates: Partial<Context>): Promise<void> {
        try {
            const current = await this.getContextById(contextId);
            if (!current) {
                throw new Error('Context not found');
            }

            const updated = { ...current, ...updates, updatedAt: new Date() };
            await this.client.query(
                'UPDATE contexts SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(updated), contextId]
            );
            this._onDidChangeContext.fire();
        } catch (error) {
            console.error('Error updating context:', error);
            throw error;
        }
    }

    async addMemory(contextId: string, content: string): Promise<void> {
        try {
            const memory: Memory = {
                id: uuidv4(),
                content,
                contextId,
                references: [],
                tags: new Set(),
                createdAt: new Date(),
                updatedAt: new Date(),
                importance: 1,
                confidence: 1.0
            };

            const context = await this.getContextById(contextId);
            if (!context) {
                throw new Error('Context not found');
            }

            context.memories.push(memory);
            await this.updateContext(contextId, context);
        } catch (error) {
            console.error('Error adding memory:', error);
            throw error;
        }
    }

    async startThread(contextId: string, name: string): Promise<string> {
        try {
            const threadId = uuidv4();
            const context = await this.getContextById(contextId);
            if (!context) {
                throw new Error('Context not found');
            }

            context.activeThreadId = threadId;
            await this.updateContext(contextId, context);
            return threadId;
        } catch (error) {
            console.error('Error starting thread:', error);
            throw error;
        }
    }

    private async getContextById(id: string): Promise<Context | null> {
        try {
            const result = await this.client.query(
                'SELECT * FROM contexts WHERE id = $1',
                [id]
            );
            return result.rows[0] ? this.mapDatabaseContextToType(result.rows[0]) : null;
        } catch (error) {
            console.error('Error fetching context by id:', error);
            throw error;
        }
    }

    private mapDatabaseContextToType(row: any): Context {
        const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            tags: new Set(data.tags)
        };
    }

    dispose(): void {
        this.client.end();
    }
}
