'use client';

import { useState } from 'react';
import { Search, Sparkles, ShieldCheck, MessageSquare, ArrowRight, Share2, BookOpen, GraduationCap, LayoutPanelLeft, FileText, Database, CreditCard, Menu, X, Globe, Lock } from 'lucide-react';
import ResearchDiagram from '@/components/ResearchDiagram';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/reference-finder?text=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAE8E2] overflow-hidden">
      {/* Main App Container - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mockup-container w-full h-[85vh] max-w-[1440px] shadow-2xl rounded-[2rem] overflow-hidden flex bg-white"
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
                  <Link href="/reference-verifier" className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-black hover:bg-white hover:shadow-sm transition-all group">
                    <ShieldCheck size={18} className="text-stone-400 group-hover:text-black" />
                    <span className="font-medium">Reference Verifier</span>
                  </Link>
                  <Link href="/upgrade" className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-black hover:bg-white hover:shadow-sm transition-all group">
                    <CreditCard size={18} className="text-stone-400 group-hover:text-black" />
                    <span className="font-medium">Upgrade</span>
                  </Link>
                </nav>
              </section>

              <section>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Database</div>
                <Link href="/database" className="block px-3 group">
                  <div className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-100 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-black group-hover:text-white transition-colors">
                      <Database size={14} />
                    </div>
                    <div>
                      <div className="text-xl font-bold tracking-tight text-stone-900 leading-none mb-1">213M+</div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider group-hover:text-stone-600 transition-colors">Academic Papers</div>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live Indexing" />
                    </div>
                  </div>
                </Link>
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
            {/* Mobile Logo - Top Left */}
            <div className="lg:hidden absolute top-0 left-0 p-4 md:p-8 z-30">
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/50 shadow-sm">
                <div className="bg-black text-white p-1 rounded-full">
                  <Sparkles size={14} fill="currentColor" />
                </div>
                <span className="text-sm font-bold tracking-tight text-stone-900">Asterscholar</span>
              </div>
            </div>

            {/* Top Bar inside Mockup - Show login buttons when not logged in, user menu when logged in */}
            <div className="absolute top-0 right-0 p-4 md:p-8 flex items-center gap-3 z-30">
              {/* Mobile Logo - Moved to separate container below */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-full hover:bg-stone-50 transition-all shadow-sm text-stone-700"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-full hover:bg-stone-50 transition-all shadow-sm"
              >
                {user ? (
                  <>
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName ? user.displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2) : user.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-stone-700 hidden sm:block">
                      {user.displayName || user.email.split('@')[0]}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-stone-700">Sign in</span>
                )}
              </button>
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
                className="text-center mb-10 w-full"
              >
                {/* Added Illustration */}
                <div className="mb-8 flex justify-center transform scale-90 md:scale-100">
                  <ResearchDiagram />
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-black">
                  AI Powered Primary Research Platform<br />
                  for Researchers
                </h1>
              </motion.div>

              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="relative flex items-center bg-white border border-stone-200 rounded-full p-2 shadow-xl shadow-stone-200/40 focus-within:ring-4 focus-within:ring-black/5 transition-all">
                  <div className="pl-3 md:pl-4 text-stone-400 flex-shrink-0">
                    <Search size={22} strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="flex-1 bg-transparent px-3 md:px-4 py-2 md:py-3 text-base md:text-lg outline-none placeholder:text-stone-300 font-medium min-w-0"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center gap-2 bg-[#E5E3DC] text-stone-700 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm hover:bg-black hover:text-white transition-all group whitespace-nowrap"
                  >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">Find References</span>
                    <span className="sm:hidden">Find</span>
                  </button>
                </div>
              </form>
            </div>

          </main>
        </motion.div>
      </div>

      {/* Footer - Moved Outside */}
      <footer className="w-full max-w-[1440px] mx-auto px-12 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-black transition-colors">About</Link>
          <Link href="/upgrade" className="hover:text-black transition-colors">Upgrade</Link>
          <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
        </div>
        <div className="flex items-center gap-2 opacity-50">
          <Globe size={12} />
          <span>Region: Global</span>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-[#FAF9F6] h-full shadow-2xl p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-black text-white p-1 rounded-full">
                    <Sparkles size={18} fill="currentColor" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Asterscholar</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 mt-2">Research Tools</div>

                <Link href="/reference-finder" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <Search size={20} />
                  <span className="font-medium">Find References</span>
                </Link>

                <Link href="/co-pilot" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <MessageSquare size={20} />
                  <span className="font-medium">Co-Pilot</span>
                </Link>

                <Link href="/paraphraser" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <FileText size={20} />
                  <span className="font-medium">Paraphraser</span>
                </Link>

                <Link href="/reference-verifier" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <ShieldCheck size={20} />
                  <span className="font-medium">Reference Verifier</span>
                </Link>

                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 mt-8">Database</div>

                <Link href="/database" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <Database size={20} />
                  <span className="font-medium">Database (213M+)</span>
                </Link>

                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 mt-8">Account</div>

                <Link href="/upgrade" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black">
                  <CreditCard size={20} />
                  <span className="font-medium">Upgrade</span>
                </Link>
              </nav>

              <div className="mt-8 pt-6 border-t border-stone-200">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <Link href="/about" className="hover:text-black">About</Link>
                  <Link href="/privacy" className="hover:text-black">Privacy</Link>
                  <Link href="/terms" className="hover:text-black">Terms</Link>
                </div>
                <p className="mt-6 text-[10px] text-stone-400 leading-relaxed">
                  © 2024 Asterscholar Inc.<br />
                  AI Powered Primary Research Platform.
                </p>
              </div>
            </motion.div>
          </div>
        )
      }

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div >
  );
}
