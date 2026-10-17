import {
  Activity,
  AlertTriangle,
  Bell,
  Droplets,
  Gauge,
  Moon,
  Radio,
  Shield,
  ShieldCheck,
  Thermometer,
  Wifi,
  Waves,
  Move3D,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemoScenario } from '@/hooks/useDemoScenario';
import { useNodes } from '@/hooks/useNodes';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useSensorData } from '@/hooks/useSensorData';

const normalizeNodeId = (nodeId: string) => nodeId.replace(/[_\s-]/g, '').toUpperCase();

const metricRows = [
  { label: 'Total Nodes', value: '4', helper: 'Configured Nodes', tone: 'green', icon: <Shield className="h-5 w-5 text-[#22c55e]" /> },
  { label: 'Online Nodes', value: '3', helper: 'Nodes Active', tone: 'green', icon: <Wifi className="h-5 w-5 text-[#22c55e]" /> },
  { label: 'Fault Nodes', value: '1', helper: 'Nodes in Fault', tone: 'red', icon: <AlertTriangle className="h-5 w-5 text-[#ff4d4d]" /> },
  { label: 'Backup Nodes', value: '1', helper: 'Standby / Ready', tone: 'amber', icon: <ShieldCheck className="h-5 w-5 text-[#facc15]" /> },
  { label: 'CAN Bus', value: 'ONLINE', helper: 'Normal Operation', tone: 'blue', icon: <Radio className="h-5 w-5 text-[#38bdf8]" /> },
  { label: 'Active Alerts', value: '2', helper: 'Needs Attention', tone: 'amber', icon: <Bell className="h-5 w-5 text-[#facc15]" /> },
];

const nodeCards = [
  { id: 'NODE 1', name: 'DHT11 Sensor', value: '28.6°C', secondary: '67%', status: 'ONLINE', icon: <Thermometer className="h-4 w-4" /> },
  { id: 'NODE 2', name: 'Vibration Sensor', value: '32 mm/s', secondary: 'Normal', status: 'ONLINE', icon: <Waves className="h-4 w-4" /> },
  { id: 'NODE 3', name: 'MPU6050', value: 'FAULT', secondary: 'Gyro X/Y/Z', status: 'FAULT', icon: <Move3D className="h-4 w-4" /> },
  { id: 'NODE 4', name: 'Backup Node', value: 'STANDBY', secondary: 'DHT11 / Vibration / MPU6050', status: 'STANDBY', icon: <ShieldCheck className="h-4 w-4" /> },
];

const sensorChartData = [
  { time: '10:00', value: 30, value2: 55, value3: 20 },
  { time: '10:05', value: 31, value2: 57, value3: 15 },
  { time: '10:10', value: 30, value2: 65, value3: 18 },
  { time: '10:15', value: 32, value2: 59, value3: 22 },
  { time: '10:20', value: 29, value2: 60, value3: 19 },
];

const faultRows = [
  { time: '10:24:35', node: 'Node 3', type: 'HEARTBEAT TIMEOUT', severity: 'CRITICAL', status: 'ACTIVE' },
  { time: '10:20:12', node: 'Node 3', type: 'CAN TIMEOUT', severity: 'WARNING', status: 'ACTIVE' },
  { time: '10:18:40', node: 'Node 2', type: 'HIGH VIBRATION', severity: 'WARNING', status: 'RESOLVED' },
  { time: '10:15:22', node: 'Node 1', type: 'SENSOR ERROR', severity: 'INFO', status: 'RESOLVED' },
];

const canMessages = [
  { time: '10:24:36', canId: '0x101', source: 'Node 1', type: 'SENSOR', status: 'OK' },
  { time: '10:24:35', canId: '0x102', source: 'Node 2', type: 'SENSOR', status: 'OK' },
  { time: '10:24:35', canId: '0x103', source: 'Node 3', type: 'HEARTBEAT', status: 'TIMEOUT' },
  { time: '10:24:34', canId: '0x104', source: 'Node 4', type: 'HEARTBEAT', status: 'OK' },
  { time: '10:24:34', canId: '0x204', source: 'Master', type: 'TASK_ASSIGN', status: 'OK' },
];

