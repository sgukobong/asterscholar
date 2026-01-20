'use client';

import { useState } from 'react';
import { Search, Sparkles, BookOpen, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PaperCard from '@/components/PaperCard';
import { Paper } from '@/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);
    setResults([]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        throw new Error('Failed to fetch results');
      }

      const data = await res.json();
      setResults(data.results.data || []);

      if (data.results.data && data.results.data.length === 0) {
        setError('No relevant papers found. Try simpler keywords.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1 rounded-full">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">Asterscholar</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="/paraphraser" className="text-sm font-medium hover:text-black hover:underline transition-colors">
            Paraphraser
          </a>
          <a href="/co-pilot" className="text-sm font-medium hover:text-black hover:underline transition-colors">
            Research Co-Pilot <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full ml-1">NEW</span>
          </a>
        </div>
        <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-black/10">
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 pt-12 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-[0.95] max-w-2xl">
              Asterscholar —<br />
              AI Powered primary<br />
              research platform<br />
              for researchers
            </h1>
            <p className="text-muted text-lg max-w-lg leading-relaxed">
              Enhance your research and benefit from industry-leading
              citation search quality, speed, and accuracy. Replace hallucinations with real science.
            </p>

            <a
              href="#search-input"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              Start Researching
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="pt-8 flex items-center gap-2 text-sm text-stone-500">
              Built by Asterscholar Team
            </div>
          </motion.div>

          {/* Right Column: Search Interface (Floating Card) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative 'Chat' bubble similar to image */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 min-h-[300px] flex flex-col justify-between border border-stone-100 transform lg:translate-x-12 lg:translate-y-12">
              <div className="mb-4">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Input Text</span>
                <form onSubmit={handleSearch} id="search-input" className="mt-2 relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Paste your claim, abstract, or text here..."
                    className="w-full h-32 bg-stone-50 rounded-lg p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-colors"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Find References'}
                      {!loading && <Search size={14} />}
                    </button>
                  </div>
                </form>
              </div>

              {searched && (
                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Results</span>
                    <span className="text-xs text-stone-400">{results.length} Papers Found</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {results.map(paper => (
                      <PaperCard key={paper.paperId} paper={paper} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-stone-200 bg-white/30 backdrop-blur-sm z-10 relative mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded-full">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">Asterscholar</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-stone-500 font-medium">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a
              href="https://github.com/sgukobong/asterscholar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border border-stone-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-colors bg-white/50"
            >
              View on GitHub
            </a>
          </div>

          <div className="text-xs text-stone-400 font-medium uppercase tracking-widest">
            © 2026 Asterscholar
          </div>
        </div>
      </footer>

      {/* Dot Pattern Background (Partial) */}
      <div className="h-64 w-full bg-dot-pattern opacity-40 pointer-events-none absolute bottom-0 z-0"></div>
    </div>
  );
}
