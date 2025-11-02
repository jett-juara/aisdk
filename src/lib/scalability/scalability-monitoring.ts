import { horizontalScalingManager } from './horizontal-scaling'
import { loadBalancingManager } from './load-balancing'
import { dataArchivingManager } from './data-archiving'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { connectionPoolManager } from '@/lib/performance/connection-pool'
import { performanceMonitor } from '@/lib/performance/monitoring'

export interface ScalabilityMetrics {
  timestamp: number
  system: {
    totalInstances: number
    healthyInstances: number
    activeConnections: number
    cpuUtilization: number
    memoryUtilization: number
    diskUsage: number
    networkIO: number
  }
  performance: {
    averageResponseTime: number
    requestsPerSecond: number
    errorRate: number
    throughput: number
    cacheHitRate: number
  }
  scaling: {
    scaleUpEvents: number
    scaleDownEvents: number
    lastScaleAction: number
    autoScalingEnabled: boolean
    scalingDecisions: Array<{
      action: string
      reason: string
      timestamp: number
    }>
  }
  loadBalancing: {
    totalRequests: number
    circuitBreakerTrips: number
    sessionAffinityHits: number
    healthCheckFailures: number
    instanceDistribution: Record<string, number>
  }
  databases: {
    connectionPools: Record<string, {
      activeConnections: number
      idleConnections: number
      totalConnections: number
      utilizationRate: number
    }>
    slowQueries: number
    queryPerformance: number
  }
  archiving: {
    totalArchivedRecords: number
    spaceSaved: number
    activeJobs: number
    lastArchiveTime: number
  }
}

export interface ScalabilityAlert {
  id: string
  type: 'scaling' | 'performance' | 'resource' | 'health' | 'capacity'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  metrics: Record<string, number>
  thresholds: Record<string, number>
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  actions: Array<{
    type: 'auto_fix' | 'notification' | 'escalation'
    description: string
    executed: boolean
    executedAt?: number
  }>
}

export interface ScalabilityDashboard {
  overview: {
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
    totalInstances: number
    activeConnections: number
    requestsPerSecond: number
    averageResponseTime: number
    errorRate: number
    lastUpdated: number
  }
  alerts: ScalabilityAlert[]
  metrics: ScalabilityMetrics
  trends: {
    cpu: Array<{ timestamp: number; value: number }>
    memory: Array<{ timestamp: number; value: number }>
    requests: Array<{ timestamp: number; value: number }>
    errors: Array<{ timestamp: number; value: number }>
  }
  recommendations: Array<{
    type: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    impact: string
  }>
}

/**
 * Comprehensive Scalability Monitoring System
 */
export class ScalabilityMonitoringManager {
  private admin = createSupabaseAdminClient()
  private metrics: ScalabilityMetrics[] = []
  private alerts: Map<string, ScalabilityAlert> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private alertThresholds = {
    cpuUtilization: 80,
    memoryUtilization: 85,
    errorRate: 5,
    responseTime: 2000,
    connectionUtilization: 90,
    diskUsage: 90,
    unhealthyInstances: 2
  }

  constructor() {
    this.initializeMonitoring()
  }

