import { useMemo, useState } from 'react';
import { useCanMessages } from '@/hooks/useCanMessages';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimestamp } from '@/lib/utils';

const messageTypes = ['ALL', 'HEARTBEAT', 'SENSOR_DATA', 'NODE_STATUS', 'FAULT', 'TASK_ASSIGN', 'TASK_ACK', 'BACKUP_ACTIVATE', 'RECOVERY', 'SYSTEM_STATUS'];

export function CanMonitorPage() {
  const { messages, loading } = useCanMessages();
  const [nodeFilter, setNodeFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const nodeMatch = nodeFilter === 'ALL' || message.source_node === nodeFilter;
      const typeMatch = typeFilter === 'ALL' || message.message_type === typeFilter;
      const statusMatch = statusFilter === 'ALL' || message.status === statusFilter;
      return nodeMatch && typeMatch && statusMatch;
    });
  }, [messages, nodeFilter, statusFilter, typeFilter]);

  const uniqueNodes = ['ALL', ...new Set(messages.map((message) => message.source_node))];
  const uniqueStatus = ['ALL', ...new Set(messages.map((message) => message.status))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CAN Bus Monitor</h1>
        <StatusBadge label={loading ? 'LOADING' : 'ONLINE'} tone={loading ? 'neutral' : 'success'} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs uppercase text-slate-500">CAN Bus</div><div className="mt-2 text-2xl font-bold">ONLINE</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs uppercase text-slate-500">Bus Activity</div><div className="mt-2 text-2xl font-bold">96%</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs uppercase text-slate-500">Message Count</div><div className="mt-2 text-2xl font-bold">{messages.length}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs uppercase text-slate-500">Error Count</div><div className="mt-2 text-2xl font-bold">1</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs uppercase text-slate-500">Last Message</div><div className="mt-2 text-sm font-semibold">{messages[0]?.message_type ?? 'HEARTBEAT'}</div></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <select value={nodeFilter} onChange={(event) => setNodeFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {uniqueNodes.map((node) => <option key={node} value={node}>{node === 'ALL' ? 'All Nodes' : node}</option>)}
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {messageTypes.map((type) => <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {uniqueStatus.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'All Statuses' : status}</option>)}
          </select>
          <div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">Time Range: 1h</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">CAN ID</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Destination</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">DLC</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">{formatTimestamp(message.timestamp)}</td>
                  <td className="px-3 py-2">{message.can_id}</td>
                  <td className="px-3 py-2">{message.source_node}</td>
                  <td className="px-3 py-2">{message.destination}</td>
                  <td className="px-3 py-2">{message.message_type}</td>
                  <td className="px-3 py-2">{message.dlc}</td>
                  <td className="px-3 py-2 max-w-[220px] truncate">{message.data}</td>
                  <td className="px-3 py-2"><StatusBadge label={message.status} tone={message.status === 'ERROR' ? 'danger' : message.status === 'QUEUED' ? 'warning' : 'success'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
