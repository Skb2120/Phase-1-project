import { supabase } from '@/services/supabaseClient';
import { demoNodes } from '@/services/demoData';
import type { NodeRecord } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getNodes(): Promise<NodeRecord[]> {
  if (demoMode || !supabase) {
    return demoNodes;
  }

  const { data, error } = await supabase.from('nodes').select('*').order('updated_at', { ascending: false });

  if (error) {
    console.warn('Failed to load nodes, showing demo fallback');
    return demoNodes;
  }

  return (data ?? []) as NodeRecord[];
}
