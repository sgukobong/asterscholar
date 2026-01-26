'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, AlertCircle, CheckCircle, ArrowRight, RefreshCw, FileText, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/components/auth/AuthContext';
import ReactMarkdown from 'react-markdown';

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

            <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm mb-6">
                        <ShieldCheck size={16} className="text-black" />
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Research Integrity Tool</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Reference Verifier
                    </h1>
                    <p className="text-xl text-stone-500 max-w-2xl mx-auto">
                        Verify citations, detect hallucinations, and correct references with AI-powered scholarly search.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-320px)] min-h-[600px]">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 flex flex-col border border-stone-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FileText size={20} className="text-stone-400" />
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
                            className="flex-1 w-full p-4 bg-[#FAF9F6] border border-stone-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-black/5 text-lg leading-relaxed transition-all placeholder:text-stone-300"
                        />

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleVerify}
                                disabled={!inputText.trim() || isLoading}
                                className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-black/10 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Verify References
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 flex flex-col border border-stone-100 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 mesh-pattern opacity-[0.05] pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck size={20} className={isLoading ? "text-blue-500 animate-pulse" : "text-green-500"} />
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
                                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 p-8 space-y-4">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-2">
                                        <Search size={32} strokeWidth={1.5} />
                                    </div>
                                    <p className="max-w-xs">
                                        Paste your text on the left to start verifying citations against 200M+ scholarly papers.
                                    </p>
                                </div>
                            ) : (
                                <div className="prose prose-stone max-w-none">
                                    {latestMessage?.content ? (
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-8 mb-4 pb-2 border-b border-stone-100" {...props} />,
                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-6 bg-stone-50 rounded-xl border border-stone-100"><table className="w-full text-sm" {...props} /></div>,
                                                thead: ({ node, ...props }) => <thead className="bg-stone-100 text-left font-bold" {...props} />,
                                                th: ({ node, ...props }) => <th className="p-3 whitespace-nowrap" {...props} />,
                                                td: ({ node, ...props }) => <td className="p-3 border-t border-stone-200" {...props} />,
                                            }}
                                        >
                                            {latestMessage.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col gap-4 animate-pulse">
                                            <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                                            <div className="h-4 bg-stone-100 rounded w-full"></div>
                                            <div className="h-4 bg-stone-100 rounded w-5/6"></div>
                                            <div className="h-32 bg-stone-50 rounded-xl mt-4"></div>
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
