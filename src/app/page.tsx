'use client';

import { useState } from 'react';
import { Search, Sparkles, ShieldCheck, MessageSquare, ArrowRight, Share2, BookOpen, GraduationCap, LayoutPanelLeft, FileText, Database, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/reference-finder?text=${encodeURIComponent(query)}`);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 w-full h-screen flex items-center justify-center bg-[#EAE8E2]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mockup-container w-full h-full max-w-[1440px] max-h-[900px]"
      >
        {/* Sidebar (Left) */}
        <aside className="w-64 border-r border-stone-100 bg-[#FAF9F6] flex flex-col p-6 hidden lg:flex">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-black text-white p-1 rounded-full">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">Asterscholar</span>
            <div className="ml-auto text-stone-300">
              <LayoutPanelLeft size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <section>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Research Tools</div>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-stone-100 font-medium text-black transition-all">
                  <Search size={18} className="text-black" />
                  <span>Find References</span>
                </button>
                <Link href="/co-pilot" className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-black hover:bg-white hover:shadow-sm transition-all group">
                  <MessageSquare size={18} className="text-stone-400 group-hover:text-black" />
                  <span className="font-medium">Co-Pilot</span>
                </Link>
                <Link href="/paraphraser" className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-black hover:bg-white hover:shadow-sm transition-all group">
                  <FileText size={18} className="text-stone-400 group-hover:text-black" />
                  <span className="font-medium">Paraphraser</span>
                </Link>
                <Link href="/upgrade" className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-black hover:bg-white hover:shadow-sm transition-all group">
                  <CreditCard size={18} className="text-stone-400 group-hover:text-black" />
                  <span className="font-medium">Upgrade</span>
                </Link>
              </nav>
            </section>

            <section>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Database</div>
              <div className="space-y-3 px-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Database size={14} />
                  <span>200M+ Academic Papers</span>
                </div>
              </div>
            </section>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-50 shadow-sm mt-auto">
            <p className="text-[10px] leading-relaxed text-stone-400 text-center">
              Asterscholar AI Powered Primary Research Platform.
            </p>
          </div>
        </aside>

        {/* Main Content Area (Right) */}
        <main className="flex-1 relative overflow-hidden bg-white flex flex-col items-center justify-center p-8">
          {/* Top Bar inside Mockup */}
          <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-stone-500 hover:text-black px-4 py-2 border border-stone-200 rounded-full transition-all bg-white hover:bg-stone-50">Log in</Link>
            <Link href="/login" className="text-sm font-bold text-white px-4 py-2 bg-black rounded-full shadow-lg shadow-black/10 hover:shadow-black/20 transition-all">Sign up</Link>
          </div>

          {/* Decorative Mesh Background */}
          <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.2]" />

          {/* Decorative Network Icons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] right-[15%] text-stone-100 opacity-60">
              <Share2 size={160} strokeWidth={0.3} />
            </div>
            <div className="absolute bottom-[10%] left-[10%] text-stone-100 opacity-60">
              <BookOpen size={200} strokeWidth={0.2} />
            </div>
            <div className="absolute top-[35%] left-[5%] text-stone-50/50">
              <GraduationCap size={140} strokeWidth={0.2} />
            </div>
          </div>

          {/* Center Search Interaction */}
          <div className="relative z-20 w-full max-w-2xl flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.1] text-black">
                Asterscholar — AI Powered<br />
                Primary Research Platform<br />
                for Researchers
              </h1>
            </motion.div>

            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="relative flex items-center bg-white border border-stone-200 rounded-full p-2 shadow-xl shadow-stone-200/40 focus-within:ring-4 focus-within:ring-black/5 transition-all">
                <div className="pl-4 text-stone-400">
                  <Search size={22} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics, authors, or concepts..."
                  className="flex-1 bg-transparent px-4 py-3 text-lg outline-none placeholder:text-stone-300 font-medium"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#E5E3DC] text-stone-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all group"
                >
                  <Sparkles size={16} />
                  Find References
                </button>
              </div>
            </form>
          </div>

          {/* Footer inside Mockup */}
          <div className="absolute bottom-10 flex items-center gap-10 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] z-20">
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
            <Link href="/upgrade" className="hover:text-black transition-colors underline decoration-black/20 underline-offset-4">Upgrade</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
