'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { performanceMonitor, type PerformanceDashboard, type PerformanceAlert } from './monitoring'

export interface PerformanceMonitoringOptions {
  enabled?: boolean
  refreshInterval?: number
  autoResolveThresholds?: boolean
  showAlertNotifications?: boolean
}

export interface MetricTracker {
  startTiming: (name: string, tags?: Record<string, string>) => string
  endTiming: (timingId: string) => void
  recordMetric: (name: string, value: number, unit: string, category?: 'database' | 'cache' | 'subscription' | 'api' | 'system' | 'user') => void
  recordError: (error: Error, context?: Record<string, any>) => void
  incrementCounter: (name: string, tags?: Record<string, string>) => void
}

/**
 * Hook for performance monitoring dashboard
 */
export function usePerformanceMonitoring(
  options: PerformanceMonitoringOptions = {}
) {
  const {
    enabled = true,
    refreshInterval = 30000, // 30 seconds
    autoResolveThresholds = false,
    showAlertNotifications = true
  } = options

  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const refreshDashboard = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      const newDashboard = await performanceMonitor.getDashboard()
      setDashboard(newDashboard)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch performance dashboard')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  // Initialize and set up refresh interval
  useEffect(() => {
    if (!enabled) return

    refreshDashboard()

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(refreshDashboard, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, refreshInterval, refreshDashboard])

  // Show notifications for new alerts
  useEffect(() => {
    if (!showAlertNotifications || !dashboard) return

    const newAlerts = dashboard.topAlerts.filter(alert => {
      const alertAge = Date.now() - alert.timestamp
      return alertAge < 60000 // Only show alerts from last minute
    })

    for (const alert of newAlerts) {
      // In a real implementation, integrate with notification system
      if (alert.severity === 'critical' || alert.severity === 'error') {
      } else if (alert.severity === 'warning') {
      }
    }
  }, [dashboard, showAlertNotifications])

  const resolveAlert = useCallback((alertId: string) => {
    performanceMonitor.resolveAlert(alertId)
    refreshDashboard() // Refresh to show updated state
  }, [refreshDashboard])

  const systemHealthColor = useMemo(() => {
    if (!dashboard) return 'gray'

    switch (dashboard.overview.systemHealth) {
      case 'excellent': return 'green'
      case 'good': return 'blue'
      case 'fair': return 'yellow'
      case 'poor': return 'orange'
      case 'critical': return 'red'
      default: return 'gray'
    }
  }, [dashboard])

  return {
    dashboard,
    isLoading,
    error,
    refreshDashboard,
    resolveAlert,
    systemHealthColor,
    metrics: {
      total: dashboard?.overview.totalMetrics || 0,
      activeAlerts: dashboard?.overview.activeAlerts || 0,
      systemHealth: dashboard?.overview.systemHealth || 'unknown',
      lastUpdated: dashboard?.overview.lastUpdated || 0
    }
  }
}

/**
 * Hook for component-level performance tracking
 */
export function usePerformanceTracker(
  componentName: string,
  options: {
    trackRerenders?: boolean
    trackMountTime?: boolean
    trackInteractions?: boolean
  } = {}
): MetricTracker {
  const {
    trackRerenders = true,
    trackMountTime = true,
    trackInteractions = true
  } = options

  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)
  const timings = useRef<Map<string, number>>(new Map())
  const counters = useRef<Map<string, number>>(new Map())

  // Track mount time
  useEffect(() => {
    if (trackMountTime) {
      mountTime.current = performance.now()
      performanceMonitor.recordMetric({
        name: 'component_mount_time',
        value: 0, // Will be updated on unmount
        unit: 'ms',
        category: 'user',
        tags: {
          component: componentName
        }
      })
    }

    return () => {
      if (trackMountTime && mountTime.current > 0) {
        const mountDuration = performance.now() - mountTime.current
        performanceMonitor.recordMetric({
          name: 'component_mount_time',
          value: mountDuration,
          unit: 'ms',
          category: 'user',
          tags: {
            component: componentName
          }
        })
      }
    }
  }, [componentName, trackMountTime])

  // Track re-renders
  useEffect(() => {
    if (trackRerenders) {
      renderCount.current++
      performanceMonitor.recordMetric({
        name: 'component_rerender',
        value: renderCount.current,
        unit: 'count',
        category: 'user',
        tags: {
          component: componentName
        }
      })
    }
  })

  const startTiming = useCallback((name: string, tags?: Record<string, string>): string => {
    const timingId = `${componentName}_${name}_${Date.now()}_${Math.random()}`
    timings.current.set(timingId, performance.now())

    performanceMonitor.recordMetric({
      name: `${name}_started`,
      value: 1,
      unit: 'count',
      category: 'user',
      tags: {
        component: componentName,
        ...tags
      }
    })

    return timingId
  }, [componentName])

  const endTiming = useCallback((timingId: string): void => {
    const startTime = timings.current.get(timingId)
    if (startTime) {
      const duration = performance.now() - startTime
      timings.current.delete(timingId)

      const operationName = timingId.split('_').slice(1, -2).join('_')

      performanceMonitor.recordMetric({
        name: `${operationName}_duration`,
        value: duration,
        unit: 'ms',
        category: 'user',
        tags: {
          component: componentName
        }
      })
    }
  }, [componentName])

  const recordMetric = useCallback((
    name: string,
    value: number,
    unit: string,
    category: 'database' | 'cache' | 'subscription' | 'api' | 'system' | 'user' = 'user'
  ) => {
    performanceMonitor.recordMetric({
      name,
      value,
      unit,
      category,
      tags: {
        component: componentName
      }
    })
  }, [componentName])

  const recordError = useCallback((error: Error, context?: Record<string, any>) => {
    performanceMonitor.recordMetric({
      name: 'component_error',
      value: 1,
      unit: 'count',
      category: 'user',
      tags: {
        component: componentName,
        error_type: error.constructor.name
      },
      metadata: {
        error_message: error.message,
        stack: error.stack,
        context
      }
    })
  }, [componentName])

  const incrementCounter = useCallback((name: string, tags?: Record<string, string>) => {
    const counterKey = `${componentName}_${name}`
    const currentCount = counters.current.get(counterKey) || 0
    counters.current.set(counterKey, currentCount + 1)

    performanceMonitor.recordMetric({
      name,
      value: currentCount + 1,
      unit: 'count',
      category: 'user',
      tags: {
        component: componentName,
        ...tags
      }
    })
  }, [componentName])

  return {
    startTiming,
    endTiming,
    recordMetric,
    recordError,
    incrementCounter
  }
}

