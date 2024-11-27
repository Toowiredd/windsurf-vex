import * as vscode from 'vscode';

export interface AIInteraction {
    id: string;
    timestamp: Date;
    type: 'question' | 'solution' | 'realization' | 'problem' | 'next_step';
    content: string;
    files?: FileReference[];
    webReferences?: WebReference[];  // References to web resources
    result?: string;
    successful?: boolean;
    followUp?: string[];
    roadmapItemId?: string;
}

export interface FileReference {
    path: string;           // Absolute path to file
    projectRoot?: string;   // If from a specific project
    snippet?: {            // Optional code snippet
        startLine: number;
        endLine: number;
        content: string;
    };
    reason?: string;       // Why this file is referenced
    relevance?: string;    // How it relates to current task
}

export interface WebReference {
    url: string;
    title: string;
    type: 'documentation' | 'example' | 'discussion' | 'article' | 'github' | 'other';
    relevance: string;     // How this helps with the current task
    snippet?: string;      // Relevant excerpt if any
    timestamp: Date;       // When it was referenced
}

export interface SearchQuery {
    query: string;
    sources?: ('github' | 'stackoverflow' | 'docs' | 'web')[];
    filters?: {
        language?: string[];
        framework?: string[];
        timeframe?: string;  // e.g., 'last_year', 'last_month'
    };
    context?: {
        relatedFiles?: string[];
        codeSnippet?: string;
        errorMessage?: string;
    };
}

export interface SearchResult {
    source: string;
    url: string;
    title: string;
    snippet: string;
    relevance: number;     // 0-1 score
    language?: string;
    framework?: string;
    timestamp: Date;
    citations?: number;    // Number of references/upvotes
}

export interface WebSearchService {
    // Search across multiple sources
    search(query: SearchQuery): Promise<SearchResult[]>;
    
    // Search GitHub repositories and issues
    searchGitHub(query: SearchQuery): Promise<SearchResult[]>;
    
    // Search Stack Overflow
    searchStackOverflow(query: SearchQuery): Promise<SearchResult[]>;
    
    // Search framework/library documentation
    searchDocs(query: SearchQuery): Promise<SearchResult[]>;
    
    // Get related discussions for an error
    findErrorSolutions(error: string): Promise<SearchResult[]>;
    
    // Find example implementations
    findExamples(query: string, context?: string): Promise<SearchResult[]>;
    
    // Convert search result to WebReference
    saveAsReference(result: SearchResult): WebReference;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed' | 'blocked' | 'deferred';
    priority: number;
    dependencies?: string[];  // IDs of items this depends on
    children?: string[];      // IDs of sub-items
    parentId?: string;        // ID of parent item if any
    tags?: string[];         // For grouping/filtering
    estimatedEffort?: string; // Rough estimate of work involved
    learnings?: string[];    // Key learnings during implementation
    problems?: string[];     // Issues encountered
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectDirection {
    currentFocus: string;     // What you're working on now
    nextSteps: string[];      // Potential next steps
    openQuestions: string[];  // Things to figure out
    blockers: string[];       // Current problems
    currentRoadmapItem?: string; // ID of current roadmap item
}

export interface CodeQuery {
    query: string;            // What you want to know
    files?: string[];        // Specific files to look at
    excludePatterns?: string[]; // Files to ignore
}

export interface RoadmapService {
    // Generate initial roadmap from project goals
    generateRoadmap(goals: string[]): Promise<RoadmapItem[]>;
    
    // Add new item to roadmap
    addRoadmapItem(item: Partial<RoadmapItem>): Promise<RoadmapItem>;
    
    // Update existing item
    updateRoadmapItem(id: string, updates: Partial<RoadmapItem>): Promise<RoadmapItem>;
    
    // Get full roadmap tree
    getRoadmap(): Promise<RoadmapItem[]>;
    
    // Get current path (items leading to current focus)
    getCurrentPath(): Promise<RoadmapItem[]>;
    
    // Get suggested next items based on dependencies and status
    getNextItems(): Promise<RoadmapItem[]>;
    
    // Get blocked items and their blockers
    getBlockers(): Promise<{item: RoadmapItem, blockers: string[]}[]>;
    
    // Reorder roadmap items based on dependencies and priorities
    optimizeRoadmap(): Promise<RoadmapItem[]>;
    
    // Get all learnings for a specific roadmap item
    getItemLearnings(id: string): Promise<string[]>;
}

export interface InteractionService {
    // Record a new interaction with AI
    recordInteraction(interaction: Partial<AIInteraction>): Promise<AIInteraction>;
    
    // Find relevant past interactions
    findRelatedInteractions(query: string): Promise<AIInteraction[]>;
    
    // Update an interaction with results/learnings
    updateInteraction(id: string, updates: Partial<AIInteraction>): Promise<AIInteraction>;
    
    // Get project direction info
    getProjectDirection(): Promise<ProjectDirection>;
    
    // Update project direction
    updateProjectDirection(updates: Partial<ProjectDirection>): Promise<ProjectDirection>;
    
