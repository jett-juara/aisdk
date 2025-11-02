'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { loadBalancingManager, type LoadBalancingStats, type InstanceMetrics } from './load-balancing'

export interface UseLoadBalancingOptions {
  refreshInterval?: number
  enableHealthChecks?: boolean
  enableStats?: boolean
}

export interface LoadBalancingResult {
  stats: LoadBalancingStats | null
  instances: InstanceMetrics[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  selectInstance: (clientId?: string) => Promise<string>
  resetCircuitBreaker: (instanceId: string) => Promise<boolean>
  getHealthStatus: () => {
    healthy: number
    unhealthy: number
    total: number
    healthPercentage: number
  }
}

/**
 * Hook for load balancing management
 */
export function useLoadBalancing(options: UseLoadBalancingOptions = {}): LoadBalancingResult {
  const {
    refreshInterval = 10000, // 10 seconds
    enableHealthChecks = true,
    enableStats = true
  } = options

  const [stats, setStats] = useState<LoadBalancingStats | null>(null)
  const [instances, setInstances] = useState<InstanceMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshIntervalRef = useRef<NodeJS.Timeout>()

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)

      const newStats = loadBalancingManager.getStatistics()
      const newInstances = loadBalancingManager.getInstances()

      setStats(newStats)
      setInstances(newInstances)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch load balancing data')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectInstance = useCallback(async (clientId?: string) => {
    try {
      const instanceId = await loadBalancingManager.selectInstance(clientId)
      return instanceId
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to select instance')
      throw error
    }
  }, [])

  const resetCircuitBreaker = useCallback(async (instanceId: string) => {
    try {
      const success = loadBalancingManager.resetCircuitBreaker(instanceId)
      await refresh() // Refresh to show updated state
      return success
    } catch (err) {
      return false
    }
  }, [refresh])

  const getHealthStatus = useCallback(() => {
    const healthy = instances.filter(instance => instance.healthStatus === 'healthy').length
    const unhealthy = instances.filter(instance => instance.healthStatus === 'unhealthy').length
    const total = instances.length

    return {
      healthy,
      unhealthy,
      total,
      healthPercentage: total > 0 ? (healthy / total) * 100 : 0
    }
  }, [instances])

  // Initialize and set up refresh interval
  useEffect(() => {
    refresh()

    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refresh, refreshInterval)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [refresh, refreshInterval])

  return {
    stats,
    instances,
    isLoading,
    error,
    refresh,
    selectInstance,
    resetCircuitBreaker,
    getHealthStatus
  }
}

/**
 * Hook for instance-specific monitoring
 */
export function useInstanceMonitoring(instanceId: string) {
  const [instance, setInstance] = useState<InstanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const instances = loadBalancingManager.getInstances()
      const foundInstance = instances.find(inst => inst.instanceId === instanceId)
      setInstance(foundInstance || null)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [instanceId])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [refresh])

  const performHealthCheck = useCallback(async () => {
    if (!instance) return false

    try {
      const isHealthy = await loadBalancingManager.manualHealthCheck(instanceId)
      await refresh()
      return isHealthy
    } catch (error) {
      return false
    }
  }, [instanceId, instance, refresh])

  const isCircuitBreakerOpen = instance?.circuitBreakerState === 'open'
  const isCircuitBreakerHalfOpen = instance?.circuitBreakerState === 'half_open'
  const isHealthy = instance?.healthStatus === 'healthy'

  return {
    instance,
    isLoading,
    refresh,
    performHealthCheck,
    isCircuitBreakerOpen,
    isCircuitBreakerHalfOpen,
    isHealthy
  }
}

/**
 * Hook for session affinity tracking
 */
export function useSessionAffinity(clientId: string) {
  const [sessionInfo, setSessionInfo] = useState<{
    instanceId: string | null
    isAffinityActive: boolean
    sessionCreated: number | null
    sessionExpires: number | null
  }>({
    instanceId: null,
    isAffinityActive: false,
    sessionCreated: null,
    sessionExpires: null
  })

  const refresh = useCallback(async () => {
    try {
      const instances = loadBalancingManager.getInstances()
      const sessions = loadBalancingManager.getSessions()

      const session = sessions.find(s => s.clientId === clientId)

      if (session) {
        const instance = instances.find(inst => inst.instanceId === session.instanceId)
        setSessionInfo({
          instanceId: session.instanceId,
          isAffinityActive: true,
          sessionCreated: session.createdAt,
          sessionExpires: session.expiresAt
        })
      } else {
        setSessionInfo({
          instanceId: null,
          isAffinityActive: false,
          sessionCreated: null,
          sessionExpires: null
        })
      }
    } catch (error) {
    }
  }, [clientId])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [refresh])

  const isSessionExpired = sessionInfo.sessionExpires
    ? Date.now() > sessionInfo.sessionExpires
    : false

  return {
    ...sessionInfo,
    isSessionExpired,
    refresh
  }
}

/**
 * Hook for load balancing performance metrics
 */
