'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Globe, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { user, login, signup, loginWithGoogle, logout } = useAuth();
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 'email') {
            setStep('password');
        } else {
            setLoading(true);
            try {
                await login(email, password);
                onClose();
                resetForm();
            } catch (err: any) {
                if (err.message?.includes('Invalid login credentials') || err.message?.includes('Email not confirmed')) {
                    setIsNewUser(true);
                    setError('Account not found. Would you like to create one?');
                } else {
                    setError(err.message || 'Authentication failed');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            await signup(email, password);
            setError('Account created! Please check your email to verify your account.');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Logout failed');
        }
    };

    const resetForm = () => {
        setStep('email');
        setEmail('');
        setPassword('');
        setError('');
        setIsNewUser(false);
    };

    const handleClose = () => {
        onClose();
        setTimeout(resetForm, 300); // Reset after animation
    };

    // Get user initials
    const getInitials = () => {
        if (!user) return '';
        if (user.displayName) {
            return user.displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
        }
        return user.email[0].toUpperCase();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Content */}
                            <div className="p-8">
                                {user ? (
                                    // Authenticated User View
                                    <div className="text-center">
                                        <div className="mb-6">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                                                {getInitials()}
                                            </div>
                                            <h2 className="text-2xl font-bold text-stone-900 mb-1">
                                                {user.displayName || user.email.split('@')[0]}
                                            </h2>
                                            <p className="text-stone-500 text-sm mb-2">{user.email}</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full">
                                                <div className={`w-2 h-2 rounded-full ${user.subscriptionTier === 'institution' ? 'bg-yellow-400' :
                                                        user.subscriptionTier === 'scholar' ? 'bg-purple-400' : 'bg-gray-400'
                                                    }`} />
                                                <span className="text-xs font-medium text-stone-600 capitalize">
                                                    {user.subscriptionTier} Plan
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all group"
                                            >
                                                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        </div>

                                        {error && (
                                            <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
                                        )}
                                    </div>
                                ) : (
                                    // Unauthenticated User View
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-3xl font-bold text-stone-900 mb-2">Welcome back</h2>
                                            <p className="text-stone-500">Enter your credentials to continue research.</p>
                                        </div>

                                        <form onSubmit={handleNext} className="space-y-4 mb-6">
                                            <AnimatePresence mode="wait">
                                                {step === 'email' ? (
                                                    <motion.div
                                                        key="email"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                    >
                                                        <div className="relative group">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-black transition-colors" size={20} />
                                                            <input
                                                                type="email"
                                                                required
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                placeholder="researcher@mail.com"
                                                                className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 focus:bg-white transition-all text-lg"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="password"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-black transition-colors" size={20} />
                                                            <input
                                                                type="password"
                                                                required
                                                                autoFocus
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                placeholder="••••••••"
                                                                className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 focus:bg-white transition-all text-lg"
                                                            />
                                                        </div>
                                                        {error && (
                                                            <div className="text-sm">
                                                                <p className={`font-medium ${error.includes('created') ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {error}
                                                                </p>
                                                                {isNewUser && !error.includes('created') && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleSignup}
                                                                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium underline"
                                                                    >
                                                                        Create account with this email
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-black/10 transition-all"
                                            >
                                                {loading ? "Authenticating..." : step === 'email' ? "Continue" : "Sign in"}
                                            </button>
                                        </form>

                                        <div>
                                            <div className="relative flex items-center justify-center mb-6">
                                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                                                <span className="relative bg-white px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">or continue with</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleGoogleLogin}
                                                className="w-full flex items-center justify-center gap-3 py-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all font-medium"
                                            >
                                                <Globe size={18} />
                                                <span>Google</span>
                                            </button>
                                        </div>

                                        <p className="mt-6 text-center text-sm text-stone-400">
                                            New to Asterscholar? Just enter your email above and we'll help you create an account.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
