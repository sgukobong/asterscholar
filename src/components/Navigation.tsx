'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { User, LogOut, Home, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navigation() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Get user initials
    const getInitials = () => {
        if (user.displayName) {
            return user.displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
        }
        return user.email[0].toUpperCase();
    };

    // Get display name
    const getDisplayName = () => {
        return user.displayName || user.email.split('@')[0];
    };

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
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-2xl p-2 shadow-lg shadow-black/5">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
                    title="Go to homepage"
                >
                    <Home size={16} />
                    <span className="text-sm hidden sm:block">Home</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors group"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {getInitials()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block text-stone-700">
                            {getDisplayName()}
                        </span>
                        <ChevronDown
                            size={14}
                            className={`text-stone-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-xl shadow-black/10 py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {getInitials()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-900 truncate">
                                            {getDisplayName()}
                                        </p>
                                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${user.subscriptionTier === 'institution' ? 'bg-yellow-400' :
                                                    user.subscriptionTier === 'scholar' ? 'bg-purple-400' : 'bg-gray-400'
                                                }`} />
                                            <span className="text-xs text-stone-500 capitalize">
                                                {user.subscriptionTier} Plan
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <User size={16} className="text-stone-400" />
                                    Profile Settings
                                </Link>

                                <Link
                                    href="/upgrade"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <CreditCard size={16} className="text-stone-400" />
                                    Upgrade Plan
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-stone-100 pt-1">
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} className="text-red-500" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}