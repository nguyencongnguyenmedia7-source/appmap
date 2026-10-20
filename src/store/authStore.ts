import { create } from 'zustand';
import { Profile } from '@/types';
import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  addXp: (amount: number) => void;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DEMO_USER_PROFILE: Profile = {
  id: 'd0000000-0000-0000-0000-000000000001',
  username: 'vietnam_explorer',
  full_name: 'Nguyễn Việt Explorer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Đam mê khám phá các thành phố 3D và check-in ẩm thực Việt Nam.',
  level: 4,
  xp: 1850,
  streak_days: 7,
  last_active_at: new Date().toISOString(),
  is_verified: true,
  is_profile_private: false,
  is_location_sharing_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEMO_USER_PROFILE,
  isLoading: false,

  setUser: (user) => set({ user }),

  addXp: (amount) => {
    const current = get().user;
    if (!current) return;
    const newXp = current.xp + amount;
    const newLevel = 1 + Math.floor(newXp / 500);
    set({
      user: {
        ...current,
        xp: newXp,
        level: newLevel,
      },
    });
  },

  initializeAuth: async () => {
    if (isSupabaseConfigured) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            set({ user: profile as Profile });
            return;
          }
        }
      } catch (e) {
        console.warn('[AuthStore] Supabase auth check failed:', e);
      }
    }

    // Default to demo profile in local dev mode
    set({ user: DEMO_USER_PROFILE });
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null });
  },
}));
