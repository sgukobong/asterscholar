export interface Author {
    authorId: string;
    name: string;
}

export interface Paper {
    paperId: string;
    title: string;
    abstract: string | null;
    venue: string | null;
    year: number | null;
    citationCount: number;
    isOpenAccess: boolean;
    openAccessPdf?: {
        url: string;
        status: string;
    } | null;
    authors: Author[];
    url: string;
    externalIds: {
        DOI?: string;
        ArXiv?: string;
        CorpusId?: string;
        [key: string]: string | undefined;
    };
}

export interface SearchResult {
    total: number;
    offset: number;
    data: Paper[];
}

export interface CitationStyle {
    value: string;
    label: string;
}

export interface UserProfile {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    institution: string | null;
    research_interests: string[] | null;
    subscription_tier: 'free' | 'scholar' | 'institution';
    preferences: Record<string, any>;
    last_active: string;
    created_at: string;
    updated_at: string;
}

export interface ActivitySummary {
    user_id: string;
    total_searches: number;
    total_papers_saved: number;
    total_chat_sessions: number;
    total_paraphrases: number;
    current_month_searches: number;
    current_month_papers_saved: number;
    current_month_chat_sessions: number;
    current_month_paraphrases: number;
    updated_at: string;
}
