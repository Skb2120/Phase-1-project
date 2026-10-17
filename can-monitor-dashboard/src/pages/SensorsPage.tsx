import { Activity, Droplets, Gauge, Move3D, Thermometer, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSensorData } from '@/hooks/useSensorData';
import { StatusBadge } from '@/components/ui/StatusBadge';

function SensorMetric({ label, value, icon, color = 'text-[#facc15]' }: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-[#facc15]/15 bg-slate-50 p-3 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
        <span className={color}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

const sensorSeries = [
  { name: '00:00', value: 24.5 },
  { name: '00:05', value: 25.1 },
  { name: '00:10', value: 25.9 },
  { name: '00:15', value: 26.4 },
  { name: '00:20', value: 26.7 },
];

export function SensorsPage() {
  const { readings, loading } = useSensorData();
  const temperature = readings.find((item) => item.sensor_type === 'temperature');
  const humidity = readings.find((item) => item.humidity != null);
  const vibration = readings.find((item) => item.sensor_type === 'vibration');
  const mpu = readings.find((item) => item.sensor_type === 'mpu6050');
  const backup = readings.find((item) => item.sensor_type === 'mpu6050_backup');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sensor Monitoring</h1>
        <StatusBadge label={loading ? 'LOADING' : 'REAL-TIME'} tone={loading ? 'neutral' : 'success'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Thermometer className="h-5 w-5 text-[#facc15]" />Node 1 — DHT11</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <SensorMetric label="Current Temp" value={<>{temperature?.temperature ?? 26.7}°C</>} icon={<Thermometer className="h-4 w-4" />} />
            <SensorMetric label="Min" value="24.3°C" icon={<Thermometer className="h-4 w-4" />} color="text-sky-300" />
            <SensorMetric label="Max" value="29.1°C" icon={<Thermometer className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Average" value="26.1°C" icon={<Gauge className="h-4 w-4" />} />
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Droplets className="h-5 w-5 text-sky-300" />Node 1 — Humidity</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <SensorMetric label="Current" value={<>{humidity?.humidity ?? 53.2}%</>} icon={<Droplets className="h-4 w-4" />} color="text-sky-300" />
            <SensorMetric label="Min" value="46.8%" icon={<Droplets className="h-4 w-4" />} color="text-sky-300" />
            <SensorMetric label="Max" value="62.4%" icon={<Droplets className="h-4 w-4" />} color="text-cyan-200" />
            <SensorMetric label="Average" value="54.1%" icon={<Gauge className="h-4 w-4" />} color="text-sky-300" />
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorSeries.map((item, index) => ({ ...item, value: 50 + index * 2.1 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Waves className="h-5 w-5 text-amber-300" />Node 2 — Vibration</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <SensorMetric label="Current" value={<>{vibration?.vibration ?? 0.64} g</>} icon={<Waves className="h-4 w-4" />} color="text-amber-300" />
            <SensorMetric label="Peak" value="1.48 g" icon={<Waves className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Average" value="0.81 g" icon={<Gauge className="h-4 w-4" />} color="text-amber-300" />
            <SensorMetric label="Threshold" value="1.2 g" icon={<Activity className="h-4 w-4" />} color="text-orange-300" />
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorSeries.map((item, index) => ({ ...item, value: 0.4 + index * 0.11 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Move3D className="h-5 w-5 text-violet-300" />Node 3 — MPU6050 #1</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <SensorMetric label="Accel X" value={mpu?.accel_x ?? 0.85} icon={<Move3D className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Accel Y" value={mpu?.accel_y ?? -0.23} icon={<Move3D className="h-4 w-4" />} color="text-emerald-300" />
            <SensorMetric label="Accel Z" value={mpu?.accel_z ?? 0.91} icon={<Move3D className="h-4 w-4" />} color="text-sky-300" />
            <SensorMetric label="Gyro X" value={mpu?.gyro_x ?? 17.5} icon={<Activity className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Gyro Y" value={mpu?.gyro_y ?? 4.3} icon={<Activity className="h-4 w-4" />} color="text-emerald-300" />
            <SensorMetric label="Gyro Z" value={mpu?.gyro_z ?? -9.1} icon={<Activity className="h-4 w-4" />} color="text-sky-300" />
          </div>
          <div className="mt-5">
            <StatusBadge label="PRIMARY" tone="success" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Move3D className="h-5 w-5 text-violet-300" />Node 4 — MPU6050 Backup</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SensorMetric label="Accel X" value={backup?.accel_x ?? 0.12} icon={<Move3D className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Accel Y" value={backup?.accel_y ?? 0.14} icon={<Move3D className="h-4 w-4" />} color="text-emerald-300" />
            <SensorMetric label="Accel Z" value={backup?.accel_z ?? 0.19} icon={<Move3D className="h-4 w-4" />} color="text-sky-300" />
            <SensorMetric label="Gyro X" value={backup?.gyro_x ?? 1.9} icon={<Activity className="h-4 w-4" />} color="text-rose-300" />
            <SensorMetric label="Gyro Y" value={backup?.gyro_y ?? -2.1} icon={<Activity className="h-4 w-4" />} color="text-emerald-300" />
            <SensorMetric label="Gyro Z" value={backup?.gyro_z ?? 1.2} icon={<Activity className="h-4 w-4" />} color="text-sky-300" />
          </div>
          <div className="mt-4">
            <StatusBadge label="STANDBY" tone="warning" />
          </div>
        </div>
      </div>
    </div>
  );
}
