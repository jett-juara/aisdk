import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseFetch } from '@/lib/supabase/safe-fetch'

const poolSupabaseFetch = createSupabaseFetch('connection-pool')

export type { SupabaseClient }

export interface PoolConfig {
  minConnections: number
  maxConnections: number
  acquireTimeoutMs: number
  idleTimeoutMs: number
  createTimeoutMs: number
  destroyTimeoutMs: number
  reapIntervalMs: number
  createRetryIntervalMs: number
  healthCheckIntervalMs: number
  enabled: boolean
  type: 'admin' | 'user' | 'service'
}

export interface ConnectionInfo {
  id: string
  client: SupabaseClient
  createdAt: number
  lastUsed: number
  useCount: number
  isHealthy: boolean
  lastHealthCheck: number
  isInUse: boolean
  poolType: 'admin' | 'user' | 'service'
  userId?: string
}

export interface PoolStatistics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  totalAcquired: number
  totalReleased: number
  totalCreated: number
  totalDestroyed: number
  averageWaitTime: number
  averageUseTime: number
  connectionErrors: number
  healthCheckFailures: number
}

export interface ConnectionRequest {
  id: string
  resolve: (connection: ConnectionInfo) => void
  reject: (error: Error) => void
  timeout: NodeJS.Timeout
  createdAt: number
  priority: number
}

/**
 * Advanced Database Connection Pool Manager
 */
export class ConnectionPoolManager {
  private pools: Map<string, {
    config: PoolConfig
    connections: Map<string, ConnectionInfo>
    waitingQueue: ConnectionRequest[]
    statistics: PoolStatistics
    isDestroyed: boolean
  }> = new Map()

  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map()
  private reapIntervals: Map<string, NodeJS.Timeout> = new Map()

  // Default pool configurations
  private defaultConfigs: Record<string, PoolConfig> = {
    'admin': {
      minConnections: 2,
      maxConnections: 10,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 300000, // 5 minutes
      createTimeoutMs: 10000,
      destroyTimeoutMs: 5000,
      reapIntervalMs: 60000, // 1 minute
      createRetryIntervalMs: 5000,
      healthCheckIntervalMs: 30000, // 30 seconds
      enabled: true,
      type: 'admin'
    },
    'user': {
      minConnections: 1,
      maxConnections: 20,
      acquireTimeoutMs: 3000,
      idleTimeoutMs: 120000, // 2 minutes
      createTimeoutMs: 8000,
      destroyTimeoutMs: 3000,
      reapIntervalMs: 45000, // 45 seconds
      createRetryIntervalMs: 3000,
      healthCheckIntervalMs: 20000, // 20 seconds
      enabled: true,
      type: 'user'
    },
    'service': {
      minConnections: 3,
      maxConnections: 15,
      acquireTimeoutMs: 2000,
      idleTimeoutMs: 600000, // 10 minutes
      createTimeoutMs: 15000,
      destroyTimeoutMs: 8000,
      reapIntervalMs: 90000, // 1.5 minutes
      createRetryIntervalMs: 4000,
      healthCheckIntervalMs: 45000, // 45 seconds
      enabled: true,
      type: 'service'
    }
  }

  constructor() {
    this.initializePools()
  }

  /**
   * Initialize default connection pools
   */
  private initializePools(): void {
    for (const [poolName, config] of Object.entries(this.defaultConfigs)) {
      if (config.enabled) {
        this.createPool(poolName, config)
      }
    }
  }

  /**
   * Create a new connection pool
   */
  createPool(poolName: string, config: PoolConfig): void {
    if (this.pools.has(poolName)) {
      throw new Error(`Pool ${poolName} already exists`)
    }

    const pool = {
      config,
      connections: new Map<string, ConnectionInfo>(),
      waitingQueue: [],
      statistics: {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingRequests: 0,
        totalAcquired: 0,
        totalReleased: 0,
        totalCreated: 0,
        totalDestroyed: 0,
        averageWaitTime: 0,
        averageUseTime: 0,
        connectionErrors: 0,
        healthCheckFailures: 0
      },
      isDestroyed: false
    }

    this.pools.set(poolName, pool)

    // Create minimum connections
    this.ensureMinimumConnections(poolName)

    // Start health checking
    this.startHealthChecking(poolName)

    // Start connection reaping
    this.startConnectionReaping(poolName)

  }

