import { horizontalScalingManager } from './horizontal-scaling'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { connectionPoolManager } from '@/lib/performance/connection-pool'

export interface LoadBalancerConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted_round_robin' | 'ip_hash' | 'random' | 'consistent_hash'
  healthCheckEnabled: boolean
  healthCheckPath: string
  healthCheckIntervalMs: number
  healthCheckTimeoutMs: number
  unhealthyThreshold: number
  healthyThreshold: number
  sessionAffinity: boolean
  sessionAffinityTimeoutMs: number
  retryAttempts: number
  retryDelayMs: number
  circuitBreakerEnabled: boolean
  circuitBreakerThreshold: number
  circuitBreakerTimeoutMs: number
  enableStickySessions: boolean
  enableHealthCheckRetry: boolean
  maxConnectionsPerInstance: number
}

export interface InstanceMetrics {
  instanceId: string
  host: string
  port: number
  weight: number
  activeConnections: number
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  healthStatus: 'healthy' | 'unhealthy' | 'draining'
  lastHealthCheck: number
  circuitBreakerState: 'closed' | 'open' | 'half_open'
  circuitBreakerFailureCount: number
  circuitBreakerLastFailure: number
}

export interface LoadBalancingSession {
  sessionId: string
  clientId: string
  instanceId: string
  createdAt: number
  lastAccessed: number
  expiresAt: number
  metadata: Record<string, any>
}

export interface LoadBalancingStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  requestsPerSecond: number
  instanceDistribution: Record<string, number>
  circuitBreakerTrips: number
  healthCheckFailures: number
  sessionAffinityHits: number
  sessionAffinityMisses: number
}

/**
 * Advanced Load Balancing Manager
 */
export class LoadBalancingManager {
  private admin = createSupabaseAdminClient()
  private config: LoadBalancerConfig
  private instances: Map<string, InstanceMetrics> = new Map()
  private sessions: Map<string, LoadBalancingSession> = new Map()
  private requestQueue: Array<{
    id: string
    resolve: (instanceId: string) => void
    reject: (error: Error) => void
    timestamp: number
    retryCount: number
  }> = []

