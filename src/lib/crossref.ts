export interface CrossrefPaper {
  title: string;
  authors: string[];
  year?: number | null;
  url?: string;
  doi?: string;
}

export async function searchCrossref(query: string, limit = 5): Promise<CrossrefPaper[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Crossref API error: ${res.status}`);
    const data = await res.json();
    const items = data.message?.items || [];
    return items.map((it: any) => ({
      title: Array.isArray(it.title) ? it.title[0] : it.title || '',
      authors: (it.author || []).map((a: any) => [a.given, a.family].filter(Boolean).join(' ')),
      year: it['published-print']?.['date-parts']?.[0]?.[0] || it['published-online']?.['date-parts']?.[0]?.[0] || null,
      url: it.URL || (it['link'] && it['link'][0]?.URL) || null,
      doi: it.DOI || null,
    }));
  } catch (err) {
    console.warn('Crossref search failed:', err);
    return [];
  }
}
