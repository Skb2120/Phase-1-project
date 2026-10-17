export type NodeRole = 'MASTER' | 'PRIMARY' | 'BACKUP';
export type NodeStatusValue = 'ONLINE' | 'OFFLINE' | 'FAULT' | 'STANDBY' | 'ACTIVE' | 'BACKUP' | 'RECOVERING';
export type FaultSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
export type RelayState = 'ON' | 'OFF';
export type RelayRoute = 'PRIMARY' | 'BACKUP';
export type MessageStatus = 'OK' | 'ERROR' | 'QUEUED';

export interface NodeRecord {
  id: string;
  node_id: string;
  node_name: string;
  role: NodeRole;
  status: NodeStatusValue;
  health: number;
  task: string;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
  can_status: string;
}

export interface SensorReading {
  id: string;
  node_id: string;
  sensor_type: string;
  temperature?: number | null;
  humidity?: number | null;
  vibration?: number | null;
  accel_x?: number | null;
  accel_y?: number | null;
  accel_z?: number | null;
  gyro_x?: number | null;
  gyro_y?: number | null;
  gyro_z?: number | null;
  timestamp: string;
}

export interface CanMessage {
  id: string;
  timestamp: string;
  can_id: string;
  source_node: string;
  destination: string;
  message_type: string;
  dlc: number;
  data: string;
  status: MessageStatus;
}

export interface FaultEvent {
  id: string;
  node_id: string;
  fault_type: string;
  severity: FaultSeverity;
  description: string;
  detected_at: string;
  resolved_at: string | null;
  status: 'OPEN' | 'RESOLVED';
  action_taken: string;
}

export interface TaskAssignment {
  id: string;
  task_name: string;
  primary_node: string;
  backup_node: string;
  active_node: string;
  status: 'NORMAL' | 'ACTIVE' | 'RECOVERED' | 'FAILOVER';
  assigned_at: string;
  activated_at: string | null;
  completed_at: string | null;
}

export interface SystemEvent {
  id: string;
  event_type: string;
  node_id: string;
  severity: EventSeverity;
  description: string;
  timestamp: string;
}

export interface RelayStatus {
  id: string;
  channel: 1 | 2;
  relay_name: string;
  state: RelayState;
  route: RelayRoute;
  last_change: string;
}
