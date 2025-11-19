import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { mockTreatments, generateId } from '../lib/mockData';
import type { Treatment, TreatmentType } from '../types/database';
import { addDays, isWithinInterval, parseISO } from 'date-fns';

export function useTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchTreatments = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    if (isDemoMode) {
      setTreatments([...mockTreatments]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setTreatments(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const addTreatment = async (treatment: {
    treatment_type: TreatmentType;
    date?: string;
    notes?: string;
    photo_url?: string;
    buffer_days?: number;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const newTreatment: Treatment = {
      id: generateId(),
      user_id: user.id,
      treatment_type: treatment.treatment_type,
      date: treatment.date ?? new Date().toISOString().split('T')[0],
      notes: treatment.notes,
      photo_url: treatment.photo_url,
      buffer_days: treatment.buffer_days ?? 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      setTreatments((prev) => [newTreatment, ...prev]);
      return { data: newTreatment, error: null };
    }

    const { data, error } = await supabase
      .from('treatments')
      .insert({
        ...treatment,
        user_id: user.id,
        date: treatment.date ?? new Date().toISOString().split('T')[0],
        buffer_days: treatment.buffer_days ?? 7,
      })
      .select()
      .single();

    if (!error && data) {
      setTreatments((prev) => [data, ...prev]);
    }

    return { data, error };
  };

  const updateTreatment = async (id: string, updates: Partial<Treatment>) => {
    if (isDemoMode) {
      const updatedTreatment = { ...treatments.find((t) => t.id === id)!, ...updates, updated_at: new Date().toISOString() };
      setTreatments((prev) => prev.map((t) => (t.id === id ? updatedTreatment : t)));
      return { data: updatedTreatment, error: null };
    }

    const { data, error } = await supabase
      .from('treatments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTreatments((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      );
    }

    return { data, error };
  };

  const deleteTreatment = async (id: string) => {
    if (isDemoMode) {
      setTreatments((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    }

    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (!error) {
      setTreatments((prev) => prev.filter((t) => t.id !== id));
    }

    return { error };
  };

  // Check if retinol should be blocked based on treatment buffer
  const isRetinolBlocked = useCallback((date: Date = new Date()): { blocked: boolean; treatment: Treatment | null; message: string } => {
    for (const treatment of treatments) {
      const treatmentDate = parseISO(treatment.date);
      const bufferDays = treatment.buffer_days || 7;

      const bufferStart = addDays(treatmentDate, -bufferDays);
      const bufferEnd = addDays(treatmentDate, bufferDays);

      if (isWithinInterval(date, { start: bufferStart, end: bufferEnd })) {
        const daysUntilSafe = Math.ceil((bufferEnd.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return {
          blocked: true,
          treatment,
          message: `Retinol blocked due to ${treatment.treatment_type} treatment on ${treatment.date}. Safe to use in ${daysUntilSafe} days.`,
        };
      }
    }

    return { blocked: false, treatment: null, message: '' };
  }, [treatments]);

  // Get buffer periods for calendar display
  const getBufferPeriods = useCallback(() => {
    return treatments.map((treatment) => {
      const treatmentDate = parseISO(treatment.date);
      const bufferDays = treatment.buffer_days || 7;

      return {
        treatment,
        start: addDays(treatmentDate, -bufferDays),
        end: addDays(treatmentDate, bufferDays),
      };
    });
  }, [treatments]);

  return {
    treatments,
    loading,
    fetchTreatments,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    isRetinolBlocked,
    getBufferPeriods,
  };
}
