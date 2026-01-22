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

        // Update and get activity summary
        await supabase.rpc('update_activity_summary', { user_uuid: userId });
        
        const { data: activity, error: activityError } = await supabase
            .from('user_activity_summary')
            .select('*')
            .eq('user_id', userId)
            .single();

        return NextResponse.json({
            profile,
            activity: activity || {
                total_searches: 0,
                total_papers_saved: 0,
                total_chat_sessions: 0,
                total_paraphrases: 0,
                current_month_searches: 0,
                current_month_papers_saved: 0,
                current_month_chat_sessions: 0,
                current_month_paraphrases: 0,
            }
        });
    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId, updates } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
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