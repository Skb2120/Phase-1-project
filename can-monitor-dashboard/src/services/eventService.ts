import { supabase } from '@/services/supabaseClient';
import { demoSystemEvents } from '@/services/demoData';
import type { SystemEvent } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getSystemEvents(): Promise<SystemEvent[]> {
  if (demoMode || !supabase) {
    return demoSystemEvents;
  }

  const { data, error } = await supabase.from('system_events').select('*').order('timestamp', { ascending: false });

  if (error) {
    console.warn('Failed to load system events, showing demo fallback');
    return demoSystemEvents;
  }

  return (data ?? []) as SystemEvent[];
}
