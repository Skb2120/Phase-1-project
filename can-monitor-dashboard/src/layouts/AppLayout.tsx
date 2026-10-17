import { Activity, AlertTriangle, Bell, Gauge, GitBranch, LayoutGrid, Power, Radio, Settings, Shield, Wifi } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
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

  return (
    <div className="min-h-screen bg-[#040b12] text-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[1900px] flex-col overflow-hidden border border-[#facc15]/40 bg-[#050b12] shadow-[0_0_40px_rgba(250,204,21,0.08)] lg:flex-row">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.10),transparent_38%),radial-gradient(circle_at_right,_rgba(14,165,233,0.10),transparent_25%)]" />

        <aside className="relative w-full shrink-0 border-b border-[#facc15]/25 bg-[#070d16]/90 p-3 backdrop-blur-xl lg:w-[210px] lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#facc15]/30 bg-[#0b1320] px-3 py-2 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#facc15]/60 bg-[#0f172a] shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              <Wifi className="h-5 w-5 text-[#facc15]" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-[#facc15]">System</div>
              <div className="text-base font-bold uppercase tracking-wide text-white">CAN</div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
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
                      'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] sm:text-sm',
                      isActive
                        ? 'border-[#ff6b3d]/60 bg-gradient-to-r from-[#ff4d4d] to-[#f97316] text-white shadow-[0_0_18px_rgba(249,115,22,0.45)]'
                        : 'border-transparent bg-[#0b1320]/80 text-slate-300 hover:border-[#facc15]/30 hover:bg-[#101a2b] hover:text-[#facc15]',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-[#facc15]/30 bg-[#0d1320] p-3 shadow-[0_0_12px_rgba(250,204,21,0.08)] lg:mt-10">
            <div className="mb-2 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#facc15]/50 bg-[#0b1220] text-[#facc15] shadow-[0_0_16px_rgba(250,204,21,0.2)]">
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
              <path d="M225 225h70v70h-70zM238 238v44m22-44v44m22-44v44M238 260h44" stroke="#38bdf8" />
              <path d="M210 162v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M210 382v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24m25 24v-24M162 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24M382 210h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24m24 25h-24" />
              <path d="M98 98h50v34m274 290h-50v-34M98 422h50v-34m274-290h-50v34" stroke="#38bdf8" />
              <circle cx="98" cy="98" r="7" fill="#facc15" />
              <circle cx="422" cy="422" r="7" fill="#facc15" />
              <circle cx="98" cy="422" r="7" fill="#38bdf8" />
              <circle cx="422" cy="98" r="7" fill="#38bdf8" />
            </g>
          </svg>
          <header className="relative z-10 border-b border-[#facc15]/30 bg-[#070d16]/70 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#facc15]/60 bg-[#0a1220] shadow-[0_0_15px_rgba(250,204,21,0.2)] sm:h-14 sm:w-14">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#facc15]/60 text-base font-black text-[#facc15] sm:h-9 sm:w-9">⚡</span>
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-[0.08em] text-[#facc15] drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] sm:text-2xl xl:text-3xl">CAN Distributed Node Monitor</h1>
                  <p className="text-[10px] tracking-[0.09em] text-slate-300 sm:text-sm">Autonomous Fault Detection & Dynamic Backup System</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-[#10b981]/40 bg-[#0a1e1a] px-2 py-1.5 text-[#6ee7b7] sm:px-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  <span className="font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em]">Online</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#facc15]/35 bg-[#1b160a] px-2 py-1.5 text-[#fcd34d] sm:px-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                  <span className="font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em]">Active</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#facc15]/35 bg-[#101a2b] px-2 py-1.5 text-slate-200 sm:px-3">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400 sm:text-xs">Fri, 01 Aug 2025</span>
                  <span className="font-semibold text-[#facc15]">10:24:36</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-[#0a1f1d] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#6ee7b7] sm:text-[10px]">Live</span>
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
