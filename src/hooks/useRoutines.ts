import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Routine, TimeOfDay } from '../types/database';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchRoutines = useCallback(async () => {
    if (!user) return;

    setLoading(true);
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
