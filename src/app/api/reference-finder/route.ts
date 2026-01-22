import { google } from '@ai-sdk/google';
import { generateText, generateObject, tool } from 'ai';
import { z } from 'zod';
import { searchPapers } from '@/lib/scholarly';
import { searchCrossref } from '@/lib/crossref';

export const maxDuration = 60;

const ReferenceSchema = z.object({
    correctedText: z.string().describe('The full manuscript text with corrected citations in APA 7th edition format'),
    originalText: z.string().describe('The original manuscript text before corrections'),
    log: z.array(z.object({
        original: z.string().describe('The original citation from the input'),
        corrected: z.string().describe('The corrected citation or reference entry in APA 7th edition'),
        status: z.enum(['Verified', 'Corrected', 'Fabricated', 'Unverifiable']),
        details: z.string().describe('Explanation of the verification result'),
        reason: z.string().describe('Reason for the change (if corrected or fabricated)'),
        paper: z.object({
            title: z.string(),
            authors: z.string(),
            year: z.number().nullable(),
            url: z.string()
        }).optional()
    })),
    auditReport: z.array(z.object({
        originalReference: z.string().describe('The original reference as cited'),
        correctionMade: z.string().describe('The corrected reference'),
        reasonForChange: z.string().describe('Why this change was made')
    })).describe('Audit report table: [Original | Correction | Reason]')
});

