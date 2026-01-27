'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, Zap, Crown, Building2, ArrowLeft, Search, MessageSquare, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function UpgradePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const tiers = [
        {
            name: "Student",
            price: "$0",
            description: "Perfect for thesis drafting and basic verification.",
            features: ["50 Verification Credits /mo", "Standard Paraphraser", "Literature Summaries", "Basic Co-Pilot access"],
            icon: <Zap size={24} className="text-stone-400" />,
            button: "Current Plan",
            current: true,
            productId: "p_free"
        },
        {
            name: "Scholar",
            price: "$15",
            period: "/month",
            description: "For professional researchers and PhD candidates.",
            features: ["Unlimited Verifications", "Advanced Academic Co-Pilot", "Batch Reference Correction", "Priority API lanes", "Early access to new models"],
            icon: <Crown size={24} className="text-yellow-400" />,
            button: "Go Pro",
            current: false,
            popular: true,
            productId: "pdt_0NWpedFEGqCX15ECA9mUQ"
        },
        {
            name: "Institution",
            price: "Custom",
            description: "For universities, labs, and research groups.",
            features: ["SSO & Team Management", "Institutional Knowledge Base", "Bulk Citation Audits", "Dedicated Support", "On-premise deployment options"],
            icon: <Building2 size={24} className="text-stone-600" />,
            button: "Contact Sales",
            current: false,
            productId: "p_institution"
        }
    ];

    const handleUpgrade = async (productId: string, planName: string) => {
        // Check if user is authenticated
        if (!user) {
            router.push('/login');
            return;
        }

        setLoadingPlan(planName);
        try {
            const res = await fetch(`/api/payments/checkout?product_id=${productId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data?.details || data?.error || "Failed to create checkout");
            }
            
            const { checkout_url } = data;
            if (!checkout_url) {
                throw new Error("No checkout URL returned from server");
            }

            // Redirect to Dodo Payments checkout page
            window.location.href = checkout_url;
        } catch (error) {
            console.error("Upgrade error:", error);
            alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
            setLoadingPlan(null);
        }
    };

    return (
        <div className="p-4 pt-16 md:p-6 w-full h-screen flex items-center justify-center bg-[#EAE8E2]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mockup-container w-full h-full max-w-[1440px] max-h-[900px]"
            >
                {/* Sidebar */}
                <aside className="w-56 border-r border-stone-100 bg-[#FAF9F6] flex flex-col p-4 hidden lg:flex">
                    <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div className="bg-black text-white p-1 rounded-full">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Asterscholar</span>
                    </Link>

                    <nav className="space-y-1 flex-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">Navigation</div>
                        <Link href="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group text-sm">
                            <ArrowLeft size={16} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3 mt-4">Account</div>
                        <Link href="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group text-sm">
                            <Search size={16} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Search Library</span>
                        </Link>
                        <Link href="/about" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group text-sm">
                            <ShieldCheck size={16} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">About</span>
                        </Link>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white shadow-sm border border-stone-100 text-black font-medium text-sm">
                            <CreditCard size={16} className="text-black" />
                            <span>Upgrade</span>
                        </div>
                    </nav>

                    <div className="p-3 bg-white rounded-xl border border-stone-50 shadow-sm mt-auto text-center">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Support</p>
                        <p className="text-xs font-bold font-mono">billing@asterscholar.com</p>
                    </div>
                </aside>

                {/* content */}
                <main className="flex-1 relative overflow-hidden bg-white flex flex-col">
                    <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.2]" />

                    {/* Mobile Back Button */}
                    <div className="lg:hidden p-4 border-b border-stone-100 bg-white">
                        <Link href="/" className="inline-flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-black hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-200">
                            <ArrowLeft size={16} />
                            <span className="font-medium text-sm">Back to Home</span>
                        </Link>
                    </div>

                    <div className="relative z-10 p-6 lg:p-8 overflow-y-auto flex-1">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-tight mb-2 text-black text-center">
                                Upgrade Your Research.
                            </h1>
                            <p className="text-sm text-stone-500 leading-relaxed max-w-xl mx-auto">
                                Unlock the full power of high-fidelity AI and verifiable citations. Choose a plan that fits your academic workflow.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {tiers.map((tier, idx) => (
                                <motion.div
                                    key={tier.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-6 rounded-2xl border transition-all ${tier.popular
                                        ? "bg-black text-white border-black shadow-2xl shadow-black/20 -translate-y-1"
                                        : "bg-[#FAF9F6] border-stone-100 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tier.popular ? "bg-yellow-400/20" : "bg-white shadow-sm"}`}>
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-3xl font-bold">{tier.price}</span>
                                        <span className={`text-xs ${tier.popular ? "text-stone-400" : "text-stone-500"}`}>{tier.period}</span>
                                    </div>
                                    <p className={`text-xs mb-5 ${tier.popular ? "text-stone-400" : "text-stone-500"}`}>
                                        {tier.description}
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        {tier.features.map(feature => (
                                            <div key={feature} className="flex items-center gap-2 text-xs">
                                                <Check size={14} className={tier.popular ? "text-stone-400" : "text-stone-900"} />
                                                <span className={tier.popular ? "text-stone-200" : "text-stone-600"}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => !tier.current && tier.productId && handleUpgrade(tier.productId, tier.name)}
                                        disabled={tier.current || !!loadingPlan}
                                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm ${tier.popular
                                            ? "bg-white text-black hover:bg-stone-200"
                                            : tier.current
                                                ? "bg-stone-200 text-stone-500 cursor-default"
                                                : "bg-black text-white hover:shadow-black/20 hover:-translate-y-0.5"
                                            }`}>
                                        {loadingPlan === tier.name ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            tier.button
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </main>
            </motion.div>
        </div>
    );
}
