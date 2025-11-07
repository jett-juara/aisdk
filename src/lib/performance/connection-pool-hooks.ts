'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { acquireConnection, releaseConnection, getConnectionStatistics, type SupabaseClient } from './connection-pool'

export interface UseConnectionOptions {
  poolName?: string
  userId?: string
  priority?: number
  autoRelease?: boolean
  timeout?: number
  retryCount?: number
  retryDelay?: number
}

export interface ConnectionResult {
  client: SupabaseClient | null
  isLoading: boolean
  error: Error | null
  isConnected: boolean
  acquire: () => Promise<void>
  release: () => void
  retry: () => Promise<void>
}

export interface PoolMonitoringResult {
  statistics: any
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  connectionHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
}

/**
 * Hook for acquiring and managing database connections
 */
export function useConnection(options: UseConnectionOptions = {}): ConnectionResult {
  const {
    poolName = 'admin',
    userId,
    priority = 0,
    autoRelease = true,
    timeout = 5000,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentRetryCount, setCurrentRetryCount] = useState(0)

  const clientRef = useRef<SupabaseClient | null>(null)
  const isMounted = useRef(true)
  const acquireRef = useRef<(() => Promise<void>) | null>(null)

  const release = useCallback(() => {
    if (clientRef.current && autoRelease) {
      releaseConnection(poolName, clientRef.current)
      clientRef.current = null
      setClient(null)
      setIsConnected(false)
    }
  }, [poolName, autoRelease])

  const acquire = useCallback(async () => {
    if (!isMounted.current) return

    setIsLoading(true)
    setError(null)

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection acquire timeout')), timeout)
      })

      const connectionPromise = acquireConnection(poolName, userId, priority)

      const acquiredClient = await Promise.race([connectionPromise, timeoutPromise])

      if (isMounted.current) {
        setClient(acquiredClient)
        clientRef.current = acquiredClient
        setIsConnected(true)
        setIsLoading(false)
        setCurrentRetryCount(0)
      }
    } catch (err) {
      if (!isMounted.current) return

      const error = err instanceof Error ? err : new Error('Failed to acquire connection')
      setError(error)
      setIsLoading(false)
      setIsConnected(false)

      // Auto-retry logic
      if (currentRetryCount < retryCount) {
        setCurrentRetryCount(prev => prev + 1)
        setTimeout(() => {
          if (acquireRef.current) {
            acquireRef.current()
          }
        }, retryDelay * (currentRetryCount + 1)) // Exponential backoff
      }
    }
  }, [poolName, userId, priority, timeout, retryCount, retryDelay, currentRetryCount])

  // Store acquire function in ref for self-reference
  useEffect(() => {
    acquireRef.current = acquire
  }, [acquire])

  const retry = useCallback(async () => {
    setCurrentRetryCount(0)
    await acquire()
  }, [acquire])

  // Auto-acquire on mount (schedule async biar nggak trigger lint React)
  useEffect(() => {
    const timeout = setTimeout(() => {
      acquire()
    }, 0)
    return () => clearTimeout(timeout)
  }, [acquire])

  // Auto-release on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
      release()
    }
  }, [release])

  return {
    client,
    isLoading,
    error,
    isConnected,
    acquire,
    release,
    retry
  }
}

/**
 * Hook for connection with automatic query execution
 */
