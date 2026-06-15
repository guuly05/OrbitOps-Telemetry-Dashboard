import { NavLink, Outlet } from 'react-router-dom';
import { Activity, Atom, Globe2, Network, Radar, Rocket, Satellite } from 'lucide-react';
import { useUtcClock } from '../hooks/useAsyncData';
import ChronosBar from './ChronosBar.jsx';

const navItems = [
  { to: '/mission-control', label: 'Mission Control', icon: Rocket },
  { to: '/deep-space', label: 'Deep Space', icon: Satellite },
  { to: '/space-weather', label: 'Space Weather', icon: Activity },
  { to: '/orbital-globe', label: 'Orbit Globe', icon: Globe2 },
  { to: '/fleet-tracker', label: 'Fleet Tracker', icon: Network },
];

export default function Layout() {
  const now = useUtcClock();

  return (
    <div className="min-h-screen bg-black text-emerald-50">
      <div className="scanline" />
      <div className="scan-sweep" />
      <aside className="fixed inset-x-0 top-0 z-40 border-b border-emerald-900/60 bg-black/85 backdrop-blur-xl lg:inset-x-auto lg:bottom-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3 lg:block">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center border border-emerald-500/60 bg-emerald-500/10 shadow-neon">
                <Atom className="h-6 w-6 text-matrix" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-500">Orbital Matrix</p>
                <h1 className="font-mono text-base font-bold text-emerald-50">OPS CONTROL</h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-none border border-emerald-900/70 bg-black/60 px-3 py-2 font-mono text-xs text-emerald-200 sm:flex lg:mt-5">
              <span className="h-2.5 w-2.5 animate-pulsefast rounded-full bg-matrix shadow-neon" />
              ACTIVE TELEMETRY
            </div>
          </div>

          <div className="hidden border border-emerald-900/50 bg-carbon/80 p-3 font-mono lg:block">
            <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-emerald-600">Universal Clock</p>
            <p className="text-2xl font-bold text-matrix">{now.toISOString().slice(11, 19)}</p>
            <p className="text-xs text-emerald-700">{now.toUTCString().replace(' GMT', ' UTC')}</p>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'cyber-button flex min-w-max items-center gap-3 border px-4 py-3 font-mono text-sm uppercase transition',
                    isActive
                      ? 'border-matrix bg-emerald-500/15 text-matrix shadow-neon'
                      : 'border-emerald-900/55 bg-black/45 text-emerald-300 hover:border-emerald-500/70 hover:bg-emerald-500/10',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden border border-emerald-900/50 bg-black/40 p-3 text-xs text-emerald-600 lg:block">
            <div className="mb-2 flex items-center gap-2 font-mono text-emerald-300">
              <Radar className="h-4 w-4 text-matrix" />
              SIGNAL INTEGRITY
            </div>
            <div className="h-2 border border-emerald-900 bg-black">
              <div className="h-full w-[92%] bg-matrix shadow-neon" />
            </div>
          </div>
        </div>
      </aside>

      <main className="relative z-10 px-4 pb-8 pt-28 sm:px-6 lg:ml-72 lg:px-8 lg:pt-6">
        <ChronosBar />
        <Outlet />
      </main>
    </div>
  );
}