  /**
   * Acquire a connection from the pool
   */
  async acquireConnection(
    poolName: string,
    userId?: string,
    priority = 0
  ): Promise<SupabaseClient> {
    const pool = this.pools.get(poolName)
    if (!pool || pool.isDestroyed) {
      throw new Error(`Pool ${poolName} does not exist or is destroyed`)
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const requestId = crypto.randomUUID()

      // Try to find an available connection
      const availableConnection = this.findAvailableConnection(pool)

      if (availableConnection) {
        this.useConnection(availableConnection, pool)
        resolve(availableConnection.client)
        return
      }

      // If no connection available and we can create more
      if (pool.connections.size < pool.config.maxConnections) {
        this.createConnection(poolName, userId)
          .then(connectionInfo => {
            this.useConnection(connectionInfo, pool)
            resolve(connectionInfo.client)
          })
          .catch(error => {
            pool.statistics.connectionErrors++
            reject(error)
          })
        return
      }

      // Add to waiting queue
      const timeout = setTimeout(() => {
        this.removeFromWaitingQueue(pool, requestId)
        pool.statistics.waitingRequests--
        reject(new Error(`Connection acquire timeout after ${pool.config.acquireTimeoutMs}ms`))
      }, pool.config.acquireTimeoutMs)

      const request: ConnectionRequest = {
        id: requestId,
        resolve: (connectionInfo) => {
          const waitTime = Date.now() - startTime
          this.updateAverageWaitTime(pool.statistics, waitTime)
          this.useConnection(connectionInfo, pool)
          resolve(connectionInfo.client)
        },
        reject,
        timeout,
        createdAt: startTime,
        priority
      }

      pool.waitingQueue.push(request)
      pool.waitingQueue.sort((a, b) => b.priority - a.priority) // Higher priority first
      pool.statistics.waitingRequests++
    })
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(poolName: string, client: SupabaseClient): void {
    const pool = this.pools.get(poolName)
    if (!pool || pool.isDestroyed) {
      return
    }

    // Find the connection info
    let connectionInfo: ConnectionInfo | undefined
    for (const [id, info] of Array.from(pool.connections.entries())) {
      if (info.client === client) {
        connectionInfo = info
        break
      }
    }

    if (!connectionInfo) {
      return
    }

    // Update connection info
    connectionInfo.isInUse = false
    connectionInfo.lastUsed = Date.now()
    pool.statistics.totalReleased++
    pool.statistics.activeConnections--
    pool.statistics.idleConnections++

    // Process waiting queue
    this.processWaitingQueue(pool)
  }

  /**
   * Create a new connection
   */
  private async createConnection(
    poolName: string,
    userId?: string
  ): Promise<ConnectionInfo> {
    const pool = this.pools.get(poolName)!
    const connectionId = crypto.randomUUID()

    try {
      const client = await this.createClient(pool.config.type, userId)

      const connectionInfo: ConnectionInfo = {
        id: connectionId,
        client,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        useCount: 0,
        isHealthy: true,
        lastHealthCheck: Date.now(),
        isInUse: false,
        poolType: pool.config.type,
        userId
      }

      pool.connections.set(connectionId, connectionInfo)
      pool.statistics.totalConnections++
      pool.statistics.totalCreated++
      pool.statistics.idleConnections++

      return connectionInfo
    } catch (error) {
      pool.statistics.connectionErrors++
      throw error
    }
  }

