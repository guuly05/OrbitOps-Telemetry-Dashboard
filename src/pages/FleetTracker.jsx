import { useEffect, useMemo, useState } from 'react';
import { Activity, Crosshair, DatabaseZap, Network, RadioTower, Satellite } from 'lucide-react';
import FleetGlobeScene from '../components/FleetGlobeScene';
import { LoadingBlock, PageHeader, Panel, StatTile, StatusBadge } from '../components/Panel';
import { fallbackCelestrakActive } from '../data/fallbacks';
import { groupSatellitesByFleet, orbitClassTone, selectedFleetSatellites } from '../lib/fleetUtils';

const CELESTRAK_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json';
const CELESTRAK_CACHE_KEY = 'celestrak_telemetry_cache';

function readCelestrakCache() {
  const cached = window.sessionStorage.getItem(CELESTRAK_CACHE_KEY) ?? window.localStorage.getItem(CELESTRAK_CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    window.sessionStorage.removeItem(CELESTRAK_CACHE_KEY);
    window.localStorage.removeItem(CELESTRAK_CACHE_KEY);
    return null;
  } catch {
    window.sessionStorage.removeItem(CELESTRAK_CACHE_KEY);
    window.localStorage.removeItem(CELESTRAK_CACHE_KEY);
    return null;
  }
}

function writeCelestrakCache(rawJson) {
  window.sessionStorage.setItem(CELESTRAK_CACHE_KEY, rawJson);
  try {
    window.localStorage.setItem(CELESTRAK_CACHE_KEY, rawJson);
  } catch {
    // Session storage is the primary single-session cache; localStorage is a best-effort warm cache.
  }
}

