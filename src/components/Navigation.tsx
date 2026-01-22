'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { User, LogOut } from 'lucide-react';

export default function Navigation() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="fixed top-4 right-4 z-50">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-2xl p-2">
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