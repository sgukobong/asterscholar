'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, AlertCircle, CheckCircle, ArrowRight, RefreshCw, FileText, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/components/auth/AuthContext';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function ReferenceVerifier() {
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const [started, setStarted] = useState(false);

    const { messages, append, status, setMessages } = useChat({
        api: '/api/verify-references',
        initialMessages: [],
    } as any) as any;

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleVerify = async () => {
        if (!inputText.trim()) return;

        setStarted(true);
        setMessages([]); // Clear previous results

        await append({
            role: 'user',
            content: inputText
        });
    };

    const latestMessage = messages.length > 0 ? (messages[messages.length - 1] as any) : null;

    return (
        <div className="min-h-screen bg-[#EAE8E2] text-stone-900 font-sans selection:bg-black/10">
            <Navigation />

            <div className="pt-20 pb-8 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Mobile Logo */}
                <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                    <div className="bg-black text-white p-1 rounded-full">
                        <Sparkles size={16} fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">Asterscholar</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm mb-4">
                        <ShieldCheck size={14} className="text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Research Integrity Tool</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Reference Verifier
                    </h1>
                    <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto">
                        Verify citations, detect hallucinations, and correct references with AI-powered scholarly search.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-stone-200/50 flex flex-col border border-stone-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <FileText size={18} className="text-stone-400" />
                                Input Text
                            </h2>
                            <button
                                onClick={() => setInputText('')}
                                className="text-xs font-medium text-stone-400 hover:text-red-500 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your text with citations here (e.g., 'As reported by Einstein (2025)...'). We'll check every reference against real scholarly databases."
                            className="flex-1 w-full p-3 bg-[#FAF9F6] border border-stone-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black/5 text-sm leading-relaxed transition-all placeholder:text-stone-300"
                        />

                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={handleVerify}
                                disabled={!inputText.trim() || isLoading}
                                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-black/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Verify References
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Output Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-stone-200/50 flex flex-col border border-stone-100 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 mesh-pattern opacity-[0.05] pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <ShieldCheck size={18} className={isLoading ? "text-blue-500 animate-pulse" : "text-green-500"} />
                                Verification Report
                            </h2>
                            {isLoading && (
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                                    Checking Databases...
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {!started ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 p-6 space-y-3">
                                    <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-2">
                                        <Search size={24} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm max-w-xs">
                                        Paste your text on the left to start verifying citations against 200M+ scholarly papers.
                                    </p>
                                </div>
                            ) : (
                                <div className="prose prose-stone max-w-none text-sm">
                                    {latestMessage?.content ? (
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3 pb-2 border-b border-stone-100" {...props} />,
                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-4 bg-stone-50 rounded-lg border border-stone-100"><table className="w-full text-xs" {...props} /></div>,
                                                thead: ({ node, ...props }) => <thead className="bg-stone-100 text-left font-bold" {...props} />,
                                                th: ({ node, ...props }) => <th className="p-2 whitespace-nowrap" {...props} />,
                                                td: ({ node, ...props }) => <td className="p-2 border-t border-stone-200" {...props} />,
                                            }}
                                        >
                                            {latestMessage.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col gap-3 animate-pulse">
                                            <div className="h-3 bg-stone-100 rounded w-3/4"></div>
                                            <div className="h-3 bg-stone-100 rounded w-full"></div>
                                            <div className="h-3 bg-stone-100 rounded w-5/6"></div>
                                            <div className="h-24 bg-stone-50 rounded-lg mt-3"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
