import { Activity, AlertTriangle, Bell, CalendarDays, CarFront, Cpu, Gauge, GitBranch, LayoutGrid, Power, Radio, Settings, Shield, Wifi } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/nodes', label: 'Node Status', icon: Gauge },
  { to: '/sensors', label: 'Sensor Data', icon: Activity },
  { to: '/can-monitor', label: 'CAN Monitor', icon: Radio },
  { to: '/faults', label: 'Fault Management', icon: AlertTriangle },
  { to: '/backup', label: 'Backup & Recovery', icon: Shield },
  { to: '/events', label: 'Event Log', icon: Bell },
  { to: '/topology', label: 'System Topology', icon: GitBranch },
  { to: '/relay', label: 'Relay Control', icon: Power },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[1900px] flex-col overflow-hidden border-x border-[#dba932]/20 bg-[#080909] shadow-[0_0_70px_rgba(0,0,0,0.7)] lg:flex-row">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,_rgba(245,158,11,0.09),transparent_30%),radial-gradient(ellipse_at_100%_60%,_rgba(14,165,233,0.045),transparent_28%)]" />

        <aside className="relative z-20 flex w-full shrink-0 flex-col border-b border-[#dba932]/20 bg-[#090a0a]/95 p-3 backdrop-blur-xl lg:min-h-screen lg:w-[238px] lg:border-b-0 lg:border-r lg:p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#dba932]/25 bg-gradient-to-br from-[#17140e] to-[#0b0c0c] px-3 py-3 shadow-[0_12px_35px_rgba(0,0,0,.28)] lg:mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f5b923]/50 bg-[#20190c] shadow-[0_0_22px_rgba(245,185,35,.16)]">
              <Cpu className="h-5 w-5 text-[#ffc43d]" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#d4a83b]">Distributed node</div>
              <div className="text-sm font-bold uppercase tracking-[0.14em] text-white">CAN monitor</div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
            {navItems.map(({ to, label, icon: Icon }) => (
              <motion.div
                key={to}
                whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-10 min-w-max items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] sm:text-sm lg:w-full',
                      isActive
                        ? 'border-[#f5b923]/45 bg-gradient-to-r from-[#6b4710]/55 to-[#23190b]/50 text-[#ffd875] shadow-[inset_2px_0_0_#f5b923,0_5px_18px_rgba(0,0,0,.22)]'
                        : 'border-transparent bg-white/[0.025] text-slate-300 hover:border-[#dba932]/25 hover:bg-[#18150e] hover:text-[#ffd875]',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="mt-3 overflow-hidden rounded-2xl border border-[#dba932]/20 bg-gradient-to-b from-[#11100d] to-[#090a0a] lg:mt-auto lg:pt-2">
            <div className="relative h-24 overflow-hidden lg:h-32">
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0a] via-transparent to-transparent" />
              <img src="/luxury-car.png" alt="Luxury car illustration" className="h-full w-full object-contain object-center opacity-90 transition duration-500 hover:scale-105" />
              <CarFront className="absolute bottom-2 left-3 h-4 w-4 text-[#f5b923]" />
            </div>
            <div className="border-t border-[#dba932]/15 px-3 pb-3 pt-2 text-center">
              <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#d9ad43]">M.E. Project · Embedded Systems & IoT</div>
              <div className="mt-1 text-xs font-semibold tracking-wide text-white">Sarathkumar B</div>
            </div>
          </div>
        </aside>

        <main className="relative flex-1">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 right-0 z-0 h-[min(72vw,620px)] w-[min(72vw,620px)] opacity-[0.09] sm:right-4 sm:opacity-[0.12]"
            viewBox="0 0 520 520"
            fill="none"
          >
            <g stroke="#facc15" strokeWidth="2">
              <path d="M260 42v56M260 422v56M42 260h56M422 260h56M106 106l40 40M374 374l40 40M414 106l-40 40M146 374l-40 40" />
              <path d="M260 18v24m-12-24h24M260 478v24m-12 0h24M18 260h24m-24-12v24m460-12h24m0-12v24" />
              <rect x="162" y="162" width="196" height="196" rx="24" />
              <rect x="190" y="190" width="140" height="140" rx="14" />
              <path d="M225 225h70v70h-70zM238 238v44m22-44v44m22-44v44M238 260h44" stroke="#38bdf8" />
              <path d="M210 162v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M210 382v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M162 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24M382 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24" />
              <path d="M98 98h50v34m274 290h-50v-34M98 422h50v-34m274-290h-50v34" stroke="#38bdf8" />
              <circle cx="98" cy="98" r="7" fill="#facc15" />
              <circle cx="422" cy="422" r="7" fill="#facc15" />
              <circle cx="98" cy="422" r="7" fill="#38bdf8" />
              <circle cx="422" cy="98" r="7" fill="#38bdf8" />
            </g>
          </svg>
          <header className="relative z-10 border-b border-[#dba932]/20 bg-[#090a0a]/75 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5b923]/55 bg-[#21190d] shadow-[0_0_24px_rgba(245,185,35,.14)] sm:h-14 sm:w-14">
                  <Cpu className="h-6 w-6 text-[#ffc43d]" />
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-[0.07em] text-[#f6c453] sm:text-2xl xl:text-[28px]">CAN Distributed Node Monitor</h1>
                  <p className="mt-0.5 text-[10px] tracking-[0.04em] text-slate-400 sm:text-sm">Autonomous Fault Detection & Dynamic Backup System</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-950/30 px-2.5 py-2 text-emerald-300 sm:px-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  <span><span className="block text-[8px] uppercase tracking-[0.16em] text-slate-500">System status</span><span className="font-semibold uppercase tracking-[0.12em]">Online</span></span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#dba932]/25 bg-[#21190c]/50 px-2.5 py-2 text-[#fcd34d] sm:px-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                  <span><span className="block text-[8px] uppercase tracking-[0.16em] text-slate-500">CAN bus</span><span className="font-semibold uppercase tracking-[0.12em]">Active</span></span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2 text-slate-200 sm:px-3">
                  <CalendarDays className="h-4 w-4 text-[#d9ad43]" />
                  <span className="text-[9px] text-slate-400 sm:text-xs">{now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="font-semibold tabular-nums text-[#f6c453]">{now.toLocaleTimeString()}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/30 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-300 sm:text-[10px]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Live</span>
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-10 p-3 sm:p-4 md:p-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6, filter: 'blur(2px)' }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeOut' }}
              >
                {children ?? <Outlet />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
