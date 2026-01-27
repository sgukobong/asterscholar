'use client';

import { motion } from 'framer-motion';
import { FileText, Database, Search, Share2, BookOpen, User, CheckCircle, Sparkles, Network } from 'lucide-react';

export default function ResearchDiagram() {
    return (
        <div className="relative w-full max-w-lg mx-auto h-64 opacity-80 select-none">
            {/* Central Hub */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
                <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-stone-200">
                    <Sparkles className="text-white" size={32} />
                </div>
            </motion.div>

            {/* Orbiting Nodes */}
            {[
                { icon: BookOpen, x: -80, y: -60, delay: 0.1 },
                { icon: Database, x: 80, y: -60, delay: 0.2 },
                { icon: Search, x: -90, y: 40, delay: 0.3 },
                { icon: FileText, x: 90, y: 40, delay: 0.4 },
            ].map((node, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                    transition={{ delay: node.delay, type: "spring" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center shadow-sm">
                        <node.icon className="text-stone-600" size={20} />
                    </div>
                </motion.div>
            ))}

            {/* Connecting Lines (SVG overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible">
                <motion.path
                    d="M 256 128 L 176 68"
                    className="stroke-stone-300"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                />
                <motion.path
                    d="M 256 128 L 336 68"
                    className="stroke-stone-300"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                />
                <motion.path
                    d="M 256 128 L 166 168"
                    className="stroke-stone-300"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                />
                <motion.path
                    d="M 256 128 L 346 168"
                    className="stroke-stone-300"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                />
            </svg>

            {/* Floating Status Badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8"
            >
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle size={12} />
                    <span>Sources Verified</span>
                </div>
            </motion.div>
        </div>
    );
}
