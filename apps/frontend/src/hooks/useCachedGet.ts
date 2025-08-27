import { useEffect, useMemo, useRef, useState } from 'react'
import { getWithCache } from '../utils/fetchCache'

type UseCachedGetOptions = {
  url: string | null | undefined
  ttlMs?: number
  deps?: any[]
  initial?: any
  bypassCache?: boolean
}

export function useCachedGet<T = any>({ url, ttlMs = 30000, deps = [], initial = null, bypassCache = false }: UseCachedGetOptions) {
  const [data, setData] = useState<T | null>(initial)
  const [loading, setLoading] = useState<boolean>(Boolean(url))
  const [error, setError] = useState<any>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const refetchBypassRef = useRef(false)

  const effectiveBypass = bypassCache || refetchBypassRef.current

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      if (!url) {
        setLoading(false)
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await getWithCache<T>(url, { ttlMs, signal: controller.signal, bypassCache: effectiveBypass })
        setData(res.data as T)
      } catch (e: any) {
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return
        setError(e)
      } finally {
        setLoading(false)
        refetchBypassRef.current = false
      }
    }
    run()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ttlMs, refreshTick, effectiveBypass, ...deps])

  const refetch = useMemo(() => {
    return async (opts?: { bypassCache?: boolean }) => {
      if (opts?.bypassCache) refetchBypassRef.current = true
      setRefreshTick((t) => t + 1)
    }
  }, [])

  return { data, loading, error, refetch }
}

