import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 60_000;

export interface PolledState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

/** Runs `fetcher` immediately and every 60s, tracking loading/error/lastUpdated state. */
export function usePolling<T>(fetcher: () => Promise<T>): PolledState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error fetching data.");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, error, loading, lastUpdated, refresh: load };
}
