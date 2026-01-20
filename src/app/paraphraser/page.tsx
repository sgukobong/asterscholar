'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ArrowLeft,
    Copy,
    Check,
    RotateCcw,
    Download,
    FileText,
    Settings2,
    History as HistoryIcon
} from 'lucide-react';
import Link from 'next/link';

function ParaphraserContent() {
    const searchParams = useSearchParams();
    const [inputText, setInputText] = useState('');
    const [strength, setStrength] = useState('Medium');
    const [tone, setTone] = useState('Academic');
    const [preserveCitations, setPreserveCitations] = useState(true);
    const [length, setLength] = useState('Similar');
    const [copied, setCopied] = useState(false);

    // History state
    const [history, setHistory] = useState<{ original: string, paraphrased: string, date: Date }[]>([]);

    useEffect(() => {
        const textParam = searchParams.get('text');
        if (textParam) {
            setInputText(decodeURIComponent(textParam));
        }
    }, [searchParams]);

    const { complete, completion, isLoading } = useCompletion({
        api: '/api/paraphrase',
        body: {
            strength,
            tone,
            preserveCitations,
            length
        },
        onFinish: (prompt, completion) => {
            setHistory(prev => [{
                original: prompt,
                paraphrased: completion,
                date: new Date()
            }, ...prev]);
        }
    });

    const handleParaphrase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;
        complete(inputText);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(completion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderDiff = () => {
        if (!completion) return null;
        return (
            <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed font-serif text-lg">
                <div className="whitespace-pre-wrap">{completion}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F8F5] font-sans text-stone-900">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 rounded-full">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Academic Paraphraser</h1>
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Asterscholar Original</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/co-pilot" className="text-sm font-medium text-stone-500 hover:text-black transition-colors">Research Co-Pilot</Link>
                    <button className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-black">
                        <HistoryIcon size={16} />
                        History
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Control Bar */}
                <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Settings2 size={16} className="text-stone-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Controls</span>
                    </div>

                    <div className="h-6 w-[1px] bg-stone-200" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600">Strength</span>
                        <div className="flex bg-stone-100 p-1 rounded-lg">
                            {['Light', 'Medium', 'Strong'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStrength(s)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${strength === s ? 'bg-white shadow-sm text-black' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600">Tone</span>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="bg-stone-100 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                            <option>Academic</option>
                            <option>Fluent</option>
                            <option>Concise</option>
                            <option>Expand</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600">Citations</span>
                        <button
                            onClick={() => setPreserveCitations(!preserveCitations)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${preserveCitations ? 'bg-black' : 'bg-stone-300'}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${preserveCitations ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <button
                        onClick={handleParaphrase}
                        disabled={isLoading || !inputText.trim()}
                        className="ml-auto bg-black text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-lg shadow-black/10"
                    >
                        {isLoading ? <RotateCcw className="animate-spin w-4 h-4" /> : <Sparkles size={14} fill="currentColor" />}
                        {isLoading ? 'Rewriting...' : 'Rewrite Text'}
                    </button>
                </div>

                {/* Workspace */}
                <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-280px)] min-h-[500px]">
                    {/* Input Panel */}
                    <div className="flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5">
                        <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Input Text</span>
                            <span className="text-[10px] text-stone-400 font-medium">{inputText.split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your abstract, paragraph, or claim here..."
                            className="flex-1 p-8 text-lg leading-relaxed font-serif text-stone-800 resize-none focus:outline-none placeholder:text-stone-300"
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative">
                        <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Paraphrased Output</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    disabled={!completion}
                                    className="p-1.5 hover:bg-stone-100 rounded-md transition-colors text-stone-500 disabled:opacity-30"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                                <button
                                    disabled={!completion}
                                    className="p-1.5 hover:bg-stone-100 rounded-md transition-colors text-stone-500 disabled:opacity-30"
                                    title="Export as Document"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto">
                            {!completion && !isLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-stone-300 gap-4">
                                    <Sparkles size={48} className="opacity-20" />
                                    <p className="text-sm font-medium">Your academic paraphrase will appear here.</p>
                                </div>
                            )}
                            {isLoading && !completion && (
                                <div className="space-y-4">
                                    <div className="h-4 bg-stone-100 rounded-full w-full animate-pulse" />
                                    <div className="h-4 bg-stone-100 rounded-full w-5/6 animate-pulse" />
                                    <div className="h-4 bg-stone-100 rounded-full w-4/6 animate-pulse" />
                                </div>
                            )}
                            {renderDiff()}
                        </div>

                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl"
                                >
                                    <RotateCcw className="animate-spin w-3 h-3" />
                                    Processing Citations...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="mt-8 flex items-center justify-center gap-2 text-stone-400 text-xs font-medium">
                    <FileText size={14} />
                    <span>Always verify AI-generated rewrites. Asterscholar prioritizes meaning over synonyms.</span>
                </div>
            </main>
        </div>
    );
}

export default function ParaphraserPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F8F5] flex items-center justify-center">Loading...</div>}>
            <ParaphraserContent />
        </Suspense>
    );
}
