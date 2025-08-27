import api from './api'

type CacheEntry<T = any> = {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<any>>()

export interface GetWithCacheOptions {
  ttlMs?: number
  signal?: AbortSignal
  bypassCache?: boolean
}

// Build a cache key for GET requests. We purposely ignore the signal in the key.
const keyFor = (url: string) => `GET ${url}`

// A minimal CanceledError-compatible object for consumers that check name/code
const canceledError = () => {
  const err: any = new Error('canceled')
  err.name = 'CanceledError'
  err.code = 'ERR_CANCELED'
  return err
}

/**
 * Perform a GET with simple in-memory deduplication + TTL cache.
 * - Concurrent identical GETs share a single network call.
 * - Subsequent GETs within TTL return cached data.
 * - If a consumer provides an AbortSignal and aborts, their call rejects
 *   without canceling the shared underlying request.
 */
export async function getWithCache<T = any>(url: string, opts: GetWithCacheOptions = {}): Promise<{ data: T }>
export async function getWithCache<T = any>(url: string, opts: GetWithCacheOptions = {}) {
  const { ttlMs = 30000, signal, bypassCache } = opts
  const key = keyFor(url)

  // Serve from cache if valid and not bypassed
  if (!bypassCache) {
    const hit = cache.get(key)
    if (hit && hit.expiresAt > Date.now()) {
      return { data: hit.data as T }
    }
  }

  // If a request is already in-flight for this key, share it
  let shared = inflight.get(key)
  if (!shared) {
    shared = api.get(url).then((res) => {
      cache.set(key, { data: res.data, expiresAt: Date.now() + ttlMs })
      return res
    }).finally(() => {
      inflight.delete(key)
    })
    inflight.set(key, shared)
  }

  // Return a per-consumer wrapper to respect their AbortSignal without
  // canceling the underlying shared request.
  if (signal) {
    if (signal.aborted) {
      throw canceledError()
    }
    return new Promise((resolve, reject) => {
      const onAbort = () => reject(canceledError())
      signal.addEventListener('abort', onAbort, { once: true })
      shared!
        .then((res) => resolve(res))
        .catch((err) => reject(err))
        .finally(() => signal.removeEventListener('abort', onAbort))
    })
  }

  return shared
}

export function clearFetchCache() {
  cache.clear()
}

