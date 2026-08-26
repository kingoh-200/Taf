import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

interface UseRealtimeOptions {
  /** Polling interval in ms (default: 10000 = 10s) */
  interval?: number;
  /** Only poll when tab is visible (default: true) */
  onlyVisible?: boolean;
  /** Enable/disable polling (default: true) */
  enabled?: boolean;
}

/**
 * Real-time polling hook — fetches data at intervals and only updates
 * when data actually changes (like WhatsApp).
 * 
 * Usage:
 * const { data, loading, newCount, acceptNew } = useRealtimePolling('/gallery', []);
 */
export function useRealtimePolling<T = any[]>(
  endpoint: string,
  initialData: T,
  options: UseRealtimeOptions = {},
) {
  const { interval = 10000, onlyVisible = true, enabled = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [pendingData, setPendingData] = useState<T | null>(null);
  const dataRef = useRef<T>(initialData);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      const res = await api.get(endpoint);
      const newData = res.data as T;

      if (!mountedRef.current) return;

      if (isBackground) {
        // Compare — only set pending if different
        const currentStr = JSON.stringify(dataRef.current);
        const newStr = JSON.stringify(newData);
        if (currentStr !== newStr) {
          setPendingData(newData);
          // Count new items if it's an array
          if (Array.isArray(newData) && Array.isArray(dataRef.current)) {
            const oldIds = new Set((dataRef.current as any[]).map((i: any) => i.id));
            const newItems = (newData as any[]).filter((i: any) => !oldIds.has(i.id));
            setNewCount((prev) => prev + newItems.length);
          } else {
            setNewCount((prev) => prev + 1);
          }
        }
      } else {
        setData(newData);
        dataRef.current = newData;
        setPendingData(null);
        setNewCount(0);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [endpoint]);

  // Accept pending data (user clicks "new items" banner)
  const acceptNew = useCallback(() => {
    if (pendingData) {
      setData(pendingData);
      dataRef.current = pendingData;
      setPendingData(null);
      setNewCount(0);
    }
  }, [pendingData]);

  // Initial fetch + polling
  useEffect(() => {
    mountedRef.current = true;
    fetchData(false);

    return () => { mountedRef.current = false; };
  }, [fetchData, enabled]);

  // Background polling
  useEffect(() => {
    if (!enabled) return;

    const poll = () => {
      if (onlyVisible && document.hidden) return;
      fetchData(true);
    };

    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [fetchData, interval, onlyVisible, enabled]);

  return { data, loading, newCount, acceptNew, pendingData };
}
