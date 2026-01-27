'use client';

import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Sparkles, Send, ArrowLeft, FileText, ChevronRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DraftPreview } from '@/components/chat/DraftPreview';

export default function CoPilotPage() {
    const [showDraftPreview, setShowDraftPreview] = useState(false);
    const [currentDraft, setCurrentDraft] = useState('');
    const [input, setInput] = useState('');

    const { messages, sendMessage, status } = useChat();

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleOpenDraft = (content: string) => {
        setCurrentDraft(content);
        setShowDraftPreview(true);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        sendMessage({ text: input });
        setInput('');
    };

    // Helper to extract text from multi-part v6 messages
    const getMessageContent = (m: any) => {
        if (!m.parts) return '';
        return m.parts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('\n');
    };

    return (
        <div className="flex flex-col h-screen bg-[#EAEAE5] font-sans relative overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#EAEAE5]/80 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-stone-200 rounded-full transition-colors font-medium" title="Back to homepage">
                        <ArrowLeft size={20} />
                    </Link>
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-black text-white p-1.5 rounded-full">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none text-stone-900">Research Co-Pilot</h1>
                            <span className="text-xs text-stone-500 font-medium tracking-wide uppercase">Powered by Asterscholar</span>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar for quick actions */}
                <aside className="hidden lg:flex w-64 border-r border-stone-200 flex-col bg-[#EAEAE5]/50 p-6 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Drafts</h3>
                        <div className="space-y-2">
                            {messages.filter((m: any) => m.role === 'assistant' && getMessageContent(m).includes("## ")).map((m: any, i) => {
                                const content = getMessageContent(m);
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => handleOpenDraft(content)}
                                        className="w-full text-left p-2 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors flex items-center justify-between group text-stone-700"
                                    >
                                        <span className="truncate flex-1">Draft {i + 1}</span>
                                        <ChevronRight size={10} className="text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                );
                            })}
                            {messages.filter((m: any) => m.role === 'assistant' && getMessageContent(m).includes("## ")).length === 0 && (
                                <span className="text-[10px] text-stone-400 italic">No drafts generated yet.</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-4">Quick Tips</h3>
                        <ul className="text-[10px] text-stone-600 space-y-3">
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold min-w-4">💡</span>
                                <span>Ask for a Literature Review to generate structured drafts.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-500 font-bold min-w-4">✏️</span>
                                <span>Use Make it shorter to refine the latest output.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-500 font-bold min-w-4">🎯</span>
                                <span>Mention specific DOIs and topics for better grounding.</span>
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Chat Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
                    <div className="max-w-3xl mx-auto space-y-6 pb-32">
                        {messages.length === 0 && (
                            <div className="text-center py-16 px-4 text-stone-900">
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Make a Draft.</h2>
                                    <p className="text-stone-500 max-w-md mx-auto mb-10 text-base leading-relaxed">
                                        Generate verifiable literature reviews, outlines, and summaries grounded in real research.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                                        {[
                                            "Draft a literature review on solar cell efficiency",
                                            "Create a comparison table of LLM architectures",
                                            "What are the research gaps in urban vertical farming?",
                                            "Summarize methodology in recent 5G network papers"
                                        ].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => {
                                                    setInput(q);
                                                }}
                                                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-black hover:shadow-md transition-all text-xs font-semibold text-stone-800 shadow-sm"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {messages.map((m: any) => {
                            const content = getMessageContent(m);
                            return (
                                <div key={m.id} className="group relative">
                                    <ChatMessage role={m.role as 'user' | 'assistant'} content={content} />
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleOpenDraft(content)}
                                            className="p-2 bg-stone-100 hover:bg-black hover:text-white rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase transition-colors"
                                        >
                                            <FileText size={12} />
                                            Open in Editor
                                        </button>
                                        <Link
                                            href={`/paraphraser?text=${encodeURIComponent(content.substring(0, 1000))}`}
                                            className="p-2 bg-stone-100 hover:bg-black hover:text-white rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase transition-colors"
                                        >
                                            <RotateCcw size={12} />
                                            Paraphrase
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex gap-4 p-4 rounded-xl">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center animate-spin">
                                    <Sparkles size={16} />
                                </div>
                                <div className="text-sm text-stone-500 flex items-center font-medium">
                                    Synthesizing evidence...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area (Centered) */}
                    <div className="absolute bottom-8 left-0 right-0 px-4">
                        <div className="max-w-3xl mx-auto relative group">
                            <form onSubmit={handleSubmit} className="relative z-10">
                                <input
                                    className="w-full p-5 pr-14 rounded-2xl border border-stone-300 shadow-2xl shadow-stone-500/10 bg-white focus:outline-none focus:ring-4 focus:ring-black/5 placeholder-stone-400 text-lg transition-all"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Draft an introduction for..."
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-3 top-3 p-3 bg-black text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="text-center mt-3 text-[10px] text-stone-400 font-medium">
                                Research Co-Pilot never hallucinates. Every claim is cited [n].
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Render Draft Preview Overlay */}
            {showDraftPreview && (
                <DraftPreview content={currentDraft} onClose={() => setShowDraftPreview(false)} />
            )}
        </div>
    );
}
