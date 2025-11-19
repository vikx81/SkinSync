import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const uploadPhoto = async (
  file: File,
  userId: string,
  folder: string = 'progress'
): Promise<string | null> => {
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
  const path = url.split('/photos/')[1];
  if (!path) return false;

  const { error } = await supabase.storage
    .from('photos')
    .remove([path]);

  return !error;
};
