import { google } from '@ai-sdk/google';
import { ToolLoopAgent, createAgentUIStreamResponse, tool } from 'ai';
import { z } from 'zod';
import { searchPapers } from '@/lib/scholarly';

// Allow streaming responses up to 60 seconds for verification
export const maxDuration = 60;

const instructions = `You are an expert academic editor and researcher. You will receive a piece of writing that includes in-text citations and a reference list. Your task is to:

1. Identify all references cited in the text, including both in-text citations and the reference list.

2. Verify each reference for authenticity. Check that:
   - The cited authors exist and are correctly named.
   - The title of the work is accurate.
   - The publication year and source (journal, book, publisher) are correct.

3. If a reference, citation, or author appears to be incorrect, incomplete, or fabricated, find the correct and authentic reference using reliable sources.
   - Use the 'searchScholarlyPapers' tool to verify existence and details.

4. Replace incorrect references in both the in-text citation and reference list with the authentic reference, maintaining proper academic formatting (APA 7th edition, unless specified otherwise).

5. Provide a corrected reference list and note any changes made, including original vs corrected reference.

6. Do not create references that do not exist. Only provide genuine, verifiable sources. Ensure consistency between in-text citations and reference list.

Output Format:
Provide your response in Markdown with the following sections:
## Verification Report
[Bullet points summary of what was checked and any issues found]

## Corrected Text
[The original text with corrected in-text citations]

## Corrected References
[The corrected reference list in APA 7th edition]

## Changes Log
| Original Reference | Corrected Reference | Notes |
|-------------------|---------------------|-------|
| [Original Ref] | [Corrected Ref] | [Reason for change] |
`;

const searchScholarlyPapersTool = tool({
    description: 'Search for scholarly papers from Semantic Scholar, CrossRef, etc. to find evidence, facts, and citations.',
    inputSchema: z.object({
        query: z.string().describe('The search query for finding relevant papers. Use specific titles, authors, or topics.'),
    }),
    execute: async ({ query }: { query: string }) => {
        const results = await searchPapers(query, 5);
        return results.data.map((p, i) => ({
            id: i + 1,
            title: p.title,
            authors: p.authors.map(a => a.name).join(', '),
            year: p.year,
            journal: p.venue,
            citationCount: p.citationCount,
            url: p.url,
            doi: p.externalIds.DOI
        }));
    },
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    try {
        const agent = new ToolLoopAgent({
            model: google('gemini-2.0-flash'),
            instructions,
            tools: {
                searchScholarlyPapers: searchScholarlyPapersTool,
            },
        });

        return createAgentUIStreamResponse({
            agent: agent as any,
            uiMessages: messages,
        });
    } catch (error: any) {
        // Fallback to gemini-1.5-flash if gemini-2.0-flash is not available
        if (error?.message?.includes('model not found') || error?.status === 404) {
            const agent = new ToolLoopAgent({
                model: google('gemini-1.5-flash'),
                instructions,
                tools: {
                    searchScholarlyPapers: searchScholarlyPapersTool,
                },
            });

            return createAgentUIStreamResponse({
                agent: agent as any,
                uiMessages: messages,
            });
        }
        throw error;
    }
}
