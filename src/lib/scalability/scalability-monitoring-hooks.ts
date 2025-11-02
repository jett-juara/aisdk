'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { scalabilityMonitoringManager, type ScalabilityDashboard, type ScalabilityAlert } from './scalability-monitoring'

export interface UseScalabilityMonitoringOptions {
  refreshInterval?: number
  autoResolveAlerts?: boolean
  enableNotifications?: boolean
}

export interface ScalabilityMonitoringResult {
  dashboard: ScalabilityDashboard | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  resolveAlert: (alertId: string) => boolean
  alerts: {
    active: ScalabilityAlert[]
    critical: ScalabilityAlert[]
    errors: ScalabilityAlert[]
    warnings: ScalabilityAlert[]
    total: number
  }
  systemHealth: {
    status: string
    color: string
    description: string
  }
}

/**
 * Hook for comprehensive scalability monitoring
 */
export function useScalabilityMonitoring(
  options: UseScalabilityMonitoringOptions = {}
): ScalabilityMonitoringResult {
  const {
    refreshInterval = 30000, // 30 seconds
    autoResolveAlerts = false,
    enableNotifications = true
  } = options

  const [dashboard, setDashboard] = useState<ScalabilityDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastAlertNotification, setLastAlertNotification] = useState<number>(0)

  const refreshIntervalRef = useRef<NodeJS.Timeout>()

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const newDashboard = await scalabilityMonitoringManager.generateDashboard()
      setDashboard(newDashboard)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch scalability dashboard')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resolveAlert = useCallback((alertId: string) => {
    return scalabilityMonitoringManager.resolveAlert(alertId)
  }, [])

  // Show notifications for new critical alerts
  useEffect(() => {
    if (!enableNotifications || !dashboard) return

    const criticalAlerts = dashboard.alerts.filter(alert => alert.severity === 'critical')
    const newCriticalAlerts = criticalAlerts.filter(alert =>
      alert.timestamp > lastAlertNotification
    )

    if (newCriticalAlerts.length > 0) {
      setLastAlertNotification(Date.now())
      // In a real implementation, integrate with notification system
    }
  }, [dashboard, lastAlertNotification, enableNotifications])

  // Calculate system health status
  const systemHealth = dashboard ? {
    status: dashboard.overview.systemHealth,
    color: getHealthColor(dashboard.overview.systemHealth),
    description: getHealthDescription(dashboard.overview.systemHealth)
  } : {
    status: 'unknown',
    color: 'gray',
    description: 'Loading...'
  }

  // Organize alerts
  const alerts = dashboard ? {
    active: dashboard.alerts,
    critical: dashboard.alerts.filter(a => a.severity === 'critical'),
    errors: dashboard.alerts.filter(a => a.severity === 'error'),
    warnings: dashboard.alerts.filter(a => a.severity === 'warning'),
    total: dashboard.alerts.length
  } : {
    active: [],
    critical: [],
    errors: [],
    warnings: [],
    total: 0
  }

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
    dashboard,
    isLoading,
    error,
    refresh,
    resolveAlert,
    alerts,
    systemHealth
  }
}

/**
 * Hook for scalability metrics visualization
 */
export function useScalabilityMetrics(timeRangeHours = 24) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const metricsHistory = scalabilityMonitoringManager.getMetricsHistory(timeRangeHours)
      setMetrics(metricsHistory)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [timeRangeHours])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [refresh])

  const chartData = {
    cpu: metrics.map(m => ({ time: new Date(m.timestamp), value: m.system.cpuUtilization })),
    memory: metrics.map(m => ({ time: new Date(m.timestamp), value: m.system.memoryUtilization })),
    requests: metrics.map(m => ({ time: new Date(m.timestamp), value: m.performance.requestsPerSecond })),
    errors: metrics.map(m => ({ time: new Date(m.timestamp), value: m.performance.errorRate })),
    responseTime: metrics.map(m => ({ time: new Date(m.timestamp), value: m.performance.averageResponseTime }))
  }

  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null

  return {
    metrics,
    chartData,
    currentMetrics,
    isLoading,
    refresh
  }
}

