import { useMemo } from 'react';
import { Crosshair, Gauge, Satellite, TriangleAlert } from 'lucide-react';
import GlobeScene from '../components/GlobeScene';
import { api, normalizeNeos } from '../lib/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { LoadingBlock, PageHeader, Panel, StatusBadge } from '../components/Panel';

export default function OrbitalGlobe() {
  const starlink = useAsyncData(api.starlink, []);
  const neos = useAsyncData(() => api.neos(), []);
  const neoVectors = useMemo(() => normalizeNeos(neos.data), [neos.data]);
  const activeSatellites = (starlink.data ?? []).filter((satellite) => satellite.latitude != null || satellite.longitude != null || satellite.spaceTrack);
  const hazardous = neoVectors.filter((neo) => neo.hazardous).length;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHeader
        eyebrow="Interactive 3D WebGL telemetry"
        title="Starlink & Asteroid Orbit Globe"
        description="A rotatable tactical Earth model with Starlink shell points and projected near-Earth object approach vectors."
      />

      <Panel className="relative overflow-hidden p-0" fallback={starlink.fallback || neos.fallback} error={starlink.error || neos.error}>
        {starlink.loading || neos.loading ? (
          <div className="p-4">
            <LoadingBlock label="Booting WebGL orbital scene" />
          </div>
        ) : (
          <div className="relative h-[72vh] min-h-[620px] bg-black">
            <GlobeScene satellites={activeSatellites} neos={neoVectors} />
            <div className="pointer-events-none absolute inset-0 border border-emerald-900/50" />
            <div className="pointer-events-none absolute left-4 top-4 grid max-w-sm gap-3">
              <div className="border border-emerald-500/50 bg-black/70 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-matrix">
                  <Gauge className="h-4 w-4" />
                  Orbital Diagnostics
                </div>
                <div className="grid gap-2 font-mono text-xs text-emerald-200">
                  <div className="flex justify-between gap-6"><span>Total Active Satellites Tracked</span><strong className="text-matrix">{activeSatellites.length}</strong></div>
                  <div className="flex justify-between gap-6"><span>Rendering Target</span><strong className="text-matrix">60 FPS</strong></div>
                  <div className="flex justify-between gap-6"><span>Orbital Shell Zoom</span><strong className="text-matrix">1.2x</strong></div>
                  <div className="flex justify-between gap-6"><span>NEO Vector Paths</span><strong className={hazardous ? 'text-red-300' : 'text-matrix'}>{neoVectors.length}</strong></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge><Satellite className="h-3 w-3" /> Starlink Shell</StatusBadge>
                <StatusBadge tone={hazardous ? 'red' : 'green'} pulse={hazardous > 0}><TriangleAlert className="h-3 w-3" /> {hazardous} Hazard Vectors</StatusBadge>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 border border-emerald-900/70 bg-black/70 p-3 font-mono text-xs uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md">
              <div className="flex items-center gap-2"><Crosshair className="h-4 w-4 text-matrix" /> OrbitControls enabled: rotate / zoom / pan</div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
