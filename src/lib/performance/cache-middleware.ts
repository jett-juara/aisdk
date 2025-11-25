import { NextRequest, NextResponse } from 'next/server'
import { queryCacheWrapper, apiCacheWrapper } from './cache-wrapper'
import { advancedCacheManager } from './advanced-cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface CacheMiddlewareConfig {
  enabled: boolean
  defaultTTL: number
  maxCacheSize: number
  respectAuth: boolean
  cacheKeyGenerator?: (url: string, method: string, body?: any) => string
  cacheInvalidationRules: Array<{
    pattern: string
    invalidate: string[]
    delay?: number
  }>
  warmingRules: Array<{
    pattern: string
    queries: Array<{
      table: string
      query: string
      params?: any[]
    }>
    priority: number
  }>
}

/**
 * Cache middleware for automatic request caching and invalidation
 */
export class CacheMiddleware {
  private admin = createSupabaseAdminClient()
  private config: CacheMiddlewareConfig
  private warmingInProgress = false

  constructor(config: Partial<CacheMiddlewareConfig> = {}) {
    this.config = {
      enabled: true,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 1000,
      respectAuth: true,
      cacheInvalidationRules: [
        {
          pattern: '/api/users/*',
          invalidate: ['users:*', 'user:*', 'setting:*'],
          delay: 100
        },
        {
          pattern: '/api/admin/*',
          invalidate: ['admin:*', 'system:*', 'permissions:*'],
          delay: 0
        },
        {
          pattern: '/api/analytics/*',
          invalidate: ['analytics:*', 'setting:*'],
          delay: 500
        }
      ],
      warmingRules: [
        {
          pattern: '/api/setting',
          queries: [
            { table: 'users', query: 'SELECT COUNT(*) as total_users FROM users WHERE status = $1', params: ['active'] },
            { table: 'analytics_summary', query: 'SELECT * FROM analytics_summary ORDER BY created_at DESC LIMIT 1' },
            { table: 'audit_trail', query: 'SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT 10' }
          ],
          priority: 1
        },
        {
          pattern: '/api/users',
          queries: [
            { table: 'users', query: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 20' },
            { table: 'user_permissions', query: 'SELECT DISTINCT user_id, COUNT(*) as permission_count FROM user_permissions GROUP BY user_id' }
          ],
          priority: 2
        }
      ],
      ...config
    }
  }

  /**
   * Middleware handler for Next.js
   */
  async middleware(request: NextRequest): Promise<NextResponse | null> {
    if (!this.config.enabled) {
      return null
    }

    const { pathname } = request.nextUrl
    const method = request.method
    const url = request.url

    // Handle GET requests - try cache first
    if (method === 'GET') {
      return await this.handleCachedRequest(request)
    }

    // Handle POST/PUT/DELETE requests - invalidate relevant cache
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      await this.handleCacheInvalidation(pathname, method)

      // Trigger cache warming for related endpoints
      await this.triggerCacheWarming(pathname, method)
    }

    return null
  }

  /**
   * Handle cached GET requests
   */
  private async handleCachedRequest(request: NextRequest): Promise<NextResponse | null> {
    const { pathname } = request.nextUrl
    const method = request.method
    const url = request.url

    // Generate cache key
    const cacheKey = this.config.cacheKeyGenerator
      ? this.config.cacheKeyGenerator(url, method)
      : this.generateDefaultCacheKey(url, method)

    // Try to get from cache
    const cachedResponse = await advancedCacheManager.get(
      'api_responses',
      cacheKey
    )

    if (cachedResponse) {
      // Return cached response
      const response = new NextResponse(JSON.stringify((cachedResponse as any).data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'X-Cache-TTL': (cachedResponse as any).metadata.ttl.toString(),
          ...(cachedResponse as any).headers
        }
      })

      return response
    }