/**
 * Hook for scalability alerts management
 */
export function useScalabilityAlerts() {
  const [alerts, setAlerts] = useState<ScalabilityAlert[]>([])
  const [autoResolveEnabled, setAutoResolveEnabled] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const activeAlerts = scalabilityMonitoringManager.getActiveAlerts()
      setAlerts(activeAlerts)
    } catch (error) {
    }
  }, [])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [refresh])

  const resolveAlert = useCallback((alertId: string) => {
    const success = scalabilityMonitoringManager.resolveAlert(alertId)
    if (success) {
      refresh() // Refresh to show updated alerts
    }
    return success
  }, [refresh])

  const resolveAllAlerts = useCallback(() => {
    let resolvedCount = 0
    for (const alert of alerts) {
      if (resolveAlert(alert.id)) {
        resolvedCount++
      }
    }
    return resolvedCount
  }, [alerts, resolveAlert])

  // Auto-resolve certain types of alerts
  useEffect(() => {
    if (!autoResolveEnabled) return

    const autoResolvableAlerts = alerts.filter(alert =>
      alert.type === 'performance' && alert.severity === 'warning'
    )

    for (const alert of autoResolvableAlerts) {
      setTimeout(() => {
        resolveAlert(alert.id)
      }, 60000) // Auto-resolve after 1 minute
    }
  }, [alerts, autoResolveEnabled, resolveAlert])

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    errors: alerts.filter(a => a.severity === 'error').length,
    warnings: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  }

  return {
    alerts,
    alertStats,
    resolveAlert,
    resolveAllAlerts,
    refresh,
    autoResolveEnabled,
    setAutoResolveEnabled
  }
}

/**
 * Hook for system resource monitoring
 */
export function useSystemResources() {
  const [resources, setResources] = useState<{
    cpu: { current: number; average: number; peak: number }
    memory: { current: number; average: number; peak: number }
    disk: { current: number; average: number; peak: number }
    network: { current: number; average: number; peak: number }
  }>({
    cpu: { current: 0, average: 0, peak: 0 },
    memory: { current: 0, average: 0, peak: 0 },
    disk: { current: 0, average: 0, peak: 0 },
    network: { current: 0, average: 0, peak: 0 }
  })

  const updateResources = useCallback((metrics: any) => {
    if (!metrics) return

    setResources(prev => ({
      cpu: {
        current: metrics.system?.cpuUtilization || 0,
        average: (prev.cpu.average + (metrics.system?.cpuUtilization || 0)) / 2,
        peak: Math.max(prev.cpu.peak, metrics.system?.cpuUtilization || 0)
      },
      memory: {
        current: metrics.system?.memoryUtilization || 0,
        average: (prev.memory.average + (metrics.system?.memoryUtilization || 0)) / 2,
        peak: Math.max(prev.memory.peak, metrics.system?.memoryUtilization || 0)
      },
      disk: {
        current: metrics.system?.diskUsage || 0,
        average: (prev.disk.average + (metrics.system?.diskUsage || 0)) / 2,
        peak: Math.max(prev.disk.peak, metrics.system?.diskUsage || 0)
      },
      network: {
        current: metrics.system?.networkIO || 0,
        average: (prev.network.average + (metrics.system?.networkIO || 0)) / 2,
        peak: Math.max(prev.network.peak, metrics.system?.networkIO || 0)
      }
    }))
  }, [])

  const getResourceStatus = useCallback((resource: keyof typeof resources) => {
    const resourceData = resources[resource]
    if (resourceData.current > 90) return { status: 'critical', color: 'red' }
    if (resourceData.current > 80) return { status: 'warning', color: 'yellow' }
    if (resourceData.current > 60) return { status: 'caution', color: 'orange' }
    return { status: 'healthy', color: 'green' }
  }, [resources])

  return {
    resources,
    updateResources,
    getResourceStatus
  }
}