    // Query codebase without changes
    queryCode(query: CodeQuery): Promise<string[]>;
    
    // Get next steps based on history
    getNextSteps(): Promise<string[]>;
    
    // Get summary of what's been learned
    getLearnings(): Promise<string[]>;
    
    // Get interactions related to a roadmap item
    getRoadmapItemInteractions(itemId: string): Promise<AIInteraction[]>;
    
    // Add methods for web references
    addWebReference(interaction: string, reference: WebReference): Promise<void>;
    getWebReferences(query?: string): Promise<WebReference[]>;
    findSimilarReferences(url: string): Promise<WebReference[]>;
}

export interface ProjectScope {
    projectRoot: string;     // Absolute path to project
    configFolder: string;    // Path to .windsurf folder
    active: boolean;         // Whether this project is currently active
    referencedProjects?: {   // Other projects referenced by this one
        path: string;
        reason: string;
    }[];
}

export interface ProjectScopeService {
    getCurrentScope(): Promise<ProjectScope | null>;
    isInCurrentProject(filePath: string): boolean;
    getRelativePath(absolutePath: string): string;
    onProjectSwitch(callback: (newScope: ProjectScope | null) => void): void;
    ensureConfigFolder(): Promise<string>;
    getConversationPath(): string | null;
}

export interface AIConversation {
    id: string;
    timestamp: Date;
    summary: string;
    messages: AIMessage[];
    relatedFiles: string[];  // Paths MUST be relative to project root
    roadmapItemId?: string;
}

export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    codeChanges?: {
        file: string;        // MUST be relative to project root
        type: 'create' | 'modify' | 'delete';
        description: string;
    }[];
}

export interface ConversationService {
    // Store current conversation in project config
    storeConversation(conversation: AIConversation): Promise<void>;
    
    // Get conversations for current project
    getProjectConversations(): Promise<AIConversation[]>;
    
    // Get conversations related to specific files
    getConversationsForFiles(files: string[]): Promise<AIConversation[]>;
    
    // Get conversations related to roadmap item
    getConversationsForRoadmapItem(itemId: string): Promise<AIConversation[]>;
    
    // Search conversations by content/intent
    searchConversations(query: string): Promise<AIConversation[]>;
    
    // Get recent conversations
    getRecentConversations(limit?: number): Promise<AIConversation[]>;
    
    // Update conversation with outcome
    updateConversationOutcome(id: string, outcome: string): Promise<void>;
    
    // Get conversation history as context for AI
    getConversationContext(): Promise<string>;
}

export interface ConfigService {
    // Initialize or load project config
    initializeConfig(projectRoot: string): Promise<ProjectConfig>;
    
    // Save current state to config
    saveConfig(): Promise<void>;
    
    // Get current project config
    getConfig(): ProjectConfig;
    
    // Watch for external config changes
    watchConfig(callback: (config: ProjectConfig) => void): void;
    
    // Merge configs if multiple exist
    mergeConfigs(configs: ProjectConfig[]): Promise<ProjectConfig>;
}

export interface ProjectConfig {
    projectRoot: string;     // Absolute path to project
    configFolder: string;    // Path to .windsurf folder
    conversations: {         // Organized by date for easy access
        [date: string]: {
            [id: string]: AIConversation
        }
    };
    roadmap: RoadmapItem[];
    interactions: AIInteraction[];
    direction: ProjectDirection;
}

export interface Memory {
    id: string;
    content: string;
    contextId: string;
    references: string[];
    tags: Set<string>;
    createdAt: Date;
    updatedAt: Date;
    importance: number;
    confidence: number;
}

export interface MemoryService {
    getMemories(): Promise<Memory[]>;
}

export interface CodeAnalysis {
    // Define properties and methods for CodeAnalysis
}

export interface CodeAnalysisService {
    analyze(document: vscode.TextDocument): Promise<CodeAnalysis>;
}

export class ConversationService {
    async getRecentConversations(limit: number): Promise<AIConversation[]> {
        return [];
    }
}

export class InteractionService {
    async getNextSteps(): Promise<string[]> {
        return [];
    }
}

export class RoadmapService {
    async getRoadmap(): Promise<RoadmapItem[]> {
        return [];
    }

    async getBlockers(): Promise<{item: RoadmapItem, blockers: string[]}[]> {
        return [];
    }
}

export class WebSearchService {
    async search(query: SearchQuery): Promise<SearchResult[]> {
        return [];
    }
}

export class ConfigService {
    async initializeConfig(projectRoot: string): Promise<ProjectConfig> {
        return {
            projectRoot,
            configFolder: '',
            conversations: {},
            roadmap: [],
            interactions: [],
            direction: {
                currentFocus: '',
                nextSteps: [],
                openQuestions: [],
                blockers: [],
            },
        };
    }
}

export class MemoryService {
    async getMemories(): Promise<Memory[]> {
        return [];
    }
}

export class CodeAnalysisService {
    async analyze(document: vscode.TextDocument): Promise<CodeAnalysis> {
        return {};
    }
}
