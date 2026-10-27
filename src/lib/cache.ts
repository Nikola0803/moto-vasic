const TTL_MS = 10 * 60 * 1000; // 10 minuta

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function isFresh(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.ts < TTL_MS;
  } catch {
    return false;
  }
}

/**
 * Vraća cached data odmah ako postoji, uvek fetches u pozadini.
 * onData se poziva i za cache hit i za svež fetch.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  onData: (data: T, fromCache: boolean) => void
): Promise<void> {
  const cached = read<T>(key);
  if (cached !== null) {
    onData(cached, true);
    if (isFresh(key)) return; // dovoljno sveže, ne treba fetch
  }
  try {
    const fresh = await fetcher();
    write(key, fresh);
    onData(fresh, false);
  } catch (err) {
    if (cached === null) throw err; // nema ni cache ni data
    // Supabase nedostupan, koristimo stale cache — ne bacamo grešku
  }
}
