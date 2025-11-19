import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { mockRoutines, generateId } from '../lib/mockData';
import type { Routine, TimeOfDay } from '../types/database';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchRoutines = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    if (isDemoMode) {
      setRoutines([...mockRoutines]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time_of_day', { ascending: true });

    if (!error && data) {
      setRoutines(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const addRoutine = async (routine: {
    date?: string;
    time_of_day: TimeOfDay;
    product_ids: string[];
    notes?: string;
    photo_url?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const newRoutine: Routine = {
      id: generateId(),
      user_id: user.id,
      date: routine.date ?? new Date().toISOString().split('T')[0],
      time_of_day: routine.time_of_day,
      product_ids: routine.product_ids,
      notes: routine.notes,
      photo_url: routine.photo_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      setRoutines((prev) => [newRoutine, ...prev]);
      return { data: newRoutine, error: null };
    }

    const { data, error } = await supabase
      .from('routines')
      .insert({
        ...routine,
        user_id: user.id,
        date: routine.date ?? new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!error && data) {
      setRoutines((prev) => [data, ...prev]);
    }

    return { data, error };
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    if (isDemoMode) {
      const updatedRoutine = { ...routines.find((r) => r.id === id)!, ...updates, updated_at: new Date().toISOString() };
      setRoutines((prev) => prev.map((r) => (r.id === id ? updatedRoutine : r)));
      return { data: updatedRoutine, error: null };
    }

    const { data, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setRoutines((prev) =>
        prev.map((r) => (r.id === id ? data : r))
      );
    }

    return { data, error };
  };

  const deleteRoutine = async (id: string) => {
    if (isDemoMode) {
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      return { error: null };
    }

    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id);

    if (!error) {
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    }

    return { error };
  };

  const getRoutinesByDate = (date: string) => {
    return routines.filter((r) => r.date === date);
  };

  const getTodayRoutines = () => {
    const today = new Date().toISOString().split('T')[0];
    return getRoutinesByDate(today);
  };

  return {
    routines,
    loading,
    fetchRoutines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutinesByDate,
    getTodayRoutines,
  };
}
