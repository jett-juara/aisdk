// Scalability Module Exports
// ==========================

// Horizontal Scaling
export {
  HorizontalScalingManager,
  horizontalScalingManager,
  getInstanceForRequest,
  getScalingStatistics,
  updateScalingConfig
} from './horizontal-scaling'

// Load Balancing
export {
  LoadBalancingManager,
  loadBalancingManager,
  selectInstance,
  getLoadBalancerStatistics,
  getLoadBalancerInstances
} from './load-balancing'

// Load Balancing Hooks
export {
  useLoadBalancing,
  useInstanceMonitoring,
  useSessionAffinity,
  useLoadBalancingMetrics,
  useCircuitBreakerMonitoring,
  useRequestRouter
} from './load-balancing-hooks'

// Data Archiving
export {
  DataArchivingManager,
  dataArchivingManager,
  executeArchive,
  getArchiveJob,
  getArchiveJobs,
  getArchiveStatistics
} from './data-archiving'

// Scalability Monitoring
export {
  ScalabilityMonitoringManager,
  scalabilityMonitoringManager,
  getScalabilityDashboard,
  getScalabilityAlerts,
  resolveScalabilityAlert
} from './scalability-monitoring'

// Scalability Monitoring Hooks
export {
  useScalabilityMonitoring,
  useScalabilityMetrics,
  useScalabilityAlerts,
  useSystemResources,
  useScalabilityRecommendations,
  useCapacityPlanning,
  useRealTimeMonitoring
} from './scalability-monitoring-hooks'

// Types
export type {
  ScalingConfig,
  InstanceInfo,
  ScalingMetrics,
  ScalingDecision
} from './horizontal-scaling'

export type {
  LoadBalancerConfig,
  InstanceMetrics,
  LoadBalancingSession,
  LoadBalancingStats
} from './load-balancing'

export type {
  ArchiveConfig,
  ArchiveJob,
  ArchiveStatistics
} from './data-archiving'

export type {
  ScalabilityMetrics,
  ScalabilityAlert,
  ScalabilityDashboard
} from './scalability-monitoring'

// Scalability Configuration
export const SCALABILITY_CONFIG = {
  // Horizontal Scaling
  MIN_INSTANCES: 2,
  MAX_INSTANCES: 10,
  TARGET_CPU_UTILIZATION: 70,
  TARGET_MEMORY_UTILIZATION: 80,
  SCALE_UP_COOLDOWN: 300000, // 5 minutes
  SCALE_DOWN_COOLDOWN: 600000, // 10 minutes
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds

  // Load Balancing
  LOAD_BALANCING_ALGORITHM: 'least_connections' as const,
  HEALTH_CHECK_PATH: '/health',
  HEALTH_CHECK_TIMEOUT: 5000,
  UNHEALTHY_THRESHOLD: 3,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 60000,
  MAX_CONNECTIONS_PER_INSTANCE: 1000,

  // Data Archiving
  DEFAULT_RETENTION_DAYS: 30,
  ARCHIVE_BATCH_SIZE: 1000,
  MAX_ARCHIVE_SIZE_MB: 100,
  ARCHIVE_SCHEDULE: '0 2 * * *', // 2 AM daily

  // Monitoring
  METRICS_WINDOW_SIZE: 100,
  ALERT_CHECK_INTERVAL: 30000,
  METRICS_RETENTION_HOURS: 24
}

// Scalability Utilities
export class ScalabilityUtils {
  /**
   * Calculate required instances based on load
   */
  static calculateRequiredInstances(
    currentLoad: number,
    targetLoadPerInstance: number,
    minInstances: number = SCALABILITY_CONFIG.MIN_INSTANCES,
    maxInstances: number = SCALABILITY_CONFIG.MAX_INSTANCES
  ): number {
    const required = Math.ceil(currentLoad / targetLoadPerInstance)
    return Math.min(Math.max(required, minInstances), maxInstances)
  }

  /**
   * Calculate connection pool size
   */
  static calculateConnectionPoolSize(
    expectedConnections: number,
    maxConnectionsPerPool: number = SCALABILITY_CONFIG.MAX_INSTANCES * 50
  ): number {
    return Math.min(Math.ceil(expectedConnections / 10), maxConnectionsPerPool)
  }

  /**
   * Estimate archive size
   */
  static estimateArchiveSize(
    recordCount: number,
    avgRecordSizeBytes: number,
    compressionRatio: number = 0.3
  ): number {
    return (recordCount * avgRecordSizeBytes * compressionRatio) / (1024 * 1024) // MB
  }

  /**
   * Calculate time to capacity
   */
  static calculateTimeToCapacity(
    currentUsage: number,
    maxCapacity: number,
    growthRate: number // per hour
  ): number {
    if (growthRate <= 0) return Infinity
    const remainingCapacity = maxCapacity - currentUsage
    return remainingCapacity / growthRate // hours
  }

  /**
   * Get scaling recommendation
   */
  static getScalingRecommendation(
    cpuUtilization: number,
    memoryUtilization: number,
    activeConnections: number,
    maxConnectionsPerInstance: number = 1000
  ): {
    action: 'scale_up' | 'scale_down' | 'maintain'
    reason: string
    confidence: number
  } {
    const maxUtilization = Math.max(cpuUtilization, memoryUtilization)
    const connectionLoadRatio = activeConnections / (maxConnectionsPerInstance * 4) // Assuming 4 instances

    if (maxUtilization > 85 || connectionLoadRatio > 0.8) {
      return {
        action: 'scale_up',
        reason: 'High resource utilization detected',
        confidence: Math.min((maxUtilization - 80) * 5 + connectionLoadRatio * 10, 100)
      }
    }

    if (maxUtilization < 30 && connectionLoadRatio < 0.2) {
      return {
        action: 'scale_down',
        reason: 'Low resource utilization detected',
        confidence: Math.min((40 - maxUtilization) * 5 + (0.3 - connectionLoadRatio) * 10, 100)
      }
    }

    return {
      action: 'maintain',
      reason: 'Resource utilization within optimal range',
      confidence: 90
    }
  }

