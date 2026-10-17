import { ArrowRight, Cpu, Gauge, LayoutGrid, Radio, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/nodes', label: 'Node Status', icon: Gauge },
  { to: '/sensors', label: 'Sensor Data', icon: Cpu },
  { to: '/can-monitor', label: 'CAN Monitor', icon: Radio },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function NavigationPage() {
  return (
    <div className="space-y-4 text-slate-100">
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#facc15]">Quick access</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white">Navigation</h2>
          </div>
          <div className="rounded-full border border-[#facc15]/35 bg-[#12110b] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fcd34d]">
            Sarathkumar B
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between rounded-2xl border border-[#facc15]/20 bg-[#0b0b0b]/90 p-4 shadow-[0_0_18px_rgba(250,204,21,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#facc15]/50 hover:bg-[#19160c]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#facc15]/30 bg-[#111] text-[#facc15] shadow-[0_0_14px_rgba(250,204,21,0.12)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Module</div>
                  <div className="mt-1 text-base font-semibold text-white">{label}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#facc15] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
