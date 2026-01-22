'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Eye, ArrowLeft, Search, MessageSquare, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="p-8 md:p-12 w-full h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mockup-container"
            >
                {/* Sidebar */}
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
                        <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <ShieldCheck size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">About Us</span>
                        </Link>
                        <Link href="/upgrade" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <CreditCard size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Upgrade</span>
                        </Link>
                    </nav>

                    <div className="p-4 bg-white rounded-2xl border border-stone-100 italic text-[10px] text-stone-400 text-center uppercase tracking-widest">
                        Data Policy v2.0
                    </div>
                </aside>

                {/* content */}
                <main className="flex-1 relative overflow-hidden bg-white flex flex-col">
                    {/* Header for Large Screens */}
                    <div className="hidden lg:flex p-6 border-b border-stone-100 justify-between items-center">
                        <span className="font-bold text-stone-600">Privacy Policy</span>
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100">
                            <ArrowLeft size={16} />
                            <span className="text-sm font-medium">Home</span>
                        </Link>
                    </div>

                    {/* Mobile Header */}
                    <div className="flex lg:hidden p-4 border-b border-stone-100 justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="bg-black text-white p-1 rounded-full">
                                <Sparkles size={18} fill="currentColor" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Asterscholar</span>
                        </Link>
                        <Link href="/" className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded-lg transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                    </div>

                    <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.2]" />

                    <div className="relative z-10 p-12 lg:p-24 overflow-y-auto flex-1">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-8 text-black">
                                Privacy is <br />
                                Our Primary Goal.
                            </h1>
                            <p className="text-lg text-stone-500 leading-relaxed mb-16 max-w-xl">
                                We protect your manuscripts with end-to-end encryption and a strict no-log policy. Your draft is your draft.
                            </p>
                        </motion.div>

                        <div className="space-y-16">
                            <section className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3 text-black">
                                    <div className="p-2 bg-stone-100 rounded-lg"><Lock size={20} /></div>
                                    <h2 className="text-xl font-bold">Data Encryption</h2>
                                </div>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    Every manuscript you paste or upload is encrypted in transit and at rest using AES-256 standards.
                                </p>
                            </section>

                            <section className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3 text-black">
                                    <div className="p-2 bg-stone-100 rounded-lg"><Eye size={20} /></div>
                                    <h2 className="text-xl font-bold">Zero-Log Protocol</h2>
                                </div>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    We do not store your original text longer than necessary. Data is purged after your session ends.
                                </p>
                            </section>

                            <section className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3 text-black">
                                    <div className="p-2 bg-stone-100 rounded-lg"><Shield size={20} /></div>
                                    <h2 className="text-xl font-bold">Privacy-Bound APIs</h2>
                                </div>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    Providers like Google are strictly bound by agreements that prevent them from using your data for model training.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>
            </motion.div>
        </div>
    );
}
