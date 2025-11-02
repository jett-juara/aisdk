import { performance } from 'perf_hooks'
import { advancedCacheManager } from './advanced-cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface CacheWrapperConfig {
  ttl?: number
  key?: string
  layer?: string
  tags?: string[]
  invalidateOnChange?: boolean
  compression?: boolean
}

export interface QueryCacheOptions extends CacheWrapperConfig {
  params?: any[]
  userId?: string
  usePagination?: boolean
  pageSize?: number
}

export interface APICacheOptions extends CacheWrapperConfig {
  method?: string
  body?: any
  headers?: Record<string, string>
  respectAuth?: boolean
}

/**
 * Wrapper for database queries with intelligent caching
 */
export class QueryCacheWrapper {
  private admin = createSupabaseAdminClient()

  /**
   * Execute cached database query
   */
  async query<T>(
    table: string,
    query: string,
    options: QueryCacheOptions = {}
  ): Promise<T | null> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      layer = 'query_results',
      params = [],
      userId,
      tags,
      usePagination = false,
      pageSize = 50
    } = options

    const cacheKey = this.generateQueryCacheKey(table, query, params, userId, usePagination, pageSize)

    return await advancedCacheManager.get<T>(
      layer,
      cacheKey,
      async () => {
        try {
          // Execute the actual query
          let queryBuilder = this.admin.from(table)

          // Parse and apply query operations
          const operations = this.parseQuery(query)

          for (const operation of operations) {
            queryBuilder = this.applyOperation(queryBuilder, operation)
          }

          // Apply parameters
          if (params.length > 0) {
            // This is simplified - in production, use parameterized queries
            queryBuilder = (queryBuilder as any).limit(params[0]?.limit || 50)
          }

          const { data, error } = await (queryBuilder as any)

          if (error) {
            throw error
          }

          // Handle pagination if needed
          if (usePagination && Array.isArray(data) && data.length > pageSize) {
            return {
              data: data.slice(0, pageSize),
              totalCount: data.length,
              hasMore: true,
              nextPage: 1
            } as T
          }

          return data as T
        } catch (error) {
          throw error
        }
      }
    )
  }

  /**
   * Execute cached stored procedure
   */
  async rpc<T>(
    functionName: string,
    params: any = {},
    options: QueryCacheOptions = {}
  ): Promise<T | null> {
    const {
      ttl = 10 * 60 * 1000, // 10 minutes default
      layer = 'query_results',
      userId,
      tags
    } = options

    const cacheKey = this.generateRPCCacheKey(functionName, params, userId)

    return await advancedCacheManager.get<T>(
      layer,
      cacheKey,
      async () => {
        try {
          const { data, error } = await this.admin.rpc(functionName, params)

          if (error) {
            throw error
          }

          return data as T
        } catch (error) {
          throw error
        }
      }
    )
  }

  /**
   * Batch multiple queries with single cache lookup
   */
  async batchQuery<T>(
    queries: Array<{
      table: string
      query: string
      options: QueryCacheOptions
    }>
  ): Promise<Map<number, T | null>> {
    const results = new Map<number, T | null>()
    const startTime = performance.now()

    // Generate all cache keys first
    const cacheKeys: string[] = []
    const cacheLayer = queries[0]?.options?.layer || 'query_results'

    for (let i = 0; i < queries.length; i++) {
      const { table, query, options = {} } = queries[i]
      const key = this.generateQueryCacheKey(
        table,
        query,
        options.params || [],
        options.userId,
        options.usePagination || false,
        options.pageSize || 50
      )
      cacheKeys.push(key)
    }

    // Batch cache lookup
    const cachedResults = await advancedCacheManager.mget<T>(cacheLayer, cacheKeys)

    // Execute uncached queries
    const uncachedIndices: number[] = []
    const uncachedQueries: Array<{
      index: number
      query: { table: string; query: string; options: QueryCacheOptions }
      cacheKey: string
    }> = []

    cacheKeys.forEach((key, index) => {
      if (cachedResults.get(key) === null) {
        uncachedIndices.push(index)
        uncachedQueries.push({
          index,
          query: queries[index],
          cacheKey: key
        })
      } else {
        results.set(index, cachedResults.get(key)!)
      }
    })

    // Execute uncached queries in parallel
    if (uncachedQueries.length > 0) {
      const queryPromises = uncachedQueries.map(async ({ index, query, cacheKey }: any) => {
        try {
          const result = await this.query<T>(query.table, query.query, {
            ...(query.options || {}),
            layer: cacheLayer
          } as QueryCacheOptions)

          // Cache the result
          if (result !== null) {
            await advancedCacheManager.set(cacheLayer, cacheKey, result, query.options?.ttl)
          }

          return { index, result }
        } catch (error) {
          return { index, result: null }
        }
      })

      const queryResults = await Promise.all(queryPromises)

      for (const { index, result } of queryResults) {
        results.set(index, result)
      }
    }


    return results
  }

  /**
   * Invalidate cache for specific table or query pattern
   */
  async invalidateCache(
    table?: string,
    queryPattern?: string,
    tags?: string[]
  ): Promise<number> {
    let invalidatedCount = 0

    if (table) {
      // Invalidate all cache entries for this table
      const pattern = queryPattern ? `${table}:${queryPattern}` : `${table}:`
      invalidatedCount += await advancedCacheManager.invalidate('query_results', pattern)
      invalidatedCount += await advancedCacheManager.invalidate('user_data', pattern)
      invalidatedCount += await advancedCacheManager.invalidate('dashboard_data', pattern)
    }

    if (tags) {
      // Invalidate by tags across all layers
      const layers = ['query_results', 'user_data', 'dashboard_data', 'analytics_data']
      for (const layer of layers) {
        invalidatedCount += await advancedCacheManager.invalidate(layer, undefined, tags)
      }
    }

    return invalidatedCount
  }

  // Private helper methods
  private generateQueryCacheKey(
    table: string,
    query: string,
    params: any[],
    userId?: string,
    usePagination = false,
    pageSize = 50
  ): string {
    const baseKey = `${table}:${query}`
    const paramsKey = params.length > 0 ? JSON.stringify(params) : ''
    const userKey = userId ? `user:${userId}:` : ''
    const paginationKey = usePagination ? `page:${pageSize}:` : ''

    return `${userKey}${paginationKey}${baseKey}:${paramsKey}`.replace(/\s+/g, '_')
  }

  private generateRPCCacheKey(functionName: string, params: any, userId?: string): string {
    const baseKey = `rpc:${functionName}`
    const paramsKey = Object.keys(params).length > 0 ? JSON.stringify(params) : ''
    const userKey = userId ? `user:${userId}:` : ''

    return `${userKey}${baseKey}:${paramsKey}`.replace(/\s+/g, '_')
  }

  private parseQuery(query: string): Array<{ type: string; value: any }> {
    // Simplified query parsing - in production use proper SQL parser
    const operations: Array<{ type: string; value: any }> = []

    // Extract common operations
    if (query.includes('SELECT')) {
      operations.push({ type: 'select', value: '*' })
    }

    if (query.includes('WHERE')) {
      const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)/i)
      if (whereMatch) {
        operations.push({ type: 'where', value: whereMatch[1] })
      }
    }

    if (query.includes('ORDER BY')) {
      const orderMatch = query.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s+OFFSET|$)/i)
      if (orderMatch) {
        operations.push({ type: 'order', value: orderMatch[1] })
      }
    }

    if (query.includes('LIMIT')) {
      const limitMatch = query.match(/LIMIT\s+(\d+)/i)
      if (limitMatch) {
        operations.push({ type: 'limit', value: parseInt(limitMatch[1]) })
      }
    }

    return operations
  }

  private applyOperation(queryBuilder: any, operation: { type: string; value: any }): any {
    switch (operation.type) {
      case 'select':
        return queryBuilder.select(operation.value)
      case 'where':
        // Simplified WHERE clause parsing
        return queryBuilder.or(operation.value)
      case 'order':
        const orderParts = operation.value.split(' ')
        const column = orderParts[0]
        const direction = orderParts[1]?.toUpperCase() === 'DESC' ? false : true
        return queryBuilder.order(column, { ascending: direction })
      case 'limit':
        return queryBuilder.limit(operation.value)
      default:
        return queryBuilder
    }
  }
}

