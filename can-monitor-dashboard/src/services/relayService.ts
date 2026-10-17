import { supabase } from '@/services/supabaseClient';
import { demoRelayStatus } from '@/services/demoData';
import type { RelayStatus } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getRelayStatus(): Promise<RelayStatus[]> {
  if (demoMode || !supabase) {
    return demoRelayStatus;
  }

  const { data, error } = await supabase.from('relay_status').select('*').order('updated_at', { ascending: false });

  if (error) {
    console.warn('Failed to load relay status, showing demo fallback');
    return demoRelayStatus;
  }

  return (data ?? []) as RelayStatus[];
}
