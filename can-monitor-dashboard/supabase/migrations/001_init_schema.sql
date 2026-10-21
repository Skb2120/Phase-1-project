CREATE TABLE public.sensor_readings (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),

    node1_online boolean,
    node2_online boolean,
    node3_online boolean,
    node4_online boolean,

    temperature_c real,
    humidity_pct real,

    vibration_raw integer,
    vibration_detected boolean,

    accel_x_g real,
    accel_y_g real,
    accel_z_g real,

    gyro_x_dps real,
    gyro_y_dps real,
    gyro_z_dps real,

    recovery_active boolean,
    recovery_task integer,
    failed_node integer,
    recovery_acknowledged boolean,
    recovery_data_verified boolean,

    can_error_count bigint,
    malformed_frame_count bigint
);

ALTER TABLE public.sensor_readings
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prototype_insert"
ON public.sensor_readings
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "prototype_read"
ON public.sensor_readings
FOR SELECT TO anon
USING (true);