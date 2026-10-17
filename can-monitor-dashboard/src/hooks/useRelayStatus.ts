import { useEffect, useState } from 'react';
import { getRelayStatus } from '@/services/relayService';
import type { RelayStatus } from '@/types';

export function useRelayStatus() {
  const [relayStatus, setRelayStatus] = useState<RelayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const data = await getRelayStatus();
      if (isMounted) {
        setRelayStatus(data);
        setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(load, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return { relayStatus, loading };
}
