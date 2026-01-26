'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Quote, BookOpen, Share2, Sparkles, Layers, BookmarkPlus, Check, Lightbulb } from 'lucide-react';
import { Paper } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaperDetailModalProps {
    paper: Paper | null;
    onClose: () => void;
}

export default function PaperDetailModal({ paper, onClose }: PaperDetailModalProps) {
    const router = useRouter();
    const [saved, setSaved] = useState(false);

    if (!paper) return null;

    const handleSave = () => {
        setSaved(true);
        // TODO: Implement actual save logic
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAnalyze = () => {
        // Navigate to Co-Pilot with paper context
        // Encode only essential details to keep URL short
        const context = `Analyze this paper: ${paper.title} by ${paper.authors[0]?.name} (${paper.year}). Abstract: ${paper.abstract?.substring(0, 300)}...`;
        router.push(`/co-pilot?context=${encodeURIComponent(context)}`);
    };

    return (
        <AnimatePresence>
            {paper && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
                    >
                        <div className="min-h-screen flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative"
                            >
                                {/* Header / Cover */}
                                <div className="bg-stone-50 p-8 border-b border-stone-100 flex justify-between items-start gap-6 relative overflow-hidden">
                                    <div className="absolute inset-0 mesh-pattern opacity-[0.05] pointer-events-none" />

                                    <div className="flex-1 relative z-10">
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            {paper.isOpenAccess && (
                                                <span className="px-3 py-1 bg-green-100/50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200">
                                                    Open Access
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-white text-stone-500 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-200 shadow-sm">
                                                {paper.year}
                                            </span>
                                            {paper.venue && (
                                                <span className="px-3 py-1 bg-white text-stone-500 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-200 shadow-sm">
                                                    {paper.venue}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                                            {paper.title}
                                        </h2>

                                        <div className="text-stone-600 font-medium">
                                            {paper.authors.map(a => a.name).join(', ')}
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="p-2 bg-white hover:bg-stone-200 rounded-full transition-colors shadow-sm border border-stone-100 z-10"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="md:col-span-2 space-y-8">
                                        <section>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Abstract</h3>
                                            <p className="text-lg leading-relaxed text-stone-700">
                                                {paper.abstract || "No abstract available for this paper."}
                                            </p>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Keywords & Topics</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Mock topics since we might not have them */}
                                                {['Research', 'Methodology', 'Analysis'].map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-stone-50 text-stone-600 text-sm font-medium rounded-lg">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Sidebar Actions */}
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <Sparkles size={18} className="text-yellow-400" />
                                            Analyze with AI
                                        </button>

                                        <button
                                            onClick={handleSave}
                                            className="w-full py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-3"
                                        >
                                            {saved ? <Check size={18} className="text-green-500" /> : <BookmarkPlus size={18} />}
                                            {saved ? 'Saved to Library' : 'Save to Library'}
                                        </button>

                                        {paper.url && (
                                            <Link
                                                href={paper.url}
                                                target="_blank"
                                                className="w-full py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-3"
                                            >
                                                <ExternalLink size={18} />
                                                View Source
                                            </Link>
                                        )}

                                        <div className="pt-6 border-t border-stone-100 mt-6">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="p-3 bg-stone-50 rounded-xl">
                                                    <div className="text-2xl font-bold text-stone-900">{paper.citationCount || 0}</div>
                                                    <div className="text-[10px] uppercase font-bold text-stone-400">Citations</div>
                                                </div>
                                                <div className="p-3 bg-stone-50 rounded-xl">
                                                    <div className="text-2xl font-bold text-stone-900">{paper.year || 'N/A'}</div>
                                                    <div className="text-[10px] uppercase font-bold text-stone-400">Published</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
