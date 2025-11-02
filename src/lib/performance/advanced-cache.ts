import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { permissionCacheManager } from '@/lib/permissions/permission-cache'

export interface CacheLayerConfig {
  name: string
  ttl: number
  maxSize: number
  strategy: 'memory' | 'redis' | 'hybrid'
  compressionEnabled: boolean
  encryptionEnabled: boolean
  syncEnabled: boolean
}

export interface CacheEntry<T> {
  key: string
  value: T
  metadata: {
    createdAt: number
    lastAccessed: number
    accessCount: number
    ttl: number
    size: number
    version: number
    checksum?: string
    tags?: string[]
  }
}

export interface CacheStats {
  totalEntries: number
  hitRate: number
  missRate: number
  memoryUsage: number
  averageAccessTime: number
  evictionRate: number
  compressionRatio: number
  syncStatus: 'synced' | 'pending' | 'failed'
}

export interface CacheWarmerConfig {
  name: string
  query: string
  params?: any[]
  cacheKey: string
  priority: number
  schedule?: string // cron pattern
  dependencies?: string[]
}

/**
 * Advanced Caching System for Multi-Layer Data Access
 */
export class AdvancedCacheManager {
  private admin = createSupabaseAdminClient()
  private layers: Map<string, Map<string, CacheEntry<any>>> = new Map()
  private layerStats: Map<string, {
    hits: number
    misses: number
    evictions: number
    totalSize: number
    avgAccessTime: number
    compressionSavings: number
  }> = new Map()

  private writeQueue: Array<{
    layer: string
    key: string
    value: any
    ttl: number
    timestamp: number
  }> = []

  private syncInProgress = false

  // Default layer configurations
  private layerConfigs: Record<string, CacheLayerConfig> = {
    'user_data': {
      name: 'User Data Cache',
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 500,
      strategy: 'memory',
      compressionEnabled: false,
      encryptionEnabled: true,
      syncEnabled: true
    },
    'dashboard_data': {
      name: 'Dashboard Data Cache',
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 200,
      strategy: 'memory',
      compressionEnabled: true,
      encryptionEnabled: false,
      syncEnabled: true
    },
    'analytics_data': {
      name: 'Analytics Data Cache',
      ttl: 30 * 60 * 1000, // 30 minutes
      maxSize: 100,
      strategy: 'hybrid',
      compressionEnabled: true,
      encryptionEnabled: false,
      syncEnabled: true
    },
    'lookup_data': {
      name: 'Lookup Data Cache',
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 1000,
      strategy: 'memory',
      compressionEnabled: true,
      encryptionEnabled: false,
      syncEnabled: false
    },
    'query_results': {
      name: 'Query Results Cache',
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 300,
      strategy: 'memory',
      compressionEnabled: true,
      encryptionEnabled: false,
      syncEnabled: true
    },
    'api_responses': {
      name: 'API Responses Cache',
      ttl: 2 * 60 * 1000, // 2 minutes
      maxSize: 400,
      strategy: 'memory',
      compressionEnabled: true,
      encryptionEnabled: false,
      syncEnabled: false
    }
  }

  /**
   * Get value from cache layer with fallback strategy
   */
  async get<T>(
    layerName: string,
    key: string,
    fallback?: () => Promise<T>
  ): Promise<T | null> {
    const startTime = performance.now()

    try {
      const config = this.layerConfigs[layerName]
      if (!config) {
        throw new Error(`Cache layer ${layerName} not found`)
      }

      const cache = this.layers.get(layerName)
      if (!cache) {
        this.recordMiss(layerName)
        return await this.handleFallback(layerName, key, fallback)
      }

      const entry = cache.get(key)
      if (!entry) {
        this.recordMiss(layerName)
        return await this.handleFallback(layerName, key, fallback)
      }

      const now = Date.now()

      // Check TTL
      if (now - entry.metadata.createdAt > entry.metadata.ttl) {
        cache.delete(key)
        this.updateStats(layerName, 'totalSize', -entry.metadata.size)
        this.recordMiss(layerName)
        return await this.handleFallback(layerName, key, fallback)
      }

      // Update access statistics
      entry.metadata.lastAccessed = now
      entry.metadata.accessCount++

      const accessTime = performance.now() - startTime
      this.updateAvgAccessTime(layerName, accessTime)
      this.recordHit(layerName)

      // Verify data integrity if checksum exists
      if (entry.metadata.checksum && !this.verifyChecksum(entry)) {
        cache.delete(key)
        this.recordMiss(layerName)
        return await this.handleFallback(layerName, key, fallback)
      }

      return entry.value
    } catch (error) {
      this.recordMiss(layerName)
      return await this.handleFallback(layerName, key, fallback)
    }
  }