/**
 * Hook for API performance tracking
 */
export function useAPIPerformanceTracker() {
  const trackAPICall = useCallback(
    async <T,>(apiCall: () => Promise<T>, endpoint: string, method: string = 'GET', userId?: string): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await apiCall()
        const duration = performance.now() - startTime

        performanceMonitor.recordAPIPerformance(endpoint, duration, 200, userId)
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        const statusCode = error instanceof Response ? error.status : 500

        performanceMonitor.recordAPIPerformance(endpoint, duration, statusCode, userId)
        throw error
      }
    }, [])

  return { trackAPICall }
}

/**
 * Hook for database query performance tracking
 */
export function useDatabasePerformanceTracker() {
  const trackQuery = useCallback(
    async <T,>(query: string, executeQuery: () => Promise<T>, userId?: string): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await executeQuery()
        const duration = performance.now() - startTime

        performanceMonitor.recordDatabaseQuery(query, duration, 0, userId) // rowsAffected would need to be determined
        return result
      } catch (error) {
        const duration = performance.now() - startTime

        performanceMonitor.recordDatabaseQuery(query, duration, 0, userId)
        performanceMonitor.recordMetric({
          name: 'database_query_error',
          value: 1,
          unit: 'count',
          category: 'database',
          tags: {
            query_hash: btoa(query.substring(0, 100)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
          },
          metadata: {
            error_message: error instanceof Error ? error.message : 'Unknown error'
          }
        })

        throw error
      }
    }, [])

  return { trackQuery }
}

/**
 * Hook for user interaction tracking
 */
export function useUserInteractionTracker(componentName: string) {
  const trackInteraction = useCallback((
    interactionType: string,
    element: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    performanceMonitor.recordMetric({
      name: 'user_interaction',
      value: value || 1,
      unit: value ? 'ms' : 'count',
      category: 'user',
      tags: {
        component: componentName,
        interaction_type: interactionType,
        element
      },
      metadata
    })
  }, [componentName])

  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    trackInteraction('click', element, 1, metadata)
  }, [trackInteraction])

  const trackFormSubmit = useCallback((formName: string, duration?: number) => {
    trackInteraction('form_submit', formName, duration, { timestamp: Date.now() })
  }, [trackInteraction])

  const trackPageView = useCallback((pageName: string, loadTime?: number) => {
    trackInteraction('page_view', pageName, loadTime, { timestamp: Date.now() })
  }, [trackInteraction])

  return {
    trackInteraction,
    trackClick,
    trackFormSubmit,
    trackPageView
  }
}

/**
 * Hook for performance alerts
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const isSubscribedRef = useRef(false)

  useEffect(() => {
    if (isSubscribedRef.current) return

    // In a real implementation, this would subscribe to real-time alert updates
    const checkForNewAlerts = async () => {
      try {
        const dashboard = await performanceMonitor.getDashboard()
        setAlerts(dashboard.topAlerts)
      } catch (error) {
      }
    }

    const interval = setInterval(checkForNewAlerts, 10000) // Check every 10 seconds
    isSubscribedRef.current = true

    return () => {
      clearInterval(interval)
      isSubscribedRef.current = false
    }
  }, [])

  const criticalAlerts = useMemo(() =>
    alerts.filter(alert => alert.severity === 'critical'), [alerts]
  )

  const errorAlerts = useMemo(() =>
    alerts.filter(alert => alert.severity === 'error'), [alerts]
  )

  const warningAlerts = useMemo(() =>
    alerts.filter(alert => alert.severity === 'warning'), [alerts]
  )

  const resolveAlert = useCallback((alertId: string) => {
    performanceMonitor.resolveAlert(alertId)
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  const resolveAllAlerts = useCallback(() => {
    for (const alert of alerts) {
      performanceMonitor.resolveAlert(alert.id)
    }
    setAlerts([])
  }, [alerts])

  return {
    alerts,
    criticalAlerts,
    errorAlerts,
    warningAlerts,
    totalAlerts: alerts.length,
    resolveAlert,
    resolveAllAlerts
  }
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options: {
    trackProps?: boolean
    trackState?: boolean
  } = {}
) {
  return function PerformanceTrackedComponent(props: P) {
    const tracker = usePerformanceTracker(componentName, {
      trackRerenders: true,
      trackMountTime: true,
      trackInteractions: options.trackProps || false
    })

    // Track prop changes if enabled
    useEffect(() => {
      if (options.trackProps) {
        tracker.recordMetric('props_changed', 1, 'count', 'user')
      }
    }, [props, tracker])

    return <WrappedComponent {...props} />
  }
}
