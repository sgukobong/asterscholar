import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        text,
        strength = 'Medium',
        tone = 'Academic',
        preserveCitations = true,
        length = 'Similar'
    } = await req.json();

    if (!text) {
        return new Response('Missing text', { status: 400 });
    }

    const systemPrompt = `You are an expert academic paraphraser for Asterscholar. 
Rewrite ONLY the provided input text. 
Preserve EXACT meaning, facts, technical terms, and structure where possible. 
Do NOT add, remove, invent, or alter any information, claims, data, or conclusions. 
${preserveCitations ? 'Keep all citations, references, DOIs, and in-text markers (e.g., [1], (Author, 2024)) completely unchanged and in their original positions.' : ''}

STRENGTH: ${strength} 
- Light: Minor tweaks and synonym replacement.
- Medium: Sentence restructuring while keeping core flow.
- Strong: Deep rewording and reorganization for highest originality.

TONE: ${tone}
- Academic: Formal, objective, scholarly language.
- Fluent: Natural, smooth transitions, easy to read.
- Concise: Remove fluff, get straight to the point.
- Expand: Add descriptive depth without adding new facts.

LENGTH: ${length}
- Shorten: Be brief.
- Expand: Be more descriptive.
- Similar: Keep word count roughly the same.

CRITICAL RULES:
1. Output ONLY the paraphrased text in clean markdown.
2. If citations are present, they MUST remain intact.
3. NO hallucinations.
4. If there are multiple paragraphs, maintain the paragraph structure.
5. Do NOT include any meta-talk like "Here is the paraphrase".

Always include this footer on a new line:
"--- \n*AI-generated paraphrase — review for accuracy, originality, and proper citation. Use responsibly to support your writing, not replace it.*"`;

    const result = streamText({
        model: openai('gpt-4o'),
        system: systemPrompt,
        prompt: text,
    });

    return result.toTextStreamResponse();
}
