export enum ContextType {
    PROJECT = "project",
    TASK = "task",
    CONVERSATION = "conversation",
    RESEARCH = "research",
    IMPLEMENTATION = "implementation",
    BUGFIX = "bugfix",
    FEATURE = "feature",
    DOCUMENTATION = "documentation",
    MEETING = "meeting",
    CODE_QUALITY = "code_quality",
    OTHER = "other"
}

export enum ContextState {
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    ARCHIVED = "archived"
}

export interface CodeReference {
    filePath: string;
    startLine: number;
    endLine: number;
}

export interface Memory {
    id: string;
    content: string;
    contextId: string;
    references: CodeReference[];
    tags: Set<string>;
    createdAt: Date;
    updatedAt: Date;
    importance: number;
    confidence: number;
    threadId?: string;
}

export interface Conversation {
    id: string;
    contextId: string;
    messages: any[];
    summary?: string;
    decisions: string[];
    actionItems: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
    completedAt?: Date;
    dependencies: string[];
    tasks: string[];
}

export interface Roadmap {
    id: string;
    contextId: string;
    title: string;
    description: string;
    milestones: Milestone[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Context {
    id: string;
    name: string;
    type: ContextType;
    state: ContextState;
    description: string;
    projectRoot: string;
    references: CodeReference[];
    ideConfig: Record<string, any>;
    memories: Memory[];
    conversations: Conversation[];
    roadmap?: Roadmap;
    relatedContexts: string[];
    tags: Set<string>;
    createdAt: Date;
    updatedAt: Date;
    activeThreadId?: string;
}
