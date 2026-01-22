'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { User, LogOut, Home } from 'lucide-react';

export default function Navigation() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
            {/* Logo/Home Link */}
            <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Back to homepage"
            >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AS
                </div>
                <span className="font-bold text-stone-900 hidden sm:block">Asterscholar</span>
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-2xl p-2">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
                    title="Go to homepage"
                >
                    <Home size={16} />
                    <span className="text-sm hidden sm:block">Home</span>
                </Link>
                <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors"
                >
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">Profile</span>
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
                >
                    <LogOut size={16} />
                    <span className="text-sm hidden sm:block">Logout</span>
                </button>
            </div>
        </nav>
    );
}