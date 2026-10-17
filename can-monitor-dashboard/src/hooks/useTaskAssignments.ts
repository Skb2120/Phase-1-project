import { useEffect, useState } from 'react';
import { getTaskAssignments } from '@/services/taskService';
import type { TaskAssignment } from '@/types';

export function useTaskAssignments() {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getTaskAssignments();
      if (mounted) {
        setAssignments(data);
        setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 15000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return { assignments, loading };
}
