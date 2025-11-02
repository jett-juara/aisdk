import { permissionOptimizer } from './permission-optimizer'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface CacheStrategy {
  name: string
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'random'
  compressionEnabled: boolean
  preloadEnabled: boolean
}

export interface CacheEntry<T> {
  key: string
  value: T
  createdAt: number
  lastAccessed: number
  accessCount: number
  size: number
  ttl: number
  metadata?: any
}

export interface CacheStats {
  totalEntries: number
  hitRate: number
  missRate: number
  evictionRate: number
  memoryUsage: number
  averageEntrySize: number
  oldestEntry: number
  newestEntry: number
}

export class PermissionCacheManager {
  private admin = createSupabaseAdminClient()
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map()
  private cacheStats: Map<string, {
    hits: number
    misses: number
    evictions: number
    totalSize: number
  }> = new Map()

  // Default cache strategies
  private strategies: Record<string, CacheStrategy> = {
    'user_permissions': {
      name: 'User Permissions Cache',
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      evictionPolicy: 'lru',
      compressionEnabled: false,
      preloadEnabled: true
    },
    'role_permissions': {
      name: 'Role Permissions Cache',
      ttl: 30 * 60 * 1000, // 30 minutes
      maxSize: 100,
      evictionPolicy: 'lfu',
      compressionEnabled: false,
      preloadEnabled: false
    },
    'resource_permissions': {
      name: 'Resource Permissions Cache',
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 500,
      evictionPolicy: 'lru',
      compressionEnabled: false,
      preloadEnabled: false
    },
    'session_permissions': {
      name: 'Session Permissions Cache',
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 200,
      evictionPolicy: 'ttl',
      compressionEnabled: false,
      preloadEnabled: false
    }
  }

