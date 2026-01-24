export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    institution: string | null;
                    research_interests: string[] | null;
                    subscription_tier: 'free' | 'scholar' | 'institution';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    institution?: string | null;
                    research_interests?: string[] | null;
                    subscription_tier?: 'free' | 'scholar' | 'institution';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    institution?: string | null;
                    research_interests?: string[] | null;
                    subscription_tier?: 'free' | 'scholar' | 'institution';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            projects: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            saved_papers: {
                Row: {
                    id: string;
                    user_id: string;
                    project_id: string | null;
                    paper_id: string;
                    title: string;
                    authors: any;
                    abstract: string | null;
                    venue: string | null;
                    year: number | null;
                    citation_count: number | null;
                    url: string | null;
                    doi: string | null;
                    notes: string | null;
                    tags: string[] | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    project_id?: string | null;
                    paper_id: string;
                    title: string;
                    authors?: any;
                    abstract?: string | null;
                    venue?: string | null;
                    year?: number | null;
                    citation_count?: number | null;
                    url?: string | null;
                    doi?: string | null;
                    notes?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    project_id?: string | null;
                    paper_id?: string;
                    title?: string;
                    authors?: any;
                    abstract?: string | null;
                    venue?: string | null;
                    year?: number | null;
                    citation_count?: number | null;
                    url?: string | null;
                    doi?: string | null;
                    notes?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                };
            };
            chat_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    project_id: string | null;
                    title: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    project_id?: string | null;
                    title?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    project_id?: string | null;
                    title?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            chat_messages: {
                Row: {
                    id: string;
                    session_id: string;
                    role: 'user' | 'assistant';
                    content: string;
                    metadata: any | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    role: 'user' | 'assistant';
                    content: string;
                    metadata?: any | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    session_id?: string;
                    role?: 'user' | 'assistant';
                    content?: string;
                    metadata?: any | null;
                    created_at?: string;
                };
            };
            search_history: {
                Row: {
                    id: string;
                    user_id: string;
                    query: string;
                    results_count: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    query: string;
                    results_count?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    query?: string;
                    results_count?: number | null;
                    created_at?: string;
                };
            };
        };
    };
}

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type SubscriptionTier = 'free' | 'scholar' | 'institution';
