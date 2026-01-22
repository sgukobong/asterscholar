'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Mail, Lock, ShieldCheck, Github, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, signup, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'password' | 'signup'>('email');
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
                // Try login first
                await login(email, password);
                router.push('/');
            } catch (err: any) {
                // If login fails with invalid credentials, offer signup
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
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    return (
        <div className="p-8 md:p-12 w-full h-screen flex items-center justify-center bg-[#EAE8E2]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mockup-container max-w-[1000px] h-[700px] flex overflow-hidden lg:grid lg:grid-cols-2"
            >
                {/* Left Side: Illustration / Branding */}
                <div className="hidden lg:flex bg-[#FAF9F6] p-12 flex-col justify-between relative border-r border-stone-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1 rounded-full">
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Asterscholar</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">
                            Sign in to replace <br />
                            hallucinations with <br />
                            real facts.
                        </h2>
                        <p className="text-stone-500 text-lg">
                            Academic integrity first. We never sell your data.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-stone-300 uppercase tracking-widest">
                        <ShieldCheck size={16} />
                        <span>Secure Auth 2026 Standards</span>
                    </div>
                </div>

                {/* Right Side: Form */}
                <main className="flex-1 bg-white p-12 flex flex-col justify-center relative">
                    <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.1]" />

                    <div className="relative z-10 w-full max-w-sm mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Link 
                                href="/"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">Welcome back</h1>
                            </div>
                        </div>
                        <p className="text-stone-500 mb-8">Enter your credentials to continue research.</p>

                        <form onSubmit={handleNext} className="space-y-4">
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
                                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-black/10 transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Authenticating..." : step === 'email' ? "Continue" : "Sign in"}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative flex items-center justify-center mb-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                                <span className="relative bg-white px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">or continue with</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center gap-3 py-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all font-medium">
                                    <Globe size={18} />
                                    <span>Google</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 py-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all font-medium">
                                    <Github size={18} />
                                    <span>ORCID</span>
                                </button>
                            </div>
                        </div>

                        <p className="mt-12 text-center text-sm text-stone-400">
                            New to Asterscholar? Just enter your email above and we'll help you create an account.
                        </p>
                    </div>
                </main>
            </motion.div>
        </div>
    );
}
