import { History, Radio, Rewind } from 'lucide-react';
import { useTimeline } from '../context/TimelineContext';

export default function ChronosBar() {
  const { currentArchiveYear, setCurrentArchiveYear, isLiveEpoch, archiveStartYear, archiveEndYear } = useTimeline();
  const progress = ((currentArchiveYear - archiveStartYear) / (archiveEndYear - archiveStartYear)) * 100;

  return (
    <div className="sticky top-24 z-30 mb-6 border border-emerald-900/70 bg-black/82 p-3 shadow-neon backdrop-blur-xl lg:top-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_2fr_auto] xl:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-emerald-500/60 bg-emerald-500/10">
            <History className="h-5 w-5 text-matrix" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-matrix">[Chronos System Timeline Replay]</p>
            <p className="font-mono text-sm text-emerald-200">{isLiveEpoch ? 'Live 2026 telemetry epoch' : `Historical archive locked to ${currentArchiveYear}`}</p>
          </div>
        </div>

        <div className="relative">
          <div className="mb-2 flex justify-between font-mono text-[10px] text-emerald-600">
            <span>{archiveStartYear}</span>
            <span>{archiveEndYear}</span>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-matrix shadow-neon" style={{ width: `${progress}%` }} />
            <input
              type="range"
              min={archiveStartYear}
              max={archiveEndYear}
              step="1"
              value={currentArchiveYear}
              onChange={(event) => setCurrentArchiveYear(Number(event.target.value))}
              className="relative z-10 h-2 w-full cursor-pointer appearance-none border border-emerald-900 bg-black accent-emerald-400"
              aria-label="Chronos historical archive year"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border border-emerald-900/70 bg-carbon px-4 py-2 font-mono">
          <span className="text-3xl font-black text-matrix">{currentArchiveYear}</span>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            {isLiveEpoch ? <Radio className="h-4 w-4 text-matrix" /> : <Rewind className="h-4 w-4 text-yellow-300" />}
            {isLiveEpoch ? 'Live Stream' : 'Replay Mode'}
          </span>
        </div>
      </div>
    </div>
  );
}
