import { AlertTriangle, Shield, Wifi } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { setDemoScenario, useDemoScenario, type DemoScenario } from '@/hooks/useDemoScenario';

export function SettingsPage() {
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const scenario = useDemoScenario();
  const reduceMotion = useReducedMotion();
  const [message, setMessage] = useState('');

  const runScenario = (nextScenario: DemoScenario, description: string) => {
    setDemoScenario(nextScenario);
    setMessage(`${description} Demo state is shared with the dashboard; no command is sent to the hardware.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <StatusBadge label={demoMode ? 'DEMO MODE' : 'PRODUCTION'} tone={demoMode ? 'warning' : 'success'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Demo Controls</h2>
          <p className="mb-4 text-sm text-slate-300">These controls update the browser demo only. They do not send commands to ESP32 hardware.</p>
          <div className="space-y-3">
            <motion.button whileHover={reduceMotion ? undefined : { x: 3, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.16 }} onClick={() => runScenario('node-3-failed', 'Node 3 failure simulated.')} className="w-full rounded-xl border border-sky-300/30 bg-sky-600/90 px-4 py-3 text-left font-medium text-white shadow-[0_0_18px_rgba(56,189,248,0.12)]">SIMULATE NODE 3 FAILURE</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { x: 3, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.16 }} onClick={() => runScenario('backup-active', 'Node 4 backup activated.')} className="w-full rounded-xl border border-amber-200/30 bg-amber-500/90 px-4 py-3 text-left font-medium text-white shadow-[0_0_18px_rgba(250,204,21,0.12)]">ACTIVATE NODE 4 BACKUP</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { x: 3, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.16 }} onClick={() => runScenario('recovered', 'Primary node recovery simulated.')} className="w-full rounded-xl border border-emerald-200/30 bg-emerald-600/90 px-4 py-3 text-left font-medium text-white shadow-[0_0_18px_rgba(34,197,94,0.12)]">SIMULATE RECOVERY</motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { x: 3, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.16 }} onClick={() => runScenario('normal', 'Demo state reset.')} className="w-full rounded-xl border border-slate-400/30 bg-slate-700/90 px-4 py-3 text-left font-medium text-white">RESET DEMO</motion.button>
          </div>
          <div className="mt-4 rounded-xl border border-[#facc15]/20 bg-black/20 p-3 text-sm text-slate-200" aria-live="polite">
            <span className="font-semibold text-[#facc15]">Scenario:</span> {scenario.replace(/-/g, ' ').toUpperCase()}
            {message && <p className="mt-1 text-xs text-slate-300">{message}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Security & Connectivity</h2>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span className="flex items-center gap-2"><Shield className="h-4 w-4" />Supabase RLS</span><StatusBadge label="READY" tone="success" /></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span className="flex items-center gap-2"><Wifi className="h-4 w-4" />Realtime</span><StatusBadge label="ENABLED" tone="info" /></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Validation</span><StatusBadge label="SAFE" tone="success" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
