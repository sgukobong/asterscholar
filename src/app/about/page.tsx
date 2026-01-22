'use client';

import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, BookOpen, ArrowLeft, GraduationCap, Share2, Search, MessageSquare, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="p-8 md:p-12 w-full h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mockup-container"
            >
                {/* Sidebar / Top Nav area */}
                <aside className="w-72 border-r border-stone-100 bg-[#FAF9F6] flex flex-col p-8 hidden lg:flex">
                    <Link href="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
                        <div className="bg-black text-white p-1 rounded-full">
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Asterscholar</span>
                    </Link>

                    <nav className="space-y-2 flex-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">The Platform</div>
                        <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <Search size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Search Library</span>
                        </Link>
                        <Link href="/co-pilot" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <MessageSquare size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Research Co-Pilot</span>
                        </Link>
                        <Link href="/reference-finder" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <ShieldCheck size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Reference Finder</span>
                        </Link>
                        <Link href="/upgrade" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <CreditCard size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Upgrade Plan</span>
                        </Link>
                    </nav>

                    <div className="p-4 bg-white rounded-2xl border border-stone-100">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 text-center">Contact</div>
                        <div className="text-sm font-bold text-center">team@asterscholar.com</div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 relative overflow-hidden bg-white flex flex-col">
                    {/* Header for Mobile/Small Screens */}
                    <div className="lg:hidden p-6 border-b border-stone-100 flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="bg-black text-white p-1 rounded-full">
                                <Sparkles size={16} fill="currentColor" />
                            </div>
                            <span className="font-bold">Asterscholar</span>
                        </Link>
                        <Link href="/" className="p-2 hover:bg-stone-50 rounded-full" title="Back to homepage"><ArrowLeft size={20} /></Link>
                    </div>

                    {/* Header for Large Screens */}
                    <div className="hidden lg:flex p-6 border-b border-stone-100 justify-between items-center">
                        <span className="font-bold text-stone-600">About Asterscholar</span>
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors" title="Back to homepage">
                            <ArrowLeft size={16} />
                            <span className="text-sm font-medium">Home</span>
                        </Link>
                    </div>

                    {/* Decorative Mesh */}
                    <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.2]" />

                    {/* Decorative Mesh/Network Icons (matching the image) */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                            className="absolute top-20 right-20 text-stone-200"
                        >
                            <Share2 size={120} strokeWidth={0.5} />
                        </motion.div>
                        <div className="absolute bottom-40 left-40 text-stone-100 italic">
                            <BookOpen size={180} strokeWidth={0.2} />
                        </div>
                        <div className="absolute top-[30%] right-[10%] text-stone-100 italic">
                            <GraduationCap size={150} strokeWidth={0.2} />
                        </div>
                    </div>

                    <div className="relative z-10 p-12 lg:p-24 overflow-y-auto flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-8 text-black max-w-2xl">
                                Asterscholar —<br />
                                The Science of High-Fidelity Research.
                            </h1>
                            <p className="text-xl text-stone-500 leading-relaxed mb-12 max-w-xl">
                                We replace AI hallucinations with verifiable, peer-reviewed science. Built for the modern scholar who values accuracy above all else.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-12 mt-20">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-4">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-2xl font-bold">Zero Hallucination Policy</h3>
                                <p className="text-stone-500 leading-relaxed">
                                    Our verification engine is hard-coded to cross-reference every claim against global scholarly databases.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-stone-100 text-black rounded-2xl flex items-center justify-center mb-4">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-2xl font-bold">Researcher-First Workflow</h3>
                                <p className="text-stone-500 leading-relaxed">
                                    Supercharging the citation process while maintaining 100% academic integrity and privacy.
                                </p>
                            </div>
                        </div>

                        <div className="mt-32 pt-12 border-t border-stone-100">
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-8">Platform Roadmap</div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <div className="text-2xl font-bold">200M+</div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sources</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">50K+</div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Scholars</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">99.9%</div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Accuracy</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">100%</div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Privacy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Quick Actions (Floating Right) */}
                <div className="absolute bottom-12 right-12 flex items-center gap-4 z-20">
                    <Link
                        href="/co-pilot"
                        className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-black/20 hover:-translate-y-1 transition-all"
                    >
                        Start Researching
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
