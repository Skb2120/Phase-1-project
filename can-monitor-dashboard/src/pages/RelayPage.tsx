import { Power, Route, TimerReset } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

const relays = [
  { channel: 'Relay CH1', state: 'ON', route: 'PRIMARY', lastChange: '08:14:22' },
  { channel: 'Relay CH2', state: 'OFF', route: 'BACKUP', lastChange: '08:42:17' },
];

export function RelayPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Master Relay Status</h1>
        <StatusBadge label="SAFE MODE" tone="success" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {relays.map((relay) => (
          <div key={relay.channel} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-bold">{relay.channel}</div>
              <StatusBadge label={relay.state} tone={relay.state === 'ON' ? 'success' : 'neutral'} />
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Power className="h-4 w-4" />State</span><span>{relay.state}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Route className="h-4 w-4" />Path</span><span>{relay.route}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><TimerReset className="h-4 w-4" />Last Change</span><span>{relay.lastChange}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">Switching Safety</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Relay switching is protected and requires explicit operator confirmation before changes are applied. This prevents unsafe arbitrary switching actions during normal monitoring.</p>
      </div>
    </div>
  );
}
