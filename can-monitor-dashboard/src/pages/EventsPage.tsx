import { useSystemEvents } from '@/hooks/useSystemEvents';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimestamp } from '@/lib/utils';

export function EventsPage() {
  const { events, loading } = useSystemEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Event Log</h1>
        <StatusBadge label={loading ? 'LOADING' : 'LIVE'} tone={loading ? 'neutral' : 'success'} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Event</th>
              <th className="px-3 py-3">Node</th>
              <th className="px-3 py-3">Severity</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-200 dark:border-slate-700">
                <td className="px-3 py-3">{formatTimestamp(event.timestamp)}</td>
                <td className="px-3 py-3 font-semibold">{event.event_type}</td>
                <td className="px-3 py-3">{event.node_id}</td>
                <td className="px-3 py-3"><StatusBadge label={event.severity} tone={event.severity === 'CRITICAL' ? 'danger' : event.severity === 'WARNING' ? 'warning' : event.severity === 'SUCCESS' ? 'success' : 'info'} /></td>
                <td className="px-3 py-3">{event.description}</td>
                <td className="px-3 py-3"><StatusBadge label="ACTIVE" tone="success" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
