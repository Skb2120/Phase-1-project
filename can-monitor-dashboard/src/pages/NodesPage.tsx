import { Activity, Gauge, Radio, ShieldCheck, TimerReset, Wifi } from 'lucide-react';
import { useNodes } from '@/hooks/useNodes';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimeAgo } from '@/lib/utils';

export function NodesPage() {
  const { nodes, loading } = useNodes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Node Status Overview</h1>
        <StatusBadge label={loading ? 'LOADING' : 'LIVE'} tone={loading ? 'neutral' : 'success'} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {nodes.map((node) => (
          <div key={node.node_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{node.node_name}</div>
                <div className="text-2xl font-bold">{node.node_id}</div>
              </div>
              <StatusBadge
                label={node.status}
                tone={
                  node.status === 'ONLINE'
                    ? 'success'
                    : node.status === 'FAULT'
                      ? 'danger'
                      : node.status === 'STANDBY'
                        ? 'warning'
                        : 'info'
                }
              />
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Role</span><span>{node.role}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Gauge className="h-4 w-4" />Health</span><span>{node.health}%</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Radio className="h-4 w-4" />CAN Status</span><span>{node.can_status}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><TimerReset className="h-4 w-4" />Heartbeat</span><span>{formatTimeAgo(node.last_heartbeat)}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Activity className="h-4 w-4" />Task</span><span>{node.task}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Wifi className="h-4 w-4" />Connection</span><span>{node.status === 'ONLINE' ? 'Connected' : 'Check path'}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
