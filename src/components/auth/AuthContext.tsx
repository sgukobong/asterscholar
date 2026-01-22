'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { UserProfile, SubscriptionTier } from '@/lib/supabase/database.types';

interface User {
    uid: string;
    email: string;
    displayName: string | null;
    subscriptionTier: SubscriptionTier;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await loadUserProfile(session.user);
                
                // Create profile for new OAuth users
                if (event === 'SIGNED_IN' && session.user.app_metadata.provider === 'google') {
                    const { error: profileError } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email!,
                            display_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                            subscription_tier: 'free' as const,
                        }, {
                            onConflict: 'id'
                        });
                    
                    if (profileError) {
                        console.warn('Profile creation for OAuth user:', profileError.message);
                    }
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadUserProfile = async (supabaseUser: SupabaseUser) => {
        try {
            // Fetch user profile from database
            const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine for new users
                // Handle missing table or other database errors gracefully
                console.warn('User profile table may not exist:', error.message);
            }

            setUser({
                uid: supabaseUser.id,
                email: supabaseUser.email!,
                displayName: userProfile?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || null,
                subscriptionTier: userProfile?.subscription_tier || 'free',
            });
        } catch (error) {
            console.warn('Error in loadUserProfile, using auth data only:', error);
            // Fallback to auth data only
            setUser({
                uid: supabaseUser.id,
                email: supabaseUser.email!,
                displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || null,
                subscriptionTier: 'free',
            });
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        // Skip profile creation if table doesn't exist - auth still works
        if (data.user) {
            try {
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: data.user.id,
                        email: data.user.email!,
                        display_name: email.split('@')[0],
                        subscription_tier: 'free' as const,
                    }, {
                        onConflict: 'id'
                    });

                if (profileError) {
                    console.warn('Profile creation skipped:', profileError.message);
                }
            } catch (err) {
                console.warn('Users table not available, auth still works');
            }
        }
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
