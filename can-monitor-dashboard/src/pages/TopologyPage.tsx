import { ArrowDown, Wifi, WifiOff } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function TopologyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live System Topology</h1>
        <StatusBadge label="CONNECTED" tone="success" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">MASTER</div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-slate-500" /></div>
          <div className="flex justify-center"><div className="rounded-xl border border-slate-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:border-slate-700 dark:bg-sky-950/30 dark:text-sky-200">CAN BUS</div></div>
          <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-slate-500" /></div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['NODE 1', 'DHT11', 'ONLINE'],
              ['NODE 2', 'VIB', 'ONLINE'],
              ['NODE 3', 'MPU6050', 'PRIMARY'],
              ['NODE 4', 'MPU6050', 'BACKUP'],
            ].map(([node, sensor, state]) => (
              <div key={node} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                <div className="text-lg font-bold">{node}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{sensor}</div>
                <div className="mt-3"><StatusBadge label={state} tone={state === 'PRIMARY' ? 'success' : state === 'BACKUP' ? 'warning' : 'info'} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Failover Transition</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2"><WifiOff className="h-4 w-4 text-red-500" />NODE 3</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500" />TASK FAILED</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-sky-500" />MASTER</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-sky-500" />BACKUP TASK ASSIGNMENT</div>
            <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-emerald-500" />NODE 4 ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
