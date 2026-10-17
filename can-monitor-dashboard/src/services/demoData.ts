import type { CanMessage, FaultEvent, NodeRecord, RelayStatus, SensorReading, SystemEvent, TaskAssignment } from '@/types';

const baseTime = Date.now();

const isoMinutesAgo = (minutes: number): string => new Date(baseTime - minutes * 60 * 1000).toISOString();
const isoSecondsAgo = (seconds: number): string => new Date(baseTime - seconds * 1000).toISOString();

export const demoNodes: NodeRecord[] = [
  {
    id: 'node-1',
    node_id: 'NODE_1',
    node_name: 'Node 1',
    role: 'PRIMARY',
    status: 'ONLINE',
    health: 96,
    task: 'DHT11 Monitoring',
    last_heartbeat: isoSecondsAgo(4),
    created_at: isoMinutesAgo(180),
    updated_at: isoSecondsAgo(4),
    can_status: 'ONLINE',
  },
  {
    id: 'node-2',
    node_id: 'NODE_2',
    node_name: 'Node 2',
    role: 'PRIMARY',
    status: 'ONLINE',
    health: 94,
    task: 'Vibration Monitoring',
    last_heartbeat: isoSecondsAgo(7),
    created_at: isoMinutesAgo(180),
    updated_at: isoSecondsAgo(7),
    can_status: 'ONLINE',
  },
  {
    id: 'node-3',
    node_id: 'NODE_3',
    node_name: 'Node 3',
    role: 'PRIMARY',
    status: 'ONLINE',
    health: 98,
    task: 'MPU6050 Monitoring',
    last_heartbeat: isoSecondsAgo(2),
    created_at: isoMinutesAgo(180),
    updated_at: isoSecondsAgo(2),
    can_status: 'ONLINE',
  },
  {
    id: 'node-4',
    node_id: 'NODE_4',
    node_name: 'Node 4',
    role: 'BACKUP',
    status: 'STANDBY',
    health: 100,
    task: 'Backup MPU6050 Monitoring',
    last_heartbeat: isoSecondsAgo(15),
    created_at: isoMinutesAgo(180),
    updated_at: isoSecondsAgo(15),
    can_status: 'STANDBY',
  },
];

export const demoSensorReadings: SensorReading[] = [
  {
    id: 'sensor-1',
    node_id: 'NODE_1',
    sensor_type: 'temperature',
    temperature: 26.7,
    humidity: 53.2,
    timestamp: isoSecondsAgo(5),
  },
  {
    id: 'sensor-2',
    node_id: 'NODE_2',
    sensor_type: 'vibration',
    vibration: 0.64,
    timestamp: isoSecondsAgo(10),
  },
  {
    id: 'sensor-3',
    node_id: 'NODE_3',
    sensor_type: 'mpu6050',
    accel_x: 0.85,
    accel_y: -0.23,
    accel_z: 0.91,
    gyro_x: 17.5,
    gyro_y: 4.3,
    gyro_z: -9.1,
    timestamp: isoSecondsAgo(8),
  },
  {
    id: 'sensor-4',
    node_id: 'NODE_4',
    sensor_type: 'mpu6050_backup',
    accel_x: 0.12,
    accel_y: 0.14,
    accel_z: 0.19,
    gyro_x: 1.9,
    gyro_y: -2.1,
    gyro_z: 1.2,
    timestamp: isoSecondsAgo(18),
  },
];

export const demoCanMessages: CanMessage[] = [
  {
    id: 'can-1',
    timestamp: isoSecondsAgo(12),
    can_id: '0x101',
    source_node: 'NODE_1',
    destination: 'MASTER',
    message_type: 'SENSOR_DATA',
    dlc: 8,
    data: 'TEMP=26.7,HUM=53.2',
    status: 'OK',
  },
  {
    id: 'can-2',
    timestamp: isoSecondsAgo(9),
    can_id: '0x201',
    source_node: 'NODE_2',
    destination: 'MASTER',
    message_type: 'HEARTBEAT',
    dlc: 2,
    data: 'STATUS=ONLINE',
    status: 'OK',
  },
  {
    id: 'can-3',
    timestamp: isoSecondsAgo(6),
    can_id: '0x301',
    source_node: 'NODE_3',
    destination: 'MASTER',
    message_type: 'SENSOR_DATA',
    dlc: 8,
    data: 'ACC=0.85,-0.23,0.91',
    status: 'OK',
  },
  {
    id: 'can-4',
    timestamp: isoSecondsAgo(3),
    can_id: '0x401',
    source_node: 'NODE_4',
    destination: 'MASTER',
    message_type: 'BACKUP_ACTIVATE',
    dlc: 5,
    data: 'NODE_4=ACTIVE',
    status: 'QUEUED',
  },
];

export const demoFaults: FaultEvent[] = [
  {
    id: 'fault-1',
    node_id: 'NODE_3',
    fault_type: 'HEARTBEAT_TIMEOUT',
    severity: 'WARNING',
    description: 'Heartbeat interval exceeded threshold',
    detected_at: isoSecondsAgo(45),
    resolved_at: null,
    status: 'OPEN',
    action_taken: 'Monitor backup readiness',
  },
];

export const demoTaskAssignments: TaskAssignment[] = [
  {
    id: 'task-1',
    task_name: 'MPU6050 Monitoring',
    primary_node: 'NODE_3',
    backup_node: 'NODE_4',
    active_node: 'NODE_3',
    status: 'NORMAL',
    assigned_at: isoMinutesAgo(120),
    activated_at: isoMinutesAgo(90),
    completed_at: null,
  },
];

export const demoSystemEvents: SystemEvent[] = [
  {
    id: 'event-1',
    event_type: 'NODE_ONLINE',
    node_id: 'NODE_3',
    severity: 'INFO',
    description: 'Node 3 online and reporting telemetry',
    timestamp: isoSecondsAgo(30),
  },
  {
    id: 'event-2',
    event_type: 'HEARTBEAT_TIMEOUT',
    node_id: 'NODE_3',
    severity: 'WARNING',
    description: 'Heartbeat timeout exceeded threshold',
    timestamp: isoSecondsAgo(28),
  },
  {
    id: 'event-3',
    event_type: 'BACKUP_ACTIVATED',
    node_id: 'NODE_4',
    severity: 'INFO',
    description: 'Backup node activated to maintain monitoring continuity',
    timestamp: isoSecondsAgo(16),
  },
];

export const demoRelayStatus: RelayStatus[] = [
  {
    id: 'relay-1',
    channel: 1,
    relay_name: 'Relay CH1',
    state: 'ON',
    route: 'PRIMARY',
    last_change: isoSecondsAgo(75),
  },
  {
    id: 'relay-2',
    channel: 2,
    relay_name: 'Relay CH2',
    state: 'OFF',
    route: 'BACKUP',
    last_change: isoSecondsAgo(200),
  },
];