export function useConnectionWithQuery<T = any>(
  queryFn: (client: SupabaseClient) => Promise<T>,
  options: UseConnectionOptions & {
    deps?: React.DependencyList
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    deps = [],
    enabled = true,
    onSuccess,
    onError,
    ...connectionOptions
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connection = useConnection(connectionOptions)

  const executeQuery = useCallback(async () => {
    if (!connection.client || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn(connection.client)
      setData(result)
      setIsLoading(false)

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query execution failed')
      setError(error)
      setIsLoading(false)

      if (onError) {
        onError(error)
      }
    }
  }, [connection.client, queryFn, enabled, onSuccess, onError])

  // Execute query when dependencies change
  useEffect(() => {
    if (connection.isConnected && enabled) {
      setTimeout(() => {
        executeQuery()
      }, 0)
    }
  }, [connection.isConnected, executeQuery, ...deps])

  return {
    data,
    isLoading,
    error,
    executeQuery,
    refetch: executeQuery,
    connection
  }
}

/**
 * Hook for connection pool monitoring
 */
export function useConnectionPoolMonitoring(
  poolName?: string,
  refreshInterval = 5000
): PoolMonitoringResult {
  const [statistics, setStatistics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const stats = getConnectionStatistics(poolName)
      setStatistics(stats)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch pool statistics')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [poolName])

  useEffect(() => {
    let cancelled = false

    const immediate = setTimeout(() => {
      if (!cancelled) {
        refresh()
      }
    }, 0)

    let interval: ReturnType<typeof setInterval> | null = null
    if (refreshInterval > 0) {
      interval = setInterval(() => {
        refresh()
      }, refreshInterval)
    }

    return () => {
      cancelled = true
      clearTimeout(immediate)
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [refresh, refreshInterval])

  const connectionHealth = useCallback(() => {
    if (!statistics) return 'critical'

    let totalConnections = 0
    let activeConnections = 0
    let waitingRequests = 0

    for (const stats of statistics.values()) {
      totalConnections += stats.totalConnections
      activeConnections += stats.activeConnections
      waitingRequests += stats.waitingRequests
    }

    const utilizationRate = totalConnections > 0 ? activeConnections / totalConnections : 0
    const waitingRate = totalConnections > 0 ? waitingRequests / totalConnections : 0

    if (waitingRate > 0.1) return 'critical'
    if (utilizationRate > 0.9) return 'poor'
    if (utilizationRate > 0.7) return 'fair'
    if (utilizationRate > 0.3) return 'good'
    return 'excellent'
  }, [statistics])

  return {
    statistics,
    isLoading,
    error,
    refresh,
    connectionHealth: connectionHealth()
  }
}

/**
 * Hook for connection pool health alerts
 */
export function useConnectionPoolAlerts(
  poolName?: string,
  options: {
    highUtilizationThreshold?: number
    highWaitingThreshold?: number
    checkInterval?: number
  } = {}
) {
  const {
    highUtilizationThreshold = 0.8,
    highWaitingThreshold = 5,
    checkInterval = 10000
  } = options

  const [alerts, setAlerts] = useState<Array<{
    type: 'high_utilization' | 'high_waiting' | 'connection_error'
    message: string
    severity: 'warning' | 'error' | 'critical'
    timestamp: number
  }>>([])

  const monitoring = useConnectionPoolMonitoring(poolName, checkInterval)

  useEffect(() => {
    if (!monitoring.statistics) return

    const newAlerts: Array<{
      type: 'high_utilization' | 'high_waiting' | 'connection_error'
      message: string
      severity: 'warning' | 'error' | 'critical'
      timestamp: number
    }> = []

    for (const [name, stats] of monitoring.statistics) {
      const utilizationRate = stats.totalConnections > 0 ? stats.activeConnections / stats.totalConnections : 0

      // High utilization alert
      if (utilizationRate > highUtilizationThreshold) {
        newAlerts.push({
          type: 'high_utilization',
          message: `Pool ${name}: High connection utilization (${Math.round(utilizationRate * 100)}%)`,
          severity: utilizationRate > 0.95 ? 'critical' : 'error',
          timestamp: Date.now()
        })
      }

      // High waiting requests alert
      if (stats.waitingRequests > highWaitingThreshold) {
        newAlerts.push({
          type: 'high_waiting',
          message: `Pool ${name}: ${stats.waitingRequests} requests waiting for connections`,
          severity: stats.waitingRequests > highWaitingThreshold * 2 ? 'critical' : 'error',
          timestamp: Date.now()
        })
      }

      // Connection errors alert
      if (stats.connectionErrors > 0) {
        newAlerts.push({
          type: 'connection_error',
          message: `Pool ${name}: ${stats.connectionErrors} connection errors detected`,
          severity: 'error',
          timestamp: Date.now()
        })
      }
    }

    setTimeout(() => {
      setAlerts(newAlerts)
    }, 0)
  }, [monitoring.statistics, highUtilizationThreshold, highWaitingThreshold])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const clearAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    errorAlerts: alerts.filter(a => a.severity === 'error'),
    warningAlerts: alerts.filter(a => a.severity === 'warning'),
    clearAlerts,
    clearAlert
  }
}

/**
 * Hook for batch connection operations
 */
export function useBatchConnections<T = any>(
  operations: Array<{
    queryFn: (client: SupabaseClient) => Promise<T>
    poolName?: string
    priority?: number
  }>,
  options: {
    maxConcurrency?: number
    timeout?: number
    onSuccess?: (results: T[]) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    maxConcurrency = 5,
    timeout = 10000,
    onSuccess,
    onError
  } = options

  const [results, setResults] = useState<(T | null)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  const executeBatch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setCompletedCount(0)

    const batchResults: (T | null)[] = new Array(operations.length).fill(null)

    try {
      // Process operations in batches
      for (let i = 0; i < operations.length; i += maxConcurrency) {
        const batch = operations.slice(i, i + maxConcurrency)

        const batchPromises = batch.map(async (operation, batchIndex) => {
          const globalIndex = i + batchIndex

          try {
            const client = await acquireConnection(
              operation.poolName || 'admin',
              undefined,
              operation.priority || 0
            )

            try {
              const result = await operation.queryFn(client)
              batchResults[globalIndex] = result
              return result
            } finally {
              releaseConnection(operation.poolName || 'admin', client)
            }
          } catch (err) {
            batchResults[globalIndex] = null
            throw err
          }
        })

        await Promise.allSettled(batchPromises)
        setCompletedCount(Math.min(i + maxConcurrency, operations.length))
      }

      setResults(batchResults)
      setIsLoading(false)

      if (onSuccess) {
        onSuccess(batchResults.filter(r => r !== null) as T[])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch operation failed')
      setError(error)
      setIsLoading(false)

      if (onError) {
        onError(error)
      }
    }
  }, [operations, maxConcurrency, onSuccess, onError])

  return {
    results,
    isLoading,
    error,
    completedCount,
    totalCount: operations.length,
    progress: operations.length > 0 ? completedCount / operations.length : 0,
    executeBatch,
    reset: () => {
      setResults([])
      setCompletedCount(0)
      setError(null)
    }
  }
}

/**
 * Hook for connection lifecycle management
 */
export function useConnectionLifecycle(
  poolName: string = 'admin',
  options: {
    autoConnect?: boolean
    keepAlive?: boolean
    maxIdleTime?: number
    healthCheck?: boolean
  } = {}
) {
  const {
    autoConnect = true,
    keepAlive = false,
    maxIdleTime = 30000,
    healthCheck = true
  } = options

  const connection = useConnection({ poolName, autoRelease: false })
  const [isHealthy, setIsHealthy] = useState(true)
  const [lastActivity, setLastActivity] = useState(() => Date.now())
  const idleTimerRef = useRef<NodeJS.Timeout>()

  const checkHealth = useCallback(async () => {
    if (!connection.client || !healthCheck) return

    try {
      // Simple health check
      await connection.client.from('users').select('count').limit(1)
      setIsHealthy(true)
    } catch (error) {
      setIsHealthy(false)
    }
  }, [connection.client, healthCheck])

  const keepAlivePing = useCallback(async () => {
    if (!connection.client || !keepAlive) return

    try {
      await connection.client.rpc('ping') // Would need to create this function
      setLastActivity(Date.now())
    } catch (error) {
    }
  }, [connection.client, keepAlive])

  // Auto-connect
  useEffect(() => {
    if (autoConnect && !connection.isConnected) {
      connection.acquire()
    }
  }, [autoConnect, connection.isConnected, connection.acquire])

  // Health checking
  useEffect(() => {
    if (!healthCheck || !connection.isConnected) return

    const interval = setInterval(checkHealth, 15000) // Check every 15 seconds
    return () => clearInterval(interval)
  }, [healthCheck, connection.isConnected, checkHealth])

  // Keep-alive pings
  useEffect(() => {
    if (!keepAlive || !connection.isConnected) return

    const interval = setInterval(keepAlivePing, 30000) // Ping every 30 seconds
    return () => clearInterval(interval)
  }, [keepAlive, connection.isConnected, keepAlivePing])

  // Idle timeout management
  useEffect(() => {
    if (maxIdleTime <= 0) return

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }

      idleTimerRef.current = setTimeout(() => {
        if (connection.isConnected) {
          connection.release()
        }
      }, maxIdleTime)
    }

    resetIdleTimer()

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [maxIdleTime, connection.isConnected, connection.release])

  const refresh = useCallback(async () => {
    if (connection.isConnected) {
      connection.release()
    }
    await connection.acquire()
    await checkHealth()
  }, [connection, checkHealth])

  return {
    connection,
    isHealthy,
    lastActivity,
    refresh,
    checkHealth,
    keepAlivePing
  }
}
