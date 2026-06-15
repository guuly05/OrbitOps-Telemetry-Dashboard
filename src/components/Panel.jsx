import { AlertTriangle, Loader2 } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-emerald-900/50 pb-5 xl:flex-row xl:items-end">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.34em] text-matrix">{eyebrow}</p>
        <h2 className="mt-2 font-mono text-3xl font-black uppercase text-emerald-50 sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-200/70">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, icon: Icon, children, className = '', fallback, error, right }) {
  return (
    <section className={`matrix-panel p-4 ${className}`}>
      {(title || Icon || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-matrix" />}
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">{title}</h3>
          </div>
          {right}
        </div>
      )}
      {fallback && <FallbackNotice error={error} />}
      {children}
    </section>
  );
}

export function LoadingBlock({ label = 'Synchronizing telemetry' }) {
  return (
    <div className="grid min-h-48 place-items-center border border-emerald-900/40 bg-black/40">
      <div className="flex flex-col items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-emerald-400">
        <Loader2 className="h-8 w-8 animate-spin text-matrix" />
        {label}
      </div>
    </div>
  );
}

export function FallbackNotice({ error }) {
  return (
    <div className="mb-4 flex items-start gap-2 border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
      <span>Live feed degraded. Using local fallback telemetry{error ? `: ${error}` : '.'}</span>
    </div>
  );
}

export function StatTile({ label, value, detail, tone = 'green' }) {
  const toneClass = tone === 'red' ? 'text-red-300 border-red-500/40' : tone === 'yellow' ? 'text-yellow-200 border-yellow-500/40' : 'text-matrix border-emerald-500/40';
  return (
    <div className={`border bg-black/55 p-3 ${toneClass}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500/80">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black">{value}</p>
      {detail && <p className="mt-1 text-xs text-emerald-200/60">{detail}</p>}
    </div>
  );
}

export function StatusBadge({ tone = 'green', children, pulse = false }) {
  const classes = {
    green: 'border-emerald-500/50 bg-emerald-500/10 text-matrix',
    red: 'border-red-500/60 bg-red-500/15 text-red-200 shadow-danger',
    yellow: 'border-yellow-500/60 bg-yellow-500/15 text-yellow-200',
  };
  return (
    <span className={`inline-flex items-center gap-2 border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${classes[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'red' ? 'bg-red-400' : tone === 'yellow' ? 'bg-yellow-300' : 'bg-matrix'} ${pulse ? 'animate-pulsefast' : ''}`} />
      {children}
    </span>
  );
}
