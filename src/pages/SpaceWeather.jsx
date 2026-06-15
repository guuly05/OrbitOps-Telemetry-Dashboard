import { useMemo } from 'react';
import { AlertOctagon, BarChart3, CircleGauge, Globe2 } from 'lucide-react';
import { api, epicImageUrl } from '../lib/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { DonutChart, HorizontalBarChart } from '../components/Charts';
import { LoadingBlock, PageHeader, Panel, StatTile, StatusBadge } from '../components/Panel';
import { useTimeline } from '../context/TimelineContext';

function classifyPayload(payload) {
  const name = `${payload.name ?? ''} ${payload.type ?? ''} ${payload.orbit ?? ''}`.toLowerCase();
  if (name.includes('starlink')) return 'Starlink';
  if (name.includes('dragon') || name.includes('crew')) return 'Crew / ISS';
  if (name.includes('crs') || name.includes('iss')) return 'ISS Resupply';
  if (name.includes('satellite')) return 'Commercial Satellite';
  return payload.type || 'Other Payload';
}

function classifyCustomer(customer = '') {
  const value = customer.toLowerCase();
  if (value.includes('nasa')) return 'NASA';
  if (value.includes('ussf') || value.includes('space force') || value.includes('usaf')) return 'USSF / Defense';
  if (value.includes('esa') || value.includes('jaxa') || value.includes('isro') || value.includes('space agency')) return 'International';
  if (value.includes('spacex')) return 'SpaceX';
  return 'Commercial';
}

