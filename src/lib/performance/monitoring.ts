import { performance } from 'perf_hooks'
import { advancedCacheManager } from './advanced-cache'
import { subscriptionOptimizer } from './subscription-optimizer'
import { lazyLoadingManager } from './lazy-loading'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: number
  category: 'database' | 'cache' | 'subscription' | 'api' | 'system' | 'user'
  tags?: Record<string, string>
  metadata?: Record<string, any>
}

export interface PerformanceAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'trend' | 'error'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  metrics: PerformanceMetric[]
  threshold?: number
  actualValue: number
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  actions?: Array<{
    type: 'auto_fix' | 'notification' | 'escalation'
    description: string
    executed: boolean
    executedAt?: number
  }>
}

export interface PerformanceThreshold {
  id: string
  name: string
  metricName: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  threshold: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  enabled: boolean
  cooldownMs: number
  windowSize?: number // for rolling averages
  description?: string
}

export interface PerformanceDashboard {
  overview: {
    totalMetrics: number
    activeAlerts: number
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
    lastUpdated: number
  }
  categories: Record<string, {
    metricCount: number
    averageValue: number
    trend: 'up' | 'down' | 'stable'
    alerts: number
  }>
  topAlerts: PerformanceAlert[]
  recentMetrics: PerformanceMetric[]
}

/**
 * Advanced Performance Monitoring and Alerting System
 */
export class PerformanceMonitor {
  private admin = createSupabaseAdminClient()
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private alerts: Map<string, PerformanceAlert> = new Map()
  private thresholds: Map<string, PerformanceThreshold> = new Map()
  private metricBuffer: PerformanceMetric[] = []
  private isProcessing = false
  private monitoringInterval: NodeJS.Timeout | null = null

  // Default thresholds
  private defaultThresholds: PerformanceThreshold[] = [
    {
      id: 'db_slow_query',
      name: 'Slow Database Query',
      metricName: 'database_query_time_ms',
      operator: '>',
      threshold: 1000,
      severity: 'warning',
      enabled: true,
      cooldownMs: 60000,
      windowSize: 5,
      description: 'Database queries taking longer than 1 second'
    },
    {
      id: 'db_very_slow_query',
      name: 'Very Slow Database Query',
      metricName: 'database_query_time_ms',
      operator: '>',
      threshold: 5000,
      severity: 'error',
      enabled: true,
      cooldownMs: 30000,
      description: 'Database queries taking longer than 5 seconds'
    },
    {
      id: 'cache_low_hit_rate',
      name: 'Low Cache Hit Rate',
      metricName: 'cache_hit_rate',
      operator: '<',
      threshold: 70,
      severity: 'warning',
      enabled: true,
      cooldownMs: 300000,
      description: 'Cache hit rate below 70%'
    },
    {
      id: 'subscription_high_latency',
      name: 'High Subscription Latency',
      metricName: 'subscription_latency_ms',
      operator: '>',
      threshold: 2000,
      severity: 'warning',
      enabled: true,
      cooldownMs: 120000,
      description: 'Real-time subscription latency above 2 seconds'
    },
    {
      id: 'memory_usage_high',
      name: 'High Memory Usage',
      metricName: 'memory_usage_mb',
      operator: '>',
      threshold: 1000,
      severity: 'warning',
      enabled: true,
      cooldownMs: 60000,
      description: 'Memory usage above 1GB'
    },
    {
      id: 'api_response_slow',
      name: 'Slow API Response',
      metricName: 'api_response_time_ms',
      operator: '>',
      threshold: 2000,
      severity: 'warning',
      enabled: true,
      cooldownMs: 60000,
      description: 'API response time above 2 seconds'
    },
    {
      id: 'error_rate_high',
      name: 'High Error Rate',
      metricName: 'error_rate_percent',
      operator: '>',
      threshold: 5,
      severity: 'error',
      enabled: true,
      cooldownMs: 120000,
      description: 'Error rate above 5%'
    }
  ]

  constructor() {
    this.initializeThresholds()
    this.startMonitoring()
  }

