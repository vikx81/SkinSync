import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadPhoto, deletePhoto as deletePhotoFromStorage, isDemoMode } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { mockPhotos, generateId } from '../lib/mockData';
import type { Photo } from '../types/database';

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    if (isDemoMode) {
      setPhotos([...mockPhotos]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const addPhoto = async (
    file: File,
    options: {
      date?: string;
      category?: string;
      routine_id?: string;
      treatment_id?: string;
      notes?: string;
    } = {}
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    const url = await uploadPhoto(file, user.id, options.category || 'progress');
    if (!url) {
      return { error: new Error('Failed to upload photo') };
    }

    const newPhoto: Photo = {
      id: generateId(),
      user_id: user.id,
      url,
      date: options.date ?? new Date().toISOString().split('T')[0],
      category: options.category,
      routine_id: options.routine_id,
      treatment_id: options.treatment_id,
      notes: options.notes,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      setPhotos((prev) => [newPhoto, ...prev]);
      return { data: newPhoto, error: null };
    }

    const { data, error } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        url,
        date: options.date ?? new Date().toISOString().split('T')[0],
        category: options.category,
        routine_id: options.routine_id,
        treatment_id: options.treatment_id,
        notes: options.notes,
      })
      .select()
      .single();

    if (!error && data) {
      setPhotos((prev) => [data, ...prev]);
    }

    return { data, error };
  };

  const deletePhoto = async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return { error: new Error('Photo not found') };

    await deletePhotoFromStorage(photo.url);

    if (isDemoMode) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      return { error: null };
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (!error) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }

    return { error };
  };

  const getPhotosByDate = (date: string) => {
    return photos.filter((p) => p.date === date);
  };

  const getPhotosByDateRange = (startDate: string, endDate: string) => {
    return photos.filter((p) => p.date >= startDate && p.date <= endDate);
  };

  return {
    photos,
    loading,
    fetchPhotos,
    addPhoto,
    deletePhoto,
    getPhotosByDate,
    getPhotosByDateRange,
  };
}
