import { createContext, useContext, useMemo, useState } from 'react';

const TimelineContext = createContext(null);

export const ARCHIVE_START_YEAR = 2015;
export const ARCHIVE_END_YEAR = new Date().getUTCFullYear();

export function TimelineProvider({ children }) {
  const [currentArchiveYear, setCurrentArchiveYear] = useState(ARCHIVE_END_YEAR);
  const isLiveEpoch = currentArchiveYear >= ARCHIVE_END_YEAR;

  const value = useMemo(
    () => ({
      currentArchiveYear,
      setCurrentArchiveYear,
      isLiveEpoch,
      archiveStartYear: ARCHIVE_START_YEAR,
      archiveEndYear: ARCHIVE_END_YEAR,
    }),
    [currentArchiveYear, isLiveEpoch],
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used inside TimelineProvider');
  }
  return context;
}