  /**
   * Initialize default thresholds
   */
  private initializeThresholds(): void {
    for (const threshold of this.defaultThresholds) {
      this.thresholds.set(threshold.id, threshold)
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      return
    }

    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics()
      this.processMetricBuffer()
      this.checkThresholds()
    }, 10000) // Collect metrics every 10 seconds

  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...metric
    }

    this.metricBuffer.push(fullMetric)

    // Process immediately for critical metrics
    if (metric.category === 'system' || metric.name.includes('error')) {
      this.processMetric(fullMetric)
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    query: string,
    executionTimeMs: number,
    rowsAffected: number,
    userId?: string
  ): void {
    this.recordMetric({
      name: 'database_query_time_ms',
      value: executionTimeMs,
      unit: 'ms',
      category: 'database',
      tags: {
        query_hash: this.hashQuery(query),
        table: this.extractTableFromQuery(query)
      },
      metadata: {
        query: query.substring(0, 200), // Limit query length
        rows_affected: rowsAffected,
        user_id: userId
      }
    })
  }

  /**
   * Record cache performance
   */
  recordCachePerformance(
    layerName: string,
    hitRate: number,
    memoryUsage: number,
    operations: number
  ): void {
    this.recordMetric({
      name: 'cache_hit_rate',
      value: hitRate,
      unit: '%',
      category: 'cache',
      tags: {
        layer: layerName
      },
      metadata: {
        memory_usage_bytes: memoryUsage,
        operations_count: operations
      }
    })

    this.recordMetric({
      name: 'cache_memory_usage',
      value: memoryUsage / (1024 * 1024), // Convert to MB
      unit: 'MB',
      category: 'cache',
      tags: {
        layer: layerName
      }
    })
  }

  /**
   * Record API performance
   */
  recordAPIPerformance(
    endpoint: string,
    responseTimeMs: number,
    statusCode: number,
    userId?: string
  ): void {
    this.recordMetric({
      name: 'api_response_time_ms',
      value: responseTimeMs,
      unit: 'ms',
      category: 'api',
      tags: {
        endpoint: endpoint,
        status_code: statusCode.toString()
      },
      metadata: {
        user_id: userId
      }
    })

    // Record error if status code indicates error
    if (statusCode >= 400) {
      this.recordMetric({
        name: 'api_error',
        value: 1,
        unit: 'count',
        category: 'api',
        tags: {
          endpoint: endpoint,
          status_code: statusCode.toString(),
          error_type: statusCode >= 500 ? 'server_error' : 'client_error'
        },
        metadata: {
          user_id: userId
        }
      })
    }
  }

  /**
   * Record subscription performance
   */
  recordSubscriptionPerformance(
    subscriptionId: string,
    latencyMs: number,
    messageRate: number,
    errorCount: number
  ): void {
    this.recordMetric({
      name: 'subscription_latency_ms',
      value: latencyMs,
      unit: 'ms',
      category: 'subscription',
      tags: {
        subscription_id: subscriptionId
      }
    })

    this.recordMetric({
      name: 'subscription_message_rate',
      value: messageRate,
      unit: 'msg/s',
      category: 'subscription',
      tags: {
        subscription_id: subscriptionId
      }
    })

    if (errorCount > 0) {
      this.recordMetric({
        name: 'subscription_errors',
        value: errorCount,
        unit: 'count',
        category: 'subscription',
        tags: {
          subscription_id: subscriptionId
        }
      })
    }
  }

  /**
   * Record system performance
   */
  recordSystemPerformance(): void {
    const memUsage = process.memoryUsage()

    this.recordMetric({
      name: 'memory_usage_mb',
      value: memUsage.heapUsed / (1024 * 1024),
      unit: 'MB',
      category: 'system',
      tags: {
        memory_type: 'heap'
      },
      metadata: {
        heap_total: memUsage.heapTotal / (1024 * 1024),
        external: memUsage.external / (1024 * 1024),
        rss: memUsage.rss / (1024 * 1024)
      }
    })

    // Record CPU usage (simplified)
    const startUsage = process.cpuUsage()
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage)
      const cpuPercent = (endUsage.user + endUsage.system) / 1000000 / 10 * 100 // 10 second interval

      this.recordMetric({
        name: 'cpu_usage_percent',
        value: Math.min(cpuPercent, 100),
        unit: '%',
        category: 'system'
      })
    }, 10000)
  }

  /**
   * Collect system metrics automatically
   */
  private collectSystemMetrics(): void {
    this.recordSystemPerformance()

    // Collect cache metrics
    const cacheStats = advancedCacheManager.getStats()
    for (const [layerName, stats] of Array.from(cacheStats.entries())) {
      this.recordCachePerformance(
        layerName,
        stats.hitRate,
        stats.memoryUsage,
        stats.totalEntries
      )
    }

    // Collect subscription metrics
    const subscriptionMetrics = subscriptionOptimizer.getSubscriptionMetrics()
    for (const [subscriptionId, metrics] of Array.from(subscriptionMetrics.entries())) {
      this.recordSubscriptionPerformance(
        subscriptionId,
        metrics.averageLatency,
        metrics.messagesPerSecond,
        metrics.errorCount
      )
    }

    // Collect lazy loading metrics
    const lazyLoadStats = lazyLoadingManager.getStatistics()
    this.recordMetric({
      name: 'lazy_load_instances',
      value: lazyLoadStats.totalInstances,
      unit: 'count',
      category: 'system',
      metadata: lazyLoadStats
    })
  }

  /**
   * Process metric buffer
   */
  private processMetricBuffer(): void {
    if (this.isProcessing || this.metricBuffer.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const metrics = [...this.metricBuffer]
      this.metricBuffer = []

      for (const metric of metrics) {
        this.processMetric(metric)
      }
    } catch (error) {
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process individual metric
   */
  private processMetric(metric: PerformanceMetric): void {
    // Store metric by category
    const categoryMetrics = this.metrics.get(metric.category) || []
    categoryMetrics.push(metric)

    // Keep only last 1000 metrics per category
    if (categoryMetrics.length > 1000) {
      categoryMetrics.splice(0, categoryMetrics.length - 1000)
    }

    this.metrics.set(metric.category, categoryMetrics)

    // Store in database periodically
    if (categoryMetrics.length % 100 === 0) {
      this.persistMetrics(metric.category)
    }
  }

  /**
   * Check thresholds and create alerts
   */
  private checkThresholds(): void {
    for (const threshold of this.thresholds.values()) {
      if (!threshold.enabled) continue

      try {
        const relevantMetrics = this.getMetricsForThreshold(threshold)
        if (relevantMetrics.length === 0) continue

        const latestMetric = relevantMetrics[relevantMetrics.length - 1]
        const value = this.calculateThresholdValue(threshold, relevantMetrics)

        if (this.evaluateThreshold(threshold, value)) {
          this.createAlert(threshold, latestMetric, value)
        }
      } catch (error) {
      }
    }
  }

  /**
   * Get metrics for threshold evaluation
   */
  private getMetricsForThreshold(threshold: PerformanceThreshold): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = []

    for (const categoryMetrics of this.metrics.values()) {
      const relevantMetrics = categoryMetrics.filter(m => m.name === threshold.metricName)
      allMetrics.push(...relevantMetrics)
    }

    // Sort by timestamp
    return allMetrics.sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Calculate threshold value (average or latest)
   */
  private calculateThresholdValue(
    threshold: PerformanceThreshold,
    metrics: PerformanceMetric[]
  ): number {
    if (threshold.windowSize && metrics.length > 0) {
      // Use rolling average
      const recentMetrics = metrics.slice(-threshold.windowSize)
      const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0)
      return sum / recentMetrics.length
    }

    // Use latest value
    return metrics.length > 0 ? metrics[metrics.length - 1].value : 0
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThreshold(threshold: PerformanceThreshold, value: number): boolean {
    switch (threshold.operator) {
      case '>': return value > threshold.threshold
      case '<': return value < threshold.threshold
      case '>=': return value >= threshold.threshold
      case '<=': return value <= threshold.threshold
      case '==': return value === threshold.threshold
      case '!=': return value !== threshold.threshold
      default: return false
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    threshold: PerformanceThreshold,
    metric: PerformanceMetric,
    actualValue: number
  ): void {
    const alertId = `${threshold.id}_${Math.floor(Date.now() / threshold.cooldownMs)}`

    // Check if alert already exists (within cooldown)
    if (this.alerts.has(alertId)) {
      return
    }

    const alert: PerformanceAlert = {
      id: alertId,
      type: 'threshold',
      severity: threshold.severity,
      title: threshold.name,
      description: threshold.description || `Threshold breached: ${metric.name} ${threshold.operator} ${threshold.threshold}`,
      metrics: [metric],
      threshold: threshold.threshold,
      actualValue,
      timestamp: Date.now(),
      resolved: false,
      actions: [
        {
          type: 'notification',
          description: 'Send notification to administrators',
          executed: false
        }
      ]
    }

    this.alerts.set(alertId, alert)
    this.handleAlert(alert)

  }

  /**
   * Handle alert (auto-fix, notifications, etc.)
   */
  private async handleAlert(alert: PerformanceAlert): Promise<void> {
    // Store alert in database
    try {
      await this.admin.from('performance_alerts').insert({
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        metrics: alert.metrics,
        threshold_value: alert.threshold,
        actual_value: alert.actualValue,
        created_at: new Date(alert.timestamp).toISOString()
      })
    } catch (error) {
    }

    // Execute actions
    for (const action of alert.actions || []) {
      if (!action.executed) {
        try {
          await this.executeAlertAction(alert, action)
          action.executed = true
          action.executedAt = Date.now()
        } catch (error) {
        }
      }
    }
  }

  /**
   * Execute alert action
   */
  private async executeAlertAction(
    alert: PerformanceAlert,
    action: { type: string; description: string }
  ): Promise<void> {
    switch (action.type) {
      case 'notification':
        // Send notification (in real implementation, integrate with notification system)
        break

      case 'auto_fix':
        // Attempt automatic fix based on alert type
        await this.attemptAutoFix(alert)
        break

      case 'escalation':
        // Escalate to higher level (in real implementation)
        break
    }
  }

  /**
   * Attempt automatic fix for performance issues
   */
  private async attemptAutoFix(alert: PerformanceAlert): Promise<void> {
    const metricName = alert.metrics[0]?.name

    switch (metricName) {
      case 'cache_hit_rate':
        // Optimize cache
        const optimizationResult = advancedCacheManager.optimize()
        break

      case 'memory_usage_mb':
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc()
        }
        break

      case 'subscription_latency_ms':
        // Optimize subscriptions
        const subscriptionOptimization = subscriptionOptimizer.optimizeSubscriptions()
        break
    }
  }

  /**
   * Get performance dashboard data
   */
  async getDashboard(): Promise<PerformanceDashboard> {
    const totalMetrics = Array.from(this.metrics.values())
      .reduce((sum, categoryMetrics) => sum + categoryMetrics.length, 0)

    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved).length

    const systemHealth = this.calculateSystemHealth()

    const categories = this.calculateCategoryStats()
    const topAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity))
      .slice(0, 5)

    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)

    return {
      overview: {
        totalMetrics,
        activeAlerts,
        systemHealth,
        lastUpdated: Date.now()
      },
      categories,
      topAlerts,
      recentMetrics
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)

    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length
    const errorAlerts = activeAlerts.filter(a => a.severity === 'error').length
    const warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length

    if (criticalAlerts > 0) return 'critical'
    if (errorAlerts > 2) return 'poor'
    if (errorAlerts > 0 || warningAlerts > 5) return 'fair'
    if (warningAlerts > 0) return 'good'
    return 'excellent'
  }

  /**
   * Calculate category statistics
   */
  private calculateCategoryStats(): Record<string, any> {
    const categories: Record<string, any> = {}

    for (const [categoryName, metrics] of Array.from(this.metrics.entries())) {
      if (metrics.length === 0) continue

      const values = metrics.map(m => m.value)
      const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length
      const trend = this.calculateTrend(values)
      const alerts = Array.from(this.alerts.values())
        .filter(alert => !alert.resolved && alert.metrics.some(m => m.category === categoryName)).length

      categories[categoryName] = {
        metricCount: metrics.length,
        averageValue,
        trend,
        alerts
      }
    }

    return categories
  }

  /**
   * Calculate trend from values
   */
  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable'

    const recent = values.slice(-5)
    const older = values.slice(-10, -5)

    if (older.length === 0) return 'stable'

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length

    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100

    if (changePercent > 10) return 'up'
    if (changePercent < -10) return 'down'
    return 'stable'
  }

  /**
   * Get severity weight for sorting
   */
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 4
      case 'error': return 3
      case 'warning': return 2
      case 'info': return 1
      default: return 0
    }
  }

  /**
   * Persist metrics to database
   */
  private async persistMetrics(category: string): Promise<void> {
    try {
      const metrics = this.metrics.get(category) || []
      const latestMetrics = metrics.slice(-50) // Last 50 metrics

      for (const metric of latestMetrics) {
        await this.admin.from('performance_metrics').insert({
          metric_name: metric.name,
          value: metric.value,
          unit: metric.unit,
          category: metric.category,
          tags: metric.tags,
          metadata: metric.metadata,
          created_at: new Date(metric.timestamp).toISOString()
        })
      }
    } catch (error) {
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = Date.now()

      // Update in database
      this.admin.from('performance_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date(alert.resolvedAt).toISOString()
        })
        .eq('id', alertId)
        .then()
    }
  }

  // Utility methods
  private hashQuery(query: string): string {
    return btoa(query.substring(0, 100)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }

  private extractTableFromQuery(query: string): string {
    const match = query.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
    return match ? match[1].toLowerCase() : 'unknown'
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const recordMetric = (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) =>
  performanceMonitor.recordMetric(metric)

export const recordDatabaseQuery = (query: string, executionTimeMs: number, rowsAffected: number, userId?: string) =>
  performanceMonitor.recordDatabaseQuery(query, executionTimeMs, rowsAffected, userId)

export const recordAPIPerformance = (endpoint: string, responseTimeMs: number, statusCode: number, userId?: string) =>
  performanceMonitor.recordAPIPerformance(endpoint, responseTimeMs, statusCode, userId)

export const getPerformanceDashboard = () => performanceMonitor.getDashboard()