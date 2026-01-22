'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabase/supabase';
import { User, Settings, BookOpen, MessageSquare, FileText, Search, Calendar, Trophy, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

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

    useEffect(() => {
        if (user) {
            loadProfile();
            loadActivity();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.uid)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadActivity = async () => {
        try {
            await supabase.rpc('update_activity_summary', { user_uuid: user?.uid });
            
            const { data, error } = await supabase
                .from('user_activity_summary')
                .select('*')
                .eq('user_id', user?.uid)
                .single();

            if (error) throw error;
            setActivity(data);
        } catch (error) {
            console.error('Error loading activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user?.uid);

            if (error) throw error;
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
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
            <div className="max-w-6xl mx-auto">
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
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-stone-800 transition-colors"
                            >
                                <Edit3 size={16} />
                                {isEditing ? 'Cancel' : 'Edit Profile'}
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

    const handleSave = () => {
        onUpdate(formData);
    };

    return (
        <div className="bg-stone-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            
            {isEditing ? (
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Display Name"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <input
                        type="text"
                        placeholder="Institution"
                        value={formData.institution}
                        onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                        className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <textarea
                        placeholder="Bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    />
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
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            onUpdate([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        onUpdate(interests.filter((i: string) => i !== interest));
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
                        {interest}
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
                        placeholder="Add research interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
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
                <button className="w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Export Research Data
                </button>
                <button className="w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Manage Subscription
                </button>
                <button className="w-full text-left p-3 hover:bg-white rounded-xl transition-colors text-sm">
                    Privacy Settings
                </button>
            </div>
        </div>
    );
}