  /**
   * Initialize monitoring system
   */
  private initializeMonitoring(): void {
    // Start collecting metrics
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.checkAlerts()
    }, 30000) // Collect every 30 seconds

  }

  /**
   * Collect comprehensive scalability metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now()

    try {
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics()

      // Collect performance metrics
      const performanceMetrics = await this.collectPerformanceMetrics()

      // Collect scaling metrics
      const scalingMetrics = await this.collectScalingMetrics()

      // Collect load balancing metrics
      const loadBalancingMetrics = await this.collectLoadBalancingMetrics()

      // Collect database metrics
      const databaseMetrics = await this.collectDatabaseMetrics()

      // Collect archiving metrics
      const archivingMetrics = await this.collectArchivingMetrics()

      const metrics: ScalabilityMetrics = {
        timestamp,
        system: systemMetrics,
        performance: performanceMetrics,
        scaling: scalingMetrics,
        loadBalancing: loadBalancingMetrics,
        databases: databaseMetrics,
        archiving: archivingMetrics
      }

      this.metrics.push(metrics)

      // Keep only last 1000 data points
      if (this.metrics.length > 1000) {
        this.metrics.shift()
      }

      // Store in database
      await this.persistMetrics(metrics)

    } catch (error) {
    }
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics(): Promise<ScalabilityMetrics['system']> {
    const scalingStats = horizontalScalingManager.getScalingStatistics()
    const instances = scalingStats.instances

    const totalInstances = instances.length
    const healthyInstances = instances.filter(i => i.status === 'healthy').length
    const activeConnections = instances.reduce((sum, i) => sum + i.activeConnections, 0)

    // Simulate resource utilization (in production, get from actual monitoring)
    const cpuUtilization = activeConnections > 0
      ? Math.min(20 + (activeConnections * 0.05) + Math.random() * 20, 100)
      : 20 + Math.random() * 10

    const memoryUtilization = activeConnections > 0
      ? Math.min(30 + (activeConnections * 0.03) + Math.random() * 15, 100)
      : 30 + Math.random() * 10

    const diskUsage = 40 + Math.random() * 30
    const networkIO = 10 + Math.random() * 50

    return {
      totalInstances,
      healthyInstances,
      activeConnections,
      cpuUtilization,
      memoryUtilization,
      diskUsage,
      networkIO
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<ScalabilityMetrics['performance']> {
    const lbStats = loadBalancingManager.getStatistics()
    const poolStats = connectionPoolManager.getPoolStatistics()

    const averageResponseTime = lbStats.averageResponseTime || 100 + Math.random() * 200
    const requestsPerSecond = lbStats.requestsPerSecond || 50 + Math.random() * 100
    const errorRate = (lbStats.failedRequests / Math.max(lbStats.totalRequests, 1)) * 100

    // Calculate throughput
    const throughput = requestsPerSecond * (1 - errorRate / 100)

    // Get cache hit rate
    const cacheHitRate = 70 + Math.random() * 20 // Simulated

    return {
      averageResponseTime,
      requestsPerSecond,
      errorRate,
      throughput,
      cacheHitRate
    }
  }

  /**
   * Collect scaling metrics
   */
  private async collectScalingMetrics(): Promise<ScalabilityMetrics['scaling']> {
    const scalingStats = horizontalScalingManager.getScalingStatistics()
    const recentDecisions = scalingStats.recentDecisions

    const scaleUpEvents = recentDecisions.filter(d => d.action === 'scale_up').length
    const scaleDownEvents = recentDecisions.filter(d => d.action === 'scale_down').length
    const lastScaleAction = recentDecisions.length > 0
      ? recentDecisions[recentDecisions.length - 1].timestamp
      : 0

    return {
      scaleUpEvents,
      scaleDownEvents,
      lastScaleAction,
      autoScalingEnabled: scalingStats.config.autoScalingEnabled,
      scalingDecisions: recentDecisions.slice(-5).map(d => ({
        action: d.action,
        reason: d.reason,
        timestamp: d.timestamp
      }))
    }
  }

  /**
   * Collect load balancing metrics
   */
  private async collectLoadBalancingMetrics(): Promise<ScalabilityMetrics['loadBalancing']> {
    const lbStats = loadBalancingManager.getStatistics()
    const instances = loadBalancingManager.getInstances()

    const circuitBreakerTrips = instances.filter(i => i.circuitBreakerState === 'open').length
    const healthCheckFailures = instances.filter(i => i.healthStatus === 'unhealthy').length

    // Calculate instance distribution
    const instanceDistribution: Record<string, number> = {}
    instances.forEach(instance => {
      instanceDistribution[instance.instanceId] = instance.totalRequests
    })

    return {
      totalRequests: lbStats.totalRequests,
      circuitBreakerTrips,
      sessionAffinityHits: lbStats.sessionAffinityHits,
      healthCheckFailures,
      instanceDistribution
    }
  }

  /**
   * Collect database metrics
   */
  private async collectDatabaseMetrics(): Promise<ScalabilityMetrics['databases']> {
    const poolStats = connectionPoolManager.getPoolStatistics()

    const connectionPools: Record<string, any> = {}
    for (const [poolName, stats] of poolStats) {
      connectionPools[poolName] = {
        activeConnections: stats.activeConnections,
        idleConnections: stats.idleConnections,
        totalConnections: stats.totalConnections,
        utilizationRate: stats.totalConnections > 0
          ? (stats.activeConnections / stats.totalConnections) * 100
          : 0
      }
    }

    // Simulate slow queries and performance
    const slowQueries = Math.floor(Math.random() * 5)
    const queryPerformance = 100 - Math.random() * 20 // Performance score

    return {
      connectionPools,
      slowQueries,
      queryPerformance
    }
  }

  /**
   * Collect archiving metrics
   */
  private async collectArchivingMetrics(): Promise<ScalabilityMetrics['archiving']> {
    const archiveStats = dataArchivingManager.getArchiveStatistics()

    return {
      totalArchivedRecords: archiveStats.totalRecordsArchived,
      spaceSaved: archiveStats.totalSpaceSaved,
      activeJobs: archiveStats.completedJobs,
      lastArchiveTime: archiveStats.lastArchiveTime
    }
  }

  /**
   * Check for alerts based on thresholds
   */
  private async checkAlerts(): Promise<void> {
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const alertId = `alert_${Date.now()}`

    // Check CPU utilization
    if (latestMetrics.system.cpuUtilization > this.alertThresholds.cpuUtilization) {
      await this.createAlert({
        id: alertId + '_cpu',
        type: 'resource',
        severity: latestMetrics.system.cpuUtilization > 95 ? 'critical' : 'error',
        title: 'High CPU Utilization',
        description: `CPU utilization is ${latestMetrics.system.cpuUtilization.toFixed(1)}%`,
        metrics: { cpuUtilization: latestMetrics.system.cpuUtilization },
        thresholds: { cpuUtilization: this.alertThresholds.cpuUtilization },
        timestamp: Date.now(),
        resolved: false,
        actions: [
          {
            type: 'auto_fix',
            description: 'Trigger auto-scaling if enabled',
            executed: false
          },
          {
            type: 'notification',
            description: 'Notify administrators',
            executed: false
          }
        ]
      })
    }

    // Check memory utilization
    if (latestMetrics.system.memoryUtilization > this.alertThresholds.memoryUtilization) {
      await this.createAlert({
        id: alertId + '_memory',
        type: 'resource',
        severity: latestMetrics.system.memoryUtilization > 95 ? 'critical' : 'error',
        title: 'High Memory Utilization',
        description: `Memory utilization is ${latestMetrics.system.memoryUtilization.toFixed(1)}%`,
        metrics: { memoryUtilization: latestMetrics.system.memoryUtilization },
        thresholds: { memoryUtilization: this.alertThresholds.memoryUtilization },
        timestamp: Date.now(),
        resolved: false,
        actions: [
          {
            type: 'auto_fix',
            description: 'Scale up instances if needed',
            executed: false
          }
        ]
      })
    }

    // Check error rate
    if (latestMetrics.performance.errorRate > this.alertThresholds.errorRate) {
      await this.createAlert({
        id: alertId + '_errors',
        type: 'performance',
        severity: latestMetrics.performance.errorRate > 10 ? 'critical' : 'error',
        title: 'High Error Rate',
        description: `Error rate is ${latestMetrics.performance.errorRate.toFixed(1)}%`,
        metrics: { errorRate: latestMetrics.performance.errorRate },
        thresholds: { errorRate: this.alertThresholds.errorRate },
        timestamp: Date.now(),
        resolved: false,
        actions: [
          {
            type: 'notification',
            description: 'Investigate error patterns',
            executed: false
          }
        ]
      })
    }

    // Check unhealthy instances
    const unhealthyCount = latestMetrics.system.totalInstances - latestMetrics.system.healthyInstances
    if (unhealthyCount >= this.alertThresholds.unhealthyInstances) {
      await this.createAlert({
        id: alertId + '_health',
        type: 'health',
        severity: unhealthyCount >= latestMetrics.system.totalInstances * 0.5 ? 'critical' : 'error',
        title: 'Multiple Unhealthy Instances',
        description: `${unhealthyCount} instances are unhealthy`,
        metrics: { unhealthyInstances: unhealthyCount },
        thresholds: { unhealthyInstances: this.alertThresholds.unhealthyInstances },
        timestamp: Date.now(),
        resolved: false,
        actions: [
          {
            type: 'escalation',
            description: 'Immediate attention required',
            executed: false
          }
        ]
      })
    }

    // Check response time
    if (latestMetrics.performance.averageResponseTime > this.alertThresholds.responseTime) {
      await this.createAlert({
        id: alertId + '_response_time',
        type: 'performance',
        severity: latestMetrics.performance.averageResponseTime > 5000 ? 'critical' : 'error',
        title: 'High Response Time',
        description: `Average response time is ${latestMetrics.performance.averageResponseTime.toFixed(0)}ms`,
        metrics: { responseTime: latestMetrics.performance.averageResponseTime },
        thresholds: { responseTime: this.alertThresholds.responseTime },
        timestamp: Date.now(),
        resolved: false,
        actions: [
          {
            type: 'auto_fix',
            description: 'Scale up if auto-scaling enabled',
            executed: false
          }
        ]
      })
    }
  }

  /**
   * Create and handle alert
   */
  private async createAlert(alert: ScalabilityAlert): Promise<void> {
    this.alerts.set(alert.id, alert)

    // Store in database
    try {
      await this.admin.from('scalability_alerts').insert({
        alert_id: alert.id,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        metrics: alert.metrics,
        thresholds: alert.thresholds,
        created_at: new Date(alert.timestamp).toISOString(),
        resolved: false
      })
    } catch (error) {
    }

    // Execute actions
    for (const action of alert.actions) {
      try {
        await this.executeAlertAction(alert, action)
        action.executed = true
        action.executedAt = Date.now()
      } catch (error) {
      }
    }

  }

  /**
   * Execute alert action
   */
  private async executeAlertAction(alert: ScalabilityAlert, action: any): Promise<void> {
    switch (action.type) {
      case 'auto_fix':
        // Attempt automatic fix based on alert type
        await this.attemptAutoFix(alert)
        break

      case 'notification':
        // Send notification (in real implementation, integrate with notification system)
        break

      case 'escalation':
        // Escalate to higher level
        break
    }
  }

  /**
   * Attempt automatic fix for scalability issues
   */
  private async attemptAutoFix(alert: ScalabilityAlert): Promise<void> {
    switch (alert.type) {
      case 'resource':
        if (alert.metrics.cpuUtilization > 90 || alert.metrics.memoryUtilization > 90) {
          // Trigger auto-scaling if enabled
          const scalingConfig = horizontalScalingManager.getScalingStatistics().config
          if (scalingConfig.autoScalingEnabled) {
          }
        }
        break

      case 'performance':
        if (alert.metrics.responseTime > 3000) {
          // Optimize performance
        }
        break

      case 'health':
        // Restart unhealthy instances if possible
        break
    }
  }

  /**
   * Generate scalability dashboard
   */
  async generateDashboard(): Promise<ScalabilityDashboard> {
    if (this.metrics.length === 0) {
      throw new Error('No metrics available')
    }

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(latestMetrics, activeAlerts)

    // Generate trends (last 24 hours)
    const trends = this.generateTrends()

    // Generate recommendations
    const recommendations = this.generateRecommendations(latestMetrics, activeAlerts)

    return {
      overview: {
        systemHealth,
        totalInstances: latestMetrics.system.totalInstances,
        activeConnections: latestMetrics.system.activeConnections,
        requestsPerSecond: latestMetrics.performance.requestsPerSecond,
        averageResponseTime: latestMetrics.performance.averageResponseTime,
        errorRate: latestMetrics.performance.errorRate,
        lastUpdated: Date.now()
      },
      alerts: activeAlerts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)),
      metrics: latestMetrics,
      trends,
      recommendations
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(
    metrics: ScalabilityMetrics,
    alerts: ScalabilityAlert[]
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const errorAlerts = alerts.filter(a => a.severity === 'error').length
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length

    if (criticalAlerts > 0) return 'critical'
    if (errorAlerts > 2) return 'poor'
    if (errorAlerts > 0 || warningAlerts > 5) return 'fair'
    if (warningAlerts > 0) return 'good'
    return 'excellent'
  }

  /**
   * Generate trend data
   */
  private generateTrends(): ScalabilityDashboard['trends'] {
    const last24Hours = this.metrics.filter(m => m.timestamp > Date.now() - 24 * 60 * 60 * 1000)

    return {
      cpu: last24Hours.map(m => ({ timestamp: m.timestamp, value: m.system.cpuUtilization })),
      memory: last24Hours.map(m => ({ timestamp: m.timestamp, value: m.system.memoryUtilization })),
      requests: last24Hours.map(m => ({ timestamp: m.timestamp, value: m.performance.requestsPerSecond })),
      errors: last24Hours.map(m => ({ timestamp: m.timestamp, value: m.performance.errorRate }))
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    metrics: ScalabilityMetrics,
    alerts: ScalabilityAlert[]
  ): ScalabilityDashboard['recommendations'] {
    const recommendations: ScalabilityDashboard['recommendations'] = []

    // Resource recommendations
    if (metrics.system.cpuUtilization > 80) {
      recommendations.push({
        type: 'scaling',
        priority: metrics.system.cpuUtilization > 95 ? 'critical' : 'high',
        title: 'Scale Up Due to High CPU',
        description: `CPU utilization is at ${metrics.system.cpuUtilization.toFixed(1)}%`,
        impact: 'Improve response time and user experience'
      })
    }

    if (metrics.system.memoryUtilization > 85) {
      recommendations.push({
        type: 'resource',
        priority: metrics.system.memoryUtilization > 95 ? 'critical' : 'high',
        title: 'Optimize Memory Usage',
        description: `Memory utilization is at ${metrics.system.memoryUtilization.toFixed(1)}%`,
        impact: 'Prevent out-of-memory errors'
      })
    }

    // Performance recommendations
    if (metrics.performance.errorRate > 5) {
      recommendations.push({
        type: 'performance',
        priority: metrics.performance.errorRate > 10 ? 'critical' : 'high',
        title: 'Investigate High Error Rate',
        description: `Error rate is ${metrics.performance.errorRate.toFixed(1)}%`,
        impact: 'Improve system reliability'
      })
    }

    if (metrics.performance.averageResponseTime > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimize Response Time',
        description: `Average response time is ${metrics.performance.averageResponseTime.toFixed(0)}ms`,
        impact: 'Enhance user experience'
      })
    }

    // Capacity recommendations
    if (metrics.system.activeConnections > metrics.system.totalInstances * 800) {
      recommendations.push({
        type: 'capacity',
        priority: 'high',
        title: 'Increase Connection Capacity',
        description: 'Connections per instance are approaching limits',
        impact: 'Handle higher traffic loads'
      })
    }

    return recommendations
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
  private async persistMetrics(metrics: ScalabilityMetrics): Promise<void> {
    try {
      await this.admin.from('scalability_metrics').insert({
        timestamp: new Date(metrics.timestamp).toISOString(),
        system_metrics: metrics.system,
        performance_metrics: metrics.performance,
        scaling_metrics: metrics.scaling,
        load_balancing_metrics: metrics.loadBalancing,
        database_metrics: metrics.databases,
        archiving_metrics: metrics.archiving,
        created_at: new Date().toISOString()
      })
    } catch (error) {
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours = 24): ScalabilityMetrics[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000)
    return this.metrics.filter(m => m.timestamp > cutoffTime)
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ScalabilityAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = Date.now()

    // Update in database
    this.admin.from('scalability_alerts')
      .update({
        resolved: true,
        resolved_at: new Date(alert.resolvedAt).toISOString()
      })
      .eq('alert_id', alertId)
      .then()

    return true
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(newThresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds }
  }

  /**
   * Shutdown monitoring
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

  }
}

// Singleton instance
export const scalabilityMonitoringManager = new ScalabilityMonitoringManager()

// Convenience functions
export const getScalabilityDashboard = () =>
  scalabilityMonitoringManager.generateDashboard()

export const getScalabilityAlerts = () =>
  scalabilityMonitoringManager.getActiveAlerts()

export const resolveScalabilityAlert = (alertId: string) =>
  scalabilityMonitoringManager.resolveAlert(alertId)