  /**
   * Create Supabase client based on type
   */
  private async createClient(type: 'admin' | 'user' | 'service', userId?: string): Promise<SupabaseClient> {
    switch (type) {
      case 'admin':
        return createSupabaseAdminClient()
      case 'service':
        // Service role client with elevated permissions
        return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false
            },
            global: {
              fetch: poolSupabaseFetch
            }
          }
        )
      case 'user':
        // User-specific client
        if (!userId) {
          throw new Error('User ID is required for user-type connections')
        }
        return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false
            },
            global: {
              headers: {
                'X-User-ID': userId
              },
              fetch: poolSupabaseFetch
            }
          }
        )
      default:
        throw new Error(`Unknown client type: ${type}`)
    }
  }

  /**
   * Find an available connection
   */
  private findAvailableConnection(pool: any): ConnectionInfo | undefined {
    for (const connectionInfo of pool.connections.values()) {
      if (!connectionInfo.isInUse && connectionInfo.isHealthy) {
        return connectionInfo
      }
    }
    return undefined
  }

  /**
   * Mark connection as in use
   */
  private useConnection(connectionInfo: ConnectionInfo, pool: any): void {
    connectionInfo.isInUse = true
    connectionInfo.lastUsed = Date.now()
    connectionInfo.useCount++

    pool.statistics.activeConnections++
    pool.statistics.idleConnections--
    pool.statistics.totalAcquired++
  }

  /**
   * Process waiting queue
   */
  private processWaitingQueue(pool: any): void {
    if (pool.waitingQueue.length === 0) return

    const availableConnection = this.findAvailableConnection(pool)
    if (!availableConnection && pool.connections.size < pool.config.maxConnections) {
      // Create new connection for waiting request
      const request = pool.waitingQueue.shift()!
      this.createConnection('default', request.priority)
        .then(connectionInfo => {
          clearTimeout(request.timeout)
          request.resolve(connectionInfo)
        })
        .catch(error => {
          clearTimeout(request.timeout)
          request.reject(error)
        })
      return
    }

    if (availableConnection) {
      const request = pool.waitingQueue.shift()!
      clearTimeout(request.timeout)
      request.resolve(availableConnection)
    }
  }

  /**
   * Remove request from waiting queue
   */
  private removeFromWaitingQueue(pool: any, requestId: string): void {
    const index = pool.waitingQueue.findIndex((req: any) => req.id === requestId)
    if (index !== -1) {
      pool.waitingQueue.splice(index, 1)
    }
  }

  /**
   * Ensure minimum connections in pool
   */
  private async ensureMinimumConnections(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)!
    const currentCount = pool.connections.size
    const minCount = pool.config.minConnections

    if (currentCount < minCount) {
      const connectionsToCreate = minCount - currentCount
      const promises = []

      for (let i = 0; i < connectionsToCreate; i++) {
        promises.push(this.createConnection(poolName))
      }

      try {
        await Promise.all(promises)
      } catch (error) {
      }
    }
  }

  /**
   * Start health checking for connections
   */
  private startHealthChecking(poolName: string): void {
    const pool = this.pools.get(poolName)!
    const interval = setInterval(async () => {
      await this.performHealthChecks(poolName)
    }, pool.config.healthCheckIntervalMs)

    this.healthCheckIntervals.set(poolName, interval)
  }

  /**
   * Perform health checks on connections
   */
  private async performHealthChecks(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)!
    const healthCheckPromises = []

    for (const [connectionId, connectionInfo] of Array.from(pool.connections.entries())) {
      if (!connectionInfo.isInUse) {
        healthCheckPromises.push(this.checkConnectionHealth(connectionId, poolName))
      }
    }

    await Promise.allSettled(healthCheckPromises)
  }

  /**
   * Check individual connection health
   */
  private async checkConnectionHealth(connectionId: string, poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)!
    const connectionInfo = pool.connections.get(connectionId)

    if (!connectionInfo) return

    try {
      // Simple health check - try to execute a lightweight query
      const startTime = Date.now()

      if (connectionInfo.poolType === 'admin') {
        await connectionInfo.client.from('users').select('count').limit(1)
      } else {
        // For non-admin clients, check connection status
        await connectionInfo.client.auth.getSession()
      }

      connectionInfo.isHealthy = true
      connectionInfo.lastHealthCheck = Date.now()
    } catch (error) {
      connectionInfo.isHealthy = false
      pool.statistics.healthCheckFailures++

      // Remove unhealthy connection
      this.destroyConnection(connectionId, poolName)
    }
  }

  /**
   * Start connection reaping (removing idle connections)
   */
  private startConnectionReaping(poolName: string): void {
    const pool = this.pools.get(poolName)!
    const interval = setInterval(async () => {
      await this.reapIdleConnections(poolName)
    }, pool.config.reapIntervalMs)

    this.reapIntervals.set(poolName, interval)
  }

  /**
   * Reap idle connections
   */
  private async reapIdleConnections(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)!
    const now = Date.now()
    const connectionsToDestroy: string[] = []

    for (const [connectionId, connectionInfo] of Array.from(pool.connections.entries())) {
      if (!connectionInfo.isInUse &&
          now - connectionInfo.lastUsed > pool.config.idleTimeoutMs &&
          pool.connections.size > pool.config.minConnections) {
        connectionsToDestroy.push(connectionId)
      }
    }

    for (const connectionId of connectionsToDestroy) {
      await this.destroyConnection(connectionId, poolName)
    }
  }

  /**
   * Destroy a connection
   */
  private async destroyConnection(connectionId: string, poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)!
    const connectionInfo = pool.connections.get(connectionId)

    if (!connectionInfo) return

    try {
      // No explicit cleanup needed for Supabase client
      pool.connections.delete(connectionId)
      pool.statistics.totalConnections--
      pool.statistics.totalDestroyed++

      if (connectionInfo.isInUse) {
        pool.statistics.activeConnections--
      } else {
        pool.statistics.idleConnections--
      }

      // Ensure minimum connections
      await this.ensureMinimumConnections(poolName)
    } catch (error) {
    }
  }

  /**
   * Update average wait time
   */
  private updateAverageWaitTime(stats: PoolStatistics, waitTime: number): void {
    stats.averageWaitTime = (stats.averageWaitTime + waitTime) / 2
  }

  /**
   * Get pool statistics
   */
  getPoolStatistics(poolName?: string): Map<string, PoolStatistics> {
    if (poolName) {
      const pool = this.pools.get(poolName)
      if (pool) {
        const stats = new Map<string, PoolStatistics>()
        stats.set(poolName, { ...pool.statistics })
        return stats
      }
      return new Map()
    }

    const allStats = new Map<string, PoolStatistics>()
    for (const [name, pool] of Array.from(this.pools.entries())) {
      allStats.set(name, { ...pool.statistics })
    }
    return allStats
  }

  /**
   * Get detailed pool information
   */
  getPoolDetails(poolName: string): {
    config: PoolConfig
    statistics: PoolStatistics
    connections: Array<{
      id: string
      age: number
      useCount: number
      isHealthy: boolean
      isInUse: boolean
      lastUsed: number
    }>
  } | null {
    const pool = this.pools.get(poolName)
    if (!pool) return null

    const connections = Array.from(pool.connections.values()).map(conn => ({
      id: conn.id,
      age: Date.now() - conn.createdAt,
      useCount: conn.useCount,
      isHealthy: conn.isHealthy,
      isInUse: conn.isInUse,
      lastUsed: conn.lastUsed
    }))

    return {
      config: { ...pool.config },
      statistics: { ...pool.statistics },
      connections
    }
  }

  /**
   * Update pool configuration
   */
  updatePoolConfig(poolName: string, newConfig: Partial<PoolConfig>): boolean {
    const pool = this.pools.get(poolName)
    if (!pool) return false

    pool.config = { ...pool.config, ...newConfig }

    // Restart health checking and reaping with new intervals
    if (newConfig.healthCheckIntervalMs) {
      const interval = this.healthCheckIntervals.get(poolName)
      if (interval) clearInterval(interval)
      this.startHealthChecking(poolName)
    }

    if (newConfig.reapIntervalMs) {
      const interval = this.reapIntervals.get(poolName)
      if (interval) clearInterval(interval)
      this.startConnectionReaping(poolName)
    }

    return true
  }

  /**
   * Close all connections and destroy pool
   */
  async destroyPool(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName)
    if (!pool || pool.isDestroyed) return

    pool.isDestroyed = true

    // Clear intervals
    const healthInterval = this.healthCheckIntervals.get(poolName)
    const reapInterval = this.reapIntervals.get(poolName)

    if (healthInterval) clearInterval(healthInterval)
    if (reapInterval) clearInterval(reapInterval)

    // Reject all waiting requests
    for (const request of pool.waitingQueue) {
      clearTimeout(request.timeout)
      request.reject(new Error('Pool is being destroyed'))
    }
    pool.waitingQueue = []

    // Close all connections
    const connectionIds = Array.from(pool.connections.keys())
    for (const connectionId of connectionIds) {
      await this.destroyConnection(connectionId, poolName)
    }

    this.pools.delete(poolName)
  }

  /**
   * Shutdown all pools
   */
  async shutdown(): Promise<void> {
    const poolNames = Array.from(this.pools.keys())

    for (const poolName of poolNames) {
      await this.destroyPool(poolName)
    }

  }
}

// Singleton instance
export const connectionPoolManager = new ConnectionPoolManager()

// Convenience functions
export const acquireConnection = (
  poolName: string = 'admin',
  userId?: string,
  priority = 0
) => connectionPoolManager.acquireConnection(poolName, userId, priority)

export const releaseConnection = (
  poolName: string,
  client: SupabaseClient
) => connectionPoolManager.releaseConnection(poolName, client)

export const getConnectionStatistics = (poolName?: string) =>
  connectionPoolManager.getPoolStatistics(poolName)

export const getConnectionPoolDetails = (poolName: string) =>
  connectionPoolManager.getPoolDetails(poolName)