  /**
   * Get value from cache
   */
  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName)
    if (!cache) return null

    const entry = cache.get(key)
    if (!entry) {
      this.recordMiss(cacheName)
      return null
    }

    const now = Date.now()

    // Check if expired
    if (now - entry.createdAt > entry.ttl) {
      cache.delete(key)
      this.updateStats(cacheName, 'totalSize', -entry.size)
      this.recordMiss(cacheName)
      return null
    }

    // Update access statistics
    entry.lastAccessed = now
    entry.accessCount++

    this.recordHit(cacheName)
    return entry.value
  }

  /**
   * Set value in cache
   */
  set<T>(cacheName: string, key: string, value: T, customTtl?: number): boolean {
    const strategy = this.strategies[cacheName]
    if (!strategy) return false

    const cache = this.caches.get(cacheName)
    if (!cache) {
      this.caches.set(cacheName, new Map())
      return this.set(cacheName, key, value, customTtl)
    }

    const now = Date.now()
    const ttl = customTtl || strategy.ttl
    const size = this.calculateSize(value)

    // Check if we need to evict entries
    if (cache.size >= strategy.maxSize) {
      this.evict(cacheName, strategy)
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      size,
      ttl
    }

    cache.set(key, entry)
    this.updateStats(cacheName, 'totalSize', size)

    return true
  }

  /**
   * Delete entry from cache
   */
  delete(cacheName: string, key: string): boolean {
    const cache = this.caches.get(cacheName)
    if (!cache) return false

    const entry = cache.get(key)
    if (!entry) return false

    cache.delete(key)
    this.updateStats(cacheName, 'totalSize', -entry.size)
    return true
  }

  /**
   * Clear entire cache
   */
  clear(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    if (cache) {
      cache.clear()
      this.updateStats(cacheName, 'totalSize', 0)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(cacheName: string): CacheStats | null {
    const cache = this.caches.get(cacheName)
    const stats = this.cacheStats.get(cacheName)
    const strategy = this.strategies[cacheName]

    if (!cache || !stats || !strategy) return null

    const totalRequests = stats.hits + stats.misses
    const hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0
    const missRate = totalRequests > 0 ? (stats.misses / totalRequests) * 100 : 0
    const evictionRate = cache.size > 0 ? (stats.evictions / cache.size) * 100 : 0

    let oldestEntry = 0
    let newestEntry = 0

    for (const entry of cache.values()) {
      if (oldestEntry === 0 || entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt
      }
      if (newestEntry === 0 || entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt
      }
    }

    return {
      totalEntries: cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      evictionRate: Math.round(evictionRate * 100) / 100,
      memoryUsage: stats.totalSize,
      averageEntrySize: cache.size > 0 ? stats.totalSize / cache.size : 0,
      oldestEntry,
      newestEntry
    }
  }

  /**
   * Preload cache with common data
   */
  async preload(cacheName: string): Promise<void> {
    const strategy = this.strategies[cacheName]
    if (!strategy || !strategy.preloadEnabled) return

    switch (cacheName) {
      case 'user_permissions':
        await this.preloadUserPermissions()
        break
      case 'role_permissions':
        await this.preloadRolePermissions()
        break
      case 'resource_permissions':
        await this.preloadResourcePermissions()
        break
    }
  }

  /**
   * Warm up cache for specific users
   */
  async warmupUserCache(userIds: string[]): Promise<void> {
    try {
      // Preload permissions for specified users
      await permissionOptimizer.preloadPermissions(userIds)

    } catch (error) {
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(cacheName: string, pattern: string | RegExp): number {
    const cache = this.caches.get(cacheName)
    if (!cache) return 0

    let invalidatedCount = 0
    const keysToDelete: string[] = []

    for (const [key] of Array.from(cache.entries())) {
      let shouldDelete = false

      if (typeof pattern === 'string') {
        shouldDelete = key.includes(pattern)
      } else if (pattern instanceof RegExp) {
        shouldDelete = pattern.test(key)
      }

      if (shouldDelete) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      if (this.delete(cacheName, key)) {
        invalidatedCount++
      }
    })

    return invalidatedCount
  }

  /**
   * Export cache data for backup/analysis
   */
  exportCache(cacheName: string): Array<{ key: string; value: any; metadata: any }> {
    const cache = this.caches.get(cacheName)
    if (!cache) return []

    return Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      value: entry.value,
      metadata: {
        createdAt: entry.createdAt,
        lastAccessed: entry.lastAccessed,
        accessCount: entry.accessCount,
        ttl: entry.ttl
      }
    }))
  }

  /**
   * Import cache data
   */
  importCache(cacheName: string, data: Array<{ key: string; value: any; metadata?: any }>): number {
    let importedCount = 0

    for (const item of data) {
      if (this.set(cacheName, item.key, item.value, item.metadata?.ttl)) {
        importedCount++
      }
    }

    return importedCount
  }

  /**
   * Optimize cache performance
   */
  optimize(): {
    cachesOptimized: string[]
    memoryFreed: number
    entriesRemoved: number
  } {
    const cachesOptimized: string[] = []
    let totalMemoryFreed = 0
    let totalEntriesRemoved = 0

    for (const [cacheName, strategy] of Object.entries(this.strategies)) {
      const cache = this.caches.get(cacheName)
      if (!cache) continue

      let memoryFreed = 0
      let entriesRemoved = 0

      // Remove expired entries
      for (const [key, entry] of Array.from(cache.entries())) {
        if (Date.now() - entry.createdAt > entry.ttl) {
          cache.delete(key)
          memoryFreed += entry.size
          entriesRemoved++
        }
      }

      // If still over limit, evict based on strategy
      if (cache.size > strategy.maxSize) {
        const targetSize = Math.floor(strategy.maxSize * 0.8) // Reduce to 80%
        while (cache.size > targetSize) {
          this.evict(cacheName, strategy)
          entriesRemoved++
        }
      }

      if (memoryFreed > 0 || entriesRemoved > 0) {
        cachesOptimized.push(cacheName)
        totalMemoryFreed += memoryFreed
        totalEntriesRemoved += entriesRemoved
      }
    }

    return {
      cachesOptimized,
      memoryFreed: totalMemoryFreed,
      entriesRemoved: totalEntriesRemoved
    }
  }

  // Private helper methods
  private evict(cacheName: string, strategy: CacheStrategy): void {
    const cache = this.caches.get(cacheName)
    if (!cache || cache.size === 0) return

    let keyToDelete: string | null = null
    const entries = Array.from(cache.entries())

    switch (strategy.evictionPolicy) {
      case 'lru': // Least Recently Used
        entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
        keyToDelete = entries[0][0]
        break

      case 'lfu': // Least Frequently Used
        entries.sort(([, a], [, b]) => a.accessCount - b.accessCount)
        keyToDelete = entries[0][0]
        break

      case 'ttl': // Shortest TTL
        entries.sort(([, a], [, b]) => a.ttl - b.ttl)
        keyToDelete = entries[0][0]
        break

      case 'random': // Random
        const randomIndex = Math.floor(Math.random() * entries.length)
        keyToDelete = entries[randomIndex][0]
        break
    }

    if (keyToDelete) {
      const entry = cache.get(keyToDelete)
      if (entry) {
        cache.delete(keyToDelete)
        this.updateStats(cacheName, 'totalSize', -entry.size)
        this.updateStats(cacheName, 'evictions', 1)
      }
    }
  }

  private async preloadUserPermissions(): Promise<void> {
    try {
      // Get active users with recent activity
      const { data: activeUsers } = await this.admin
        .from('users')
        .select('id')
        .eq('status', 'active')
        .gte('last_sign_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(100)

      if (activeUsers) {
        await permissionOptimizer.preloadPermissions(activeUsers.map(u => u.id))
      }
    } catch (error) {
    }
  }

  private async preloadRolePermissions(): Promise<void> {
    try {
      // Get role-based permissions
      const { data: rolePermissions } = await this.admin
        .from('role_permissions')
        .select('*')

      if (rolePermissions) {
        const cache = this.caches.get('role_permissions') || new Map()
        this.caches.set('role_permissions', cache)

        rolePermissions.forEach(rp => {
          const key = `${rp.role}:${rp.permission}`
          this.set('role_permissions', key, true)
        })
      }
    } catch (error) {
    }
  }

  private async preloadResourcePermissions(): Promise<void> {
    try {
      // Get common resource permissions
      const { data: resourcePermissions } = await this.admin
        .from('resource_permissions')
        .select('*')
        .limit(200)

      if (resourcePermissions) {
        const cache = this.caches.get('resource_permissions') || new Map()
        this.caches.set('resource_permissions', cache)

        resourcePermissions.forEach(rp => {
          const key = `${rp.resource}:${rp.action}`
          this.set('resource_permissions', key, rp.allowed)
        })
      }
    } catch (error) {
    }
  }

  private calculateSize(value: any): number {
    // Rough estimation of memory size
    try {
      return JSON.stringify(value).length * 2 // Assume 2 bytes per character
    } catch {
      return 100 // Default size for non-serializable objects
    }
  }

  private recordHit(cacheName: string): void {
    if (!this.cacheStats.has(cacheName)) {
      this.cacheStats.set(cacheName, { hits: 0, misses: 0, evictions: 0, totalSize: 0 })
    }
    const stats = this.cacheStats.get(cacheName)!
    stats.hits++
  }

  private recordMiss(cacheName: string): void {
    if (!this.cacheStats.has(cacheName)) {
      this.cacheStats.set(cacheName, { hits: 0, misses: 0, evictions: 0, totalSize: 0 })
    }
    const stats = this.cacheStats.get(cacheName)!
    stats.misses++
  }

  private updateStats(cacheName: string, field: 'totalSize' | 'evictions', delta: number): void {
    if (!this.cacheStats.has(cacheName)) {
      this.cacheStats.set(cacheName, { hits: 0, misses: 0, evictions: 0, totalSize: 0 })
    }
    const stats = this.cacheStats.get(cacheName)!
    stats[field] += delta
  }
}

// Singleton instance
export const permissionCacheManager = new PermissionCacheManager()

// Convenience functions
export const getCachedPermission = (cacheName: string, key: string) =>
  permissionCacheManager.get(cacheName, key)

export const setCachedPermission = <T>(cacheName: string, key: string, value: T, ttl?: number) =>
  permissionCacheManager.set(cacheName, key, value, ttl)

export const invalidateCachedPermissions = (cacheName: string, pattern: string | RegExp) =>
  permissionCacheManager.invalidatePattern(cacheName, pattern)