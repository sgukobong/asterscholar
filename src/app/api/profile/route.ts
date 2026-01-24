import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // Get basic activity data from existing tables
        const { data: searchCount } = await supabase
            .from('search_history')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);

        const { data: savedPapersCount } = await supabase
            .from('saved_papers')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);

        const activity = {
            total_searches: searchCount?.length || 0,
            total_papers_saved: savedPapersCount?.length || 0,
            total_chat_sessions: 0,
            total_paraphrases: 0,
            current_month_searches: 0,
            current_month_papers_saved: 0,
            current_month_chat_sessions: 0,
            current_month_paraphrases: 0,
        };

        return NextResponse.json({
            profile,
            activity
        });
    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const ALLOWED_FIELDS = ['display_name', 'bio', 'institution', 'research_interests'];
const MAX_LENGTHS = { display_name: 100, bio: 500, institution: 200 };

function validateUpdates(updates: any): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(updates)) {
        if (!ALLOWED_FIELDS.includes(key)) continue;
        
        if (typeof value === 'string') {
            const trimmed = value.trim();
            const maxLen = MAX_LENGTHS[key as keyof typeof MAX_LENGTHS];
            if (maxLen && trimmed.length > maxLen) {
                throw new Error(`${key} exceeds maximum length of ${maxLen}`);
            }
            sanitized[key] = trimmed;
        } else if (key === 'research_interests' && Array.isArray(value)) {
            sanitized[key] = value.filter(i => typeof i === 'string' && i.trim()).slice(0, 10);
        }
    }
    
    return sanitized;
}

export async function PUT(request: NextRequest) {
    try {
        const { userId, updates } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const sanitizedUpdates = validateUpdates(updates);
        
        const { data, error } = await supabase
            .from('users')
            .update(sanitizedUpdates as any)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ profile: data });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}