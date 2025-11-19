import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { UserSettings } from '../types/database';

interface SettingsState {
  settings: UserSettings | null;
  darkMode: boolean;
  loading: boolean;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      darkMode: false,
      loading: false,

      fetchSettings: async (userId: string) => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          set({
            settings: data,
            darkMode: data.dark_mode,
            loading: false
          });
        } else {
          set({ loading: false });
        }
      },

      updateSettings: async (updates: Partial<UserSettings>) => {
        const { settings } = get();
        if (!settings) return;

        const { error } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('id', settings.id);

        if (!error) {
          set({
            settings: { ...settings, ...updates },
            darkMode: updates.dark_mode ?? get().darkMode
          });
        }
      },

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });

        const { settings } = get();
        if (settings) {
          supabase
            .from('user_settings')
            .update({ dark_mode: newDarkMode })
            .eq('id', settings.id);
        }

        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'skinsync-settings',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
);
