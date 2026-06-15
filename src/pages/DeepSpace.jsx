import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Images, Orbit, Ship, X } from 'lucide-react';
import { api, marsSolForYear } from '../lib/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { FallbackNotice, LoadingBlock, PageHeader, Panel, StatTile, StatusBadge } from '../components/Panel';
import { useTimeline } from '../context/TimelineContext';

const cameras = ['FHAZ', 'RHAZ', 'MAST'];
const rovers = ['Curiosity', 'Perseverance'];
const roverWindows = {
  Curiosity: { start: 2012, end: 2026 },
  Perseverance: { start: 2021, end: 2026 },
};

function MetricRing({ label, value, total, tone = 'green' }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const color = tone === 'red' ? '#f87171' : '#00ff66';
  return (
    <div className="grid place-items-center gap-3 border border-emerald-900/50 bg-black/45 p-4 text-center">
      <div
        className="grid h-28 w-28 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${percent}%, rgba(6,95,70,0.28) 0)` }}
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-black font-mono text-2xl font-black text-emerald-50">{value}</div>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">{label}</p>
        <p className="text-xs text-emerald-700">{percent}% of tracked fleet</p>
      </div>
    </div>
  );
}

export default function DeepSpace() {
  const { currentArchiveYear } = useTimeline();
  const [date, setDate] = useState(`${currentArchiveYear}-05-18`);
  const [rover, setRover] = useState('Curiosity');
  const [camera, setCamera] = useState('MAST');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  useEffect(() => {
    setDate((current) => {
      const [, month = '05', day = '18'] = current.split('-');
      return `${currentArchiveYear}-${month}-${day}`;
    });
  }, [currentArchiveYear]);

  const activeRover = currentArchiveYear >= roverWindows[rover].start && currentArchiveYear <= roverWindows[rover].end;
  const sol = marsSolForYear(rover, currentArchiveYear);
  const apod = useAsyncData(() => api.apod(date), [date]);
  const mars = useAsyncData(
    () => (activeRover ? api.marsPhotos(rover, camera, sol) : Promise.resolve({ data: { photos: [] }, fallback: false, error: '[ASSET STATUS: DECOMMISSIONED // OFFLINE]' })),
    [rover, camera, sol, activeRover],
  );
  const cores = useAsyncData(api.cores, []);
  const ships = useAsyncData(api.ships, []);

  const coreStats = useMemo(() => {
    const list = cores.data ?? [];
    return {
      active: list.filter((core) => core.status === 'active').length,
      retired: list.filter((core) => core.status && core.status !== 'active').length,
      total: list.length,
    };
  }, [cores.data]);

  const asdsShips = (ships.data ?? []).filter((ship) => /ASDS|drone|barge/i.test(`${ship.type} ${ship.name}`));

  return (
    <>
      <PageHeader
        eyebrow="Visual exploration archive"
        title="Deep Space Exploration"
        description="Astronomy imagery, rover surface inspection, and reusable launch asset deployment in a visual operations hub."
        action={
          <label className="flex items-center gap-3 border border-emerald-900/70 bg-black/70 px-3 py-2 font-mono text-xs text-emerald-200">
            <CalendarDays className="h-4 w-4 text-matrix" />
            <input
              type="date"
              value={date}
              max={currentArchiveYear === new Date().getUTCFullYear() ? new Date().toISOString().slice(0, 10) : `${currentArchiveYear}-12-31`}
              min={`${currentArchiveYear}-01-01`}
              onChange={(event) => {
                const [, month = '05', day = '18'] = event.target.value.split('-');
                setDate(`${currentArchiveYear}-${month}-${day}`);
              }}
              className="bg-transparent text-matrix outline-none"
            />
          </label>
        }
      />

      <div className="grid gap-5">
        <Panel title="NASA Daily Astronomy Wall" icon={Images} fallback={apod.fallback} error={apod.error}>
          {apod.loading ? (
            <LoadingBlock />
          ) : (
            <div className="relative min-h-[520px] overflow-hidden border border-emerald-900/50 bg-black">
              {apod.data.media_type === 'video' ? (
                <iframe title={apod.data.title} src={apod.data.url} className="h-[520px] w-full" />
              ) : (
                <img src={apod.data.hdurl ?? apod.data.url} alt={apod.data.title} className="h-[520px] w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setDetailsOpen((value) => !value)}
                className="absolute right-4 top-4 border border-emerald-500/60 bg-black/80 px-3 py-2 font-mono text-xs uppercase text-matrix"
              >
                {detailsOpen ? 'Hide Intel' : 'Show Intel'}
              </button>
              {detailsOpen && (
                <div className="absolute bottom-0 right-0 top-0 w-full max-w-xl overflow-auto border-l border-emerald-900/70 bg-black/75 p-5 backdrop-blur-md sm:w-[44%]">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-matrix">{apod.data.date}</p>
                  <h3 className="mt-2 text-2xl font-black text-emerald-50">{apod.data.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-emerald-100/75">{apod.data.explanation}</p>
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="Mars Rover Gallery"
          icon={Orbit}
          fallback={mars.fallback}
          error={mars.error}
          right={
            <div className="flex flex-wrap gap-2">
              {rovers.map((name) => (
                <button
                  key={name}
                  onClick={() => setRover(name)}
                  className={`border px-3 py-1.5 font-mono text-xs uppercase ${
                    currentArchiveYear < roverWindows[name].start || currentArchiveYear > roverWindows[name].end
                      ? 'border-zinc-800 bg-zinc-950 text-zinc-600'
                      : rover === name
                        ? 'border-matrix bg-emerald-500/15 text-matrix'
                        : 'border-emerald-900 text-emerald-400'
                  }`}
                  title={currentArchiveYear < roverWindows[name].start || currentArchiveYear > roverWindows[name].end ? '[ASSET STATUS: DECOMMISSIONED // OFFLINE]' : `${name} online`}
                >
                  {name}
                </button>
              ))}
              {cameras.map((name) => (
                <button key={name} onClick={() => setCamera(name)} className={`border px-3 py-1.5 font-mono text-xs uppercase ${camera === name ? 'border-matrix bg-emerald-500/15 text-matrix' : 'border-emerald-900 text-emerald-400'}`}>
                  {name}
                </button>
              ))}
            </div>
          }
        >
          {mars.loading ? (
            <LoadingBlock />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {!activeRover && (
                <div className="col-span-full">
                  <FallbackNotice error="[ASSET STATUS: DECOMMISSIONED // OFFLINE]" />
                </div>
              )}
              {!mars.data.photos?.length && (
                <div className="col-span-full border border-emerald-900/60 bg-black/45 p-6 text-center font-mono text-sm uppercase tracking-[0.18em] text-emerald-400">
                  No rover frames returned for {rover} / {camera} on archive sol {sol}.
                </div>
              )}
              {(mars.data.photos ?? []).slice(0, 16).map((photo) => (
                <button key={photo.id} onClick={() => setSelectedPhoto(photo)} className="group relative aspect-[4/3] overflow-hidden border border-emerald-900/60 bg-black text-left">
                  <img loading="lazy" src={photo.img_src} alt={`${photo.rover.name} ${photo.camera.name}`} className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 p-3 backdrop-blur-sm">
                    <p className="font-mono text-xs text-matrix">{photo.rover.name} / {photo.camera.name}</p>
                    <p className="text-xs text-emerald-300/70">{photo.earth_date}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="SpaceX Core & Ship Status Grid" icon={Ship} fallback={cores.fallback || ships.fallback} error={cores.error || ships.error}>
          {cores.loading || ships.loading ? (
            <LoadingBlock />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <MetricRing label="Active Boosters" value={coreStats.active} total={coreStats.total} />
                <MetricRing label="Retired / Lost" value={coreStats.retired} total={coreStats.total} tone="red" />
              </div>
              <div className="grid gap-3">
                {asdsShips.map((ship) => (
                  <div key={ship.name} className="flex flex-col justify-between gap-3 border border-emerald-900/50 bg-black/45 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-mono font-bold uppercase text-emerald-50">{ship.name}</p>
                      <p className="text-sm text-emerald-300/65">{ship.home_port ?? 'Undisclosed port'} / {ship.status ?? 'status pending'}</p>
                    </div>
                    <StatusBadge tone={ship.active ? 'green' : 'yellow'}>{ship.active ? 'Deployed' : 'Dormant'}</StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-h-[92vh] max-w-6xl border border-emerald-500/60 bg-black p-3 shadow-neon" onClick={(event) => event.stopPropagation()}>
            <button className="absolute right-4 top-4 z-10 border border-emerald-500/60 bg-black/80 p-2 text-matrix" onClick={() => setSelectedPhoto(null)} aria-label="Close image preview">
              <X className="h-5 w-5" />
            </button>
            <img src={selectedPhoto.img_src} alt={`${selectedPhoto.rover.name} rover inspection`} className="max-h-[84vh] w-full object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
