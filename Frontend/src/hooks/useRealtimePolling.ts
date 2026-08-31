import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedGet } from '../api/client';
import api from '../api/client';

interface UseRealtimeOptions {
  /** Polling interval in ms (default: 30000 = 30s) */
  interval?: number;
  /** Only poll when tab is visible (default: true) */
  onlyVisible?: boolean;
  /** Enable/disable polling (default: true) */
  enabled?: boolean;
}

/**
 * Real-time polling hook — loads from cache instantly, then polls in background.
 * Only shows "new items" banner when data actually changes (like WhatsApp).
 *
 * Usage:
 * const { data, loading, newCount, acceptNew } = useRealtimePolling('/gallery', []);
 */
export function useRealtimePolling<T = any[]>(
  endpoint: string,
  initialData: T,
  options: UseRealtimeOptions = {},
) {
  const { interval = 30000, onlyVisible = true, enabled = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [pendingData, setPendingData] = useState<T | null>(null);
  const dataRef = useRef<T>(initialData);
  const mountedRef = useRef(true);
  const initialLoadDone = useRef(false);

  // Accept pending data (user clicks "new items" banner)
  const acceptNew = useCallback(() => {
    if (pendingData) {
      setData(pendingData);
      dataRef.current = pendingData;
      setPendingData(null);
      setNewCount(0);
    }
  }, [pendingData]);

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
        initialLoadDone.current = true;

        // If from cache, fetch fresh in background silently
        if (fromCache) {
          try {
        const res = await api.get(endpoint);
        const freshData = res.data as T;
            if (!mountedRef.current) return;
            const cachedStr = JSON.stringify(cachedData);
            const freshStr = JSON.stringify(freshData);
            if (cachedStr !== freshStr) {
              // Data changed — show as pending update
              setPendingData(freshData);
              if (Array.isArray(freshData) && Array.isArray(cachedData)) {
                const oldIds = new Set((cachedData as any[]).map((i: any) => i.id));
                const newItems = (freshData as any[]).filter((i: any) => !oldIds.has(i.id));
                setNewCount(newItems.length);
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
  }, [endpoint]);

  // Background polling — only runs after initial load
  useEffect(() => {
    if (!enabled || !initialLoadDone.current) return;

    const poll = async () => {
      if (onlyVisible && document.hidden) return;
      try {
        const res = await api.get(endpoint);
        const newData = res.data as T;
        if (!mountedRef.current) return;

        const currentStr = JSON.stringify(dataRef.current);
        const newStr = JSON.stringify(newData);
        if (currentStr !== newStr) {
          setPendingData(newData);
          if (Array.isArray(newData) && Array.isArray(dataRef.current)) {
            const oldIds = new Set((dataRef.current as any[]).map((i: any) => i.id));
            const newItems = (newData as any[]).filter((i: any) => !oldIds.has(i.id));
            setNewCount((prev) => prev + newItems.length);
          } else {
            setNewCount((prev) => prev + 1);
          }
        }
      } catch {}
    };

    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [endpoint, interval, onlyVisible, enabled]);

  return { data, loading, newCount, acceptNew, pendingData };
}
