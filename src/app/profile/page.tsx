'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabase/supabase';
import { User, Settings, BookOpen, MessageSquare, FileText, Search, Calendar, Trophy, Edit3, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface UserProfile {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    institution: string | null;
    research_interests: string[] | null;
    subscription_tier: string;
    created_at: string;
}

interface ActivitySummary {
    total_searches: number;
    total_papers_saved: number;
    total_chat_sessions: number;
    total_paraphrases: number;
    current_month_searches: number;
    current_month_papers_saved: number;
    current_month_chat_sessions: number;
    current_month_paraphrases: number;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activity, setActivity] = useState<ActivitySummary | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadProfile();
            loadActivity();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            setError(null);
            // Use auth user data as fallback since users table may not exist
            if (user) {
                setProfile({
                    id: user.uid,
                    email: user.email,
                    display_name: user.displayName,
                    avatar_url: null,
                    bio: null,
                    institution: null,
                    research_interests: null,
                    subscription_tier: user.subscriptionTier,
                    created_at: new Date().toISOString()
                });
            }
        } catch (error: any) {
            console.warn('Profile loading fallback to auth data:', error);
            setError('Using basic profile information.');
        }
    };

    const loadActivity = async () => {
        try {
            const { error: rpcError } = await supabase.rpc('update_activity_summary', { user_uuid: user?.uid });
            if (rpcError) console.warn('Activity update failed:', rpcError);
            
            const { data, error } = await supabase
                .from('user_activity_summary')
                .select('*')
                .eq('user_id', user?.uid)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setActivity(data || null);
        } catch (error: any) {
            console.error('Error loading activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            setUpdateLoading(true);
            setError(null);
            
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user?.uid);

            if (error) throw error;
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAE8E2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAE8E2] p-6">
            {/* Top Navigation */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Back to homepage">
                        <div className="bg-black text-white p-1.5 rounded-full">
                            <Settings size={16} />
                        </div>
                        <span className="font-bold text-stone-900 hidden sm:block">Asterscholar</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                        <Home size={16} />
                        <span className="text-sm font-medium hidden sm:block">Home</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {error}
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-8 border-b border-stone-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900">
                                        {profile?.display_name || user?.email?.split('@')[0]}
                                    </h1>
                                    <p className="text-stone-600 mt-1">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Trophy size={16} className="text-amber-500" />
                                        <span className="text-sm font-medium capitalize text-stone-700">
                                            {user?.subscriptionTier} Plan
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                disabled={updateLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
                            >
                                <Edit3 size={16} />
                                {updateLoading ? 'Saving...' : isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <ProfileSection
                                title="About"
                                icon={<User size={20} />}
                                isEditing={isEditing}
                                profile={profile}
                                onUpdate={updateProfile}
                            />
                            
                            <ResearchInterests
                                isEditing={isEditing}
                                interests={profile?.research_interests || []}
                                onUpdate={(interests) => updateProfile({ research_interests: interests })}
                            />
                        </div>

                        {/* Activity Stats */}
                        <div className="space-y-6">
                            <ActivityStats activity={activity} />
                            <QuickActions />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function ProfileSection({ title, icon, isEditing, profile, onUpdate }: any) {
    const [formData, setFormData] = useState({
        display_name: profile?.display_name || '',
        bio: profile?.bio || '',
        institution: profile?.institution || ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (formData.display_name.length > 100) {
            newErrors.display_name = 'Display name must be 100 characters or less';
        }
        if (formData.bio.length > 500) {
            newErrors.bio = 'Bio must be 500 characters or less';
        }
        if (formData.institution.length > 200) {
            newErrors.institution = 'Institution must be 200 characters or less';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onUpdate(formData);
        }
    };

    return (
        <div className="bg-stone-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Display Name"
                            value={formData.display_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 ${
                                errors.display_name ? 'border-red-300' : 'border-stone-200'
                            }`}
                        />
                        {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Institution"
                            value={formData.institution}
                            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 ${
                                errors.institution ? 'border-red-300' : 'border-stone-200'
                            }`}
                        />
                        {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution}</p>}
                    </div>
                    <div>
                        <textarea
                            placeholder="Bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 resize-none ${
                                errors.bio ? 'border-red-300' : 'border-stone-200'
                            }`}
                        />
                        {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black text-white rounded-xl hover:bg-stone-800 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {profile?.institution && (
                        <p className="text-stone-600">
                            <span className="font-medium">Institution:</span> {profile.institution}
                        </p>
                    )}
                    {profile?.bio && (
                        <p className="text-stone-600">{profile.bio}</p>
                    )}
                    {!profile?.bio && !profile?.institution && (
                        <p className="text-stone-400 italic">No additional information provided</p>
                    )}
                </div>
            )}
        </div>
    );
}

function ResearchInterests({ isEditing, interests, onUpdate }: any) {
    const [newInterest, setNewInterest] = useState('');

    const addInterest = () => {
        const trimmed = newInterest.trim();
        if (trimmed && !interests.includes(trimmed) && trimmed.length <= 50) {
            onUpdate([...interests, trimmed]);
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        onUpdate(interests.filter((i: string) => i !== interest));
    };

    const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    return (
        <div className="bg-stone-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} />
                <h3 className="text-lg font-semibold">Research Interests</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest: string) => (
                    <span
                        key={interest}
                        className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm flex items-center gap-2"
                    >
                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(interest) }} />
                        {isEditing && (
                            <button
                                onClick={() => removeInterest(interest)}
                                className="text-stone-400 hover:text-red-500"
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
            </div>
            
            {isEditing && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add research interest (max 50 chars)"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        maxLength={50}
                        className="flex-1 p-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <button
                        onClick={addInterest}
                        className="px-4 py-2 bg-black text-white rounded-xl hover:bg-stone-800 transition-colors"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}

function ActivityStats({ activity }: { activity: ActivitySummary | null }) {
    const stats = [
        { label: 'Papers Saved', value: activity?.total_papers_saved || 0, thisMonth: activity?.current_month_papers_saved || 0, icon: <BookOpen size={16} /> },
        { label: 'Searches', value: activity?.total_searches || 0, thisMonth: activity?.current_month_searches || 0, icon: <Search size={16} /> },
        { label: 'Chat Sessions', value: activity?.total_chat_sessions || 0, thisMonth: activity?.current_month_chat_sessions || 0, icon: <MessageSquare size={16} /> },
        { label: 'Paraphrases', value: activity?.total_paraphrases || 0, thisMonth: activity?.current_month_paraphrases || 0, icon: <FileText size={16} /> },
    ];

    return (
        <div className="bg-stone-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} />
                <h3 className="text-lg font-semibold">Activity</h3>
            </div>
            
            <div className="space-y-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {stat.icon}
                            <span className="text-sm text-stone-600">{stat.label}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold">{stat.value}</div>
                            <div className="text-xs text-stone-500">+{stat.thisMonth} this month</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuickActions() {
    return (
        <div className="bg-stone-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Settings size={20} />
                <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            
            <div className="space-y-2">
                <a href="/api/export" className="block w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Export Research Data
                </a>
                <a href="/upgrade" className="block w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Manage Subscription
                </a>
                <a href="/privacy" className="block w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Privacy Settings
                </a>
            </div>
        </div>
    );
}