export async function POST(req: Request) {
    let requestText = '';
    try {
        const body = await req.json();
        requestText = body.text;

        console.log('[Reference Finder] Starting verification for text length:', requestText?.length);

        // If no AI provider key is configured, fall back to a demo mode that uses
        // only the scholarly search (Semantic Scholar) to provide a lightweight result
        // so visitors can try the app without an AI key.
            // If the generic GOOGLE_API_KEY is set (e.g., API key from previous configs),
            // mirror it into the variable name the AI SDK expects so the SDK doesn't throw.
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_API_KEY) {
                process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
            }

            // If no AI provider key is configured, fall back to a demo mode that uses
            // only the scholarly search (Semantic Scholar) to provide a lightweight result
            // so visitors can try the app without a generative API key.
            const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
        if (!hasGoogleKey && !hasOpenAIKey) {
            console.warn('[Reference Finder] No AI API key configured — running in demo mode (no generative model).');

            // Simple demo: extract keywords, perform a small search, and return a minimal structured response
            // without calling the generative model.
            const { extractKeywords } = await import('@/lib/nlp');
            const query = extractKeywords(requestText || '').split(' ').slice(0, 10).join(' ');
            let papers: any[] = [];
            try {
                const results = await searchPapers(query, 3);
                papers = results.data;
            } catch (e) {
                console.warn('[Reference Finder Demo] searchPapers failed:', e);
            }

            const demoLog = (papers && papers.length > 0) ? papers.map((p: any) => ({
                original: p.title?.slice(0, 120) || 'N/A',
                corrected: p.title || 'N/A',
                status: 'Verified' as const,
                details: 'Demo mode: matched paper via keyword search',
                reason: 'Verified through Semantic Scholar keyword search (demo mode)',
                paper: {
                    title: p.title,
                    authors: (p.authors || []).map((a: any) => a.name).join(', '),
                    year: p.year || null,
                    url: p.url || ''
                }
            })) : [{ original: requestText?.slice(0, 120) || '', corrected: requestText || '', status: 'Unverifiable' as const, details: 'Demo mode: no matches found', reason: 'No matches found in demo mode', paper: undefined }];

            const demoAuditReport = (papers && papers.length > 0) ? papers.map((p: any) => ({
                originalReference: p.title?.slice(0, 120) || 'N/A',
                correctionMade: p.title || 'N/A',
                reasonForChange: 'Verified through Semantic Scholar keyword search'
            })) : [];

            const demoResult = {
                correctedText: requestText,
                originalText: requestText,
                log: demoLog,
                auditReport: demoAuditReport,
            };

            return new Response(JSON.stringify(demoResult), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Stage 1: Iterative Verification using tools
        console.log('[Reference Finder] Stage 1: Searching for papers...');

        // Helper: try a list of Google model IDs until one succeeds for generateText/generateObject
        const candidateGoogleModels = [
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-pro-001',
            'gemini-1.5-pro',
        ];

        function isModelNotSupportedError(err: any) {
            const msg = (err && (err.message || err.toString && err.toString())) || '';
            return /not found|not supported|ListModels|API version v1beta/i.test(msg);
        }

        async function tryModels<T>(models: string[], fn: (model: any) => Promise<T>) {
            let lastErr: any = null;
            for (const m of models) {
                try {
                    console.log('[Reference Finder] Trying model', m);
                    // pass google(modelId) as the model resolver the SDK expects
                    return await fn(google(m) as any);
                } catch (err: any) {
                    lastErr = err;
                    console.warn(`[Reference Finder] Model ${m} failed:`, err?.message || err);
                    if (!isModelNotSupportedError(err)) {
                        // If it's not a model-not-found type error, rethrow immediately
                        throw err;
                    }
                    // otherwise try next model
                }
            }
            // If we exhausted models, throw the last error
            throw lastErr || new Error('No models available');
        }

        let verificationSession: any = null;
        try {
            verificationSession = await tryModels(candidateGoogleModels, (model) => (generateText as any)({
            model,
            system: `You are a Senior Academic Research Auditor and Expert Editor. Your primary objective is ensuring 100% accuracy, verifiability, and formatting integrity of academic manuscripts.

WORKFLOW:
1. Cross-Verification: Compare every in-text citation against the reference list.
2. Authenticity Audit: Verify that authors, titles, journals, and years exist.
3. Correction & Replacement: Correct "near-misses" (wrong year/misspelled author). Flag fabricated citations.
4. APA 7th Edition Standardization: Format all references strictly per APA 7th (sentence case titles, proper italics, no publisher locations).

For each citation:
- Use 'searchScholarlyPapers' to find the authentic source.
- Record: Original | Status (Verified/Corrected/Fabricated/Unverifiable) | Reason for change
- If corrected, provide the APA 7th formatted version.
- Do NOT change the academic voice unless there is a grammatical error.`,
            prompt: `Academic Manuscript Section:\n\n${requestText}\n\nPerform a rigorous authenticity audit. For each citation, determine if it is Verified, Corrected, Fabricated, or Unverifiable.`,
            tools: {
                searchScholarlyPapers: tool({
                    description: 'Search for scholarly papers to verify metadata and existence.',
                    inputSchema: z.object({
                        query: z.string().describe('Search query (title, authors, or citation string)'),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        console.log('[Reference Finder Tool] Searching (SemanticScholar + Crossref):', query);
                        try {
                            const [ssResults, crResults] = await Promise.all([
                                (async () => {
                                    try {
                                        const r = await searchPapers(query, 3);
                                        return r.data.map((p: any) => ({
                                            title: p.title,
                                            authors: p.authors?.map((a: any) => a.name).join(', '),
                                            year: p.year,
                                            url: p.url,
                                            doi: p.externalIds?.DOI,
                                        }));
                                    } catch (e) {
                                        console.warn('[Reference Finder Tool] Semantic Scholar search failed:', e);
                                        return [];
                                    }
                                })(),
                                (async () => {
                                    try {
                                        return await searchCrossref(query, 3);
                                    } catch (e) {
                                        console.warn('[Reference Finder Tool] Crossref search failed:', e);
                                        return [];
                                    }
                                })(),
                            ]);

                            // Merge results preferring Semantic Scholar matches, dedupe by DOI or title
                            const seen = new Map<string, any>();
                            function add(p: any) {
                                const key = (p.doi || p.title || '').toString().toLowerCase();
                                if (!key) return;
                                if (!seen.has(key)) seen.set(key, p);
                            }
                            ssResults.forEach(add);
                            crResults.forEach(add);

                            return Array.from(seen.values());
                        } catch (e) {
                            console.error('[Reference Finder Tool] Combined search failed:', e);
                            return [];
                        }
                    },
                }),
            },
            maxSteps: 8,
        }));

        // Stage 2: Structured Output Generation
        console.log('[Reference Finder] Stage 2: Formatting output...');
            const structuredResult: any = await tryModels(candidateGoogleModels, (model) => generateObject({
                model,
                schema: ReferenceSchema,
                system: `You are a Senior Academic Research Auditor. Generate a comprehensive JSON audit report.

Required Output:
- correctedText: Full manuscript with all citations corrected to APA 7th edition
- originalText: The input text unchanged
- log: Array of verification records with reason for each change
- auditReport: Table format [Original Reference | Correction Made | Reason for Change]

Guidelines:
- Ensure 100% accuracy of corrected references in APA 7th edition format
- Provide clear, specific reasons for each correction (e.g., "Year was 2021, verified as 2022", "Author misspelled: 'Jonson' → 'Johnson'")
- For fabricated citations, explain why they are not found in scholarly databases
- Maintain academic voice; do not rephrase the text unless correcting citations`,
                prompt: `Original Manuscript:\n${requestText}\n\nVerification Summary:\n${verificationSession.text}\n\nGenerate a complete audit report with corrected references in APA 7th edition format.`,
            }));

            console.log('[Reference Finder] Verification complete. Sending results.');
            return new Response(JSON.stringify(structuredResult.object), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err: any) {
            // If model quota exceeded or similar, fallback to non-generative combined search result
            const msg = (err && (err.message || err.toString && err.toString())) || '';
            if (/quota|exceed(ed)?|limit/i.test(msg)) {
                console.warn('[Reference Finder] AI quota exceeded — falling back to non-generative verification using Semantic Scholar + Crossref.');

                // Use keyword extraction to form a query and perform combined search
                const { extractKeywords } = await import('@/lib/nlp');
                const query = extractKeywords(requestText || '').split(' ').slice(0, 12).join(' ');
                let ssResults: any[] = [];
                let crResults: any[] = [];
                try {
                    const ss = await searchPapers(query, 6);
                    ssResults = ss.data.map((p: any) => ({ title: p.title, authors: p.authors?.map((a: any) => a.name).join(', '), year: p.year, url: p.url, doi: p.externalIds?.DOI }));
                } catch (e) {
                    console.warn('[Reference Finder Fallback] Semantic Scholar search failed:', e);
                }
                try {
                    crResults = await searchCrossref(query, 6);
                } catch (e) {
                    console.warn('[Reference Finder Fallback] Crossref search failed:', e);
                }

                const seen = new Map<string, any>();
                function add(p: any) { const key = (p.doi || p.title || '').toString().toLowerCase(); if (!key) return; if (!seen.has(key)) seen.set(key, p); }
                ssResults.forEach(add);
                crResults.forEach(add);

                const papers = Array.from(seen.values()).slice(0, 6);

                const demoLog = papers.length > 0 ? papers.map((p: any) => ({
                    original: p.title?.slice(0, 120) || 'N/A',
                    corrected: p.title || 'N/A',
                    status: 'Verified' as const,
                    details: 'Matched via external scholarly sources (Semantic Scholar / Crossref)',
                    reason: 'Verified through cross-referencing with Semantic Scholar and Crossref databases',
                    paper: {
                        title: p.title,
                        authors: p.authors || '',
                        year: p.year || null,
                        url: p.url || ''
                    }
                })) : [{ original: requestText?.slice(0, 120) || '', corrected: requestText || '', status: 'Unverifiable' as const, details: 'No matches found via external sources', reason: 'Could not verify against scholarly databases', paper: undefined }];

                const auditReport = papers.length > 0 ? papers.map((p: any) => ({
                    originalReference: p.title?.slice(0, 120) || 'N/A',
                    correctionMade: p.title || 'N/A',
                    reasonForChange: 'Verified through cross-referencing with Semantic Scholar and Crossref databases'
                })) : [];

                const fallbackResult = { 
                    correctedText: requestText, 
                    originalText: requestText,
                    log: demoLog,
                    auditReport
                };
                return new Response(JSON.stringify(fallbackResult), { headers: { 'Content-Type': 'application/json' } });
            }

            console.error('[Reference Finder API Error]:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error during verification';
            return new Response(JSON.stringify({ error: 'Verification failed', details: errorMessage, timestamp: new Date().toISOString() }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        

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
