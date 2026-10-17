import { supabase } from '@/services/supabaseClient';
import { demoFaults } from '@/services/demoData';
import type { FaultEvent } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getFaults(): Promise<FaultEvent[]> {
  if (demoMode || !supabase) {
    return demoFaults;
  }

  const { data, error } = await supabase.from('faults').select('*').order('detected_at', { ascending: false });

  if (error) {
    console.warn('Failed to load fault events, showing demo fallback');
    return demoFaults;
  }

  return (data ?? []) as FaultEvent[];
}
