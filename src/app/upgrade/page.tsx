'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, Zap, Crown, Building2, ArrowLeft, Search, MessageSquare, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function UpgradePage() {
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
            price: "$19",
            period: "/month",
            description: "For professional researchers and PhD candidates.",
            features: ["Unlimited Verifications", "Advanced Academic Co-Pilot", "Batch Reference Correction", "Priority API lanes", "Early access to new models"],
            icon: <Crown size={24} className="text-black" />,
            button: "Go Pro",
            current: false,
            popular: true,
            productId: "p_scholar"
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
        setLoadingPlan(planName);
        try {
            const res = await fetch(`/api/payments/checkout?product_id=${productId}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Failed to create checkout");
            const { checkout_url } = await res.json();

            // Redirect to Dodo Payments checkout page
            window.location.href = checkout_url;
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("Upgrade failed. Please try again.");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="p-8 md:p-12 w-full h-screen flex items-center justify-center bg-[#EAE8E2]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mockup-container w-full h-full max-w-[1440px] max-h-[900px]"
            >
                {/* Sidebar */}
                <aside className="w-64 border-r border-stone-100 bg-[#FAF9F6] flex flex-col p-6 hidden lg:flex">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="bg-black text-white p-1 rounded-full">
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Asterscholar</span>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Account</div>
                        <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <Search size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">Search Library</span>
                        </Link>
                        <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600 hover:text-black group">
                            <ShieldCheck size={18} className="text-stone-400 group-hover:text-black" />
                            <span className="font-medium">About</span>
                        </Link>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-stone-100 text-black font-medium">
                            <CreditCard size={18} className="text-black" />
                            <span>Upgrade</span>
                        </div>
                    </nav>

                    <div className="p-4 bg-white rounded-2xl border border-stone-50 shadow-sm mt-auto text-center">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Support</p>
                        <p className="text-xs font-bold font-mono">billing@asterscholar.com</p>
                    </div>
                </aside>

                {/* content */}
                <main className="flex-1 relative overflow-hidden bg-white flex flex-col">
                    <div className="absolute inset-0 mesh-pattern pointer-events-none opacity-[0.2]" />

                    <div className="relative z-10 p-12 lg:p-20 overflow-y-auto flex-1">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-4 text-black text-center">
                                Upgrade Your Research.
                            </h1>
                            <p className="text-lg text-stone-500 leading-relaxed max-w-xl mx-auto">
                                Unlock the full power of high-fidelity AI and verifiable citations. Choose a plan that fits your academic workflow.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {tiers.map((tier, idx) => (
                                <motion.div
                                    key={tier.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-8 rounded-[2rem] border transition-all ${tier.popular
                                        ? "bg-black text-white border-black shadow-2xl shadow-black/20 -translate-y-2"
                                        : "bg-[#FAF9F6] border-stone-100 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${tier.popular ? "bg-white/10" : "bg-white shadow-sm"}`}>
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-bold">{tier.price}</span>
                                        <span className={`text-sm ${tier.popular ? "text-stone-400" : "text-stone-500"}`}>{tier.period}</span>
                                    </div>
                                    <p className={`text-sm mb-8 ${tier.popular ? "text-stone-400" : "text-stone-500"}`}>
                                        {tier.description}
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        {tier.features.map(feature => (
                                            <div key={feature} className="flex items-center gap-3 text-sm">
                                                <Check size={16} className={tier.popular ? "text-stone-400" : "text-stone-900"} />
                                                <span className={tier.popular ? "text-stone-200" : "text-stone-600"}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => !tier.current && tier.productId && handleUpgrade(tier.productId, tier.name)}
                                        disabled={tier.current || !!loadingPlan}
                                        className={`w-full py-4 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${tier.popular
                                            ? "bg-white text-black hover:bg-stone-200"
                                            : tier.current
                                                ? "bg-stone-200 text-stone-500 cursor-default"
                                                : "bg-black text-white hover:shadow-black/20 hover:-translate-y-1"
                                            }`}>
                                        {loadingPlan === tier.name ? (
                                            <Loader2 size={18} className="animate-spin" />
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
