import { supabase } from '@/services/supabaseClient';
import { demoSensorReadings } from '@/services/demoData';
import type { SensorReading } from '@/types';

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export async function getSensorReadings(): Promise<SensorReading[]> {
  if (demoMode || !supabase) {
    return demoSensorReadings;
  }

  const { data, error } = await supabase.from('sensor_readings').select('*').order('timestamp', { ascending: false });

  if (error) {
    console.warn('Failed to load sensor readings, showing demo fallback');
    return demoSensorReadings;
  }

  return (data ?? []) as SensorReading[];
}
