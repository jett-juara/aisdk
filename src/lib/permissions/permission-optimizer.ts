import { cache } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface PermissionQueryOptimization {
  userId?: string
  resource?: string
  action?: string
  useCache?: boolean
  includeInactive?: boolean
}

export interface OptimizedPermissionResult {
  hasPermission: boolean
  permissions: string[]
  grantedAt?: string
  cached?: boolean
  cacheExpiry?: string
}

export interface PermissionPerformanceMetrics {
  queryTime: number
  cacheHitRate: number
  averageQueryTime: number
  totalQueries: number
  slowQueries: Array<{
    query: string
    time: number
    timestamp: string
  }>
}

export class PermissionOptimizer {
  private admin = createSupabaseAdminClient()
  private queryMetrics: Map<string, number[]> = new Map()
  private cacheHits = 0
  private totalQueries = 0

  // Cache for frequently accessed permissions
  private permissionCache = new Map<string, {
    permissions: string[]
    grantedAt: string
    expiresAt: string
  }>()

  // Cache TTL: 5 minutes for permissions
  private readonly CACHE_TTL = 5 * 60 * 1000

  /**
   * Optimized permission check with caching
   */
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    options: PermissionQueryOptimization = {}
  ): Promise<OptimizedPermissionResult> {
    const startTime = performance.now()
    const cacheKey = this.getCacheKey(userId, resource, action)

    // Check cache first
    if (options.useCache !== false) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.cacheHits++
        this.totalQueries++
        this.recordQueryTime('cache_check', performance.now() - startTime)

        const hasPermission = this.evaluatePermission(cached.permissions, resource, action)

        return {
          hasPermission,
          permissions: cached.permissions,
          grantedAt: cached.grantedAt,
          cached: true,
          cacheExpiry: cached.expiresAt
        }
      }
    }

    // Query database with optimized approach
    const result = await this.queryPermissionsOptimized(userId, resource, action, options)
    const queryTime = performance.now() - startTime

    this.totalQueries++
    this.recordQueryTime('permission_query', queryTime)

    // Cache the result
    if (options.useCache !== false && result.permissions.length > 0) {
      this.setCache(cacheKey, result.permissions)
    }

    return {
      hasPermission: result.hasPermission,
      permissions: result.permissions,
      grantedAt: new Date().toISOString(),
      cached: false
    }
  }

  /**
   * Batch permission check for multiple resources/actions
   */
  async checkMultiplePermissions(
    userId: string,
    checks: Array<{ resource: string; action: string }>,
    options: PermissionQueryOptimization = {}
  ): Promise<Array<{ resource: string; action: string; hasPermission: boolean }>> {
    // First, check cache for all requests
    const uncachedChecks: Array<{ resource: string; action: string; index: number }> = []
    const results: Array<{ resource: string; action: string; hasPermission: boolean }> = new Array(checks.length)

    checks.forEach((check, index) => {
      const cacheKey = this.getCacheKey(userId, check.resource, check.action)
      const cached = this.getFromCache(cacheKey)

      if (cached && options.useCache !== false) {
        results[index] = {
          ...check,
          hasPermission: this.evaluatePermission(cached.permissions, check.resource, check.action)
        }
      } else {
        uncachedChecks.push({ ...check, index })
      }
    })

    // Batch query for uncached permissions
    if (uncachedChecks.length > 0) {
      const batchResults = await this.queryBatchPermissions(userId, uncachedChecks, options)

      uncachedChecks.forEach((check, index) => {
        const result = batchResults[index]
        results[check.index] = {
          ...check,
          hasPermission: result.hasPermission
        }

        // Cache individual results
        if (options.useCache !== false && result.permissions.length > 0) {
          const cacheKey = this.getCacheKey(userId, check.resource, check.action)
          this.setCache(cacheKey, result.permissions)
        }
      })
    }

    return results
  }

  /**
   * Get all permissions for a user with optimization
   */
  async getUserPermissions(
    userId: string,
    options: PermissionQueryOptimization = {}
  ): Promise<string[]> {
    const startTime = performance.now()
    const cacheKey = `user_permissions:${userId}`

    // Check cache
    if (options.useCache !== false) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.cacheHits++
        this.totalQueries++
        return cached.permissions
      }
    }

    // Optimized database query
    const permissions = await this.queryUserPermissionsOptimized(userId, options)
    const queryTime = performance.now() - startTime

    this.totalQueries++
    this.recordQueryTime('user_permissions_query', queryTime)

    // Cache result
    if (options.useCache !== false) {
      this.setCache(cacheKey, permissions)
    }

    return permissions
  }

  /**
   * Invalidate permission cache for a user
   */
  invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = []

    for (const [key] of Array.from(this.permissionCache.entries())) {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.permissionCache.delete(key))
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PermissionPerformanceMetrics {
    const allQueryTimes = Array.from(this.queryMetrics.values()).flat()
    const averageQueryTime = allQueryTimes.length > 0
      ? allQueryTimes.reduce((sum, time) => sum + time, 0) / allQueryTimes.length
      : 0

    const slowQueries = allQueryTimes
      .filter(time => time > 100) // Queries over 100ms
      .map((time, index) => ({
        query: `Query ${index + 1}`,
        time,
        timestamp: new Date().toISOString()
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10)

    return {
      queryTime: averageQueryTime,
      cacheHitRate: this.totalQueries > 0 ? (this.cacheHits / this.totalQueries) * 100 : 0,
      averageQueryTime,
      totalQueries: this.totalQueries,
      slowQueries
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    const now = Date.now()
    let clearedCount = 0

    for (const [key, value] of Array.from(this.permissionCache.entries())) {
      if (new Date(value.expiresAt).getTime() < now) {
        this.permissionCache.delete(key)
        clearedCount++
      }
    }

    return clearedCount
  }

  /**
   * Preload commonly accessed permissions
   */
  async preloadPermissions(userIds: string[]): Promise<void> {
    const startTime = performance.now()

    // Batch query for all users
    const { data, error } = await this.admin
      .from('user_permissions')
      .select('user_id, page_key, feature_key, access_granted')
      .in('user_id', userIds)
      .eq('access_granted', true)

    if (error) {
      return
    }

    // Group by user and cache
    const userPermissions: Record<string, string[]> = {}
    data?.forEach(perm => {
      if (!userPermissions[perm.user_id]) {
        userPermissions[perm.user_id] = []
      }
      userPermissions[perm.user_id].push(
        `${perm.page_key}.${perm.feature_key}`
      )
    })

    // Cache each user's permissions
    Object.entries(userPermissions).forEach(([userId, permissions]) => {
      const cacheKey = `user_permissions:${userId}`
      this.setCache(cacheKey, permissions)
    })

    const loadTime = performance.now() - startTime
  }

  /**
   * Optimize database with indexes and cleanup
   */
  async optimizeDatabase(): Promise<{
    indexesCreated: string[]
    tablesOptimized: string[]
    cleanupStats: { orphanedRecords: number; expiredCache: number }
  }> {
    const indexesCreated: string[] = []
    const tablesOptimized: string[] = []

    try {
      // Create optimized indexes
      const indexQueries = [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_user_access ON user_permissions(user_id, access_granted)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_page_feature ON user_permissions(page_key, feature_key)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_composite ON user_permissions(user_id, page_key, feature_key, access_granted)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_updated_at ON user_permissions(updated_at DESC)',
        'ANALYZE user_permissions'
      ]

      for (const query of indexQueries) {
        try {
          await this.admin.rpc('execute_sql', { query: query })
          if (query.includes('CREATE INDEX')) {
            indexesCreated.push(query.match(/idx_\w+/)?.[0] || 'unknown')
          } else if (query.includes('ANALYZE')) {
            tablesOptimized.push('user_permissions')
          }
        } catch (error) {
        }
      }

      // Cleanup orphaned permission records
      const { data: orphanedRecords } = await this.admin
        .rpc('cleanup_orphaned_permissions')

      // Clear expired cache
      const expiredCache = this.clearExpiredCache()

      return {
        indexesCreated,
        tablesOptimized,
        cleanupStats: {
          orphanedRecords: orphanedRecords || 0,
          expiredCache
        }
      }
    } catch (error) {
      return {
        indexesCreated: [],
        tablesOptimized: [],
        cleanupStats: { orphanedRecords: 0, expiredCache: 0 }
      }
    }
  }

  // Private helper methods
  private getCacheKey(userId: string, resource: string, action: string): string {
    return `permission:${userId}:${resource}:${action}`
  }

  private getFromCache(key: string): { permissions: string[]; grantedAt: string; expiresAt: string } | null {
    const cached = this.permissionCache.get(key)
    if (!cached) return null

    // Check if expired
    if (new Date(cached.expiresAt).getTime() < Date.now()) {
      this.permissionCache.delete(key)
      return null
    }

    return cached
  }

  private setCache(key: string, permissions: string[]): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.CACHE_TTL)

    this.permissionCache.set(key, {
      permissions,
      grantedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    })
  }

  private evaluatePermission(permissions: string[], resource: string, action: string): boolean {
    // Check for exact match
    if (permissions.includes(`${resource}.${action}`)) {
      return true
    }

    // Check for wildcard resource permissions
    if (permissions.includes(`*.${action}`)) {
      return true
    }

    // Check for wildcard action permissions
    if (permissions.includes(`${resource}.*`)) {
      return true
    }

    // Check for admin permissions
    if (permissions.includes('admin.*') || permissions.includes('*.*')) {
      return true
    }

    return false
  }

  private async queryPermissionsOptimized(
    userId: string,
    resource: string,
    action: string,
    options: PermissionQueryOptimization
  ): Promise<{ hasPermission: boolean; permissions: string[] }> {
    try {
      // Use a single optimized query
      const { data, error } = await this.admin
        .from('user_permissions')
        .select('page_key, feature_key')
        .eq('user_id', userId)
        .eq('access_granted', true)

      if (error) throw error

      const permissions = (data || []).map(perm => `${perm.page_key}.${perm.feature_key}`)
      const hasPermission = this.evaluatePermission(permissions, resource, action)

      return { hasPermission, permissions }
    } catch (error) {
      return { hasPermission: false, permissions: [] }
    }
  }

  private async queryBatchPermissions(
    userId: string,
    checks: Array<{ resource: string; action: string; index: number }>,
    options: PermissionQueryOptimization
  ): Promise<Array<{ hasPermission: boolean; permissions: string[] }>> {
    try {
      // Get all permissions for the user once
      const { data, error } = await this.admin
        .from('user_permissions')
        .select('page_key, feature_key')
        .eq('user_id', userId)
        .eq('access_granted', true)

      if (error) throw error

      const permissions = (data || []).map(perm => `${perm.page_key}.${perm.feature_key}`)

      // Evaluate each check against the permissions
      return checks.map(check => ({
        hasPermission: this.evaluatePermission(permissions, check.resource, check.action),
        permissions
      }))
    } catch (error) {
      return checks.map(() => ({ hasPermission: false, permissions: [] }))
    }
  }

  private async queryUserPermissionsOptimized(
    userId: string,
    options: PermissionQueryOptimization
  ): Promise<string[]> {
    try {
      const { data, error } = await this.admin
        .from('user_permissions')
        .select('page_key, feature_key')
        .eq('user_id', userId)
        .eq('access_granted', true)

      if (error) throw error

      return (data || []).map(perm => `${perm.page_key}.${perm.feature_key}`)
    } catch (error) {
      return []
    }
  }

  private recordQueryTime(queryType: string, time: number): void {
    if (!this.queryMetrics.has(queryType)) {
      this.queryMetrics.set(queryType, [])
    }
    this.queryMetrics.get(queryType)!.push(time)

    // Keep only last 100 measurements per query type
    const times = this.queryMetrics.get(queryType)!
    if (times.length > 100) {
      times.splice(0, times.length - 100)
    }
  }
}

// Singleton instance
export const permissionOptimizer = new PermissionOptimizer()

// React cache for server-side permission checking
export const checkPermission = cache(async (
  userId: string,
  resource: string,
  action: string,
  options?: PermissionQueryOptimization
) => {
  return permissionOptimizer.checkPermission(userId, resource, action, options)
})

export const getUserPermissions = cache(async (userId: string, options?: PermissionQueryOptimization) => {
  return permissionOptimizer.getUserPermissions(userId, options)
})