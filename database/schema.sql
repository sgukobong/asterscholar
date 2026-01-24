-- Complete Database Schema for AsterScholar
-- This file contains the complete database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores user profile information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT CHECK (LENGTH(bio) <= 500),
    institution TEXT CHECK (LENGTH(institution) <= 200),
    research_interests TEXT[] DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity summary table
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

-- Projects table - for organizing research
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (LENGTH(title) <= 200),
    description TEXT CHECK (LENGTH(description) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved papers table
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
    notes TEXT CHECK (LENGTH(notes) <= 2000),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, paper_id)
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT CHECK (LENGTH(title) <= 200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL CHECK (LENGTH(query) <= 500),
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_papers_user_id ON saved_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_papers_project_id ON saved_papers(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activity summary update function
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

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Activity summary policies
CREATE POLICY "Users can view own activity" ON user_activity_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own activity" ON user_activity_summary FOR ALL USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Saved papers policies
CREATE POLICY "Users can manage own saved papers" ON saved_papers FOR ALL USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can manage own chat messages" ON chat_messages FOR ALL USING (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id)
);

-- Search history policies
CREATE POLICY "Users can manage own search history" ON search_history FOR ALL USING (auth.uid() = user_id);