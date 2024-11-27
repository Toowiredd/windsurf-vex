-- Drop old tables if they exist
DROP TABLE IF EXISTS contexts CASCADE;
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS roadmaps CASCADE;

-- Create contexts table
CREATE TABLE contexts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    description TEXT,
    project_root TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create memories table
CREATE TABLE memories (
    id UUID PRIMARY KEY,
    context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    references JSONB,
    tags TEXT[],
    importance INTEGER DEFAULT 1,
    thread_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
    messages JSONB,
    summary TEXT,
    decisions TEXT[],
    action_items TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY,
    roadmap_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    dependencies UUID[],
    tasks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create roadmaps table
CREATE TABLE roadmaps (
    id UUID PRIMARY KEY,
    context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_contexts_state ON contexts(state);
CREATE INDEX idx_contexts_type ON contexts(type);
CREATE INDEX idx_memories_context_id ON memories(context_id);
CREATE INDEX idx_conversations_context_id ON conversations(context_id);
CREATE INDEX idx_roadmaps_context_id ON roadmaps(context_id);
CREATE INDEX idx_milestones_roadmap_id ON milestones(roadmap_id);
