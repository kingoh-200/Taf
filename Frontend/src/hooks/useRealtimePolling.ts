import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedGet } from '../api/client';
import api from '../api/client';
import { invalidateCache } from '../api/client';

interface UseRealtimeOptions {
  /** Polling interval in ms (default: 30000 = 30s) */
  interval?: number;
  /** Only poll when the tab is visible (default: true) */
  onlyVisible?: boolean;
  /** Enable/disable polling (default: true) */
  enabled?: boolean;
  /**
   * Apply changes straight away instead of showing the "new items" banner.
   * Use for feeds where new content should just appear (default: false).
   */
  autoApply?: boolean;
}

/** Ignore foreground catch-ups that fire within this window of the last poll. */
const CATCHUP_DEBOUNCE = 5000;

/**
 * Real-time polling hook — loads from cache instantly, then polls in background.
 *
 * - Instant first paint from the session cache, fresh data fetched silently.
 * - Keeps polling even if the very first load failed (backend asleep, offline).
 * - Catches up immediately when the tab/app returns to the foreground instead
 *   of waiting for the next interval.
 * - Never stacks overlapping requests.
 * - By default it shows a "new items" banner when data changes (WhatsApp style);
 *   pass `autoApply: true` to have changes appear immediately instead.
 *
 * Usage:
 * const { data, loading, newCount, acceptNew, refresh } = useRealtimePolling('/gallery', []);
 */
export function useRealtimePolling<T = any[]>(
  endpoint: string,
  initialData: T,
  options: UseRealtimeOptions = {},
) {
  const { interval = 30000, onlyVisible = true, enabled = true, autoApply = false } = options;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [pendingData, setPendingData] = useState<T | null>(null);
  const [ready, setReady] = useState(false);
  const dataRef = useRef<T>(initialData);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const lastPollRef = useRef(0);

  const applyData = useCallback((next: T) => {
    setData(next);
    dataRef.current = next;
    setPendingData(null);
    setNewCount(0);
  }, []);

  // Accept pending data (user clicks "new items" banner)
  const acceptNew = useCallback(() => {
    if (pendingData) applyData(pendingData);
  }, [pendingData, applyData]);

  /** Fetch once and merge the result according to the autoApply setting. */
  const fetchOnce = useCallback(async (): Promise<'updated' | 'unchanged' | 'skipped'> => {
    if (inFlightRef.current) return 'skipped';
    inFlightRef.current = true;
    lastPollRef.current = Date.now();
    try {
      const res = await api.get(endpoint);
      if (!mountedRef.current) return 'skipped';
      const next = res.data as T;
      if (JSON.stringify(dataRef.current) === JSON.stringify(next)) return 'unchanged';

      if (autoApply) {
        setData(next);
        dataRef.current = next;
      } else {
        setPendingData(next);
        setNewCount((prev) => prev + countNewItems(dataRef.current, next));
      }
      return 'updated';
    } catch {
      return 'skipped';
    } finally {
      inFlightRef.current = false;
    }
  }, [endpoint, autoApply]);

  /**
   * Force an immediate fresh fetch and apply it — used right after the user
   * creates/likes/saves something so their own change shows instantly.
   */
  const refresh = useCallback(async () => {
    invalidateCache(endpoint);
    try {
      const res = await api.get(endpoint);
      if (!mountedRef.current) return;
      applyData(res.data as T);
      setReady(true);
    } catch {
      // Even if this fails, make sure polling is running so we recover later.
      if (mountedRef.current) setReady(true);
    }
  }, [endpoint, applyData]);

  // Initial fetch — uses cache for instant display, then refreshes in background
  useEffect(() => {
    mountedRef.current = true;

    const loadInitial = async () => {
      try {
        const { data: cachedData, fromCache } = await cachedGet<T>(endpoint);
        if (!mountedRef.current) return;

        setData(cachedData);
        dataRef.current = cachedData;
        setLoading(false);

        if (fromCache) await fetchOnce();
      } catch {
        // Nothing cached and the request failed (backend asleep, offline) —
        // keep the defaults and let background polling recover.
      } finally {
        // Always start polling, even when the first load failed.
        if (mountedRef.current) {
          setLoading(false);
          setReady(true);
        }
      }
    };

    loadInitial();

    return () => { mountedRef.current = false; };
  }, [endpoint, fetchOnce]);

  // Background polling
  useEffect(() => {
    if (!enabled || !ready) return;

    const tick = () => {
      if (onlyVisible && document.hidden) return;
      fetchOnce();
    };

    const id = setInterval(tick, interval);

    // Catch up as soon as the tab/app is back in the foreground.
    const onForeground = () => {
      if (document.hidden) return;
      if (Date.now() - lastPollRef.current < CATCHUP_DEBOUNCE) return;
      fetchOnce();
    };

    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);
    window.addEventListener('online', onForeground);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
      window.removeEventListener('online', onForeground);
    };
  }, [endpoint, interval, onlyVisible, enabled, fetchOnce, ready]);

  return { data, loading, newCount, acceptNew, refresh, pendingData };
}

/** How many items are in `next` that weren't in `prev`. */
function countNewItems(prev: any, next: any): number {
  if (Array.isArray(prev) && Array.isArray(next)) {
    const oldIds = new Set(prev.map((i: any) => i?.id));
    return next.filter((i: any) => !oldIds.has(i?.id)).length;
  }
  return 1;
}