/**
 * Wrapper for API responses with intelligent caching
 */
export class APICacheWrapper {
  /**
   * Execute cached API call
   */
  async call<T>(
    url: string,
    options: APICacheOptions = {}
  ): Promise<T | null> {
    const {
      ttl = 2 * 60 * 1000, // 2 minutes default
      layer = 'api_responses',
      key,
      tags,
      method = 'GET',
      body,
      headers = {},
      respectAuth = true
    } = options

    const cacheKey = key || this.generateAPICacheKey(url, method, body, respectAuth)

    return await advancedCacheManager.get<T>(
      layer,
      cacheKey,
      async () => {
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            body: body ? JSON.stringify(body) : undefined
          })

          if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`)
          }

          return await response.json()
        } catch (error) {
          throw error
        }
      }
    )
  }

  /**
   * Batch multiple API calls
   */
  async batchCall<T>(
    calls: Array<{
      url: string
      options?: APICacheOptions
    }>
  ): Promise<Map<number, T | null>> {
    const results = new Map<number, T | null>()
    const startTime = performance.now()

    // Generate cache keys
    const cacheKeys: string[] = []
    const cacheLayer = calls[0]?.options?.layer || 'api_responses'

    for (let i = 0; i < calls.length; i++) {
      const { url, options = {} } = calls[i]
      const key = this.generateAPICacheKey(
        url,
        options.method || 'GET',
        options.body,
        options.respectAuth !== false
      )
      cacheKeys.push(key)
    }

    // Batch cache lookup
    const cachedResults = await advancedCacheManager.mget<T>(cacheLayer, cacheKeys)

    // Execute uncached calls
    const uncachedIndices: number[] = []
    cacheKeys.forEach((key, index) => {
      if (cachedResults.get(key) === null) {
        uncachedIndices.push(index)
      } else {
        results.set(index, cachedResults.get(key)!)
      }
    })

    // Execute uncached calls
    if (uncachedIndices.length > 0) {
      const callPromises = uncachedIndices.map(async (index) => {
        try {
          const { url, options = {} } = calls[index]
          const result = await this.call<T>(url, {
            ...options,
            layer: cacheLayer
          })

          return { index, result }
        } catch (error) {
          return { index, result: null }
        }
      })

      const callResults = await Promise.all(callPromises)

      for (const { index, result } of callResults) {
        results.set(index, result)
      }
    }


    return results
  }

  /**
   * Invalidate API response cache
   */
  async invalidateCache(urlPattern?: string, tags?: string[]): Promise<number> {
    let invalidatedCount = 0

    if (urlPattern) {
      invalidatedCount += await advancedCacheManager.invalidate('api_responses', urlPattern)
    }

    if (tags) {
      invalidatedCount += await advancedCacheManager.invalidate('api_responses', undefined, tags)
    }

    return invalidatedCount
  }

  // Private helper methods
  private generateAPICacheKey(
    url: string,
    method: string,
    body?: any,
    respectAuth = true
  ): string {
    const urlKey = url.replace(/[^a-zA-Z0-9]/g, '_')
    const methodKey = method.toLowerCase()
    const bodyKey = body ? btoa(JSON.stringify(body)).substring(0, 20) : ''
    const authKey = respectAuth ? 'auth' : 'public'

    return `${authKey}:${methodKey}:${urlKey}:${bodyKey}`
  }
}

// Singleton instances
export const queryCacheWrapper = new QueryCacheWrapper()
export const apiCacheWrapper = new APICacheWrapper()

// Convenience functions
export const cachedQuery = <T>(
  table: string,
  query: string,
  options?: QueryCacheOptions
) => queryCacheWrapper.query<T>(table, query, options)

export const cachedRPC = <T>(
  functionName: string,
  params?: any,
  options?: QueryCacheOptions
) => queryCacheWrapper.rpc<T>(functionName, params, options)

export const cachedAPICall = <T>(
  url: string,
  options?: APICacheOptions
) => apiCacheWrapper.call<T>(url, options)

export const invalidateQueryCache = (
  table?: string,
  queryPattern?: string,
  tags?: string[]
) => queryCacheWrapper.invalidateCache(table, queryPattern, tags)

export const invalidateAPICache = (
  urlPattern?: string,
  tags?: string[]
) => apiCacheWrapper.invalidateCache(urlPattern, tags)