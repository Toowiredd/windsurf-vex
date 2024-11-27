import { Client } from 'pg';
import { Context, Memory } from './types';

export function createDatabaseClient(): Client {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return new Client({ connectionString });
}

export async function connectToDatabase(client: Client): Promise<void> {
    try {
        await client.connect();
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

export async function createContext(client: Client, context: Context): Promise<void> {
    const query = `
        INSERT INTO contexts (id, name, type, state, description, project_root, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
        context.id,
        context.name,
        context.type,
        context.state,
        context.description,
        context.projectRoot,
        JSON.stringify(context)
    ];

    try {
        await client.query(query, values);
    } catch (error) {
        console.error('Error creating context:', error);
        throw error;
    }
}

export async function updateContext(client: Client, context: Context): Promise<void> {
    const query = `
        UPDATE contexts
        SET name = $2, type = $3, state = $4, description = $5,
            project_root = $6, data = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `;
    const values = [
        context.id,
        context.name,
        context.type,
        context.state,
        context.description,
        context.projectRoot,
        JSON.stringify(context)
    ];

    try {
        await client.query(query, values);
    } catch (error) {
        console.error('Error updating context:', error);
        throw error;
    }
}

export async function getContextById(client: Client, id: string): Promise<Context | null> {
    const query = 'SELECT * FROM contexts WHERE id = $1';
    try {
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) return null;
        return mapDatabaseContextToType(result.rows[0]);
    } catch (error) {
        console.error('Error getting context:', error);
        throw error;
    }
}

export async function getAllContexts(client: Client): Promise<Context[]> {
    const query = 'SELECT * FROM contexts ORDER BY updated_at DESC';
    try {
        const result = await client.query(query);
        return result.rows.map(mapDatabaseContextToType);
    } catch (error) {
        console.error('Error getting all contexts:', error);
        throw error;
    }
}

export async function addMemory(client: Client, memory: Memory): Promise<void> {
    const query = `
        INSERT INTO memories (id, context_id, content, references, tags, importance, thread_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
        memory.id,
        memory.contextId,
        memory.content,
        JSON.stringify(memory.references),
        Array.from(memory.tags),
        memory.importance,
        memory.threadId
    ];

    try {
        await client.query(query, values);
    } catch (error) {
        console.error('Error adding memory:', error);
        throw error;
    }
}

export async function getContextMemories(client: Client, contextId: string): Promise<Memory[]> {
    const query = 'SELECT * FROM memories WHERE context_id = $1 ORDER BY created_at DESC';
    try {
        const result = await client.query(query, [contextId]);
        return result.rows.map(mapDatabaseMemoryToType);
    } catch (error) {
        console.error('Error getting context memories:', error);
        throw error;
    }
}

function mapDatabaseContextToType(row: any): Context {
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    return {
        ...data,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        tags: new Set(data.tags || [])
    };
}

function mapDatabaseMemoryToType(row: any): Memory {
    return {
        id: row.id,
        contextId: row.context_id,
        content: row.content,
        references: row.references || [],
        tags: new Set(row.tags || []),
        importance: row.importance || 1,
        confidence: row.confidence || 1.0,
        threadId: row.thread_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    };
}