  private stats: LoadBalancingStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    requestsPerSecond: 0,
    instanceDistribution: {},
    circuitBreakerTrips: 0,
    healthCheckFailures: 0,
    sessionAffinityHits: 0,
    sessionAffinityMisses: 0
  }

  private healthCheckInterval: NodeJS.Timeout | null = null
  private sessionCleanupInterval: NodeJS.Timeout | null = null
  private statsUpdateInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.config = {
      algorithm: 'least_connections',
      healthCheckEnabled: true,
      healthCheckPath: '/health',
      healthCheckIntervalMs: 15000,
      healthCheckTimeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      sessionAffinity: false,
      sessionAffinityTimeoutMs: 300000, // 5 minutes
      retryAttempts: 3,
      retryDelayMs: 1000,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeoutMs: 60000, // 1 minute
      enableStickySessions: false,
      enableHealthCheckRetry: true,
      maxConnectionsPerInstance: 1000,
      ...config
    }

    this.initializeInstances()
    this.startHealthChecking()
    this.startSessionCleanup()
    this.startStatsUpdate()
  }

  /**
   * Initialize instances from horizontal scaling manager
   */
  private initializeInstances(): void {
    const scalingStats = horizontalScalingManager.getScalingStatistics()

    for (const instance of scalingStats.instances) {
      this.instances.set(instance.id, {
        instanceId: instance.id,
        host: instance.host,
        port: instance.port,
        weight: 1,
        activeConnections: instance.activeConnections,
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        healthStatus: instance.status === 'healthy' ? 'healthy' : 'unhealthy',
        lastHealthCheck: Date.now(),
        circuitBreakerState: 'closed',
        circuitBreakerFailureCount: 0,
        circuitBreakerLastFailure: 0
      })
    }
  }

  /**
   * Get best instance for request
   */
  async selectInstance(clientId?: string, requestContext?: any): Promise<string> {
    const startTime = Date.now()
    this.stats.totalRequests++

    try {
      // Check session affinity first
      if (this.config.sessionAffinity && clientId) {
        const affinityInstanceId = this.getSessionAffinityInstance(clientId)
        if (affinityInstanceId) {
          const instance = this.instances.get(affinityInstanceId)
          if (instance && instance.healthStatus === 'healthy' &&
              instance.circuitBreakerState === 'closed' &&
              instance.activeConnections < this.config.maxConnectionsPerInstance) {
            this.updateSessionAccess(clientId)
            this.stats.sessionAffinityHits++
            this.updateInstanceStats(affinityInstanceId, 'success', Date.now() - startTime)
            return affinityInstanceId
          }
        }
        this.stats.sessionAffinityMisses++
      }

      // Select instance based on algorithm
      let instanceId = this.selectInstanceByAlgorithm(clientId, requestContext)

      // Check if instance is healthy and available
      if (!this.isInstanceAvailable(instanceId)) {
        // Try alternative instances
        const availableInstance = this.findAvailableInstance()
        if (!availableInstance) {
          throw new Error('No healthy instances available')
        }
        instanceId = availableInstance
      }

      // Create session affinity if enabled
      if (this.config.sessionAffinity && clientId) {
        this.createSessionAffinity(clientId, instanceId)
      }

      this.updateInstanceStats(instanceId, 'success', Date.now() - startTime)
      this.stats.successfulRequests++

      return instanceId

    } catch (error) {
      this.stats.failedRequests++
      throw error
    }
  }

  /**
   * Select instance based on configured algorithm
   */
  private selectInstanceByAlgorithm(clientId?: string, requestContext?: any): string {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance =>
        instance.healthStatus === 'healthy' &&
        instance.circuitBreakerState === 'closed' &&
        instance.activeConnections < this.config.maxConnectionsPerInstance
      )

    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available')
    }

    switch (this.config.algorithm) {
      case 'round_robin':
        return this.roundRobinSelect(healthyInstances)
      case 'least_connections':
        return this.leastConnectionsSelect(healthyInstances)
      case 'weighted_round_robin':
        return this.weightedRoundRobinSelect(healthyInstances)
      case 'ip_hash':
        return this.ipHashSelect(healthyInstances, clientId)
      case 'random':
        return this.randomSelect(healthyInstances)
      case 'consistent_hash':
        return this.consistentHashSelect(healthyInstances, clientId || requestContext)
      default:
        return this.leastConnectionsSelect(healthyInstances)
    }
  }

  /**
   * Round-robin selection
   */
  private roundRobinSelect(instances: InstanceMetrics[]): string {
    const sortedInstances = instances.sort((a, b) => a.totalRequests - b.totalRequests)
    return sortedInstances[0].instanceId
  }

  /**
   * Least connections selection
   */
  private leastConnectionsSelect(instances: InstanceMetrics[]): string {
    const sortedInstances = instances.sort((a, b) => a.activeConnections - b.activeConnections)
    return sortedInstances[0].instanceId
  }

  /**
   * Weighted round-robin selection
   */
  private weightedRoundRobinSelect(instances: InstanceMetrics[]): string {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0)
    let random = Math.random() * totalWeight

    for (const instance of instances) {
      random -= instance.weight
      if (random <= 0) {
        return instance.instanceId
      }
    }

    return instances[0].instanceId
  }

  /**
   * IP hash selection
   */
  private ipHashSelect(instances: InstanceMetrics[], clientId?: string): string {
    if (!clientId) {
      return this.leastConnectionsSelect(instances)
    }

    const hash = this.hashString(clientId)
    const index = hash % instances.length
    return instances[index].instanceId
  }

  /**
   * Random selection
   */
  private randomSelect(instances: InstanceMetrics[]): string {
    const randomIndex = Math.floor(Math.random() * instances.length)
    return instances[randomIndex].instanceId
  }

  /**
   * Consistent hash selection
   */
  private consistentHashSelect(instances: InstanceMetrics[], key?: any): string {
    if (!key) {
      return this.leastConnectionsSelect(instances)
    }

    const hash = this.hashString(JSON.stringify(key))
    const index = hash % instances.length
    return instances[index].instanceId
  }

  /**
   * Check if instance is available
   */
  private isInstanceAvailable(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    return instance.healthStatus === 'healthy' &&
           instance.circuitBreakerState === 'closed' &&
           instance.activeConnections < this.config.maxConnectionsPerInstance
  }

  /**
   * Find any available instance
   */
  private findAvailableInstance(): string | null {
    for (const instance of this.instances.values()) {
      if (this.isInstanceAvailable(instance.instanceId)) {
        return instance.instanceId
      }
    }
    return null
  }

  /**
   * Session affinity methods
   */
  private getSessionAffinityInstance(clientId: string): string | null {
    const session = this.sessions.get(clientId)
    if (!session || session.expiresAt < Date.now()) {
      this.sessions.delete(clientId)
      return null
    }
    return session.instanceId
  }

  private createSessionAffinity(clientId: string, instanceId: string): void {
    this.sessions.set(clientId, {
      sessionId: crypto.randomUUID(),
      clientId,
      instanceId,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + this.config.sessionAffinityTimeoutMs,
      metadata: {}
    })
  }

  private updateSessionAccess(clientId: string): void {
    const session = this.sessions.get(clientId)
    if (session) {
      session.lastAccessed = Date.now()
      session.expiresAt = Date.now() + this.config.sessionAffinityTimeoutMs
    }
  }

  /**
   * Update instance statistics
   */
  private updateInstanceStats(instanceId: string, result: 'success' | 'error', responseTime: number): void {
    const instance = this.instances.get(instanceId)
    if (!instance) return

    if (result === 'success') {
      instance.totalRequests++
      instance.averageResponseTime = (instance.averageResponseTime + responseTime) / 2
      instance.circuitBreakerFailureCount = 0
      instance.circuitBreakerState = 'closed'
    } else {
      instance.errorRate = Math.min(instance.errorRate + 0.01, 1)
      instance.circuitBreakerFailureCount++

      // Check circuit breaker
      if (this.config.circuitBreakerEnabled &&
          instance.circuitBreakerFailureCount >= this.config.circuitBreakerThreshold) {
        instance.circuitBreakerState = 'open'
        instance.circuitBreakerLastFailure = Date.now()
        this.stats.circuitBreakerTrips++
      }
    }

    // Update distribution stats
    this.stats.instanceDistribution[instanceId] =
      (this.stats.instanceDistribution[instanceId] || 0) + 1
  }

  /**
   * Start health checking
   */
  private startHealthChecking(): void {
    if (!this.config.healthCheckEnabled) return

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheckIntervalMs)
  }

  /**
   * Perform health checks on all instances
   */
  private async performHealthChecks(): Promise<void> {
    for (const [instanceId, instance] of Array.from(this.instances.entries())) {
      try {
        const isHealthy = await this.checkInstanceHealth(instance)
        const previousStatus = instance.healthStatus

        if (isHealthy) {
          if (instance.healthStatus === 'unhealthy') {
            instance.healthStatus = 'healthy'
          }
        } else {
          if (instance.healthStatus === 'healthy') {
            instance.healthStatus = 'unhealthy'
            this.stats.healthCheckFailures++
          }
        }

        instance.lastHealthCheck = Date.now()

        // Check circuit breaker recovery
        if (instance.circuitBreakerState === 'open' &&
            Date.now() - instance.circuitBreakerLastFailure > this.config.circuitBreakerTimeoutMs) {
          instance.circuitBreakerState = 'half_open'
        }

      } catch (error) {
        instance.healthStatus = 'unhealthy'
        this.stats.healthCheckFailures++
      }
    }
  }

  /**
   * Check individual instance health
   */
  private async checkInstanceHealth(instance: InstanceMetrics): Promise<boolean> {
    try {
      // Simulate health check
      if (instance.activeConnections > this.config.maxConnectionsPerInstance * 0.9) {
        return false
      }

      if (instance.errorRate > 0.5) { // 50% error rate
        return false
      }

      // Simulate HTTP health check
      const healthCheckUrl = `http://${instance.host}:${instance.port}${this.config.healthCheckPath}`

      // In a real implementation, make actual HTTP request
      // For now, simulate based on instance metrics
      return Math.random() > 0.05 // 95% success rate

    } catch (error) {
      return false
    }
  }

  /**
   * Start session cleanup
   */
  private startSessionCleanup(): void {
    this.sessionCleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 60000) // Clean up every minute
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [clientId, session] of Array.from(this.sessions.entries())) {
      if (session.expiresAt < now) {
        this.sessions.delete(clientId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
    }
  }

  /**
   * Start statistics update
   */
  private startStatsUpdate(): void {
    this.statsUpdateInterval = setInterval(() => {
      this.updateStats()
    }, 10000) // Update every 10 seconds
  }

  /**
   * Update load balancing statistics
   */
  private updateStats(): void {
    // Calculate requests per second
    const now = Date.now()
    const recentRequests = this.stats.totalRequests

    // Update average response time
    const totalResponseTime = Array.from(this.instances.values())
      .reduce((sum, instance) => sum + instance.averageResponseTime, 0)
    const avgResponseTime = totalResponseTime / Math.max(this.instances.size, 1)

    this.stats.averageResponseTime = avgResponseTime
    this.stats.requestsPerSecond = recentRequests / 60 // Rough estimate
  }

  /**
   * Get load balancing statistics
   */
  getStatistics(): LoadBalancingStats {
    return { ...this.stats }
  }

  /**
   * Get instance details
   */
  getInstances(): InstanceMetrics[] {
    return Array.from(this.instances.values())
  }

  /**
   * Get active sessions
   */
  getSessions(): LoadBalancingSession[] {
    return Array.from(this.sessions.values())
  }

  /**
   * Add or update instance
   */
  addInstance(instanceData: {
    instanceId: string
    host: string
    port: number
    weight?: number
  }): void {
    const instance: InstanceMetrics = {
      instanceId: instanceData.instanceId,
      host: instanceData.host,
      port: instanceData.port,
      weight: instanceData.weight || 1,
      activeConnections: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      healthStatus: 'healthy',
      lastHealthCheck: Date.now(),
      circuitBreakerState: 'closed',
      circuitBreakerFailureCount: 0,
      circuitBreakerLastFailure: 0
    }

    this.instances.set(instanceData.instanceId, instance)
  }

  /**
   * Remove instance
   */
  removeInstance(instanceId: string): boolean {
    const removed = this.instances.delete(instanceId)
    if (removed) {
      // Clean up any sessions pointing to this instance
      for (const [clientId, session] of Array.from(this.sessions.entries())) {
        if (session.instanceId === instanceId) {
          this.sessions.delete(clientId)
        }
      }
    }
    return removed
  }

  /**
   * Update instance weight
   */
  updateInstanceWeight(instanceId: string, weight: number): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    instance.weight = weight
    return true
  }

  /**
   * Update load balancer configuration
   */
  updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart health checking if configuration changed
    if (newConfig.healthCheckIntervalMs && this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.startHealthChecking()
    }
  }

  /**
   * Reset circuit breaker for instance
   */
  resetCircuitBreaker(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    instance.circuitBreakerState = 'closed'
    instance.circuitBreakerFailureCount = 0
    instance.circuitBreakerLastFailure = 0

    return true
  }

  /**
   * Manual health check for instance
   */
  async manualHealthCheck(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    return await this.checkInstanceHealth(instance)
  }

  /**
   * Hash utility function
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Shutdown load balancer
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval)
    }

    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval)
    }

    // Clear request queue
    for (const request of this.requestQueue) {
      request.reject(new Error('Load balancer shutting down'))
    }
    this.requestQueue = []

  }
}

// Singleton instance
export const loadBalancingManager = new LoadBalancingManager()

// Convenience functions
export const selectInstance = (clientId?: string, requestContext?: any) =>
  loadBalancingManager.selectInstance(clientId, requestContext)

export const getLoadBalancerStatistics = () =>
  loadBalancingManager.getStatistics()

export const getLoadBalancerInstances = () =>
  loadBalancingManager.getInstances()