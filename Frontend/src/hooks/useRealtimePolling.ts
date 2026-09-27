import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedGet } from '../api/client';
import api from '../api/client';
import { invalidateCache } from '../api/client';

interface UseRealtimeOptions {
  /** Polling interval in ms (default: 30000 = 30s) */
  interval?: number;
  /** Only poll when tab is visible (default: true) */
  onlyVisible?: boolean;
  /** Enable/disable polling (default: true) */
  enabled?: boolean;
  /**
   * Apply changes straight away instead of showing the "new items" banner.
   * Use for feeds where new content should just appear (default: false).
   */
  autoApply?: boolean;
}

/**
 * Real-time polling hook — loads from cache instantly, then polls in background.
 * By default it shows a "new items" banner when data changes (WhatsApp style);
 * pass `autoApply: true` to have changes appear immediately instead.
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
    } catch {}
  }, [endpoint, applyData]);

  // Initial fetch — uses cache for instant display
  useEffect(() => {
    mountedRef.current = true;

    const loadInitial = async () => {
      try {
        const { data: cachedData, fromCache } = await cachedGet<T>(endpoint);
        if (!mountedRef.current) return;

        setData(cachedData);
        dataRef.current = cachedData;
        setLoading(false);
        setReady(true);

        // If from cache, fetch fresh in background
        if (fromCache) {
          try {
            const res = await api.get(endpoint);
            const freshData = res.data as T;
            if (!mountedRef.current) return;
            if (JSON.stringify(cachedData) !== JSON.stringify(freshData)) {
              if (autoApply) {
                setData(freshData);
                dataRef.current = freshData;
              } else {
                setPendingData(freshData);
                setNewCount(countNewItems(cachedData, freshData));
              }
            }
          } catch {}
        }
      } catch {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadInitial();

    return () => { mountedRef.current = false; };
  }, [endpoint, autoApply]);

  // Background polling — starts once the first load has finished
  useEffect(() => {
    if (!enabled || !ready) return;

    const poll = async () => {
      if (onlyVisible && document.hidden) return;
      try {
        const res = await api.get(endpoint);
        const newData = res.data as T;
        if (!mountedRef.current) return;
        if (JSON.stringify(dataRef.current) === JSON.stringify(newData)) return;

        if (autoApply) {
          setData(newData);
          dataRef.current = newData;
        } else {
          setPendingData(newData);
          setNewCount((prev) => prev + countNewItems(dataRef.current, newData));
        }
      } catch {}
    };

    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [endpoint, interval, onlyVisible, enabled, autoApply, ready]);

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
