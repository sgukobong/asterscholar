'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    return (
        <div className={cn(
            "flex gap-4 p-4 rounded-xl transition-colors",
            role === 'assistant' ? "bg-white border border-stone-200" : "bg-transparent"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                role === 'assistant' ? "bg-black text-white" : "bg-stone-200 text-stone-600"
            )}>
                {role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="prose prose-stone max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                    components={{
                        a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" />
                        )
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
