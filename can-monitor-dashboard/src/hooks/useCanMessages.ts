import { useEffect, useState } from 'react';
import { getCanMessages } from '@/services/canService';
import type { CanMessage } from '@/types';

export function useCanMessages() {
  const [messages, setMessages] = useState<CanMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getCanMessages();
      if (mounted) {
        setMessages(data);
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

  return { messages, loading };
}
