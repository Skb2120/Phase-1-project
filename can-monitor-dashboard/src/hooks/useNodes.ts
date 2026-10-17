import { useEffect, useState } from 'react';
import { getNodes } from '@/services/nodeService';
import type { NodeRecord } from '@/types';

export function useNodes() {
  const [nodes, setNodes] = useState<NodeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getNodes();
      if (mounted) {
        setNodes(data);
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

  return { nodes, loading };
}
