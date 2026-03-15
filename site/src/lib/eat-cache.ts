import type { GroupedEatResults } from "./eat-types";

const TTL_MS = 15 * 60 * 1000; // 15 minutes

type CacheEntry = {
  data: GroupedEatResults;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();

export function getCacheKey(
  lat: number,
  lng: number,
  cuisine: string,
  radiusMeters: number,
): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)},${cuisine},${radiusMeters}`;
}

export function getCached(key: string): GroupedEatResults | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: GroupedEatResults): void {
  cache.set(key, { data, timestamp: Date.now() });
}