    return null // Let request proceed to actual handler
  }

  /**
   * Handle cache invalidation for write operations
   */
  private async handleCacheInvalidation(pathname: string, method: string): Promise<void> {
    const invalidationRules = this.config.cacheInvalidationRules.filter(rule =>
      this.matchPattern(pathname, rule.pattern)
    )

    for (const rule of invalidationRules) {
      if (rule.delay && rule.delay > 0) {
        setTimeout(async () => {
          await this.executeInvalidation(rule.invalidate)
        }, rule.delay)
      } else {
        await this.executeInvalidation(rule.invalidate)
      }
    }
  }

  /**
   * Trigger cache warming for related endpoints
   */
  private async triggerCacheWarming(pathname: string, method: string): Promise<void> {
    // Only warm up after successful write operations
    const warmingRules = this.config.warmingRules.filter(rule =>
      this.matchPattern(pathname, rule.pattern)
    )

    if (warmingRules.length > 0 && !this.warmingInProgress) {
      this.warmingInProgress = true

      // Delay warming to allow database changes to settle
      setTimeout(async () => {
        try {
          for (const rule of warmingRules.sort((a, b) => a.priority - b.priority)) {
            await this.warmUpCache(rule.queries)
          }
        } catch (error) {
        } finally {
          this.warmingInProgress = false
        }
      }, 1000)
    }
  }

  /**
   * Warm up cache with predefined queries
   */
  async warmUpCache(queries: Array<{ table: string; query: string; params?: any[] }>): Promise<void> {

    const startTime = performance.now()
    let successCount = 0
    let errorCount = 0

    for (const queryConfig of queries) {
      try {
        const result = await queryCacheWrapper.query(
          queryConfig.table,
          queryConfig.query,
          {
            params: queryConfig.params,
            ttl: this.config.defaultTTL
          }
        )

        if (result !== null) {
          successCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    const duration = performance.now() - startTime
  }

  /**
   * Create cache entry for API response
   */
  async cacheResponse(
    request: NextRequest,
    response: NextResponse,
    ttl?: number
  ): Promise<void> {
    if (!this.config.enabled) return

    const { method } = request
    const url = request.url

    // Only cache successful GET responses
    if (method !== 'GET' || !response.ok) return

    const cacheKey = this.config.cacheKeyGenerator
      ? this.config.cacheKeyGenerator(url, method)
      : this.generateDefaultCacheKey(url, method)

    try {
      const responseData = await response.json()

      await advancedCacheManager.set(
        'api_responses',
        cacheKey,
        {
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        },
        ttl || this.config.defaultTTL
      )
    } catch (error) {
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Map<string, any> {
    const allStats = advancedCacheManager.getStats()
    const middlewareStats = new Map()

    // Add middleware-specific stats
    middlewareStats.set('middleware', {
      enabled: this.config.enabled,
      warmingInProgress: this.warmingInProgress,
      invalidationRules: this.config.cacheInvalidationRules.length,
      warmingRules: this.config.warmingRules.length
    })

    // Merge with general cache stats
    for (const [key, value] of Array.from(allStats.entries())) {
      middlewareStats.set(key, value)
    }

    return middlewareStats
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    const layers = ['api_responses', 'query_results', 'user_data', 'setting_data', 'analytics_data']

    for (const layer of layers) {
      await advancedCacheManager.invalidate(layer)
    }

  }

  /**
   * Optimize cache performance
   */
  optimizeCache(): {
    layersOptimized: string[]
    memoryFreed: number
    entriesRemoved: number
  } {
    return advancedCacheManager.optimize()
  }

  // Private helper methods
  private generateDefaultCacheKey(url: string, method: string): string {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const search = urlObj.search
    const methodKey = method.toLowerCase()

    // Respect auth if configured
    const authPrefix = this.config.respectAuth ? 'auth:' : 'public:'

    return `${authPrefix}${methodKey}:${pathname}${search}`.replace(/[^a-zA-Z0-9:_/-]/g, '_')
  }

  private matchPattern(pathname: string, pattern: string): boolean {
    // Simple pattern matching - supports wildcards
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(pathname)
  }

  private async executeInvalidation(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      try {
        if (pattern.includes('*')) {
          // Pattern-based invalidation
          await advancedCacheManager.invalidate('api_responses', pattern)
          await advancedCacheManager.invalidate('query_results', pattern)
        } else {
          // Exact key invalidation
          await advancedCacheManager.invalidate('api_responses', undefined, [pattern])
          await advancedCacheManager.invalidate('query_results', undefined, [pattern])
        }
      } catch (error) {
      }
    }
  }
}

/**
 * Cache invalidation service for database changes
 */
export class DatabaseCacheInvalidator {
  private admin = createSupabaseAdminClient()

  /**
   * Set up database triggers for automatic cache invalidation
   */
  async setupTriggers(): Promise<void> {
    const triggers = [
      {
        name: 'invalidate_user_cache',
        table: 'users',
        event: 'UPDATE',
        function: 'handle_user_cache_invalidation'
      },
      {
        name: 'invalidate_permission_cache',
        table: 'user_permissions',
        event: 'INSERT, UPDATE, DELETE',
        function: 'handle_permission_cache_invalidation'
      },
      {
        name: 'invalidate_audit_cache',
        table: 'audit_trail',
        event: 'INSERT',
        function: 'handle_audit_cache_invalidation'
      }
    ]

    for (const trigger of triggers) {
      try {
        await this.admin.rpc('create_cache_invalidation_trigger', {
          trigger_name: trigger.name,
          table_name: trigger.table,
          trigger_event: trigger.event,
          function_name: trigger.function
        })
      } catch (error) {
      }
    }
  }

  /**
   * Handle database change notifications
   */
  async handleDatabaseChange(payload: any): Promise<void> {
    const { table, record, eventType } = payload

    try {
      switch (table) {
        case 'users':
          await this.invalidateUserCache(record, eventType)
          break
        case 'user_permissions':
          await this.invalidatePermissionCache(record, eventType)
          break
        case 'audit_trail':
          await this.invalidateAuditCache(record, eventType)
          break
        case 'role_permissions':
          await this.invalidateRoleCache(record, eventType)
          break
        default:
          await this.invalidateGenericCache(table, record, eventType)
      }
    } catch (error) {
    }
  }

  // Private invalidation methods
  private async invalidateUserCache(record: any, eventType: string): Promise<void> {
    const userId = record.id

    // Invalidate user-specific cache
    await advancedCacheManager.invalidate('user_data', `user:${userId}:`)
    await advancedCacheManager.invalidate('query_results', `user:${userId}:`)

    // Invalidate general user cache
    await advancedCacheManager.invalidate('user_data', 'users:')
    await advancedCacheManager.invalidate('query_results', 'users:')

    // Invalidate setting cache
    await advancedCacheManager.invalidate('setting_data', 'user_list')
  }

  private async invalidatePermissionCache(record: any, eventType: string): Promise<void> {
    const userId = record.user_id

    // Invalidate permission cache for specific user
    await advancedCacheManager.invalidate('user_data', `user:${userId}:permissions`)
    await advancedCacheManager.invalidate('query_results', `permissions:${userId}:`)

    // Invalidate general permission cache
    await advancedCacheManager.invalidate('user_data', 'permissions:')
    await advancedCacheManager.invalidate('query_results', 'permissions:')
  }

  private async invalidateAuditCache(record: any, eventType: string): Promise<void> {
    const userId = record.user_id

    // Invalidate activity cache
    await advancedCacheManager.invalidate('user_data', `user:${userId}:activity`)
    await advancedCacheManager.invalidate('setting_data', 'recent_activity')
    await advancedCacheManager.invalidate('analytics_data', 'audit:')
  }

  private async invalidateRoleCache(record: any, eventType: string): Promise<void> {
    const role = record.role

    // Invalidate role-based cache
    await advancedCacheManager.invalidate('user_data', `role:${role}:`)
    await advancedCacheManager.invalidate('query_results', `role:${role}:`)

    // Invalidate permission cache as it affects role permissions
    await advancedCacheManager.invalidate('user_data', 'permissions:')
    await advancedCacheManager.invalidate('query_results', 'permissions:')
  }

  private async invalidateGenericCache(table: string, record: any, eventType: string): Promise<void> {
    // Invalidate table-specific cache
    await advancedCacheManager.invalidate('query_results', `${table}:`)
    await advancedCacheManager.invalidate('user_data', `${table}:`)

    // If the record has a user_id, invalidate user-specific cache
    if (record.user_id) {
      await advancedCacheManager.invalidate('user_data', `user:${record.user_id}:`)
    }
  }
}

// Singleton instances
export const cacheMiddleware = new CacheMiddleware()
export const databaseCacheInvalidator = new DatabaseCacheInvalidator()

// Convenience functions
export const handleCacheMiddleware = (request: NextRequest) =>
  cacheMiddleware.middleware(request)

export const cacheAPIResponse = (request: NextRequest, response: NextResponse, ttl?: number) =>
  cacheMiddleware.cacheResponse(request, response, ttl)

export const invalidateCacheOnChange = (payload: any) =>
  databaseCacheInvalidator.handleDatabaseChange(payload)