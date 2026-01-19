import { NextResponse } from 'next/server';
import { searchPapers } from '@/lib/scholarly';
import { extractKeywords } from '@/lib/nlp';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, filters } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        // Determine query: if text is short (< 10 words), use it directly.
        // If long, extract keywords.
        const wordCount = text.split(/\s+/).length;
        let query = text;
        if (wordCount > 10) {
            query = extractKeywords(text);
        }

        // Fallback if NLP returns empty
        if (!query.trim()) {
            query = text.substring(0, 200); // truncated
        }

        const results = await searchPapers(query);

        return NextResponse.json({
            query,
            results
        });
    } catch (error) {
        console.error('Search API error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const status = errorMessage.includes('Rate limit') ? 429 : 500;
        return NextResponse.json(
            { error: status === 429 ? 'Semantic Scholar API Rate Limit Exceeded. Please try again in a minute.' : 'Failed to fetch references', details: errorMessage },
            { status }
        );
    }
}
