import { Paper, SearchResult } from '@/types';

const SEMANTIC_SCHOLAR_API_BASE = 'https://api.semanticscholar.org/graph/v1';

export async function searchPapers(query: string, limit = 10, offset = 0): Promise<SearchResult> {
    const fields = [
        'paperId',
        'title',
        'abstract',
        'venue',
        'year',
        'citationCount',
        'isOpenAccess',
        'openAccessPdf',
        'authors',
        'url',
        'externalIds'
    ].join(',');

    try {
        const response = await fetch(
            `${SEMANTIC_SCHOLAR_API_BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=${fields}`,
            {
                method: 'GET',
                headers: {
                    // 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '', // TODO: Add API key support if needed
                },
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            total: data.total || 0,
            offset: data.offset || 0,
            data: data.data || []
        };
    } catch (error) {
        console.error('Error fetching papers:', error);
        throw error;
    }
}
