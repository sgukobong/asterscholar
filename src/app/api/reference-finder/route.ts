import { google } from '@ai-sdk/google';
import { generateText, generateObject, tool } from 'ai';
import { z } from 'zod';
import { searchPapers } from '@/lib/scholarly';

export const maxDuration = 60;

const ReferenceSchema = z.object({
    correctedText: z.string().describe('The full manuscript text with corrected citations'),
    log: z.array(z.object({
        original: z.string().describe('The original citation from the input'),
        corrected: z.string().describe('The corrected citation or reference entry'),
        status: z.enum(['Verified', 'Corrected', 'Fabricated', 'Unverifiable']),
        details: z.string().describe('Explanation of the verification result'),
        paper: z.object({
            title: z.string(),
            authors: z.string(),
            year: z.number().nullable(),
            url: z.string()
        }).optional()
    }))
});

export async function POST(req: Request) {
    let requestText = '';
    try {
        const body = await req.json();
        requestText = body.text;

        console.log('[Reference Finder] Starting verification for text length:', requestText?.length);

        // Stage 1: Iterative Verification using tools
        console.log('[Reference Finder] Stage 1: Searching for papers...');
        const verificationSession = await (generateText as any)({
            model: google('gemini-1.5-flash'),
            system: `You are Asterscholar's Reference Verification Engine. 
Your goal is to identify every in-text citation and reference in the text and verify them.
STRICT PROTOCOL:
1. For each citation, use 'searchScholarlyPapers' once.
2. If the paper is found, record the details (title, authors, year, url).
3. If not found, look for the most relevant authentic alternative.
4. Summarize each citation: Original string -> Verified/Corrected/Fabricated -> Official Reference.`,
            prompt: `Text to analyze:\n\n${requestText}`,
            tools: {
                searchScholarlyPapers: tool({
                    description: 'Search for scholarly papers to verify metadata and existence.',
                    inputSchema: z.object({
                        query: z.string().describe('Search query (title, authors, or citation string)'),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        console.log('[Reference Finder Tool] Searching:', query);
                        try {
                            const results = await searchPapers(query, 3);
                            return results.data.map(p => ({
                                title: p.title,
                                authors: p.authors.map(a => a.name).join(', '),
                                year: p.year,
                                url: p.url,
                                doi: p.externalIds.DOI
                            }));
                        } catch (e) {
                            console.error('[Reference Finder Tool] Search failed:', e);
                            return [];
                        }
                    },
                }),
            },
            maxSteps: 8,
        });

        // Stage 2: Structured Output Generation
        console.log('[Reference Finder] Stage 2: Formatting output...');
        const structuredResult = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: ReferenceSchema,
            system: `You are a formatting assistant. Create a JSON report from the verification summary.
Ensure 'correctedText' is the full original manuscript with all citations and references updated to the verified versions.`,
            prompt: `Original Manuscript:\n${requestText}\n\nVerification Summary:\n${verificationSession.text}`,
        });

        console.log('[Reference Finder] Verification complete. Sending results.');
        return new Response(JSON.stringify(structuredResult.object), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[Reference Finder API Error]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during verification';

        return new Response(JSON.stringify({
            error: 'Verification failed',
            details: errorMessage,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
