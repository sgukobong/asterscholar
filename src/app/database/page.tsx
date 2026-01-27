'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Globe, BookOpen, Layers, ArrowRight, ExternalLink, Loader2, Sparkles, Filter, FileText, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import PaperDetailModal from '@/components/database/PaperDetailModal';

import { Paper } from '@/types';

export default function DatabasePage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    const [stats, setStats] = useState({ papers: 213405921, sources: 45000 });

    // Simulate live index counter
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({ ...prev, papers: prev.papers + Math.floor(Math.random() * 5) }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/papers/search?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            if (data.data) {
                setResults(data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EAE8E2] text-stone-900 font-sans selection:bg-black/10">
            <Navigation />

            <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Return Button */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-stone-200">
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm mb-6">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Live Indexing</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                        {stats.papers.toLocaleString()}
                    </h1>

                    <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10">
                        The world's scientific knowledge, indexed and interconnected.
                        Search across {stats.sources.toLocaleString()} sources instantly.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto relative z-20">
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 focus-within:border-stone-300 focus-within:ring-4 focus-within:ring-black/5 transition-all">
                                <Search className="ml-4 text-stone-400" size={24} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search papers, authors, or DOIs..."
                                    className="flex-1 p-4 bg-transparent outline-none text-lg font-medium placeholder:text-stone-300"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Search'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    {!searched ? (
                        /* Sources Grid (The "Well") */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {[
                                { name: 'Semantic Scholar', icon: BookOpen, count: '213M', desc: 'Primary citation graph & AI analysis' },
                                { name: 'PubMed', icon: Layers, count: '36M', desc: 'Biomedical literature & life sciences' },
                                { name: 'arXiv', icon: FileText, count: '2.4M', desc: 'Physics, CS, & Math preprints' },
                                { name: 'CrossRef', icon: Globe, count: '150M+', desc: 'Digital Object Identifiers (DOIs)' },
                                { name: 'OpenAlex', icon: Database, count: '250M', desc: 'Open conceptual map of science' },
                                { name: 'Core', icon: Search, count: '25M', desc: 'Open access research papers' }
                            ].map((source, i) => (
                                <motion.div
                                    key={source.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all group cursor-default"
                                >
                                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-black group-hover:text-white transition-colors mb-4">
                                        <source.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{source.name}</h3>
                                    <div className="text-2xl font-bold bg-gradient-to-r from-stone-900 to-stone-500 bg-clip-text text-transparent mb-2">
                                        {source.count}
                                    </div>
                                    <p className="text-sm text-stone-400 group-hover:text-stone-500 transition-colors">
                                        {source.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        /* Results List */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 max-w-4xl mx-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles size={18} className="text-yellow-500" />
                                    Results for "{query}"
                                </h2>
                                <button
                                    onClick={() => { setSearched(false); setQuery(''); setResults([]); }}
                                    className="text-sm font-medium text-stone-500 hover:text-black hover:underline"
                                >
                                    Back to Sources
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 animate-pulse relative h-32" />
                                    ))}
                                </div>
                            ) : results.length > 0 ? (
                                results.map((paper) => (
                                    <motion.div
                                        key={paper.paperId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setSelectedPaper(paper)}
                                        className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-black/10 hover:shadow-lg transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                                                    {paper.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500 mb-3">
                                                    <span className="font-medium text-black">{paper.year}</span>
                                                    <span>•</span>
                                                    <span>{paper.venue || 'Unknown Venue'}</span>
                                                    <span>•</span>
                                                    <span>{paper.authors.slice(0, 3).map(a => a.name).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
                                                </div>
                                                {paper.abstract && (
                                                    <p className="text-stone-500 text-sm line-clamp-2 mb-4">
                                                        {paper.abstract}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    {paper.isOpenAccess && (
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">
                                                            Open Access
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                                        {paper.citationCount} Citations
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 bg-stone-100 hover:bg-black hover:text-white rounded-xl transition-colors"
                                                    title="View Details"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-stone-400">
                                    <p>No papers found matching your query.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <PaperDetailModal
                paper={selectedPaper}
                onClose={() => setSelectedPaper(null)}
            />
        </div>
    );
}