function countBy(items, mapper) {
  const counts = items.reduce((acc, item) => {
    const key = mapper(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function stormState(cmes = [], year, isLiveEpoch) {
  if (!isLiveEpoch) {
    if (cmes.length >= 3) return { tone: 'red', label: 'Historical Storm Cluster', detail: `${cmes.length} CME records parsed from the ${year} archive slice` };
    if (cmes.length > 0) return { tone: 'yellow', label: 'Historical Solar Activity', detail: `${cmes.length} CME record parsed from the ${year} archive slice` };
    return { tone: 'green', label: 'Archive Slice Clear', detail: `No CME records detected in the ${year} query window` };
  }
  const now = Date.now();
  const recent = cmes.filter((cme) => {
    const time = new Date(cme.startTime).getTime();
    return Number.isFinite(time) && now - time < 48 * 60 * 60 * 1000;
  });
  if (recent.length >= 3) return { tone: 'red', label: 'Storm Escalated', detail: `${recent.length} CME events within 48 hours` };
  if (recent.length > 0) return { tone: 'yellow', label: 'Solar Watch', detail: `${recent.length} CME event within 48 hours` };
  return { tone: 'green', label: 'Magnetosphere Nominal', detail: 'No CME events detected in active window' };
}

export default function SpaceWeather() {
  const { currentArchiveYear, isLiveEpoch } = useTimeline();
  const cmes = useAsyncData(() => api.cmes(currentArchiveYear), [currentArchiveYear]);
  const flares = useAsyncData(() => api.solarFlares(currentArchiveYear), [currentArchiveYear]);
  const storms = useAsyncData(() => api.geomagneticStorms(currentArchiveYear), [currentArchiveYear]);
  const epic = useAsyncData(api.epicImages, []);
  const payloads = useAsyncData(api.payloads, []);

  const status = useMemo(() => stormState(cmes.data ?? [], currentArchiveYear, isLiveEpoch), [cmes.data, currentArchiveYear, isLiveEpoch]);
  const latestEpic = epic.data?.[0];
  const payloadTypeData = useMemo(() => countBy(payloads.data ?? [], classifyPayload).slice(0, 6), [payloads.data]);
  const customerData = useMemo(() => {
    const customers = (payloads.data ?? []).flatMap((payload) => payload.customers ?? []);
    return countBy(customers, classifyCustomer).slice(0, 7);
  }, [payloads.data]);

  return (
    <>
      <PageHeader
        eyebrow="Solar wind and orbital payload intelligence"
        title="Earth & Space Weather"
        description="CME warning state, EPIC full-disk Earth imagery, and historical payload classification for agency-level telemetry review."
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="DONKI Space Weather Alert Desk" icon={AlertOctagon} fallback={cmes.fallback || flares.fallback || storms.fallback} error={cmes.error || flares.error || storms.error}>
          {cmes.loading || flares.loading || storms.loading ? (
            <LoadingBlock />
          ) : (
            <div className="grid gap-4">
              <div className={`border p-5 ${status.tone === 'red' ? 'border-red-500/60 bg-red-500/10 shadow-danger' : status.tone === 'yellow' ? 'border-yellow-500/60 bg-yellow-500/10' : 'border-emerald-500/60 bg-emerald-500/10 shadow-neon'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-500">Geomagnetic Storm System Status</p>
                    <h3 className="mt-2 font-mono text-3xl font-black uppercase text-emerald-50">{status.label}</h3>
                    <p className="mt-2 text-sm text-emerald-200/70">{status.detail}</p>
                  </div>
                  <CircleGauge className={`h-14 w-14 ${status.tone === 'red' ? 'text-red-300' : status.tone === 'yellow' ? 'text-yellow-300' : 'text-matrix'}`} />
                </div>
              </div>
              <div className="max-h-64 overflow-auto">
                {(cmes.data ?? []).slice(0, 8).map((event) => (
                  <div key={event.activityID ?? event.startTime} className="mb-2 border border-emerald-900/50 bg-black/45 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-sm text-emerald-100">{event.activityID ?? 'CME EVENT'}</p>
                      <StatusBadge tone={new Date(event.startTime).getTime() > Date.now() - 48 * 60 * 60 * 1000 ? status.tone : 'green'}>{new Date(event.startTime).toUTCString()}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-emerald-300/65">{event.note || event.instruments?.map((instrument) => instrument.displayName).join(', ') || 'No detailed CME note available.'}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="CME Records" value={(cmes.data ?? []).length} detail={`${currentArchiveYear} archive slice`} tone={status.tone === 'red' ? 'red' : status.tone === 'yellow' ? 'yellow' : 'green'} />
                <StatTile label="Solar Flares" value={(flares.data ?? []).length} detail="DONKI FLR records" tone={(flares.data ?? []).length ? 'yellow' : 'green'} />
                <StatTile label="Geo Storms" value={(storms.data ?? []).length} detail="DONKI GST records" tone={(storms.data ?? []).length ? 'red' : 'green'} />
              </div>
            </div>
          )}
        </Panel>

        <Panel title="NASA EPIC Earth Rotation Viewer" icon={Globe2} fallback={epic.fallback} error={epic.error}>
          {epic.loading ? (
            <LoadingBlock />
          ) : (
            <div className="relative grid min-h-[520px] place-items-center overflow-hidden border border-emerald-900/50 bg-black">
              <img src={epicImageUrl(latestEpic)} alt={latestEpic?.caption ?? 'EPIC Earth disk'} className="h-[460px] w-[460px] max-w-[88vw] rounded-full object-cover shadow-neon" />
              <div className="absolute h-[500px] w-[500px] max-w-[94vw] animate-slow-spin rounded-full border border-dashed border-emerald-500/60" />
              <div className="absolute h-[390px] w-[390px] max-w-[76vw] animate-[spin_10s_linear_infinite_reverse] rounded-full border border-emerald-800/70" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between gap-2 border border-emerald-900/70 bg-black/70 p-3 font-mono text-xs text-emerald-300 backdrop-blur-md">
                <span>EPIC ID: {latestEpic?.identifier ?? 'UNKNOWN'}</span>
                <span>{latestEpic?.date ?? 'latest natural color packet'}</span>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Payload Type Distribution" icon={BarChart3} fallback={payloads.fallback} error={payloads.error}>
          {payloads.loading ? <LoadingBlock /> : <DonutChart data={payloadTypeData} />}
        </Panel>

        <Panel title="Top Client Agencies" icon={BarChart3} fallback={payloads.fallback} error={payloads.error}>
          {payloads.loading ? (
            <LoadingBlock />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr]">
              <HorizontalBarChart data={customerData} />
              <div className="grid content-start gap-3">
                <StatTile label="Payload Records" value={(payloads.data ?? []).length} detail="SpaceX payload archive" />
                <StatTile label="Client Classes" value={customerData.length} detail="normalized agencies" />
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
