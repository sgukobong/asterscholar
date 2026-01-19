'use client';

import React from 'react';
import { Download, Copy, Check, FileText } from 'lucide-react';
import { exportToMarkdown, exportToBibtex, exportToDocx } from '@/lib/export';
import { useState } from 'react';

interface DraftPreviewProps {
    content: string;
    onClose: () => void;
}

export function DraftPreview({ content, onClose }: DraftPreviewProps) {
    const [copied, setCopied] = useState(false);

    // Extract title (first H1 or H2)
    const titleMatch = content.match(/^#+\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : "Research_Draft";

    // Separate content and references for export (heuristic)
    const refIndex = content.lastIndexOf("## References");
    const mainContent = refIndex !== -1 ? content.substring(0, refIndex).trim() : content;
    const references = refIndex !== -1 ? content.substring(refIndex).trim() : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exportData = { title, content: mainContent, references };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded">
                            <FileText size={16} />
                        </div>
                        <h2 className="font-bold text-lg">Draft Preview</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-black">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-stone-800 bg-stone-50/30">
                    <div className="prose prose-stone max-w-none">
                        {/* Simple split rendering since we don't have a full md renderer here for preview */}
                        <pre className="whitespace-pre-wrap font-serif text-base bg-transparent p-0 border-none">
                            {content}
                        </pre>
                    </div>
                </div>

                <div className="p-4 border-t border-stone-100 bg-white flex flex-wrap gap-3 justify-end items-center">
                    <span className="text-xs text-stone-400 mr-auto">
                        {content.split(/\s+/).length} words
                    </span>

                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm font-medium transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy Text'}
                    </button>

                    <button
                        onClick={() => exportToMarkdown(exportData)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-black text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Export (.md)
                    </button>

                    <button
                        onClick={() => exportToDocx(exportData)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-stone-900 hover:bg-stone-200 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Export (.docx)
                    </button>

                    <button
                        onClick={() => exportToBibtex(exportData)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        References (.bib)
                    </button>
                </div>
            </div>
        </div>
    );
}
