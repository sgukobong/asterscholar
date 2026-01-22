import { google } from '@ai-sdk/google';
import { ToolLoopAgent, createAgentUIStreamResponse, tool } from 'ai';
import { z } from 'zod';
import { searchPapers } from '@/lib/scholarly';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const instructions = `You are Asterscholar's Research Co-Pilot, an expert academic writer and research assistant. 
Your goal is to help scholars draft high-quality, trustworthy, and verifiable academic text.

CRITICAL RULES FOR DRAFTING:
1.  **Strict Grounding**: Use ONLY the papers provided by the 'searchScholarlyPapers' tool. If no papers are found, state that you cannot draft the section without evidence.
2.  **Inline Citations**: Every claim, summary, or idea MUST be supported by at least one inline citation in the format [1], [2], etc., corresponding to the tool results.
3.  **Academic Tone**: Use a professional, objective, and scholarly tone. Avoid flowery language or "AI-isms".
4.  **Structure**: Use clear Markdown headings (e.g., ## Introduction) and transitions.
5.  **Anti-Hallucination**: NEVER invent facts, statistics, or papers. If a paper doesn't mention something, don't include it.
6.  **References List**: At the end of every draft or significant summary, provide a "## References" section. List the papers used in APA style (Author, Year, Title, Journal/Venue).
7.  **Iterative Editing**: If the user asks to "revise", "shorten", or "focus on X", maintain the same grounding and citation accuracy while modifying the narrative.

Support output types: narrative text (300-800 words), Markdown tables for comparison, and bulleted summaries.
Always end with: "--- \n*Disclaimer: This is an AI-generated draft based on retrieved scholarly data. Please review, edit, and verify all sources manually before submission.*"

Refuse to answer non-academic questions with "I am a research assistant designed to help with scholarly inquiries."`;

const searchScholarlyPapersTool = tool({
    description: 'Search for scholarly papers from Semantic Scholar, CrossRef, etc. to find evidence, facts, and citations.',
    inputSchema: z.object({
        query: z.string().describe('The search query for finding relevant papers.'),
    }),
    execute: async ({ query }: { query: string }) => {
        const results = await searchPapers(query, 5);
        return results.data.map((p, i) => ({
            id: i + 1,
            title: p.title,
            authors: p.authors.map(a => a.name).join(', '),
            year: p.year,
            abstract: p.abstract || "No abstract available",
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
