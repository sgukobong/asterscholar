-- Migration: Add missing columns to existing users table
-- Run this in Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS research_interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create missing tables
CREATE TABLE IF NOT EXISTS user_activity_summary (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_searches INTEGER DEFAULT 0,
    total_papers_saved INTEGER DEFAULT 0,
    total_chat_sessions INTEGER DEFAULT 0,
    total_paraphrases INTEGER DEFAULT 0,
    current_month_searches INTEGER DEFAULT 0,
    current_month_papers_saved INTEGER DEFAULT 0,
    current_month_chat_sessions INTEGER DEFAULT 0,
    current_month_paraphrases INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    paper_id TEXT NOT NULL,
    title TEXT NOT NULL,
    authors JSONB,
    abstract TEXT,
    venue TEXT,
    year INTEGER,
    citation_count INTEGER,
    url TEXT,
    doi TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function
CREATE OR REPLACE FUNCTION update_activity_summary(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
    INSERT INTO user_activity_summary (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE user_activity_summary SET
        total_searches = (SELECT COUNT(*) FROM search_history WHERE user_id = user_uuid),
        total_papers_saved = (SELECT COUNT(*) FROM saved_papers WHERE user_id = user_uuid),
        total_chat_sessions = (SELECT COUNT(*) FROM chat_sessions WHERE user_id = user_uuid),
        current_month_searches = (SELECT COUNT(*) FROM search_history WHERE user_id = user_uuid AND created_at >= current_month_start),
        current_month_papers_saved = (SELECT COUNT(*) FROM saved_papers WHERE user_id = user_uuid AND created_at >= current_month_start),
        current_month_chat_sessions = (SELECT COUNT(*) FROM chat_sessions WHERE user_id = user_uuid AND created_at >= current_month_start),
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;