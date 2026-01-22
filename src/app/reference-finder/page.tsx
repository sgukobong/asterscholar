'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Sparkles,
    ArrowLeft,
    Check,
    RotateCcw,
    AlertTriangle,
    ExternalLink,
    FileText,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface VerificationResult {
    original: string;
    corrected: string;
    status: 'Verified' | 'Corrected' | 'Fabricated' | 'Unverifiable';
    details: string;
    paper?: {
        title: string;
        authors: string;
        year: number;
        url: string;
    };
}

function ReferenceFinderContent() {
    const searchParams = useSearchParams();
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'input' | 'processing' | 'results'>('input');
    const [results, setResults] = useState<{ correctedText: string; log: VerificationResult[] } | null>(null);
    const [currentStatus, setCurrentStatus] = useState('Extracting citations...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const textParam = searchParams.get('text');
        if (textParam) {
            setInputText(decodeURIComponent(textParam));
            handleVerify(decodeURIComponent(textParam));
        }
    }, [searchParams]);

    const handleVerify = async (text: string = inputText) => {
        if (!text.trim() || isProcessing) return;

        setIsProcessing(true);
        setStep('processing');
        setError(null);

        try {
            const res = await fetch('/api/reference-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Verification failed');
            }

            const data = await res.json();
            setResults(data);
            setStep('results');
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setStep('input');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F8F5] font-sans text-stone-900 selection:bg-black selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 rounded-full">
                            <ShieldCheck size={16} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Reference Finder & Verifier</h1>
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Powered by Gemini + Asterscholar Search</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/paraphraser" className="text-sm font-medium text-stone-500 hover:text-black transition-colors">Paraphraser</Link>
                    <Link href="/co-pilot" className="text-sm font-medium text-stone-500 hover:text-black transition-colors">Research Co-Pilot</Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                                <h2 className="text-2xl font-bold mb-4">Paste your manuscript draft</h2>
                                <p className="text-stone-500 mb-8">We will identify every citation, check its authenticity against real scholarly databases, and provide corrected references where needed.</p>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-900">
                                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm">
                                            <p className="font-bold">Verification Error</p>
                                            <p className="opacity-80">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Paste text with citations here..."
                                    className="w-full h-80 bg-stone-50 rounded-2xl p-8 text-lg font-serif leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-black/5"
                                />

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleVerify()}
                                        disabled={!inputText.trim()}
                                        className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-stone-800 transition-all disabled:opacity-50"
                                    >
                                        <Search size={20} />
                                        Verify All References
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[60vh] flex flex-col items-center justify-center text-center"
                        >
                            <Loader2 className="w-12 h-12 text-black animate-spin mb-6" />
                            <h2 className="text-2xl font-bold mb-2">Analyzing citations...</h2>
                            <p className="text-stone-500 max-w-sm">Cross-referencing your text with Semantic Scholar, CrossRef, and PubMed to ensure 100% authenticity.</p>

                            <div className="mt-12 space-y-4 w-64">
                                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-black"
                                        animate={{ width: ['0%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{currentStatus}</span>
                            </div>
                        </motion.div>
                    )}

                    {step === 'results' && results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Verification Summary Card */}
                            <div className="bg-black text-white rounded-3xl p-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Verification Report</h2>
                                    <p className="text-stone-400 text-sm">Processed {results.log.length} citations in your text.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center px-4 py-2 bg-white/10 rounded-xl">
                                        <div className="text-2xl font-bold">{results.log.filter(l => l.status === 'Verified').length}</div>
                                        <div className="text-[10px] uppercase font-bold text-stone-400">Verified</div>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-amber-500/20 rounded-xl">
                                        <div className="text-2xl font-bold text-amber-500">{results.log.filter(l => l.status === 'Corrected').length}</div>
                                        <div className="text-[10px] uppercase font-bold text-amber-500">Corrected</div>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-red-500/20 rounded-xl">
                                        <div className="text-2xl font-bold text-red-500">{results.log.filter(l => l.status === 'Fabricated').length}</div>
                                        <div className="text-[10px] uppercase font-bold text-red-500">Hallucinated</div>
                                    </div>

                                    {/* Export actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                // generate a simple Markdown report and download
                                                const md = ['# Asterscholar Verification Report', '', `Processed ${results.log.length} citations`, '', ...results.log.map((r, i) => `## ${i + 1}\n- Status: ${r.status}\n- Original: ${r.original}\n- Corrected: ${r.corrected}\n- Details: ${r.details}\n`)].join('\n');
                                                const blob = new Blob([md], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'asterscholar-verification.md';
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="text-xs px-3 py-2 bg-white text-black rounded-lg font-bold hover:shadow-md transition"
                                        >Export Report</button>
                                        <button
                                            onClick={() => {
                                                // create a simple BibTeX file and download
                                                const bib = generateBibtexFromResults(results.log);
                                                const blob = new Blob([bib], { type: 'application/x-bibtex' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'asterscholar-references.bib';
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="text-xs px-3 py-2 bg-white/10 border border-white/20 rounded-lg font-bold hover:bg-white/20 transition"
                                        >Export .bib</button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Workspace */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Left: Verification Log */}
                                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Verification Log</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[600px]">
                                        {results.log.map((item, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border transition-all ${item.status === 'Verified' ? 'bg-green-50/30 border-green-100' :
                                                item.status === 'Corrected' ? 'bg-amber-50/30 border-amber-100' :
                                                    'bg-red-50/30 border-red-100'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.status === 'Verified' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'Corrected' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-stone-400 italic">APA 7th Format</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="text-stone-400 flex items-start gap-2">
                                                        <span className="text-[10px] font-bold mt-1">FROM:</span>
                                                        <span className="text-xs line-through">{item.original}</span>
                                                    </div>
                                                    <div className="text-stone-900 flex items-start gap-2">
                                                        <span className="text-[10px] font-bold mt-1">TO:</span>
                                                        <span className="text-xs font-medium">{item.corrected}</span>
                                                    </div>
                                                </div>
                                                {item.paper && (
                                                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                                                        <div className="text-[10px] text-stone-500 flex items-center gap-1">
                                                            <ShieldCheck size={12} className="text-green-600" />
                                                            Authentic Source Found
                                                        </div>
                                                        <a href={item.paper.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-stone-100 rounded-md transition-colors">
                                                            <ExternalLink size={14} className="text-stone-400" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Middle: Resulting Text */}
                                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Corrected Manuscript</span>
                                        <button className="flex items-center gap-2 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors">
                                            <Check size={14} />
                                            Copy Text
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 prose prose-stone max-w-none text-stone-800 font-serif leading-relaxed text-lg">
                                        <ReactMarkdown>{results.correctedText}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Right: Extracted References & Formatter */}
                                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Extracted References</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {/* Render formatted references */}
                                        <ReferencesPane results={results} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep('input')}
                                    className="px-6 py-3 border border-stone-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-sm"
                                >
                                    <RotateCcw size={18} />
                                    Start New Search
                                </button>
                                <button className="px-6 py-3 bg-white border border-stone-200 rounded-2xl font-bold flex items-center gap-2 hover:shadow-md transition-all">
                                    <FileText size={18} />
                                    Export as Report (.md)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Disclaimer */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                        <AlertTriangle size={12} className="text-amber-500" />
                        Asterscholar focuses on factual verification. Always check final sources.
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ReferenceFinderPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold">Initializing Asterscholar Engine...</div>}>
            <ReferenceFinderContent />
        </Suspense>
    );
}

// ReferencesPane: renders and formats extracted references, dynamic-imports citation-js at runtime
function ReferencesPane({ results }: { results: { correctedText: string; log: VerificationResult[] } }) {
    const [style, setStyle] = useState<'apa' | 'mla' | 'chicago' | 'ieee'>('apa');
    const [formatted, setFormatted] = useState<string[]>([]);

    const refs = useMemo<{ title: string; authors: string; year?: number; url?: string; raw: string }[]>(() => {
        return results.log.map((item) => {
            if (item.paper) {
                return {
                    title: item.paper.title,
                    authors: item.paper.authors || '',
                    year: item.paper.year,
                    url: item.paper.url,
                    raw: item.corrected,
                };
            }
            return {
                title: item.corrected,
                authors: '',
                year: undefined,
                url: undefined,
                raw: item.corrected,
            };
        });
    }, [results]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // Attempt to dynamically import citation-js; if unavailable, fall back to plain formatting
                const citationModule: any = await import('citation-js').catch(() => null);
                if (!citationModule) {
                    const out = refs.map((r) => `${r.authors ? r.authors + ' ' : ''}${r.year ? `(${r.year}) ` : ''}${r.title}${r.url ? ' ' + r.url : ''}`);
                    if (!cancelled) setFormatted(out);
                    return;
                }

                const CiteClass = (citationModule && (citationModule.default || citationModule)) as any;

                const items = refs.map((r) => {
                    // try to split authors into given/family
                    const authorArr = (r.authors || '').split(/;|, and |, /).map((name: string) => {
                        const parts = name.trim().split(' ');
                        const family = parts.pop() || '';
                        const given = parts.join(' ');
                        return family ? { given, family } : null;
                    }).filter(Boolean);

                    const cs = {
                        title: r.title,
                        author: authorArr,
                        issued: r.year ? { 'date-parts': [[r.year]] } : undefined,
                        URL: r.url,
                        DOI: r.url && r.url.includes('doi.org') ? r.url.split('doi.org/')[1] : undefined,
                        type: 'article-journal',
                    } as any;
                    return cs;
                });

                try {
                    const cite = new CiteClass(items);
                    // Try to format bibliography using style name; citation-js templates may vary but many accept common names
                    const bib = cite.format('bibliography', { format: 'text', template: style });
                    let out: string[] = [];
                    if (typeof bib === 'string') {
                        out = bib.split(/\n\n+/).map((s: string) => s.trim()).filter(Boolean);
                    } else if (Array.isArray(bib)) {
                        out = bib;
                    } else {
                        out = items.map((r: any) => `${(r.author || []).map((a: any) => `${a.family}, ${a.given}`).join('; ')} ${r.issued ? `(${r.issued['date-parts'][0][0]}) ` : ''}${r.title} ${r.URL || ''}`);
                    }

                    if (!cancelled) setFormatted(out);
                } catch (e) {
                    // formatting failed — fallback to simple strings
                    const out = refs.map((r) => `${r.authors ? r.authors + ' ' : ''}${r.year ? `(${r.year}) ` : ''}${r.title}${r.url ? ' ' + r.url : ''}`);
                    if (!cancelled) setFormatted(out);
                }
            } catch (err) {
                const out = refs.map((r) => `${r.authors ? r.authors + ' ' : ''}${r.year ? `(${r.year}) ` : ''}${r.title}${r.url ? ' ' + r.url : ''}`);
                if (!cancelled) setFormatted(out);
            }
        })();
        return () => { cancelled = true; };
    }, [refs, style]);

    const copyAll = async () => {
        try {
            await navigator.clipboard.writeText(formatted.join('\n\n'));
        } catch (e) {
            console.warn('Copy failed', e);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase text-stone-400 mr-2">Style</label>
                    <select value={style} onChange={(e) => setStyle(e.target.value as any)} className="text-xs p-2 rounded-lg border">
                        <option value="apa">APA</option>
                        <option value="mla">MLA</option>
                        <option value="chicago">Chicago</option>
                        <option value="ieee">IEEE</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={copyAll} className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg">Copy All</button>
                </div>
            </div>

            <div className="space-y-3">
                {formatted.length === 0 && <div className="text-sm text-stone-400">Formatting references...</div>}
                {formatted.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.18 }}
                        className="p-3 border rounded-lg bg-stone-50 flex items-start justify-between"
                    >
                        <div className="text-sm text-stone-800 whitespace-pre-wrap mr-4">{f}</div>
                        <div className="flex flex-col gap-2">
                            <CopyButton text={f} />
                            <a href={refs[i]?.url || '#'} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-white border rounded">Open</a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Helper: generate a simple BibTeX string from verification results
function generateBibtexFromResults(log: VerificationResult[]) {
    // produce very small bibtex entries using available metadata
    return log.map((r, i) => {
        const key = `ref${i + 1}`;
        const title = r.paper?.title || r.corrected || r.original || 'Untitled';
        const authors = r.paper?.authors || '';
        const year = r.paper?.year || '';
        const url = r.paper?.url || '';
        const entry = `@article{${key},\n  title = {${escapeBib(title)}},\n  author = {${escapeBib(authors)}},\n  year = {${year}},\n  url = {${url}}\n}`;
        return entry;
    }).join('\n\n');
}

function escapeBib(s: string) {
    return String(s || '').replace(/([{}\\])/g, '\\$1');
}

// Small copy button component with feedback
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                } catch (e) {
                    console.warn('copy failed', e);
                }
            }}
            className={`text-[10px] px-2 py-1 ${copied ? 'bg-emerald-600 text-white' : 'bg-white'} border rounded`}
        >
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

