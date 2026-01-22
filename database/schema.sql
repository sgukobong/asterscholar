-- Asterscholar Database Schema
-- Academic Research Platform with AI-powered tools

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    institution TEXT,
    research_interests TEXT[],
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'scholar', 'institution')),
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity summary for dashboard
CREATE TABLE user_activity_summary (
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

-- Research projects for organizing work
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved papers from reference finder
CREATE TABLE saved_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    paper_id TEXT NOT NULL, -- External paper ID from Semantic Scholar
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

-- Chat sessions for co-pilot conversations
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB, -- For storing citations, sources, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paraphrasing history
CREATE TABLE paraphrase_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL,
    paraphrased_text TEXT NOT NULL,
    style TEXT, -- academic, casual, formal, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history for analytics and quick access
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for subscription limits
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- 'search', 'chat', 'paraphrase'
    count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature, date)
);

-- Subscription management
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'scholar', 'institution')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_saved_papers_user_id ON saved_papers(user_id);
CREATE INDEX idx_saved_papers_project_id ON saved_papers(project_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_paraphrase_history_user_id ON paraphrase_history(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, date);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_user_activity_summary_user_id ON user_activity_summary(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE paraphrase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity summary" ON user_activity_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own activity summary" ON user_activity_summary FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved papers" ON saved_papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON chat_messages FOR ALL USING (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id)
);
CREATE POLICY "Users can manage own paraphrase history" ON paraphrase_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own search history" ON search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage tracking" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_activity_summary_updated_at BEFORE UPDATE ON user_activity_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_usage(user_uuid UUID, feature_name TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO usage_tracking (user_id, feature, count, date)
    VALUES (user_uuid, feature_name, 1, CURRENT_DATE)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_tracking.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update activity summary
CREATE OR REPLACE FUNCTION update_activity_summary(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
    INSERT INTO user_activity_summary (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE user_activity_summary SET
        total_searches = (SELECT COALESCE(SUM(count), 0) FROM usage_tracking WHERE user_id = user_uuid AND feature = 'search'),
        total_papers_saved = (SELECT COUNT(*) FROM saved_papers WHERE user_id = user_uuid),
        total_chat_sessions = (SELECT COUNT(*) FROM chat_sessions WHERE user_id = user_uuid),
        total_paraphrases = (SELECT COALESCE(SUM(count), 0) FROM usage_tracking WHERE user_id = user_uuid AND feature = 'paraphrase'),
        current_month_searches = (SELECT COALESCE(SUM(count), 0) FROM usage_tracking WHERE user_id = user_uuid AND feature = 'search' AND date >= current_month_start),
        current_month_papers_saved = (SELECT COUNT(*) FROM saved_papers WHERE user_id = user_uuid AND created_at >= current_month_start),
        current_month_chat_sessions = (SELECT COUNT(*) FROM chat_sessions WHERE user_id = user_uuid AND created_at >= current_month_start),
        current_month_paraphrases = (SELECT COALESCE(SUM(count), 0) FROM usage_tracking WHERE user_id = user_uuid AND feature = 'paraphrase' AND date >= current_month_start),
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;