/**
 * Hook for scalability recommendations
 */
export function useScalabilityRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const dashboard = await scalabilityMonitoringManager.generateDashboard()
      setRecommendations(dashboard.recommendations || [])
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [refresh])

  const prioritizedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder: any = { critical: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  const recommendationsByType = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = []
    acc[rec.type].push(rec)
    return acc
  }, {} as Record<string, any[]>)

  return {
    recommendations: prioritizedRecommendations,
    recommendationsByType,
    isLoading,
    refresh
  }
}

/**
 * Hook for capacity planning
 */
export function useCapacityPlanning() {
  const [capacity, setCapacity] = useState<{
    currentCapacity: number
    maxCapacity: number
    utilizationRate: number
    projectedGrowth: number
    timeToThreshold: number // days
    recommendations: string[]
  }>({
    currentCapacity: 0,
    maxCapacity: 0,
    utilizationRate: 0,
    projectedGrowth: 0,
    timeToThreshold: 0,
    recommendations: []
  })

  const calculateCapacity = useCallback((metrics: any) => {
    if (!metrics) return

    const totalConnections = metrics.system?.activeConnections || 0
    const maxConnections = metrics.system?.totalInstances * 1000 // Assuming 1000 per instance
    const maxCapacity = maxConnections
    const utilizationRate = maxConnections > 0 ? (totalConnections / maxConnections) * 100 : 0

    // Simple projection based on current growth rate
    const growthRate = 0.1 // 10% daily growth
    const projectedGrowth = utilizationRate * growthRate

    // Calculate days until 80% threshold
    const threshold = 80
    const timeToThreshold = utilizationRate < threshold
      ? Math.ceil((threshold - utilizationRate) / projectedGrowth)
      : 0

    const recommendations = []
    if (utilizationRate > 80) {
      recommendations.push('Immediate scaling required - utilization over 80%')
    } else if (utilizationRate > 60) {
      recommendations.push('Monitor closely - utilization over 60%')
    }
    if (timeToThreshold < 7 && timeToThreshold > 0) {
      recommendations.push(`Plan scaling within ${timeToThreshold} days`)
    }

    setCapacity({
      currentCapacity: totalConnections,
      maxCapacity,
      utilizationRate,
      projectedGrowth,
      timeToThreshold,
      recommendations
    })
  }, [])

  return {
    capacity,
    calculateCapacity
  }
}

/**
 * Hook for real-time monitoring
 */
export function useRealTimeMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const monitoringMetrics = useScalabilityMonitoring({
    refreshInterval: isMonitoring ? 10000 : 0 // 10 seconds if monitoring
  })

  useEffect(() => {
    setLastUpdate(Date.now())
  }, [monitoringMetrics.dashboard])

  const timeSinceLastUpdate = Date.now() - lastUpdate
  const isStale = timeSinceLastUpdate > 60000 // Consider stale after 1 minute

  return {
    isMonitoring,
    setIsMonitoring,
    lastUpdate,
    timeSinceLastUpdate,
    isStale,
    ...monitoringMetrics
  }
}

// Utility functions
function getHealthColor(status: string): string {
  switch (status) {
    case 'excellent': return 'green'
    case 'good': return 'blue'
    case 'fair': return 'yellow'
    case 'poor': return 'orange'
    case 'critical': return 'red'
    default: return 'gray'
  }
}

function getHealthDescription(status: string): string {
  switch (status) {
    case 'excellent': return 'All systems operating optimally'
    case 'good': return 'Minor issues detected, but overall healthy'
    case 'fair': return 'Some performance issues need attention'
    case 'poor': return 'Significant issues require immediate action'
    case 'critical': return 'Critical issues require immediate intervention'
    default: return 'System status unknown'
  }
}