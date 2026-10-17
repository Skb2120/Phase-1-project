import { supabase } from '@/services/supabaseClient';
import { demoTaskAssignments } from '@/services/demoData';
import type { TaskAssignment } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getTaskAssignments(): Promise<TaskAssignment[]> {
  if (demoMode || !supabase) {
    return demoTaskAssignments;
  }

  const { data, error } = await supabase.from('task_assignments').select('*').order('assigned_at', { ascending: false });

  if (error) {
    console.warn('Failed to load task assignments, showing demo fallback');
    return demoTaskAssignments;
  }

  return (data ?? []) as TaskAssignment[];
}
