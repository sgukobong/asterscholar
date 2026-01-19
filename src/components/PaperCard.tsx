'use client';

import React, { useState } from 'react';
import { Paper } from '@/types';
import { ExternalLink, Copy, Check, Quote, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Cite = require('citation-js');

interface PaperCardProps {
    paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
    const [copied, setCopied] = useState(false);
    const [showCitation, setShowCitation] = useState(false);
    const [citationFormat, setCitationFormat] = useState('apa');
    const [citationText, setCitationText] = useState('');

    const generateCitation = async (format: string) => {
        try {
            // In a real app we'd fetch BIBTEX or CSL JSON. 
            // Cite-js works best with DOI or formatted input.
            // Here we will try to construct a simple CSL-JSON object manually 
            // or use the DOI if available.

            let input: any = null;
            if (paper.externalIds.DOI) {
                input = paper.externalIds.DOI;
            } else {
                // Fallback: simple manual citation text construction 
                // because full CSL generation requires strict data
                const authors = paper.authors.map(a => a.name).join(', ');
                const year = paper.year || 'n.d.';
                const title = paper.title;
                const venue = paper.venue || '';

                // Very basic Manual logic just for visual validation if DOI fails
                const manual = `${authors} (${year}). ${title}. ${venue}. ${paper.url}`;
                setCitationText(manual);
                return;
            }

            const cite = new Cite(input);
            const output = cite.format('bibliography', {
                format: 'text',
                template: format,
                lang: 'en-US'
            });
            setCitationText(output.trim());
        } catch (e) {
            console.error('Citation generation failed', e);
            setCitationText(`${paper.title} - ${paper.url}`);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(citationText || `${paper.title} - ${paper.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleCitation = () => {
        if (!showCitation) {
            generateCitation(citationFormat);
        }
        setShowCitation(!showCitation);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                            {paper.title}
                        </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {paper.authors.length > 0 ? paper.authors.map(a => a.name).slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '') : 'Unknown Authors'}
                        {' • '}
                        {paper.year || 'n.d.'}
                        {paper.venue ? ` • ${paper.venue}` : ''}
                    </p>

                    {paper.abstract && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {paper.abstract}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        {paper.isOpenAccess && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Open Access
                            </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {paper.citationCount} Citations
                        </span>
                        {paper.externalIds.DOI && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                DOI: {paper.externalIds.DOI}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 flex gap-3">
                <button
                    onClick={toggleCitation}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <Quote size={16} />
                    {showCitation ? 'Hide Citation' : 'Cite'}
                </button>
                <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ExternalLink size={16} />
                    View Paper
                </a>
                {paper.openAccessPdf && (
                    <a
                        href={paper.openAccessPdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-600 transition-colors ml-auto"
                    >
                        <BookOpen size={16} />
                        PDF
                    </a>
                )}
            </div>

            {showCitation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                >
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                            {['apa', 'mla', 'chicago', 'ieee'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => { setCitationFormat(style); generateCitation(style); }}
                                    className={`text-xs px-2 py-1 rounded ${citationFormat === style ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {style.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-words">
                        {citationText || 'Generating...'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
