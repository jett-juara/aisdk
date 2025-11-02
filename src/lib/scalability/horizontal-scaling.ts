import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { connectionPoolManager } from '@/lib/performance/connection-pool'
import { advancedCacheManager } from '@/lib/performance/advanced-cache'

export interface ScalingConfig {
  enabled: boolean
  minInstances: number
  maxInstances: number
  targetCPUUtilization: number
  targetMemoryUtilization: number
  scaleUpCooldownMs: number
  scaleDownCooldownMs: number
  healthCheckIntervalMs: number
  metricsWindowSize: number
  autoScalingEnabled: boolean
  loadBalancingEnabled: boolean
  sessionAffinity: boolean
}

export interface InstanceInfo {
  id: string
  name: string
  host: string
  port: number
  status: 'healthy' | 'unhealthy' | 'draining' | 'offline'
  cpuUtilization: number
  memoryUtilization: number
  activeConnections: number
  requestCount: number
  lastHealthCheck: number
  createdAt: number
  region: string
  zone: string
  capabilities: string[]
}

export interface LoadBalancingConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted_round_robin' | 'ip_hash' | 'random'
  healthCheckEnabled: boolean
  healthCheckPath: string
  healthCheckIntervalMs: number
  healthCheckTimeoutMs: number
  unhealthyThreshold: number
  healthyThreshold: number
  sessionAffinity: boolean
  sessionAffinityTimeoutMs: number
}

export interface ScalingMetrics {
  timestamp: number
  cpuUtilization: number
  memoryUtilization: number
  activeConnections: number
  requestRate: number
  responseTime: number
  errorRate: number
  queueLength: number
  diskUsage: number
  networkIO: number
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action'
  reason: string
  confidence: number
  recommendedInstances: number
  currentInstances: number
  metrics: ScalingMetrics
  timestamp: number
}

/**
 * Horizontal Scaling and Load Balancing Manager
 */
export class HorizontalScalingManager {
  private admin = createSupabaseAdminClient()
  private config: ScalingConfig
  private instances: Map<string, InstanceInfo> = new Map()
  private metricsHistory: ScalingMetrics[] = []
  private scalingDecisions: ScalingDecision[] = []
  private lastScaleAction: number = 0
  private healthCheckInterval: NodeJS.Timeout | null = null
  private metricsCollectionInterval: NodeJS.Timeout | null = null

  // Load balancing
  private loadBalancingConfig: LoadBalancingConfig
  private currentInstanceIndex: number = 0
  private connectionMap: Map<string, string> = new Map() // client -> instance mapping

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = {
      enabled: true,
      minInstances: 2,
      maxInstances: 10,
      targetCPUUtilization: 70,
      targetMemoryUtilization: 80,
      scaleUpCooldownMs: 300000, // 5 minutes
      scaleDownCooldownMs: 600000, // 10 minutes
      healthCheckIntervalMs: 30000, // 30 seconds
      metricsWindowSize: 100, // Keep last 100 data points
      autoScalingEnabled: true,
      loadBalancingEnabled: true,
      sessionAffinity: false,
      ...config
    }

    this.loadBalancingConfig = {
      algorithm: 'least_connections',
      healthCheckEnabled: true,
      healthCheckPath: '/health',
      healthCheckIntervalMs: 15000,
      healthCheckTimeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      sessionAffinity: this.config.sessionAffinity,
      sessionAffinityTimeoutMs: 300000 // 5 minutes
    }

