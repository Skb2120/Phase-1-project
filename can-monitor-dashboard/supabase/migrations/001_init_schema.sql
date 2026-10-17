create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  node_id text not null unique,
  node_name text not null,
  role text not null,
  status text not null,
  health integer not null default 0,
  task text,
  last_heartbeat timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  node_id text not null,
  sensor_type text not null,
  temperature double precision,
  humidity double precision,
  vibration double precision,
  accel_x double precision,
  accel_y double precision,
  accel_z double precision,
  gyro_x double precision,
  gyro_y double precision,
  gyro_z double precision,
  timestamp timestamptz not null default now()
);

create table if not exists public.can_messages (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  can_id text not null,
  source_node text not null,
  destination text not null,
  message_type text not null,
  dlc integer not null,
  data text not null,
  status text not null default 'OK'
);

create table if not exists public.faults (
  id uuid primary key default gen_random_uuid(),
  node_id text not null,
  fault_type text not null,
  severity text not null,
  description text not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  status text not null default 'OPEN',
  action_taken text not null default 'Pending'
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  primary_node text not null,
  backup_node text not null,
  active_node text not null,
  status text not null default 'NORMAL',
  assigned_at timestamptz not null default now(),
  activated_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  node_id text,
  severity text not null,
  description text not null,
  timestamp timestamptz not null default now()
);

create index if not exists idx_nodes_updated_at on public.nodes(updated_at desc);
create index if not exists idx_sensor_readings_timestamp on public.sensor_readings(timestamp desc);
create index if not exists idx_can_messages_timestamp on public.can_messages(timestamp desc);
create index if not exists idx_faults_detected_at on public.faults(detected_at desc);
create index if not exists idx_task_assignments_assigned_at on public.task_assignments(assigned_at desc);
create index if not exists idx_system_events_timestamp on public.system_events(timestamp desc);

alter table public.nodes enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.can_messages enable row level security;
alter table public.faults enable row level security;
alter table public.task_assignments enable row level security;
alter table public.system_events enable row level security;

create policy "Allow read access to authenticated users" on public.nodes for select using (true);
create policy "Allow read access to authenticated users" on public.sensor_readings for select using (true);
create policy "Allow read access to authenticated users" on public.can_messages for select using (true);
create policy "Allow read access to authenticated users" on public.faults for select using (true);
create policy "Allow read access to authenticated users" on public.task_assignments for select using (true);
create policy "Allow read access to authenticated users" on public.system_events for select using (true);
