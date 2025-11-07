'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { createOptimizedSubscription, removeOptimizedSubscription, getSubscriptionMetrics } from './subscription-optimizer'
import type { SubscriptionConfig, SubscriptionMetrics } from './subscription-optimizer'

export interface UseRealtimeOptions {
  enabled?: boolean
  retryCount?: number
  retryDelay?: number
  onError?: (error: Error) => void
  onSuccess?: () => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export interface RealtimeSubscriptionResult<T = any> {
  data: T[]
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  metrics?: SubscriptionMetrics
  lastUpdated: Date | null
  reconnect: () => void
  disconnect: () => void
}

/**
 * Hook for optimized real-time subscriptions
 */
export function useRealtimeSubscription<T = any>(
  config: SubscriptionConfig,
  options: UseRealtimeOptions = {}
): RealtimeSubscriptionResult<T> {
  const [data, setData] = useState<T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [metrics, setMetrics] = useState<SubscriptionMetrics | undefined>()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const subscriptionIdRef = useRef<string | null>(null)
  const retryCountRef = useRef(0)
  const connectRef = useRef<(() => void) | null>(null)
  const {
    enabled = true,
    retryCount = 3,
    retryDelay = 2000,
    onError,
    onSuccess,
    onConnect,
    onDisconnect
  } = options

  const handleEvent = useCallback((payload: any) => {
    try {
      setData(prevData => {
        let newData = [...prevData]

        switch (payload.eventType) {
          case 'INSERT':
            newData.push(payload.new as T)
            break
          case 'UPDATE':
            newData = newData.map(item =>
              (item as any).id === payload.new.id ? payload.new : item
            )
            break
          case 'DELETE':
            newData = newData.filter(item =>
              (item as any).id !== payload.old.id
            )
            break
          case '*':
            if (payload.new) {
              const index = newData.findIndex(item =>
                (item as any).id === payload.new.id
              )
              if (index >= 0) {
                newData[index] = payload.new
              } else {
                newData.push(payload.new)
              }
            } else if (payload.old) {
              newData = newData.filter(item =>
                (item as any).id !== payload.old.id
              )
            }
            break
        }

        return newData
      })

      setLastUpdated(new Date())
      setError(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      if (onError) {
        onError(error)
      }
    }
  }, [onSuccess, onError])

  const connect = useCallback(async () => {
    if (!enabled || subscriptionIdRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const subscriptionId = await createOptimizedSubscription(config, handleEvent)
      subscriptionIdRef.current = subscriptionId
      setIsConnected(true)
      setIsLoading(false)
      retryCountRef.current = 0

      if (onConnect) {
        onConnect()
      }

      // Start metrics monitoring
      const metricsInterval = setInterval(() => {
        if (subscriptionIdRef.current) {
          const currentMetrics = getSubscriptionMetrics(subscriptionIdRef.current)
          if (currentMetrics.has(subscriptionIdRef.current)) {
            setMetrics(currentMetrics.get(subscriptionIdRef.current))
          }
        } else {
          clearInterval(metricsInterval)
        }
      }, 1000)

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect')
      setError(error)
      setIsLoading(false)

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        setTimeout(() => {
          connectRef.current?.()
        }, retryDelay)
      } else {
        if (onError) {
          onError(error)
        }
      }
    }
  }, [enabled, config, handleEvent, retryCount, retryDelay, onError, onConnect])

  const disconnect = useCallback(async () => {
    if (subscriptionIdRef.current) {
      await removeOptimizedSubscription(subscriptionIdRef.current)
      subscriptionIdRef.current = null
      setIsConnected(false)
      setMetrics(undefined)

      if (onDisconnect) {
        onDisconnect()
      }
    }
  }, [onDisconnect])

  const reconnect = useCallback(() => {
    disconnect().then(() => {
      setTimeout(connect, 1000)
    })
  }, [disconnect, connect])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  // Auto-connect on mount/config change (async untuk hindari setState sinkron)
  useEffect(() => {
    if (!enabled) {
      return () => {
        disconnect()
      }
    }

    const timeout = setTimeout(() => {
      connect()
    }, 0)

    return () => {
      clearTimeout(timeout)
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    data,
    isConnected,
    isLoading,
    error,
    metrics,
    lastUpdated,
    reconnect,
    disconnect
  }
}

/**
 * Hook for real-time subscription with custom data transformation
 */
export function useRealtimeSubscriptionWithTransform<T = any, R = any>(
  config: SubscriptionConfig,
  transform: (data: T[]) => R,
  options: UseRealtimeOptions = {}
): RealtimeSubscriptionResult<R> {
  const subscriptionResult = useRealtimeSubscription<T>(config, {
    ...options
  })

  const transformedData = useMemo(() => [transform(subscriptionResult.data)], [
    subscriptionResult.data,
    transform
  ])

  return {
    ...subscriptionResult,
    data: transformedData
  }
}

/**
 * Hook for real-time subscription with filtering
 */
export function useRealtimeSubscriptionWithFilter<T = any>(
  config: SubscriptionConfig,
  filterFn: (item: T) => boolean,
  options: UseRealtimeOptions = {}
): RealtimeSubscriptionResult<T> {
  const subscriptionResult = useRealtimeSubscription<T>(config, {
    ...options
  })

  const filteredData = useMemo(
    () => subscriptionResult.data.filter(filterFn),
    [subscriptionResult.data, filterFn]
  )

  return {
    ...subscriptionResult,
    data: filteredData
  }
}

/**
 * Hook for real-time subscription with pagination
 */
export function useRealtimeSubscriptionWithPagination<T = any>(
  config: SubscriptionConfig,
  initialPageSize = 20,
  options: UseRealtimeOptions = {}
) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const subscriptionResult = useRealtimeSubscription<T>(config, options)

  const paginatedData = subscriptionResult.data.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const totalPages = Math.ceil(subscriptionResult.data.length / pageSize)

  return {
    ...subscriptionResult,
    data: paginatedData,
    page,
    pageSize,
    totalPages,
    totalCount: subscriptionResult.data.length,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: () => setPage(prev => Math.min(prev + 1, totalPages)),
    previousPage: () => setPage(prev => Math.max(prev - 1, 1)),
    goToPage: (newPage: number) => setPage(Math.max(1, Math.min(newPage, totalPages))),
    setPageSize: (newSize: number) => {
      setPageSize(newSize)
      setPage(1) // Reset to first page when changing page size
    }
  }
}

/**
 * Hook for real-time subscription with caching
 */
export function useCachedRealtimeSubscription<T = any>(
  config: SubscriptionConfig,
  cacheKey: string,
  options: UseRealtimeOptions = {}
) {
  const [cachedData, setCachedData] = useState<T[]>([])
  const [isCacheHit, setIsCacheHit] = useState(false)

  const subscriptionResult = useRealtimeSubscription<T>(config, options)

  // Persist data ke cache setiap kali update (async supaya lulus lint React hooks)
  useEffect(() => {
    if (typeof window === 'undefined' || subscriptionResult.data.length === 0) {
      return
    }

    const timeout = setTimeout(() => {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: subscriptionResult.data,
        timestamp: Date.now()
      }))
    }, 0)

    return () => clearTimeout(timeout)
  }, [cacheKey, subscriptionResult.data])

  // Load from cache on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let cancelled = false
    const timeout = setTimeout(() => {
      if (cancelled) return
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const cacheAge = Date.now() - timestamp

          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setCachedData(data)
            setIsCacheHit(true)
          }
        }
      } catch (error) {
      }
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [cacheKey])

  // Use cached data while loading
  const displayData = subscriptionResult.isLoading && isCacheHit ? cachedData : subscriptionResult.data

  return {
    ...subscriptionResult,
    data: displayData,
    isCacheHit,
    clearCache: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(cacheKey)
        setCachedData([])
        setIsCacheHit(false)
      }
    }
  }
}

/**
 * Hook for real-time subscription with debounced updates
 */
export function useDebouncedRealtimeSubscription<T = any>(
  config: SubscriptionConfig,
  debounceMs = 300,
  options: UseRealtimeOptions = {}
) {
  const [debouncedData, setDebouncedData] = useState<T[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const subscriptionResult = useRealtimeSubscription<T>(config, options)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedData(subscriptionResult.data)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [subscriptionResult.data, debounceMs])

  return {
    ...subscriptionResult,
    data: debouncedData
  }
}

/**
 * Hook for subscription performance monitoring
 */
export function useSubscriptionPerformance(subscriptionId?: string) {
  const [performanceData, setPerformanceData] = useState<{
    metrics?: SubscriptionMetrics
    connectionPoolStats?: any
    recommendations?: any
  }>({})

  useEffect(() => {
    const interval = setInterval(() => {
      if (subscriptionId) {
        const metrics = getSubscriptionMetrics(subscriptionId)
        if (metrics.has(subscriptionId)) {
          setPerformanceData(prev => ({
            ...prev,
            metrics: metrics.get(subscriptionId)
          }))
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [subscriptionId])

  return performanceData
}
