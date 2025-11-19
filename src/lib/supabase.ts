import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in demo mode (no Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Create a mock client for demo mode or real client for production
export const supabase: SupabaseClient<Database> = isDemoMode
  ? (null as unknown as SupabaseClient<Database>)
  : createClient<Database>(supabaseUrl, supabaseAnonKey);

export const uploadPhoto = async (
  file: File,
  userId: string,
  folder: string = 'progress'
): Promise<string | null> => {
  if (isDemoMode) {
    // In demo mode, create a local URL for the file
    return URL.createObjectURL(file);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('photos')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const deletePhoto = async (url: string): Promise<boolean> => {
  if (isDemoMode) {
    // In demo mode, just revoke the object URL
    URL.revokeObjectURL(url);
    return true;
  }

  const path = url.split('/photos/')[1];
  if (!path) return false;

  const { error } = await supabase.storage
    .from('photos')
    .remove([path]);

  return !error;
};
