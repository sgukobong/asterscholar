import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const text = body.prompt || '';
        const strength = body.strength || 'Medium';
        const tone = body.tone || 'Academic';
        const preserveCitations = body.preserveCitations !== false;
        const length = body.length || 'Similar';

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return new Response('Missing text', { 
                status: 400,
                headers: { 'Content-Type': 'text/plain' }
            });
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

        try {
            console.log('Calling generateText with gemini-2.0-flash...');
            const result = await generateText({
                model: google('gemini-2.0-flash'),
                system: systemPrompt,
                prompt: text,
            });

            console.log('Generated text length:', result.text.length);
            
            // Return as text stream response
            return new Response(result.text, {
                status: 200,
                headers: { 
                    'Content-Type': 'text/plain',
                    'Transfer-Encoding': 'chunked'
                }
            });
        } catch (error: any) {
            console.error('gemini-2.0-flash error:', error?.message);
            // Fallback to gemini-1.5-flash if gemini-2.0-flash is not available
            if (error?.message?.includes('model not found') || error?.status === 404) {
                console.log('Falling back to gemini-1.5-flash');
                const result = await generateText({
                    model: google('gemini-1.5-flash'),
                    system: systemPrompt,
                    prompt: text,
                });
                
                console.log('Fallback generated text length:', result.text.length);
                
                return new Response(result.text, {
                    status: 200,
                    headers: { 
                        'Content-Type': 'text/plain',
                        'Transfer-Encoding': 'chunked'
                    }
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Paraphrase API error:', error);
        return new Response(
            JSON.stringify({ 
                error: error instanceof Error ? error.message : 'Unknown error' 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
