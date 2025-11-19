import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_USER_ID } from '../lib/mockData';

// Demo user object
const demoUser: User = {
  id: DEMO_USER_ID,
  email: 'demo@skinsync.app',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
} as User;

interface AuthState {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isDemo: isDemoMode,

  signIn: async (email: string, password: string) => {
    if (isDemoMode) {
      set({ user: demoUser });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  },

  signUp: async (email: string, password: string) => {
    if (isDemoMode) {
      set({ user: demoUser });
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error as Error | null };
  },

  signOut: async () => {
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
    set({ user: null });
  },

  initialize: async () => {
    if (isDemoMode) {
      // Auto-login in demo mode
      set({ user: demoUser, loading: false });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },
}));
