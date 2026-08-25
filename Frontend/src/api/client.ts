import axios from 'axios';

// In production, use the full backend URL; in dev, use the Vite proxy
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// --- Session cache for fast repeat loads ---
const CACHE_TTL = 60_000; // 1 minute cache
const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cache GET responses automatically
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      setCache(response.config.url || '', response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Cached GET — returns cached data instantly if available, then fetches fresh in background.
 * Returns { data, fromCache } so the UI can show content immediately.
 */
export async function cachedGet<T = any>(url: string): Promise<{ data: T; fromCache: boolean }> {
  const cached = getCached(url);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }
  const res = await api.get<T>(url);
  return { data: res.data, fromCache: false };
}

export function clearCache() {
  cache.clear();
}

/**
 * Retry wrapper for API calls — helpful when Render is waking up from sleep.
 * Usage: const data = await retry(() => api.get('/events'), 3);
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 2000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error('Unreachable');
}

export default api;
