import { useEffect, useState } from 'react';
import { getSensorReadings } from '@/services/sensorService';
import type { SensorReading } from '@/types';

export function useSensorData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const data = await getSensorReadings();
      if (mounted) {
        setReadings(data);
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

  return { readings, loading };
}