export function useLoadBalancingMetrics() {
  const [metrics, setMetrics] = useState<{
    requestRate: number
    successRate: number
    averageResponseTime: number
    errorRate: number
    throughput: number
    connectionUtilization: number
  }>({
    requestRate: 0,
    successRate: 0,
    averageResponseTime: 0,
    errorRate: 0,
    throughput: 0,
    connectionUtilization: 0
  })

  const refresh = useCallback(() => {
    const stats = loadBalancingManager.getStatistics()
    const instances = loadBalancingManager.getInstances()

    if (stats && instances.length > 0) {
      const successRate = stats.totalRequests > 0
        ? (stats.successfulRequests / stats.totalRequests) * 100
        : 0

      const errorRate = stats.totalRequests > 0
        ? (stats.failedRequests / stats.totalRequests) * 100
        : 0

      const totalConnections = instances.reduce((sum, instance) => sum + instance.activeConnections, 0)
      const maxConnections = instances.length * 1000 // Assuming max 1000 per instance

      setMetrics({
        requestRate: stats.requestsPerSecond,
        successRate,
        averageResponseTime: stats.averageResponseTime,
        errorRate,
        throughput: stats.successfulRequests / 60, // per minute
        connectionUtilization: maxConnections > 0 ? (totalConnections / maxConnections) * 100 : 0
      })
    }
  }, [])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [refresh])

  return {
    ...metrics,
    refresh
  }
}

/**
 * Hook for circuit breaker monitoring
 */
export function useCircuitBreakerMonitoring() {
  const [circuitBreakers, setCircuitBreakers] = useState<Array<{
    instanceId: string
    host: string
    port: number
    state: 'closed' | 'open' | 'half_open'
    failureCount: number
    lastFailure: number | null
    timeUntilReset: number | null
  }>>([])

  const refresh = useCallback(() => {
    const instances = loadBalancingManager.getInstances()

    const breakerData = instances.map(instance => {
      const timeUntilReset = instance.circuitBreakerLastFailure > 0
        ? Math.max(0, 60000 - (Date.now() - instance.circuitBreakerLastFailure)) // 60 second timeout
        : null

      return {
        instanceId: instance.instanceId,
        host: instance.host,
        port: instance.port,
        state: instance.circuitBreakerState,
        failureCount: instance.circuitBreakerFailureCount,
        lastFailure: instance.circuitBreakerLastFailure || null,
        timeUntilReset
      }
    })

    setCircuitBreakers(breakerData)
  }, [])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [refresh])

  const openBreakers = circuitBreakers.filter(cb => cb.state === 'open')
  const halfOpenBreakers = circuitBreakers.filter(cb => cb.state === 'half_open')
  const closedBreakers = circuitBreakers.filter(cb => cb.state === 'closed')

  return {
    circuitBreakers,
    openBreakers,
    halfOpenBreakers,
    closedBreakers,
    totalBreakers: circuitBreakers.length,
    refresh
  }
}

/**
 * Hook for request routing simulation
 */
export function useRequestRouter(enableSimulation = false) {
  const [routingStats, setRoutingStats] = useState<{
    totalRequests: number
    successfulRoutes: number
    failedRoutes: number
    averageRoutingTime: number
    instanceDistribution: Record<string, number>
  }>({
    totalRequests: 0,
    successfulRoutes: 0,
    failedRoutes: 0,
    averageRoutingTime: 0,
    instanceDistribution: {}
  })

  const routeRequest = useCallback(async (clientId?: string) => {
    const startTime = Date.now()

    try {
      const instanceId = await loadBalancingManager.selectInstance(clientId)
      const routingTime = Date.now() - startTime

      setRoutingStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        successfulRoutes: prev.successfulRoutes + 1,
        failedRoutes: prev.failedRoutes,
        averageRoutingTime: (prev.averageRoutingTime + routingTime) / 2,
        instanceDistribution: {
          ...prev.instanceDistribution,
          [instanceId]: (prev.instanceDistribution[instanceId] || 0) + 1
        }
      }))

      return { instanceId, routingTime }
    } catch (error) {
      const routingTime = Date.now() - startTime

      setRoutingStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        successfulRoutes: prev.successfulRoutes,
        failedRoutes: prev.failedRoutes + 1,
        averageRoutingTime: (prev.averageRoutingTime + routingTime) / 2,
        instanceDistribution: prev.instanceDistribution
      }))

      throw error
    }
  }, [])

  // Auto-simulation
  useEffect(() => {
    if (!enableSimulation) return

    const simulateRequests = async () => {
      try {
        await routeRequest(`client-${Math.random()}`)
      } catch (error) {
        // Handle routing errors silently in simulation
      }
    }

    const interval = setInterval(simulateRequests, 2000) // Simulate every 2 seconds
    return () => clearInterval(interval)
  }, [enableSimulation, routeRequest])

  const resetStats = useCallback(() => {
    setRoutingStats({
      totalRequests: 0,
      successfulRoutes: 0,
      failedRoutes: 0,
      averageRoutingTime: 0,
      instanceDistribution: {}
    })
  }, [])

  return {
    ...routingStats,
    routeRequest,
    resetStats
  }
}