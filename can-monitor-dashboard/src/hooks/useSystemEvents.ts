import { useEffect, useState } from 'react';
import { getSystemEvents } from '@/services/eventService';
import type { SystemEvent } from '@/types';

export function useSystemEvents() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getSystemEvents();
      if (mounted) {
        setEvents(data);
        setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 12000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return { events, loading };
}
