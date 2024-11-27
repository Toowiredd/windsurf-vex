import * as vscode from 'vscode';
import { Memory, Context, CodeReference } from '../types';
import { CodeAnalysisService } from './codeAnalysisService';

interface ShortTermMemory {
    content: string;
    timestamp: Date;
    filePath: string;
}

export class MemoryService {
    private shortTermMemories: ShortTermMemory[] = [];
    private codeAnalysisService: CodeAnalysisService;
    private readonly MAX_SHORT_TERM_MEMORIES = 10;

    constructor() {
        this.codeAnalysisService = new CodeAnalysisService();
    }

    public async processFileChange(document: vscode.TextDocument, context: Context): Promise<Memory> {
        // Update short-term memory
        this.updateShortTermMemory({
            content: document.getText(),
            timestamp: new Date(),
            filePath: document.fileName
        });

        // Generate memory using code analysis
        return await this.codeAnalysisService.analyzeFileForContext(document, context);
    }

    public updateShortTermMemory(memory: ShortTermMemory): void {
        // Add new memory to the front
        this.shortTermMemories.unshift(memory);

        // Keep only the most recent memories
        if (this.shortTermMemories.length > this.MAX_SHORT_TERM_MEMORIES) {
            this.shortTermMemories.pop();
        }
    }

    public getRecentMemories(): ShortTermMemory[] {
        return this.shortTermMemories;
    }

    public findRelatedMemories(context: Context, query: string): Memory[] {
        // Simple implementation - can be enhanced with more sophisticated matching
        return context.memories.filter(memory => {
            const content = memory.content.toLowerCase();
            const queryLower = query.toLowerCase();
            return content.includes(queryLower);
        });
    }

    public consolidateMemories(context: Context): Memory[] {
        const consolidated: Memory[] = [];
        const groupedByFile = new Map<string, Memory[]>();

        // Group memories by file
        context.memories.forEach(memory => {
            memory.references.forEach(ref => {
                const memories = groupedByFile.get(ref.filePath) || [];
                memories.push(memory);
                groupedByFile.set(ref.filePath, memories);
            });
        });

        // Consolidate memories for each file
        groupedByFile.forEach((memories, filePath) => {
            if (memories.length > 1) {
                consolidated.push(this.mergeMemories(memories, filePath));
            } else {
                consolidated.push(memories[0]);
            }
        });

        return consolidated;
    }

    private mergeMemories(memories: Memory[], filePath: string): Memory {
        const allTags = new Set<string>();
        let maxImportance = 0;
        let mergedContent = '';

        memories.forEach(memory => {
            memory.tags.forEach(tag => allTags.add(tag));
            maxImportance = Math.max(maxImportance, memory.importance);
            mergedContent += memory.content + '\n';
        });

        const references: CodeReference[] = memories
            .flatMap(m => m.references)
            .filter(ref => ref.filePath === filePath);

        return {
            id: memories[0].id, // Use the ID of the first memory
            contextId: memories[0].contextId,
            content: mergedContent.trim(),
            references,
            tags: allTags,
            importance: maxImportance,
            confidence: memories.reduce((acc, m) => acc + m.confidence, 0) / memories.length,
            createdAt: new Date(Math.min(...memories.map(m => m.createdAt.getTime()))),
            updatedAt: new Date()
        };
    }
}
