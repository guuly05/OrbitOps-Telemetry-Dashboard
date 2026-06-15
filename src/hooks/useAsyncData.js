import { useEffect, useState } from 'react';

export function useAsyncData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, fallback: false, error: null });

  useEffect(() => {
    let mounted = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    loader().then((result) => {
      if (!mounted) return;
      setState({ data: result.data, loading: false, fallback: result.fallback, error: result.error });
    });

    return () => {
      mounted = false;
    };
  }, deps);

  return state;
}

export function useUtcClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