    this.initializeInstances()
    this.startMonitoring()
  }

  /**
   * Initialize default instances
   */
  private initializeInstances(): void {
    // Create initial instances
    for (let i = 0; i < this.config.minInstances; i++) {
      this.createInstance({
        name: `instance-${i + 1}`,
        host: `instance-${i + 1}.internal`,
        port: 3000,
        region: 'us-central',
        zone: 'us-central1-a',
        capabilities: ['api', 'database', 'cache']
      })
    }
  }

  /**
   * Start monitoring and auto-scaling
   */
  private startMonitoring(): void {
    if (!this.config.enabled) return

    // Start health checking
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks()
    }, this.config.healthCheckIntervalMs)

    // Start metrics collection
    this.metricsCollectionInterval = setInterval(() => {
      this.collectMetrics()
    }, 10000) // Collect every 10 seconds

  }

  /**
   * Create a new instance
   */
  createInstance(instanceData: Partial<InstanceInfo>): InstanceInfo {
    const instance: InstanceInfo = {
      id: crypto.randomUUID(),
      name: instanceData.name || `instance-${Date.now()}`,
      host: instanceData.host || 'localhost',
      port: instanceData.port || 3000,
      status: 'offline',
      cpuUtilization: 0,
      memoryUtilization: 0,
      activeConnections: 0,
      requestCount: 0,
      lastHealthCheck: 0,
      createdAt: Date.now(),
      region: instanceData.region || 'us-central',
      zone: instanceData.zone || 'us-central1-a',
      capabilities: instanceData.capabilities || ['api']
    }

    this.instances.set(instance.id, instance)

    return instance
  }

  /**
   * Perform health checks on all instances
   */
  private async performHealthChecks(): Promise<void> {
    for (const [instanceId, instance] of this.instances) {
      try {
        const isHealthy = await this.checkInstanceHealth(instance)
        const previousStatus = instance.status

        if (isHealthy) {
          if (instance.status === 'unhealthy') {
            instance.status = 'healthy'
          } else if (instance.status === 'offline') {
            instance.status = 'healthy'
          }
        } else {
          if (instance.status === 'healthy') {
            instance.status = 'unhealthy'
          }
        }

        instance.lastHealthCheck = Date.now()

        // Log status changes
        if (previousStatus !== instance.status) {
          await this.logInstanceStatusChange(instance, previousStatus, instance.status)
        }
      } catch (error) {
        instance.status = 'unhealthy'
      }
    }
  }

  /**
   * Check individual instance health
   */
  private async checkInstanceHealth(instance: InstanceInfo): Promise<boolean> {
    try {
      // In a real implementation, this would make an HTTP request to the instance
      // For now, we'll simulate health checks based on metrics
      const timeSinceLastCheck = Date.now() - instance.lastHealthCheck

      // Simulate health check
      if (instance.cpuUtilization > 95 || instance.memoryUtilization > 95) {
        return false
      }

      if (timeSinceLastCheck > 60000) { // No health check for over 1 minute
        return false
      }

      return instance.status !== 'offline'
    } catch (error) {
      return false
    }
  }

  /**
   * Collect system metrics
   */
  private collectMetrics(): void {
    const metrics: ScalingMetrics = {
      timestamp: Date.now(),
      cpuUtilization: this.getCPUUtilization(),
      memoryUtilization: this.getMemoryUtilization(),
      activeConnections: this.getActiveConnections(),
      requestRate: this.getRequestRate(),
      responseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      queueLength: this.getQueueLength(),
      diskUsage: this.getDiskUsage(),
      networkIO: this.getNetworkIO()
    }

    this.metricsHistory.push(metrics)

    // Keep only the configured window size
    if (this.metricsHistory.length > this.config.metricsWindowSize) {
      this.metricsHistory.shift()
    }

    // Trigger auto-scaling evaluation
    if (this.config.autoScalingEnabled) {
      this.evaluateScaling(metrics)
    }
  }

  /**
   * Evaluate scaling decisions
   */
  private evaluateScaling(currentMetrics: ScalingMetrics): void {
    const now = Date.now()
    const cooldownPeriod = this.lastScaleAction + this.config.scaleUpCooldownMs

    if (now < cooldownPeriod) {
      return // Still in cooldown period
    }

    const decision = this.makeScalingDecision(currentMetrics)

    if (decision.action !== 'no_action') {
      this.executeScalingDecision(decision)
    }

    this.scalingDecisions.push(decision)

    // Keep only recent decisions
    if (this.scalingDecisions.length > 50) {
      this.scalingDecisions.shift()
    }
  }

  /**
   * Make scaling decision based on metrics
   */
  private makeScalingDecision(metrics: ScalingMetrics): ScalingDecision {
    const currentInstances = this.instances.size
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy').length

    let action: 'scale_up' | 'scale_down' | 'no_action' = 'no_action'
    let reason = ''
    let confidence = 0
    let recommendedInstances = currentInstances

    // Scale up conditions
    if (
      (metrics.cpuUtilization > this.config.targetCPUUtilization ||
       metrics.memoryUtilization > this.config.targetMemoryUtilization ||
       metrics.activeConnections > healthyInstances * 1000) &&
      currentInstances < this.config.maxInstances
    ) {
      action = 'scale_up'
      confidence = Math.min(
        (metrics.cpuUtilization / this.config.targetCPUUtilization - 1) * 100,
        (metrics.memoryUtilization / this.config.targetMemoryUtilization - 1) * 100,
        (metrics.activeConnections / (healthyInstances * 1000) - 1) * 100
      )

      if (metrics.cpuUtilization > 90) {
        reason = 'Critical CPU utilization'
        recommendedInstances = Math.min(currentInstances + 2, this.config.maxInstances)
      } else if (metrics.memoryUtilization > 90) {
        reason = 'Critical memory utilization'
        recommendedInstances = Math.min(currentInstances + 2, this.config.maxInstances)
      } else if (metrics.activeConnections > healthyInstances * 1000) {
        reason = 'High connection count'
        recommendedInstances = Math.min(currentInstances + 1, this.config.maxInstances)
      } else {
        reason = 'Elevated resource utilization'
        recommendedInstances = Math.min(currentInstances + 1, this.config.maxInstances)
      }
    }
    // Scale down conditions
    else if (
      metrics.cpuUtilization < this.config.targetCPUUtilization * 0.5 &&
      metrics.memoryUtilization < this.config.targetMemoryUtilization * 0.5 &&
      metrics.activeConnections < (healthyInstances - 1) * 500 &&
      currentInstances > this.config.minInstances
    ) {
      action = 'scale_down'
      confidence = Math.min(
        (1 - metrics.cpuUtilization / (this.config.targetCPUUtilization * 0.5)) * 100,
        (1 - metrics.memoryUtilization / (this.config.targetMemoryUtilization * 0.5)) * 100
      )

      reason = 'Low resource utilization'
      recommendedInstances = Math.max(currentInstances - 1, this.config.minInstances)
    }

    return {
      action,
      reason,
      confidence: Math.max(0, Math.min(100, confidence)),
      recommendedInstances,
      currentInstances,
      metrics,
      timestamp: Date.now()
    }
  }

  /**
   * Execute scaling decision
   */
  private async executeScalingDecision(decision: ScalingDecision): Promise<void> {
    try {
      if (decision.action === 'scale_up') {
        await this.scaleUp(decision.recommendedInstances - decision.currentInstances)
      } else if (decision.action === 'scale_down') {
        await this.scaleDown(decision.currentInstances - decision.recommendedInstances)
      }

      this.lastScaleAction = Date.now()

      // Log scaling decision
      await this.logScalingDecision(decision)

    } catch (error) {
    }
  }

  /**
   * Scale up by adding instances
   */
  private async scaleUp(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const instance = this.createInstance({
        name: `instance-scaleup-${Date.now()}-${i}`,
        capabilities: ['api', 'database', 'cache']
      })

      // Simulate instance startup time
      setTimeout(() => {
        instance.status = 'healthy'
      }, 30000) // 30 seconds startup time
    }
  }

  /**
   * Scale down by removing instances
   */
  private async scaleDown(count: number): Promise<void> {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy')
      .sort((a, b) => a.activeConnections - b.activeConnections) // Remove least busy first

    const instancesToRemove = healthyInstances.slice(0, Math.min(count, healthyInstances.length - this.config.minInstances))

    for (const instance of instancesToRemove) {
      instance.status = 'draining'

      // Wait for connections to drain before termination
      setTimeout(() => {
        this.instances.delete(instance.id)
      }, 60000) // 1 minute drain time
    }
  }

  /**
   * Get instance for load balancing
   */
  getInstanceForRequest(clientId?: string): InstanceInfo | null {
    if (!this.config.loadBalancingEnabled) {
      // Return first healthy instance
      const healthyInstances = Array.from(this.instances.values())
        .filter(instance => instance.status === 'healthy')
      return healthyInstances[0] || null
    }

    switch (this.loadBalancingConfig.algorithm) {
      case 'round_robin':
        return this.getRoundRobinInstance()
      case 'least_connections':
        return this.getLeastConnectionsInstance()
      case 'ip_hash':
        return this.getIPHashInstance(clientId)
      case 'random':
        return this.getRandomInstance()
      default:
        return this.getLeastConnectionsInstance()
    }
  }

  /**
   * Round-robin load balancing
   */
  private getRoundRobinInstance(): InstanceInfo | null {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy')

    if (healthyInstances.length === 0) return null

    const instance = healthyInstances[this.currentInstanceIndex % healthyInstances.length]
    this.currentInstanceIndex++
    return instance
  }

  /**
   * Least connections load balancing
   */
  private getLeastConnectionsInstance(): InstanceInfo | null {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy')
      .sort((a, b) => a.activeConnections - b.activeConnections)

    return healthyInstances[0] || null
  }

  /**
   * IP hash load balancing (session affinity)
   */
  private getIPHashInstance(clientId?: string): InstanceInfo | null {
    if (!clientId) {
      return this.getLeastConnectionsInstance()
    }

    // Check for existing session mapping
    const existingInstance = this.connectionMap.get(clientId)
    if (existingInstance) {
      const instance = this.instances.get(existingInstance)
      if (instance && instance.status === 'healthy') {
        return instance
      }
      // Remove stale mapping
      this.connectionMap.delete(clientId)
    }

    // Create new mapping
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy')

    if (healthyInstances.length === 0) return null

    // Simple hash function
    const hash = this.simpleHash(clientId)
    const instance = healthyInstances[hash % healthyInstances.length]

    this.connectionMap.set(clientId, instance.id)
    return instance
  }

  /**
   * Random instance selection
   */
  private getRandomInstance(): InstanceInfo | null {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'healthy')

    if (healthyInstances.length === 0) return null

    const randomIndex = Math.floor(Math.random() * healthyInstances.length)
    return healthyInstances[randomIndex]
  }

  /**
   * Simple hash function for IP hash
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Metric collection methods (simulated for demo)
  private getCPUUtilization(): number {
    // Simulate CPU usage based on active connections
    const activeConnections = this.getActiveConnections()
    const baseUsage = 20 + Math.random() * 10
    const connectionLoad = Math.min(activeConnections * 0.5, 60)
    return baseUsage + connectionLoad
  }

  private getMemoryUtilization(): number {
    // Simulate memory usage
    const baseUsage = 30 + Math.random() * 15
    const connectionLoad = this.getActiveConnections() * 0.3
    return Math.min(baseUsage + connectionLoad, 90)
  }

  private getActiveConnections(): number {
    return Array.from(this.instances.values())
      .reduce((sum, instance) => sum + instance.activeConnections, 0)
  }

  private getRequestRate(): number {
    // Simulate requests per second
    return 50 + Math.random() * 100
  }

  private getAverageResponseTime(): number {
    // Simulate response time in milliseconds
    return 100 + Math.random() * 200
  }

  private getErrorRate(): number {
    // Simulate error rate as percentage
    return Math.random() * 5
  }

  private getQueueLength(): number {
    // Simulate request queue length
    return Math.max(0, Math.floor(Math.random() * 20))
  }

  private getDiskUsage(): number {
    // Simulate disk usage as percentage
    return 40 + Math.random() * 30
  }

  private getNetworkIO(): number {
    // Simulate network I/O in MB/s
    return 10 + Math.random() * 50
  }

  /**
   * Get scaling statistics
   */
  getScalingStatistics(): {
    config: ScalingConfig
    instances: InstanceInfo[]
    currentMetrics: ScalingMetrics | null
    recentDecisions: ScalingDecision[]
    healthStatus: {
      healthy: number
      unhealthy: number
      total: number
    }
  } {
    const instances = Array.from(this.instances.values())
    const healthy = instances.filter(i => i.status === 'healthy').length
    const unhealthy = instances.filter(i => i.status === 'unhealthy').length

    return {
      config: this.config,
      instances,
      currentMetrics: this.metricsHistory[this.metricsHistory.length - 1] || null,
      recentDecisions: this.scalingDecisions.slice(-10),
      healthStatus: {
        healthy,
        unhealthy,
        total: instances.length
      }
    }
  }

  /**
   * Update scaling configuration
   */
  updateConfig(newConfig: Partial<ScalingConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Adjust instance count if needed
    const currentInstanceCount = this.instances.size
    if (currentInstanceCount < this.config.minInstances) {
      this.scaleUp(this.config.minInstances - currentInstanceCount)
    } else if (currentInstanceCount > this.config.maxInstances) {
      this.scaleDown(currentInstanceCount - this.config.maxInstances)
    }
  }

  /**
   * Log instance status change to database
   */
  private async logInstanceStatusChange(
    instance: InstanceInfo,
    previousStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      await this.admin.from('scaling_events').insert({
        event_type: 'instance_status_change',
        instance_id: instance.id,
        instance_name: instance.name,
        previous_status: previousStatus,
        new_status: newStatus,
        metrics: {
          cpu: instance.cpuUtilization,
          memory: instance.memoryUtilization,
          connections: instance.activeConnections
        },
        created_at: new Date().toISOString()
      })
    } catch (error) {
    }
  }

  /**
   * Log scaling decision to database
   */
  private async logScalingDecision(decision: ScalingDecision): Promise<void> {
    try {
      await this.admin.from('scaling_events').insert({
        event_type: 'scaling_decision',
        action: decision.action,
        reason: decision.reason,
        confidence: decision.confidence,
        current_instances: decision.currentInstances,
        recommended_instances: decision.recommendedInstances,
        metrics: decision.metrics,
        created_at: new Date(decision.timestamp).toISOString()
      })
    } catch (error) {
    }
  }

  /**
   * Shutdown scaling manager
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval)
    }

    // Mark all instances as draining
    for (const instance of this.instances.values()) {
      instance.status = 'draining'
    }

  }
}

// Singleton instance
export const horizontalScalingManager = new HorizontalScalingManager()

// Convenience functions
export const getInstanceForRequest = (clientId?: string) =>
  horizontalScalingManager.getInstanceForRequest(clientId)

export const getScalingStatistics = () =>
  horizontalScalingManager.getScalingStatistics()

export const updateScalingConfig = (config: Partial<ScalingConfig>) =>
  horizontalScalingManager.updateConfig(config)