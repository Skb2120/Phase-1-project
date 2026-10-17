import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function BackupRecoveryPage() {
  const { assignments } = useTaskAssignments();
  const primary = assignments[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backup & Recovery</h1>
        <StatusBadge label="AUTO FAILOVER" tone="primary" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Primary Node</div>
            <div className="mt-2 text-2xl font-bold">Node 3</div>
            <div className="mt-3"><StatusBadge label="PRIMARY" tone="success" /></div>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Task: {primary?.task_name ?? 'MPU6050 Monitoring'}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Status: ONLINE</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Backup Node</div>
            <div className="mt-2 text-2xl font-bold">Node 4</div>
            <div className="mt-3"><StatusBadge label="BACKUP" tone="warning" /></div>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Task: Backup MPU6050 Monitoring</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Status: STANDBY</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Failover Timeline</h2>
        <div className="space-y-3">
          {[
            'Node 3 Online',
            'Heartbeat Timeout',
            'Fault Detected',
            'Backup Available',
            'Task Assigned',
            'Node 4 Activated',
            'Acknowledgement',
            'System Recovered',
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-500 bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">{index + 1}</div>
              <div className="text-sm text-slate-700 dark:text-slate-200">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Failover Event Example</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">NODE 3 FAILURE DETECTED</div>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">Task: MPU6050 Monitoring</div>
          <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">Backup: NODE 4</div>
          <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">Action: TASK REASSIGNMENT to NODE 4 ACTIVATED</div>
        </div>
      </div>
    </div>
  );
}
