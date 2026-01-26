import { NextRequest, NextResponse } from 'next/server';
import { searchPapers } from '@/lib/scholarly';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const results = await searchPapers(query, limit, offset);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch papers' },
            { status: 500 }
        );
    }
}
