import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RadioTower, Rocket, ShieldAlert, TimerReset } from 'lucide-react';
import { api, neowsArchiveDate, normalizeNeos } from '../lib/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { LaunchTrendChart } from '../components/Charts';
import { LoadingBlock, PageHeader, Panel, StatTile, StatusBadge } from '../components/Panel';
import { useTimeline } from '../context/TimelineContext';

function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const distance = Math.max(0, new Date(targetDate).getTime() - now);
  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance % 86_400_000) / 3_600_000);
  const minutes = Math.floor((distance % 3_600_000) / 60_000);
  const seconds = Math.floor((distance % 60_000) / 1000);
  return { days, hours, minutes, seconds, distance };
}

function LandingStats({ launches }) {
  const stats = launches.reduce(
    (acc, launch) => {
      launch.cores?.forEach((core) => {
        if (typeof core.landing_success === 'boolean') {
          acc.total += 1;
          core.landing_success ? (acc.success += 1) : (acc.failure += 1);
        }
      });
      return acc;
    },
    { total: 0, success: 0, failure: 0 },
  );
  const successRate = stats.total ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile label="Landing Success" value={`${successRate}%`} detail={`${stats.success} recoveries`} />
      <StatTile label="Landing Failure" value={stats.failure} tone="red" detail="failed or lost cores" />
      <StatTile label="Tracked Attempts" value={stats.total} detail="historical core events" />
    </div>
  );
}

export default function MissionControl() {
  const { currentArchiveYear, isLiveEpoch } = useTimeline();
  const nextLaunch = useAsyncData(api.nextLaunch, []);
  const launches = useAsyncData(api.launches, []);
  const neoDate = isLiveEpoch ? undefined : neowsArchiveDate(currentArchiveYear);
  const neos = useAsyncData(() => api.neos(neoDate), [neoDate]);

  const historicalLaunches = useMemo(() => {
    const cutoff = Date.UTC(currentArchiveYear, 11, 31, 23, 59, 59);
    return (launches.data ?? [])
      .filter((launch) => new Date(launch.date_utc).getTime() <= cutoff)
      .sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime());
  }, [launches.data, currentArchiveYear]);

  const replayLaunch = useMemo(() => {
    if (isLiveEpoch) return nextLaunch.data;
    const epochStart = Date.UTC(currentArchiveYear, 0, 1);
    return (launches.data ?? [])
      .filter((launch) => new Date(launch.date_utc).getTime() >= epochStart)
      .sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime())[0];
  }, [isLiveEpoch, nextLaunch.data, launches.data, currentArchiveYear]);

  const countdown = useCountdown(replayLaunch?.date_utc);
  const normalizedNeos = useMemo(() => normalizeNeos(neos.data), [neos.data]);
  const replayOffset = useMemo(() => {
    if (!replayLaunch) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const distance = Math.max(0, new Date(replayLaunch.date_utc).getTime() - Date.UTC(currentArchiveYear, 0, 1));
    return {
      days: Math.floor(distance / 86_400_000),
      hours: Math.floor((distance % 86_400_000) / 3_600_000),
      minutes: Math.floor((distance % 3_600_000) / 60_000),
      seconds: Math.floor((distance % 60_000) / 1000),
    };
  }, [replayLaunch, currentArchiveYear]);
  const counterValues = isLiveEpoch ? countdown : replayOffset;

  return (
    <>
      <PageHeader
        eyebrow="Real-time tactical operations center"
        title="Mission Control"
        description="Launch countdowns, SpaceX recovery analytics, and near-Earth object proximity scoring in one dense command surface."
      />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title={isLiveEpoch ? 'SpaceX Launch Counter' : 'Historical Launch Replay Counter'} icon={Rocket} fallback={nextLaunch.fallback || launches.fallback} error={nextLaunch.error || launches.error}>
          {nextLaunch.loading || launches.loading ? (
            <LoadingBlock />
          ) : (
            <div className="space-y-5">
              <div className="border border-emerald-900/50 bg-black/50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500">{isLiveEpoch ? 'Next Launch' : `First scheduled launch after 01 JAN ${currentArchiveYear}`}</p>
                    <h3 className="mt-1 text-2xl font-black text-emerald-50">{replayLaunch?.name ?? 'No launch packet in archive window'}</h3>
                  </div>
                  <StatusBadge tone={isLiveEpoch ? 'green' : 'yellow'}>{isLiveEpoch ? `Flight #${replayLaunch?.flight_number ?? 'TBD'}` : 'Replay Offset'}</StatusBadge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['DAYS', counterValues.days],
                    ['HRS', counterValues.hours],
                    ['MIN', counterValues.minutes],
                    ['SEC', counterValues.seconds],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-emerald-800/70 bg-carbon p-3 text-center">
                      <p className="font-mono text-3xl font-black text-matrix">{String(value).padStart(2, '0')}</p>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-emerald-600">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-emerald-200/65">
                  {isLiveEpoch
                    ? replayLaunch?.details ?? 'Launch window locked. Awaiting final telemetry.'
                    : `${replayLaunch?.date_utc ? new Date(replayLaunch.date_utc).toUTCString() : 'Archive has no launch date'} within the ${currentArchiveYear} Chronos replay.`}
                </p>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Landing Recovery Metrics" icon={TimerReset} fallback={launches.fallback} error={launches.error}>
          {launches.loading ? <LoadingBlock /> : <LandingStats launches={historicalLaunches} />}
        </Panel>

        <Panel title="Launches Per Year" icon={RadioTower} className="xl:col-span-2" fallback={launches.fallback} error={launches.error}>
          {launches.loading ? <LoadingBlock /> : <LaunchTrendChart launches={historicalLaunches} />}
        </Panel>

        <Panel title="NASA NeoWs Threat Matrix" icon={ShieldAlert} className="xl:col-span-2" fallback={neos.fallback} error={neos.error}>
          {neos.loading ? (
            <LoadingBlock />
          ) : (
            <div className="max-h-[480px] overflow-auto border border-emerald-900/40">
              <table className="w-full min-w-[760px] border-collapse font-mono text-sm">
                <thead className="sticky top-0 bg-black text-xs uppercase tracking-[0.2em] text-emerald-500">
                  <tr>
                    <th className="border-b border-emerald-900/60 p-3 text-left">Object</th>
                    <th className="border-b border-emerald-900/60 p-3 text-right">Velocity KM/H</th>
                    <th className="border-b border-emerald-900/60 p-3 text-right">Miss Distance KM</th>
                    <th className="border-b border-emerald-900/60 p-3 text-right">Hazard State</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedNeos.map((neo) => (
                    <tr key={neo.id} className="border-b border-emerald-950/80 bg-black/35 hover:bg-emerald-500/5">
                      <td className="p-3 text-emerald-100">{neo.name}</td>
                      <td className="p-3 text-right text-emerald-200">{neo.velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-right text-emerald-200">{neo.missDistance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-right">
                        {neo.hazardous ? (
                          <StatusBadge tone="red" pulse>
                            Red Alert
                          </StatusBadge>
                        ) : (
                          <StatusBadge>
                            <CheckCircle2 className="h-3 w-3" />
                            Clear
                          </StatusBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
