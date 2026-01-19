const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
    'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now'
]);

export function extractKeywords(text: string): string {
    // 1. Clean text: remove special chars, lower case
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');

    // 2. Tokenize
    const tokens = cleanText.split(/\s+/);

    // 3. Filter stop words and short words
    const keywords = tokens.filter(token =>
        token.length > 2 && !STOP_WORDS.has(token)
    );

    // 4. Unique
    const uniqueKeywords = Array.from(new Set(keywords));

    // 5. Return top 10 relevant keywords joined
    // In a real app we might prioritize by frequency or TF-IDF
    return uniqueKeywords.slice(0, 10).join(' ');
}
