import { useEffect, useState } from 'react';
import { getFaults } from '@/services/faultService';
import type { FaultEvent } from '@/types';

export function useFaults() {
  const [faults, setFaults] = useState<FaultEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getFaults();
      if (mounted) {
        setFaults(data);
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

  return { faults, loading };
}