export default function FleetTracker() {
  const [catalog, setCatalog] = useState({
    data: [],
    loading: true,
    isLiveFeedDegraded: false,
    errorCode: null,
    source: 'BOOTING',
  });
  const [selectedFleetIds, setSelectedFleetIds] = useState(['starlink', 'astranis']);
  const groups = useMemo(() => groupSatellitesByFleet(catalog.data ?? []), [catalog.data]);
  const selectedSatellites = useMemo(() => selectedFleetSatellites(groups, selectedFleetIds), [groups, selectedFleetIds]);
  const selectedGroups = groups.filter((group) => selectedFleetIds.includes(group.id));
  const hasGeoLock = selectedGroups.some((group) => group.orbit === 'GEO');

  useEffect(() => {
    let mounted = true;

    async function loadCelestrakTelemetry() {
      const cachedTelemetry = readCelestrakCache();
      if (cachedTelemetry) {
        if (mounted) {
          setCatalog({
            data: cachedTelemetry,
            loading: false,
            isLiveFeedDegraded: false,
            errorCode: null,
            source: 'SESSION_CACHE',
          });
        }
        return;
      }

      try {
        const response = await fetch(CELESTRAK_URL, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        });

        if (response.status === 403) {
          throw new Error('ERR_403');
        }
        if (response.status === 429) {
          throw new Error('ERR_429');
        }
        if (!response.ok) {
          throw new Error(`ERR_${response.status}`);
        }

        const rawJson = await response.text();
        const parsedTelemetry = JSON.parse(rawJson);
        if (!Array.isArray(parsedTelemetry) || parsedTelemetry.length === 0) {
          throw new Error('ERR_EMPTY_PAYLOAD');
        }

        writeCelestrakCache(rawJson);
        if (mounted) {
          setCatalog({
            data: parsedTelemetry,
            loading: false,
            isLiveFeedDegraded: false,
            errorCode: null,
            source: 'LIVE_CELESTRAK',
          });
        }
      } catch (error) {
        const errorCode = error?.message?.startsWith('ERR_') ? error.message : 'ERR_NETWORK';
        if (mounted) {
          setCatalog({
            data: fallbackCelestrakActive,
            loading: false,
            isLiveFeedDegraded: true,
            errorCode,
            source: 'LOCAL_FALLBACK',
          });
        }
      }
    }

    loadCelestrakTelemetry();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleFleet(id) {
    setSelectedFleetIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }

  return (
    <>
      <PageHeader
        eyebrow="International commercial space intelligence deck"
        title="Global Satellite Constellation Fleet Tracker"
        description="CelesTrak active-object aggregation with selectable fleet overlays, orbital shell simulation, and GEO-locked Astranis halo rendering."
      />

      <div className="grid min-h-[calc(100vh-15rem)] gap-5 xl:grid-cols-[35fr_65fr]">
        <Panel title="Telemetry Control Panel" icon={DatabaseZap} className="xl:max-h-[calc(100vh-15rem)] xl:overflow-hidden">
          {catalog.loading ? (
            <LoadingBlock label="Ingesting CelesTrak active catalog" />
          ) : (
            <div className="flex h-full flex-col gap-4">
              {catalog.isLiveFeedDegraded ? (
                <div className="animate-pulse border border-red-500/60 bg-red-500/12 p-3 font-mono text-xs uppercase tracking-[0.12em] text-red-200 shadow-danger">
                  [Live Stream Degraded // Using Local Fallback Telemetry: {catalog.errorCode ?? 'ERR_UNKNOWN'}]
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-emerald-500/50 bg-emerald-500/10 p-3 font-mono text-xs uppercase tracking-[0.14em] text-matrix shadow-neon">
                  <span className="h-2.5 w-2.5 animate-pulsefast rounded-full bg-matrix" />
                  [Online // Data Link Synchronized]
                  <span className="ml-auto text-emerald-500/70">{catalog.source}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Active Catalog" value={(catalog.data ?? []).length.toLocaleString()} detail="CelesTrak objects" />
                <StatTile label="Plotted Nodes" value={selectedSatellites.length.toLocaleString()} detail="selected fleets" tone={selectedSatellites.length ? 'green' : 'yellow'} />
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {groups.map((fleet) => {
                  const selected = selectedFleetIds.includes(fleet.id);
                  return (
                    <button
                      type="button"
                      key={fleet.id}
                      onClick={() => toggleFleet(fleet.id)}
                      className={`w-full border p-3 text-left transition ${
                        selected
                          ? 'border-matrix bg-emerald-500/12 shadow-neon'
                          : 'border-emerald-900/55 bg-black/45 hover:border-emerald-500/60 hover:bg-emerald-500/8'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-bold uppercase text-emerald-50">{fleet.name}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-500">Active Node Count</p>
                        </div>
                        <StatusBadge tone={orbitClassTone(fleet.orbit)}>{fleet.orbit}</StatusBadge>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <span className="font-mono text-3xl font-black text-matrix">{fleet.count.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                          <span className="h-2 w-2 animate-pulsefast rounded-full bg-matrix shadow-neon" />
                          [Receiving Data Stream]
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="3D Orbital Canvas" icon={Network} className="overflow-hidden p-0">
          {catalog.loading ? (
            <div className="p-4">
              <LoadingBlock label="Charging fleet orbital renderer" />
            </div>
          ) : (
            <div className="relative h-[calc(100vh-15rem)] min-h-[640px] bg-black">
              <FleetGlobeScene satellites={selectedSatellites} />
              <div className="pointer-events-none absolute inset-0 border border-emerald-900/60" />
              <div className="pointer-events-none absolute left-4 top-4 grid max-w-md gap-3">
                <div className="border border-emerald-500/50 bg-black/72 p-4 font-mono backdrop-blur-md">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-matrix">
                    <Activity className="h-4 w-4" />
                    Fleet Render Diagnostics
                  </div>
                  <div className="grid gap-2 text-xs text-emerald-200">
                    <div className="flex justify-between gap-8"><span>Selected Fleets</span><strong className="text-matrix">{selectedFleetIds.length}</strong></div>
                    <div className="flex justify-between gap-8"><span>Particle Instances</span><strong className="text-matrix">{Math.min(selectedSatellites.length, 1800).toLocaleString()}</strong></div>
                    <div className="flex justify-between gap-8"><span>Camera FOV</span><strong className="text-matrix">45 DEG</strong></div>
                    <div className="flex justify-between gap-8"><span>Renderer Target</span><strong className="text-matrix">60 FPS</strong></div>
                    <div className="flex justify-between gap-8"><span>GEO Physics</span><strong className={hasGeoLock ? 'text-yellow-200' : 'text-emerald-600'}>{hasGeoLock ? '[GEOLOCK ENGAGED]' : 'STANDBY'}</strong></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge><Satellite className="h-3 w-3" /> LEO fast shell</StatusBadge>
                  <StatusBadge tone="yellow"><RadioTower className="h-3 w-3" /> GEO equator halo</StatusBadge>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-4 right-4 border border-emerald-900/70 bg-black/72 p-3 font-mono text-xs uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md">
                <div className="flex items-center gap-2"><Crosshair className="h-4 w-4 text-matrix" /> OrbitControls: rotate / zoom / pan</div>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
