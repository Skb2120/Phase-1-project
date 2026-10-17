import { supabase } from '@/services/supabaseClient';
import { demoCanMessages } from '@/services/demoData';
import type { CanMessage } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getCanMessages(): Promise<CanMessage[]> {
  if (demoMode || !supabase) {
    return demoCanMessages;
  }

  const { data, error } = await supabase.from('can_messages').select('*').order('timestamp', { ascending: false });

  if (error) {
    console.warn('Failed to load CAN messages, showing demo fallback');
    return demoCanMessages;
  }

  return (data ?? []) as CanMessage[];
}