  /**
   * Set value in cache layer with optional encryption
   */
  async set<T>(
    layerName: string,
    key: string,
    value: T,
    customTtl?: number,
    tags?: string[]
  ): Promise<boolean> {
    try {
      const config = this.layerConfigs[layerName]
      if (!config) {
        throw new Error(`Cache layer ${layerName} not found`)
      }

      const cache = this.layers.get(layerName) || new Map()
      this.layers.set(layerName, cache)

      const now = Date.now()
      const ttl = customTtl || config.ttl
      const size = this.calculateSize(value)
      let processedValue = value

      // Apply compression if enabled
      let compressionSavings = 0
      if (config.compressionEnabled) {
        const compressed = this.compressData(value)
        if (compressed.size < size) {
          processedValue = compressed.data
          compressionSavings = size - compressed.size
        }
      }

      // Apply encryption if enabled
      if (config.encryptionEnabled) {
        processedValue = await this.encryptData(processedValue)
      }

      // Check cache size limit
      if (cache.size >= config.maxSize) {
        this.evictLRU(layerName, cache)
      }

      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        metadata: {
          createdAt: now,
          lastAccessed: now,
          accessCount: 1,
          ttl,
          size,
          version: 1,
          checksum: this.generateChecksum(value),
          tags
        }
      }

      cache.set(key, entry)
      this.updateStats(layerName, 'totalSize', size)
      this.updateStats(layerName, 'compressionSavings', compressionSavings)

      // Queue for sync if enabled
      if (config.syncEnabled) {
        this.queueSync(layerName, key, value, ttl)
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get multiple values from cache layer
   */
  async mget<T>(
    layerName: string,
    keys: string[]
  ): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()

    for (const key of keys) {
      const value = await this.get<T>(layerName, key)
      results.set(key, value)
    }

    return results
  }

  /**
   * Set multiple values in cache layer
   */
  async mset<T>(
    layerName: string,
    entries: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<number> {
    let successCount = 0

    for (const entry of entries) {
      const success = await this.set(layerName, entry.key, entry.value, entry.ttl)
      if (success) successCount++
    }

    return successCount
  }

  /**
   * Invalidate cache entries by pattern or tags
   */
  async invalidate(
    layerName: string,
    pattern?: string | RegExp,
    tags?: string[]
  ): Promise<number> {
    const cache = this.layers.get(layerName)
    if (!cache) return 0

    let invalidatedCount = 0
    const keysToDelete: string[] = []

    for (const [key, entry] of Array.from(cache.entries())) {
      let shouldDelete = false

      // Pattern matching
      if (pattern) {
        if (typeof pattern === 'string') {
          shouldDelete = key.includes(pattern)
        } else if (pattern instanceof RegExp) {
          shouldDelete = pattern.test(key)
        }
      }

      // Tag matching
      if (!shouldDelete && tags && entry.metadata.tags) {
        shouldDelete = tags.some(tag => entry.metadata.tags!.includes(tag))
      }

      if (shouldDelete) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      const entry = cache.get(key)
      if (entry) {
        cache.delete(key)
        this.updateStats(layerName, 'totalSize', -entry.metadata.size)
        invalidatedCount++
      }
    })

    return invalidatedCount
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(layerName?: string): Map<string, CacheStats> {
    const stats = new Map<string, CacheStats>()

    const layers = layerName ? [layerName] : Array.from(this.layers.keys())

    for (const name of layers) {
      const cache = this.layers.get(name)
      const layerStats = this.layerStats.get(name)
      const config = this.layerConfigs[name]

      if (!cache || !layerStats || !config) continue

      const totalRequests = layerStats.hits + layerStats.misses
      const hitRate = totalRequests > 0 ? (layerStats.hits / totalRequests) * 100 : 0
      const missRate = totalRequests > 0 ? (layerStats.misses / totalRequests) * 100 : 0
      const evictionRate = cache.size > 0 ? (layerStats.evictions / cache.size) * 100 : 0

      stats.set(name, {
        totalEntries: cache.size,
        hitRate: Math.round(hitRate * 100) / 100,
        missRate: Math.round(missRate * 100) / 100,
        memoryUsage: layerStats.totalSize,
        averageAccessTime: Math.round(layerStats.avgAccessTime * 1000) / 1000,
        evictionRate: Math.round(evictionRate * 100) / 100,
        compressionRatio: layerStats.compressionSavings > 0 ?
          Math.round((layerStats.compressionSavings / layerStats.totalSize) * 100) : 0,
        syncStatus: this.syncInProgress ? 'pending' : 'synced'
      })
    }

    return stats
  }

  /**
   * Warm up cache with predefined data
   */
  async warmUpLayer(layerName: string, configs: CacheWarmerConfig[]): Promise<void> {

    const sortedConfigs = configs.sort((a, b) => b.priority - a.priority)

    for (const config of sortedConfigs) {
      try {
        const startTime = performance.now()

        // Execute query to get fresh data
        const { data } = await this.admin
          .from(config.cacheKey.split(':')[0] || 'users')
          .select('*')
          .limit(100) // Limit for performance

        if (data) {
          await this.set(layerName, config.cacheKey, data)
        }
      } catch (error) {
      }
    }
  }

  /**
   * Preload user-specific cache data
   */
  async preloadUserData(userId: string): Promise<void> {
    const preloadConfigs = [
      {
        query: 'profile',
        cacheKey: `user:${userId}:profile`,
        priority: 1
      },
      {
        query: 'permissions',
        cacheKey: `user:${userId}:permissions`,
        priority: 2
      },
      {
        query: 'recent_activity',
        cacheKey: `user:${userId}:activity`,
        priority: 3
      },
      {
        query: 'preferences',
        cacheKey: `user:${userId}:preferences`,
        priority: 4
      }
    ]

    for (const config of preloadConfigs) {
      try {
        switch (config.query) {
          case 'profile':
            const { data: profile } = await this.admin
              .from('users')
              .select('*')
              .eq('id', userId)
              .single()
            if (profile) {
              await this.set('user_data', config.cacheKey, profile)
            }
            break

          case 'permissions':
            // Use existing permission cache
            const permissions = await permissionCacheManager.get('user_permissions', userId)
            if (permissions) {
              await this.set('user_data', config.cacheKey, permissions)
            }
            break

          case 'recent_activity':
            const { data: activity } = await this.admin
              .from('audit_trail')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(10)
            if (activity) {
              await this.set('user_data', config.cacheKey, activity)
            }
            break

          case 'preferences':
            const { data: preferences } = await this.admin
              .from('user_preferences')
              .select('*')
              .eq('user_id', userId)
              .single()
            if (preferences) {
              await this.set('user_data', config.cacheKey, preferences)
            }
            break
        }
      } catch (error) {
      }
    }
  }

  /**
   * Create cache warming configurations for common data
   */
  createWarmUpConfigs(): CacheWarmerConfig[] {
    return [
      {
        name: 'Active Users',
        query: 'SELECT * FROM users WHERE status = $1',
        params: ['active'],
        cacheKey: 'system:active_users',
        priority: 1,
        schedule: '*/5 * * * *' // Every 5 minutes
      },
      {
        name: 'System Statistics',
        query: 'SELECT COUNT(*) as total_users FROM users',
        cacheKey: 'system:stats',
        priority: 2,
        schedule: '*/10 * * * *' // Every 10 minutes
      },
      {
        name: 'Common Lookups',
        query: 'SELECT * FROM lookup_tables',
        cacheKey: 'system:lookups',
        priority: 3,
        schedule: '0 */2 * * *' // Every 2 hours
      },
      {
        name: 'Dashboard Analytics',
        query: 'SELECT * FROM analytics_summary',
        cacheKey: 'dashboard:analytics',
        priority: 1,
        schedule: '*/15 * * * *' // Every 15 minutes
      }
    ]
  }

  /**
   * Optimize cache performance
   */
  optimize(): {
    layersOptimized: string[]
    memoryFreed: number
    entriesRemoved: number
    compressionImproved: boolean
  } {
    const layersOptimized: string[] = []
    let totalMemoryFreed = 0
    let totalEntriesRemoved = 0
    let compressionImproved = false

    for (const [layerName, config] of Object.entries(this.layerConfigs)) {
      const cache = this.layers.get(layerName)
      if (!cache) continue

      let memoryFreed = 0
      let entriesRemoved = 0

      // Remove expired entries
      for (const [key, entry] of Array.from(cache.entries())) {
        if (Date.now() - entry.metadata.createdAt > entry.metadata.ttl) {
          cache.delete(key)
          memoryFreed += entry.metadata.size
          entriesRemoved++
        }
      }

      // Apply compression to uncompressed entries if beneficial
      if (config.compressionEnabled) {
        for (const [key, entry] of Array.from(cache.entries())) {
          if (entry.metadata.size > 1024) { // Only compress entries > 1KB
            const compressed = this.compressData(entry.value)
            if (compressed.size < entry.metadata.size) {
              entry.value = compressed.data
              entry.metadata.size = compressed.size
              compressionImproved = true
            }
          }
        }
      }

      // Maintain LRU order
      if (cache.size > config.maxSize * 0.8) {
        const targetSize = Math.floor(config.maxSize * 0.7)
        while (cache.size > targetSize) {
          this.evictLRU(layerName, cache)
          entriesRemoved++
        }
      }

      if (memoryFreed > 0 || entriesRemoved > 0) {
        layersOptimized.push(layerName)
        totalMemoryFreed += memoryFreed
        totalEntriesRemoved += entriesRemoved
      }
    }

    return {
      layersOptimized,
      memoryFreed: totalMemoryFreed,
      entriesRemoved: totalEntriesRemoved,
      compressionImproved
    }
  }

  /**
   * Export cache data for backup
   */
  exportCache(layerName?: string): Array<{
    layer: string
    entries: Array<{ key: string; value: any; metadata: any }>
  }> {
    const exportData: Array<{
      layer: string
      entries: Array<{ key: string; value: any; metadata: any }>
    }> = []

    const layers = layerName ? [layerName] : Array.from(this.layers.keys())

    for (const name of layers) {
      const cache = this.layers.get(name)
      if (!cache) continue

      const entries = Array.from(cache.entries()).map(([key, entry]) => ({
        key,
        value: entry.value,
        metadata: entry.metadata
      }))

      exportData.push({
        layer: name,
        entries
      })
    }

    return exportData
  }

  // Private helper methods
  private async handleFallback<T>(
    layerName: string,
    key: string,
    fallback?: () => Promise<T>
  ): Promise<T | null> {
    if (!fallback) return null

    try {
      const value = await fallback()
      if (value !== null && value !== undefined) {
        await this.set(layerName, key, value)
      }
      return value
    } catch (error) {
      return null
    }
  }

  private evictLRU(layerName: string, cache: Map<string, CacheEntry<any>>): void {
    let lruKey: string | null = null
    let oldestAccess = Date.now()

    for (const [key, entry] of Array.from(cache.entries())) {
      if (entry.metadata.lastAccessed < oldestAccess) {
        oldestAccess = entry.metadata.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      const entry = cache.get(lruKey)!
      cache.delete(lruKey)
      this.updateStats(layerName, 'totalSize', -entry.metadata.size)
      this.updateStats(layerName, 'evictions', 1)
    }
  }

  private queueSync(layerName: string, key: string, value: any, ttl: number): void {
    this.writeQueue.push({
      layer: layerName,
      key,
      value,
      ttl,
      timestamp: Date.now()
    })

    // Process sync queue if not already running
    if (!this.syncInProgress) {
      this.processSyncQueue()
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.writeQueue.length === 0) return

    this.syncInProgress = true

    try {
      while (this.writeQueue.length > 0) {
        const batch = this.writeQueue.splice(0, 10) // Process in batches of 10

        // In a real implementation, this would sync to external storage
        // For now, we'll just log the sync operation

        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    } catch (error) {
    } finally {
      this.syncInProgress = false
    }
  }

  private compressData(data: any): { data: any; size: number } {
    try {
      const serialized = JSON.stringify(data)
      // Simple compression simulation - in production use proper compression
      const compressed = serialized.replace(/\s+/g, ' ').trim()
      return {
        data: JSON.parse(compressed),
        size: compressed.length
      }
    } catch {
      return { data, size: this.calculateSize(data) }
    }
  }

  private async encryptData(data: any): Promise<any> {
    // Simple encryption simulation - in production use proper encryption
    return {
      encrypted: true,
      data: btoa(JSON.stringify(data))
    }
  }

  private generateChecksum(data: any): string {
    const serialized = JSON.stringify(data)
    // Simple checksum - in production use proper hash function
    return serialized.length.toString(36)
  }

  private verifyChecksum(entry: CacheEntry<any>): boolean {
    if (!entry.metadata.checksum) return true

    const expectedChecksum = this.generateChecksum(entry.value)
    return entry.metadata.checksum === expectedChecksum
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2 // Assume 2 bytes per character
    } catch {
      return 100
    }
  }

  private recordHit(layerName: string): void {
    if (!this.layerStats.has(layerName)) {
      this.layerStats.set(layerName, {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        avgAccessTime: 0,
        compressionSavings: 0
      })
    }
    const stats = this.layerStats.get(layerName)!
    stats.hits++
  }

  private recordMiss(layerName: string): void {
    if (!this.layerStats.has(layerName)) {
      this.layerStats.set(layerName, {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        avgAccessTime: 0,
        compressionSavings: 0
      })
    }
    const stats = this.layerStats.get(layerName)!
    stats.misses++
  }

  private updateStats(layerName: string, field: 'totalSize' | 'evictions' | 'compressionSavings', delta: number): void {
    if (!this.layerStats.has(layerName)) {
      this.layerStats.set(layerName, {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        avgAccessTime: 0,
        compressionSavings: 0
      })
    }
    const stats = this.layerStats.get(layerName)!
    stats[field] += delta
  }

  private updateAvgAccessTime(layerName: string, accessTime: number): void {
    if (!this.layerStats.has(layerName)) {
      this.layerStats.set(layerName, {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        avgAccessTime: 0,
        compressionSavings: 0
      })
    }
    const stats = this.layerStats.get(layerName)!
    stats.avgAccessTime = (stats.avgAccessTime + accessTime) / 2
  }
}

// Singleton instance
export const advancedCacheManager = new AdvancedCacheManager()

// Convenience functions
export const getCachedData = <T>(layerName: string, key: string, fallback?: () => Promise<T>) =>
  advancedCacheManager.get<T>(layerName, key, fallback)

export const setCachedData = <T>(layerName: string, key: string, value: T, ttl?: number) =>
  advancedCacheManager.set<T>(layerName, key, value, ttl)

export const invalidateCachedData = (layerName: string, pattern?: string | RegExp, tags?: string[]) =>
  advancedCacheManager.invalidate(layerName, pattern, tags)

export const preloadUserData = (userId: string) =>
  advancedCacheManager.preloadUserData(userId)

export const getCacheStats = (layerName?: string) =>
  advancedCacheManager.getStats(layerName)