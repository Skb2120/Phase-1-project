# CAN Distributed Node Monitor

A professional React + Vite dashboard for monitoring a distributed ESP32 CAN network with autonomous fault detection and backup task reassignment.

## Features

- Real-time dashboard for master and node health
- Sensor monitoring for temperature, humidity, vibration, acceleration, and gyroscope
- CAN bus message monitoring with filters and table view
- Fault detection and recovery workflows
- Backup task allocation with failover timeline
- Event log and live topology view
- Demo mode for development and presentation
- Supabase-ready data services and TypeScript interfaces

## Project structure

- `src/components` — reusable UI elements
- `src/pages` — dashboard pages
- `src/layouts` — app shell and navigation
- `src/services` — data layer for Supabase and demo data
- `src/hooks` — polling hooks for realtime-ready data access
- `src/types` — strongly typed domain models
- `src/lib` — utility helpers

## Local setup

1. Copy `.env.example` to `.env`
2. Add your Supabase URL and anon key
3. Run:

```bash
npm install
npm run dev
```

## Deploying to Vercel

Import the repository in Vercel and set **Root Directory** to `can-monitor-dashboard`.
Vercel should detect Vite; use `npm run build` as the build command and `dist` as
the output directory. The `vercel.json` rewrite serves the SPA entry point for
React Router paths such as `/nodes` and `/settings`.

## Deploying to Netlify

Set the **Base directory** to `can-monitor-dashboard`, the **Build command** to
`npm run build`, and the **Publish directory** to `dist`. The `public/_redirects`
file configures Netlify to serve the app entry point for React Router paths such
as `/nodes` and `/settings`.

## Demo mode

Set `VITE_DEMO_MODE=true` in `.env` to simulate node telemetry, fault events, and failover actions. Production data can be plugged into the same service layer without changing the UI.

## Supabase

Use the migration SQL in `supabase/migrations/001_init_schema.sql` to create the required tables and indexes.

## Security

- Frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- No service role key is stored in client code
- Database access should be protected with Row Level Security policies