  /**
   * Calculate load balancing efficiency
   */
  static calculateLoadBalancingEfficiency(
    instanceMetrics: Array<{
      requests: number
      connections: number
      responseTime: number
    }>
  ): {
    efficiency: number
    balanceScore: number
    uniformity: number
  } {
    if (instanceMetrics.length === 0) {
      return { efficiency: 0, balanceScore: 0, uniformity: 0 }
    }

    const totalRequests = instanceMetrics.reduce((sum, m) => sum + m.requests, 0)
    const avgRequests = totalRequests / instanceMetrics.length

    // Calculate uniformity (how evenly distributed are requests)
    const variance = instanceMetrics.reduce((sum, m) => {
      const diff = m.requests - avgRequests
      return sum + (diff * diff)
    }, 0) / instanceMetrics.length

    const standardDeviation = Math.sqrt(variance)
    const uniformity = Math.max(0, 100 - (standardDeviation / avgRequests) * 100)

    // Calculate efficiency based on response times
    const avgResponseTime = instanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / instanceMetrics.length
    const efficiency = Math.max(0, 100 - (avgResponseTime / 1000) * 100) // Assuming 1s = 0% efficiency

    // Balance score combines uniformity and efficiency
    const balanceScore = (uniformity + efficiency) / 2

    return {
      efficiency,
      balanceScore,
      uniformity
    }
  }

  /**
   * Calculate archive ROI (Return on Investment)
   */
  static calculateArchiveROI(
    recordsCount: number,
    avgRecordSizeBytes: number,
    storageCostPerGBPerMonth: number,
    compressionRatio: number = 0.3,
    retentionDays: number = 30
  ): {
    spaceSaved: number // GB
    costSavings: number // per month
    roi: number // percentage
  } {
    const originalSizeGB = (recordsCount * avgRecordSizeBytes) / (1024 * 1024 * 1024)
    const archivedSizeGB = originalSizeGB * compressionRatio
    const spaceSavedGB = originalSizeGB - archivedSizeGB

    const monthlyRetention = retentionDays / 30
    const costSavings = spaceSavedGB * storageCostPerGBPerMonth * monthlyRetention

    const roi = spaceSavedGB > 0 ? (costSavings / (spaceSavedGB * storageCostPerGBPerMonth)) * 100 : 0

    return {
      spaceSaved: spaceSavedGB,
      costSavings,
      roi
    }
  }

  /**
   * Get capacity forecast
   */
  static getCapacityForecast(
    currentMetrics: {
      cpuUtilization: number
      memoryUtilization: number
      diskUsage: number
      networkIO: number
    },
    growthRate: number, // percentage per day
    daysToForecast: number = 30
  ): {
    forecast: Array<{
      day: number
      cpuUtilization: number
      memoryUtilization: number
      diskUsage: number
      networkIO: number
    }>
    recommendations: string[]
  } {
    const forecast = []
    const recommendations = []

    for (let day = 1; day <= daysToForecast; day++) {
      const growthFactor = 1 + (growthRate / 100) * day

      forecast.push({
        day,
        cpuUtilization: Math.min(currentMetrics.cpuUtilization * growthFactor, 100),
        memoryUtilization: Math.min(currentMetrics.memoryUtilization * growthFactor, 100),
        diskUsage: Math.min(currentMetrics.diskUsage * growthFactor, 100),
        networkIO: currentMetrics.networkIO * growthFactor
      })
    }

    // Check for capacity issues
    const criticalDays = forecast.filter(day =>
      day.cpuUtilization > 90 || day.memoryUtilization > 90 || day.diskUsage > 90
    )

    if (criticalDays.length > 0) {
      recommendations.push(
        `Capacity planning needed: ${criticalDays[0].day} days to reach critical utilization`
      )
    }

    if (growthRate > 20) {
      recommendations.push('High growth rate detected - consider aggressive scaling')
    }

    return { forecast, recommendations }
  }

  /**
   * Format large numbers
   */
  static formatLargeNumber(num: number): string {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
    return `${(num / 1000000000).toFixed(1)}B`
  }

  /**
   * Get severity color
   */
  static getSeverityColor(severity: 'info' | 'warning' | 'error' | 'critical'): string {
    switch (severity) {
      case 'info': return 'blue'
      case 'warning': return 'yellow'
      case 'error': return 'orange'
      case 'critical': return 'red'
      default: return 'gray'
    }
  }

  /**
   * Calculate SLA compliance
   */
  static calculateSLACompliance(
    metrics: {
      uptime: number // percentage
      responseTime: number // ms
      errorRate: number // percentage
    },
    targets: {
      uptimeTarget: number // percentage
      responseTimeTarget: number // ms
      errorRateTarget: number // percentage
    }
  ): {
    overall: number // percentage
    uptime: number
    responseTime: number
    errorRate: number
    compliant: boolean
  } {
    const uptime = metrics.uptime >= targets.uptimeTarget ? 100 : (metrics.uptime / targets.uptimeTarget) * 100
    const responseTime = Math.max(0, 100 - ((metrics.responseTime - targets.responseTimeTarget) / targets.responseTimeTarget) * 100)
    const errorRate = Math.max(0, 100 - ((metrics.errorRate - targets.errorRateTarget) / targets.errorRateTarget) * 100)

    const overall = (uptime + responseTime + errorRate) / 3
    const compliant = overall >= 95

    return {
      overall,
      uptime,
      responseTime,
      errorRate,
      compliant
    }
  }
}