import { Activity, AlertTriangle, Bell, Cpu, Gauge, GitBranch, LayoutGrid, Power, Radio, Settings, Shield } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/navigation', label: 'Navigation', icon: LayoutGrid },
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
    <div className="min-h-screen bg-[#030303] text-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[1900px] flex-col overflow-x-clip border-x border-[#facc15]/25 bg-[#050505] shadow-[0_0_40px_rgba(250,204,21,0.06)] lg:flex-row">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(250,204,21,0.07),transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.05),transparent_28%)]" />

        <aside className="relative flex w-full shrink-0 flex-col border-b border-[#facc15]/25 bg-black/80 p-3 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[184px] lg:self-start lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#facc15]/30 bg-[#0b0b0b] px-3 py-2 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#facc15]/60 bg-[#111] shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              <Cpu className="h-5 w-5 text-[#facc15]" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#facc15]">CAN Distributed</div>
              <div className="text-xs font-bold uppercase tracking-wide text-white">Node Monitor</div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-[#facc15]/25 bg-[#101010] px-3 py-2 text-center shadow-[0_0_12px_rgba(250,204,21,0.08)]">
            <div className="text-[9px] uppercase tracking-[0.22em] text-slate-400">Admin</div>
            <div className="mt-1 text-sm font-semibold tracking-[0.08em] text-[#f5f5f5]">Sarathkumar B</div>
          </div>

          <nav className="grid grid-cols-1 gap-2 lg:block lg:space-y-2">
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
                      'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] sm:text-sm',
                      isActive
                        ? 'border-[#ffcf40]/70 bg-gradient-to-r from-[#7a5b0a] via-[#ba5210] to-[#a61b18] text-[#fff3c4] shadow-[0_0_20px_rgba(249,115,22,0.34),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'border-transparent bg-[#0b0b0b]/90 text-slate-300 hover:translate-x-1 hover:border-[#facc15]/35 hover:bg-[#17130b] hover:text-white hover:shadow-[0_0_14px_rgba(250,204,21,0.1)]',
                    )
                  }
                >
                  {({ isActive }) => <>
                    <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-[#ffe48a]' : 'text-[#facc15]')} />
                    <span className="truncate">{label}</span>
                  </>}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.035 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
            className="mt-3 flex h-28 w-full items-center justify-center lg:mt-auto"
          >
            <img src="/luxury-car.png" alt="" className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(242,169,32,0.24)]" />
          </motion.div>

          <div className="mt-3 rounded-2xl border border-[#facc15]/30 bg-[#0b0b0b] p-3 shadow-[0_0_12px_rgba(250,204,21,0.08)] lg:mt-2 lg:mb-2">
            <div className="mb-2 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#facc15]/50 bg-[#101010] text-[#facc15] shadow-[0_0_16px_rgba(250,204,21,0.2)]">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#facc15]">M.E. PROJECT</div>
            <div className="mt-1 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">Embedded Systems & IoT</div>
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
              <path d="M225 225h70v70h-70zM238 238v44m22-44v44m22-44v44M238 260h44" stroke="#facc15" />
              <path d="M210 162v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M210 382v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M162 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24M382 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24" />
              <path d="M98 98h50v34m274 290h-50v-34M98 422h50v-34m274-290h-50v34" stroke="#facc15" />
              <circle cx="98" cy="98" r="7" fill="#facc15" />
              <circle cx="422" cy="422" r="7" fill="#facc15" />
              <circle cx="98" cy="422" r="7" fill="#facc15" />
              <circle cx="422" cy="98" r="7" fill="#facc15" />
            </g>
          </svg>
          <header className="relative z-10 border-b border-[#facc15]/30 bg-black/65 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#facc15]/60 bg-[#101010] shadow-[0_0_15px_rgba(250,204,21,0.2)] sm:h-14 sm:w-14">
                  <Cpu className="h-7 w-7 text-[#facc15] sm:h-8 sm:w-8" strokeWidth={1.6} />
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-[0.08em] text-[#facc15] drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] sm:text-2xl xl:text-3xl">CAN Distributed Node Monitor</h1>
                  <p className="text-[10px] tracking-[0.09em] text-slate-300 sm:text-sm">Autonomous Fault Detection & Dynamic Backup System</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-[#10b981]/40 bg-[#07120d] px-2 py-1.5 text-[#6ee7b7] sm:px-3">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">System Status</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  <span className="font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em]">Online</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#facc15]/35 bg-[#151006] px-2 py-1.5 text-[#fcd34d] sm:px-3">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">CAN Bus</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                  <span className="font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em]">Active</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#facc15]/35 bg-[#101010] px-2 py-1.5 text-slate-200 sm:px-3">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400 sm:text-xs">{new Intl.DateTimeFormat(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(now)}</span>
                  <span className="font-semibold tabular-nums text-[#facc15]">{new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-950/30 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-red-300 sm:text-[10px]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />Live</span>
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-10 p-3 sm:p-4 xl:p-4">
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
