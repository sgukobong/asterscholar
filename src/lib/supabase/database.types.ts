export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string | null;
                    subscription_tier: 'free' | 'scholar' | 'institution';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    subscription_tier?: 'free' | 'scholar' | 'institution';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    display_name?: string | null;
                    subscription_tier?: 'free' | 'scholar' | 'institution';
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type SubscriptionTier = 'free' | 'scholar' | 'institution';
