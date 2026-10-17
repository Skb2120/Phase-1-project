import { useFaults } from '@/hooks/useFaults';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimestamp } from '@/lib/utils';

export function FaultsPage() {
  const { faults, loading } = useFaults();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fault Management</h1>
        <StatusBadge label={loading ? 'LOADING' : 'MONITORING'} tone={loading ? 'neutral' : 'warning'} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-3">Fault ID</th>
              <th className="px-3 py-3">Node</th>
              <th className="px-3 py-3">Fault Type</th>
              <th className="px-3 py-3">Severity</th>
              <th className="px-3 py-3">Detected Time</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Recovery</th>
            </tr>
          </thead>
          <tbody>
            {faults.map((fault) => (
              <tr key={fault.id} className="border-b border-slate-200 dark:border-slate-700">
                <td className="px-3 py-3">{fault.id}</td>
                <td className="px-3 py-3">{fault.node_id}</td>
                <td className="px-3 py-3">{fault.fault_type}</td>
                <td className="px-3 py-3"><StatusBadge label={fault.severity} tone={fault.severity === 'CRITICAL' ? 'danger' : fault.severity === 'WARNING' ? 'warning' : 'info'} /></td>
                <td className="px-3 py-3">{formatTimestamp(fault.detected_at)}</td>
                <td className="px-3 py-3"><StatusBadge label={fault.status} tone={fault.status === 'OPEN' ? 'danger' : 'success'} /></td>
                <td className="px-3 py-3">{fault.action_taken}</td>
                <td className="px-3 py-3">{fault.resolved_at ? 'Recovered' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
