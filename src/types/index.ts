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
