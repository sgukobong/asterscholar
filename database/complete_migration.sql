-- Complete Migration with RLS Policies
-- Run this in Supabase SQL Editor

-- Create profiles table (avoiding conflict with existing users table)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    institution TEXT,
    research_interests TEXT[],
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create user_activity_summary table
CREATE TABLE IF NOT EXISTS user_activity_summary (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Enable RLS on user_activity_summary table
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity_summary table
CREATE POLICY "Users can view own activity" ON user_activity_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON user_activity_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity" ON user_activity_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- Create other tables with RLS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS saved_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

ALTER TABLE saved_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved papers" ON saved_papers
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM chat_sessions WHERE id = session_id));

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- Create function with proper security
CREATE OR REPLACE FUNCTION update_activity_summary(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
    -- Only allow users to update their own activity
    IF auth.uid() != user_uuid THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
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