export function DashboardPage() {
  const { nodes } = useNodes();
  const { assignments } = useTaskAssignments();
  const { readings } = useSensorData();
  const demoScenario = useDemoScenario();

  const failedPrimary = demoScenario === 'node-3-failed' || demoScenario === 'backup-active'
    ? nodes.find((node) => normalizeNodeId(node.node_id) === 'NODE3')
    : demoScenario === 'recovered'
      ? undefined
      : nodes.find((node) =>
        node.role === 'PRIMARY' && (node.status === 'FAULT' || node.status === 'OFFLINE'),
      );
  const activeBackupAssignment = assignments.find((assignment) =>
    normalizeNodeId(assignment.backup_node) === 'NODE4'
    && normalizeNodeId(assignment.active_node) === 'NODE4'
    && (assignment.status === 'ACTIVE' || assignment.status === 'FAILOVER'),
  );
  const failedTaskAssignment = failedPrimary
    ? assignments.find((assignment) =>
      normalizeNodeId(assignment.primary_node) === normalizeNodeId(failedPrimary.node_id)
      && normalizeNodeId(assignment.backup_node) === 'NODE4',
    )
    : undefined;
  const backupAssignment = activeBackupAssignment ?? failedTaskAssignment;
  const backupNode = nodes.find((node) => normalizeNodeId(node.node_id) === 'NODE4');
  const backupActive = demoScenario === 'backup-active'
    || demoScenario === 'node-3-failed'
    || (demoScenario === 'normal' && Boolean(activeBackupAssignment || failedPrimary || backupNode?.status === 'ACTIVE'));
  const backupReadings = readings.filter((reading) => normalizeNodeId(reading.node_id) === 'NODE4');
  const backupSensorKind = (
    backupAssignment?.task_name
    ?? failedPrimary?.task
    ?? (demoScenario === 'backup-active' || demoScenario === 'node-3-failed' ? 'MPU6050 Monitoring' : '')
  ).toLowerCase();
  const backupSensorLabel = backupSensorKind.includes('dht') || backupSensorKind.includes('temp')
    ? 'DHT11'
    : backupSensorKind.includes('vibration')
      ? 'Vibration'
      : backupSensorKind.includes('mpu')
        ? 'MPU6050'
        : backupReadings.some((reading) => reading.sensor_type.toLowerCase().includes('mpu'))
          ? 'MPU6050'
          : backupReadings.some((reading) => reading.sensor_type.toLowerCase().includes('vibration'))
            ? 'Vibration'
            : 'DHT11';
  const backupReading = backupReadings.find((reading) => {
    const sensorType = reading.sensor_type.toLowerCase();
    if (backupSensorLabel === 'DHT11') return sensorType.includes('dht') || sensorType.includes('temperature');
    if (backupSensorLabel === 'Vibration') return sensorType.includes('vibration');
    return sensorType.includes('mpu');
  });
  const backupTelemetry = backupSensorLabel === 'DHT11'
    ? backupReading?.temperature != null || backupReading?.humidity != null
      ? `Temp ${backupReading.temperature ?? '—'}°C · Humidity ${backupReading.humidity ?? '—'}%`
      : 'Waiting for Node 4 DHT11 telemetry'
    : backupSensorLabel === 'Vibration'
      ? backupReading?.vibration != null
        ? `Vibration ${backupReading.vibration} g`
        : 'Waiting for Node 4 vibration telemetry'
      : backupReading?.accel_x != null || backupReading?.accel_y != null || backupReading?.accel_z != null
        ? `Accel X ${backupReading.accel_x ?? '—'} · Y ${backupReading.accel_y ?? '—'} · Z ${backupReading.accel_z ?? '—'}`
        : 'Waiting for Node 4 MPU6050 telemetry';

  return (
    <div className="space-y-4 text-slate-100">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {metricRows.map(({ label, value, helper, tone, icon }) => (
          <motion.div
            key={label}
            whileHover={{ y: -3, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={[
              'rounded-2xl border p-3 shadow-[0_0_20px_rgba(250,204,21,0.08)]',
              tone === 'green' && 'border-[#22c55e]/40 bg-[#0b1d15] text-emerald-200',
              tone === 'red' && 'border-[#ff4d4d]/45 bg-[#240d0d] text-red-200',
              tone === 'amber' && 'border-[#facc15]/40 bg-[#1c1b0e] text-yellow-200',
              tone === 'blue' && 'border-[#38bdf8]/35 bg-[#091c2d] text-sky-200',
            ].join(' ')}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">{label}</span>
              <div className="rounded-lg border border-current/20 bg-black/20 p-1.5">{icon}</div>
            </div>
            <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-300 sm:text-[11px]">{helper}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-wide text-[#f8fafc] sm:text-2xl">Node Status Overview</h2>
            <div className="rounded-full border border-[#22c55e]/40 bg-[#0a1f1d] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6ee7b7]">Live</div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {nodeCards.map((node) => {
              const liveNode = nodes.find((record) => normalizeNodeId(record.node_id) === normalizeNodeId(node.id));
              const nodeStatus = node.id === 'NODE 4'
                ? backupActive ? 'ACTIVE' : 'STANDBY'
                : node.id === 'NODE 3' && (demoScenario === 'node-3-failed' || demoScenario === 'backup-active')
                  ? 'FAULT'
                  : node.id === 'NODE 3' && demoScenario === 'recovered'
                    ? 'ONLINE'
                    : liveNode?.status ?? node.status;
              const displayValue = node.id === 'NODE 3'
                ? nodeStatus === 'FAULT' ? 'FAULT' : 'ONLINE'
                : node.value;
              const isBackup = node.id === 'NODE 4';
              return (
              <motion.div
                key={node.id}
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={[
                  'relative overflow-hidden rounded-2xl border p-3 backdrop-blur-xl transition-all duration-300',
                  isBackup && backupActive
                    ? 'border-[#22c55e]/55 bg-[linear-gradient(145deg,rgba(8,37,31,0.94),rgba(7,19,29,0.92))] shadow-[0_0_28px_rgba(34,197,94,0.16),inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : isBackup
                      ? 'border-[#facc15]/30 bg-[linear-gradient(145deg,rgba(35,29,12,0.88),rgba(7,19,29,0.94))] shadow-[0_0_24px_rgba(250,204,21,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'border-[#facc15]/20 bg-[#0a1220]/90 shadow-[0_0_16px_rgba(250,204,21,0.05)]',
                ].join(' ')}
              >
                {isBackup && <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-left">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#facc15]/30 bg-[#0d1723] text-[#facc15]">{node.icon}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{node.id}</div>
                  </div>
                  <span className={[
                    'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]',
                    nodeStatus === 'ONLINE' && 'border-[#22c55e]/35 bg-[#0a1f1d] text-[#6ee7b7]',
                    nodeStatus === 'FAULT' && 'border-[#ff4d4d]/30 bg-[#260d0d] text-[#fca5a5]',
                    nodeStatus === 'STANDBY' && 'border-[#facc15]/35 bg-[#201a0a] text-[#fcd34d]',
                    nodeStatus === 'ACTIVE' && 'border-[#22c55e]/40 bg-[#08251f] text-[#86efac]',
                  ].join(' ')}>{nodeStatus}</span>
                </div>

                <div className="mb-3 rounded-xl border border-[#facc15]/15 bg-[#091520]/80 p-2.5 text-center backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">{isBackup ? 'Universal Backup Node' : node.name}</div>
                  {isBackup ? (
                    <div className="mt-3 rounded-lg border border-[#facc15]/15 bg-black/20 px-2 py-3">
                      {backupActive ? (
                        <>
                          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#6ee7b7]">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{backupSensorLabel} backup active</span>
                          </div>
                          <div className="mt-2 break-words text-sm font-semibold leading-relaxed text-white">{backupTelemetry}</div>
                          <div className="mt-1 text-[10px] text-slate-300">Task: {backupAssignment?.task_name ?? backupNode?.task ?? 'Failover task'}</div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#fcd34d]">
                            <Moon className="h-3.5 w-3.5" />
                            <span>Standby · sensors asleep</span>
                          </div>
                          <div className="mt-2 text-xs leading-relaxed text-slate-200">Universal backup ready for DHT11, vibration, and MPU6050 failover.</div>
                          <div className="mt-1 text-[10px] text-slate-300">Wakes automatically when a primary node fails.</div>
                        </>
                      )}
                    </div>
                  ) : node.id === 'NODE 1' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-[#facc15]/15 bg-black/20 px-2 py-2">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-300">
                          <Thermometer className="h-3.5 w-3.5 shrink-0 text-[#facc15]" />
                          <span>Temperature</span>
                        </div>
                        <div className="mt-1 text-base font-bold text-[#fcd34d] sm:text-lg">{node.value}</div>
                      </div>
                      <div className="rounded-lg border border-[#38bdf8]/20 bg-black/20 px-2 py-2">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-300">
                          <Droplets className="h-3.5 w-3.5 shrink-0 text-[#38bdf8]" />
                          <span>Humidity</span>
                        </div>
                        <div className="mt-1 text-base font-bold text-[#7dd3fc] sm:text-lg">{node.secondary}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 text-lg font-bold text-white sm:text-xl">{displayValue}</div>
                      <div className="mt-1 text-[11px] text-slate-300">{node.secondary}</div>
                    </>
                  )}
                </div>

                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorChartData}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                      <XAxis hide dataKey="time" />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={node.status === 'FAULT' ? '#ef4444' : '#facc15'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">System Topology</h2>
            <span className="rounded-full border border-[#22c55e]/35 bg-[#0a1f1d] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6ee7b7]">Live</span>
          </div>

          <div className="space-y-3">
            <div className="mx-auto flex max-w-[120px] justify-center rounded-xl border border-[#facc15]/35 bg-[#0e1a2a] px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.15)]">
              Master ESP32
            </div>
            <div className="flex justify-center text-[#facc15]">
              <span className="text-2xl">↓</span>
            </div>
            <div className="mx-auto w-32 rounded-xl border border-[#facc15]/35 bg-[#0e1a2a] px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#38bdf8]">CAN BUS</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {['Node 1', 'Node 2', 'Node 3', 'Node 4'].map((node, index) => (
                <div
                  key={node}
                  className={[
                    'rounded-xl border px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em]',
                    index === 0 && 'border-[#22c55e]/35 bg-[#0a1a15] text-[#6ee7b7]',
                    index === 1 && 'border-[#22c55e]/35 bg-[#0a1a15] text-[#6ee7b7]',
                    index === 2 && 'border-[#ff4d4d]/35 bg-[#210d0d] text-[#fca5a5]',
                    index === 3 && 'border-[#facc15]/35 bg-[#1d1c0d] text-[#fcd34d]',
                  ].join(' ')}
                >
                  {node}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">Real-Time Sensor Data</h2>
              <span className="text-xs text-slate-400 sm:text-sm">Last 1 Hour</span>
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-3">
              {[
                { label: 'Temperature', node: 'NODE 1', current: '28.6', unit: '°C', color: '#facc15', dataKey: 'value', icon: <Thermometer className="h-4 w-4" /> },
                  { label: 'Humidity', node: 'NODE 1', current: '67', unit: '%', color: '#38bdf8', dataKey: 'value2', icon: <Droplets className="h-4 w-4" /> },
                  { label: 'Vibration', node: 'NODE 2', current: '32', unit: 'mm/s', color: '#22c55e', dataKey: 'value3', icon: <Waves className="h-4 w-4" /> },
              ].map((chart) => (
                <div key={chart.label} className="min-w-0 rounded-2xl border border-[#facc15]/15 bg-[#090909] p-3">
                  <div className="mb-2 flex min-w-0 items-center gap-2 text-sm text-slate-200">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#facc15]/25 bg-[#111] text-[#facc15]">
                      {chart.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center justify-between gap-1">
                        <div className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300">{chart.label}</div>
                        <div className="shrink-0 text-[8px] font-medium uppercase tracking-wide text-slate-500">{chart.node}</div>
                      </div>
                      <div className="flex min-w-0 items-baseline gap-1 whitespace-nowrap text-xl font-bold leading-tight text-white">
                        <span>{chart.current}</span><span className="text-xs font-semibold text-slate-300">{chart.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensorChartData}>
                        <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} strokeWidth={2} dot={false} />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">Fault Events</h2>
                <Link to="/faults" className="text-xs font-bold uppercase tracking-[0.15em] text-[#facc15] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]">View All</Link>
              </div>

              <div className="space-y-2 text-[10px] sm:text-xs">
                {faultRows.map((fault) => (
                    <motion.div whileHover={{ x: 2, backgroundColor: 'rgba(250,204,21,0.06)' }} transition={{ duration: 0.16 }} key={`${fault.time}-${fault.node}`} className="grid grid-cols-[1.1fr_1fr_1.2fr_0.8fr_0.8fr] items-center gap-2 rounded-xl border border-[#facc15]/10 bg-[#0a1220] px-3 py-2 text-slate-200">
                    <span>{fault.time}</span>
                    <span>{fault.node}</span>
                    <span>{fault.type}</span>
                    <span className={fault.severity === 'CRITICAL' ? 'text-[#fca5a5]' : fault.severity === 'WARNING' ? 'text-[#fcd34d]' : 'text-[#93c5fd]'}>{fault.severity}</span>
                    <span className={fault.status === 'ACTIVE' ? 'text-[#fca5a5]' : 'text-[#6ee7b7]'}>{fault.status}</span>
                    </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">Backup & Recovery</h2>
                <Link to="/backup" className="text-xs font-bold uppercase tracking-[0.15em] text-[#facc15] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]">View Details</Link>
              </div>

              <div className="space-y-3">
                {assignments.length ? assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border border-[#facc15]/15 bg-[#0a1220] p-3">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                      <span>{assignment.task_name}</span>
                      <span className="text-[#6ee7b7]">{assignment.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-200">Primary: {assignment.primary_node}</div>
                    <div className="text-sm text-slate-200">Backup: {assignment.backup_node}</div>
                  </div>
                )) : (
                  <div className="rounded-xl border border-[#facc15]/15 bg-[#0a1220] p-3 text-sm text-slate-200">
                    Node 3 failure detected. Backup Node 4 activated and task reassigned successfully.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">CAN Bus Monitor</h2>
              <Link to="/can-monitor" className="text-xs font-bold uppercase tracking-[0.15em] text-[#facc15] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]">View All</Link>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.16em] text-slate-300 sm:text-xs">
              <div className="rounded-xl border border-[#facc15]/15 bg-[#0a1220] p-2"><div className="text-xl font-black text-white sm:text-2xl">245</div><div>Messages</div></div>
              <div className="rounded-xl border border-[#facc15]/15 bg-[#0a1220] p-2"><div className="text-xl font-black text-white sm:text-2xl">2</div><div>Errors</div></div>
              <div className="rounded-xl border border-[#facc15]/15 bg-[#0a1220] p-2"><div className="text-xl font-black text-white sm:text-2xl">0.5%</div><div>Error Rate</div></div>
            </div>

            <div className="space-y-2 text-[10px] text-slate-200 sm:text-xs">
              {canMessages.map((message) => (
                <motion.div whileHover={{ x: 2, backgroundColor: 'rgba(56,189,248,0.06)' }} transition={{ duration: 0.16 }} key={`${message.time}-${message.canId}`} className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr_0.8fr] items-center gap-2 rounded-xl border border-[#facc15]/10 bg-[#0a1220] px-2 py-2">
                  <span>{message.time}</span>
                  <span>{message.canId}</span>
                  <span>{message.source}</span>
                  <span>{message.type}</span>
                  <span className={message.status === 'TIMEOUT' ? 'text-[#fca5a5]' : 'text-[#6ee7b7]'}>{message.status}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#facc15]/25 bg-[#07131d]/90 p-4 shadow-[0_0_24px_rgba(250,204,21,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#f8fafc] sm:text-2xl">Relay Status</h2>
              <Link to="/relay" className="text-xs font-bold uppercase tracking-[0.15em] text-[#facc15] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15]">Manual Control</Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {[
                { name: 'Relay CH1', state: 'ON', route: 'Primary Path' },
                { name: 'Relay CH2', state: 'OFF', route: 'Backup Path' },
              ].map((relay) => (
                <div key={relay.name} className="rounded-2xl border border-[#facc15]/15 bg-[#0a1220] p-3 text-center">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">{relay.name}</div>
                  <div className={[
                    'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border text-lg font-black',
                    relay.state === 'ON' ? 'border-[#22c55e]/35 bg-[#0a1f1d] text-[#6ee7b7]' : 'border-[#facc15]/35 bg-[#1f1b0e] text-[#fcd34d]',
                  ].join(' ')}>{relay.state === 'ON' ? 'ON' : 'OFF'}</div>
                  <div className="text-sm font-semibold text-white">{relay.route}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
