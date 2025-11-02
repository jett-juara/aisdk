import { queryCacheWrapper } from './cache-wrapper'
import { advancedCacheManager } from './advanced-cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface LazyLoadConfig {
  table: string
  pageSize: number
  initialLoadSize?: number
  prefetchSize?: number
  prefetchThreshold?: number // percentage (0-1)
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  select?: string
  cacheEnabled?: boolean
  cacheTTL?: number
}

export interface LazyLoadResult<T> {
  data: T[]
  isLoading: boolean
  hasMore: boolean
  totalCount: number
  currentPage: number
  pageSize: number
  error: Error | null
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
  prefetchNext: () => Promise<void>
}

export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
  enabled: boolean
}

export interface VirtualScrollResult<T> {
  visibleItems: T[]
  startIndex: number
  endIndex: number
  totalHeight: number
  scrollTop: number
  scrollContainerProps: any
  itemProps: (index: number) => any
}

/**
 * Advanced Lazy Loading System for Large Datasets
 */
export class LazyLoadingManager {
  private admin = createSupabaseAdminClient()
  private loadingCache = new Map<string, {
    data: any[]
    totalCount: number
    hasMore: boolean
    currentPage: number
    lastUpdated: number
    isLoading: boolean
  }>()

  private prefetchQueue: Array<{
    id: string
    config: LazyLoadConfig
    page: number
    priority: number
  }> = []

  private isProcessingPrefetch = false

  /**
   * Create lazy loading instance
   */
  async createLazyLoad<T = any>(
    id: string,
    config: LazyLoadConfig
  ): Promise<LazyLoadResult<T>> {
    const {
      pageSize,
      initialLoadSize = pageSize,
      prefetchSize = pageSize * 2,
      prefetchThreshold = 0.8,
      cacheEnabled = true,
      cacheTTL = 5 * 60 * 1000 // 5 minutes
    } = config

    // Initialize cache entry
    if (!this.loadingCache.has(id)) {
      this.loadingCache.set(id, {
        data: [],
        totalCount: 0,
        hasMore: true,
        currentPage: 0,
        lastUpdated: 0,
        isLoading: false
      })
    }

    const cacheEntry = this.loadingCache.get(id)!

    // Load initial data if cache is empty
    if (cacheEntry.data.length === 0 && !cacheEntry.isLoading) {
      await this.loadPage(id, config, 1, initialLoadSize)
    }

    return {
      data: cacheEntry.data,
      isLoading: cacheEntry.isLoading,
      hasMore: cacheEntry.hasMore,
      totalCount: cacheEntry.totalCount,
      currentPage: cacheEntry.currentPage,
      pageSize,
      error: null,
      loadMore: () => this.loadMore(id, config),
      refresh: () => this.refresh(id, config),
      reset: () => this.reset(id),
      prefetchNext: () => this.prefetchNext(id, config, prefetchSize)
    }
  }

  /**
   * Load page of data
   */
  private async loadPage<T = any>(
    id: string,
    config: LazyLoadConfig,
    page: number,
    size?: number
  ): Promise<void> {
    const cacheEntry = this.loadingCache.get(id)
    if (!cacheEntry) {
      throw new Error(`Lazy load instance ${id} not found`)
    }

    if (cacheEntry.isLoading) {
      return // Already loading
    }

    cacheEntry.isLoading = true

    try {
      const actualSize = size || config.pageSize
      const cacheKey = this.generateCacheKey(id, config, page, actualSize)

      let result: { data: T[]; totalCount: number; hasMore: boolean }

      if (config.cacheEnabled) {
        result = await queryCacheWrapper.query<{ data: T[]; totalCount: number; hasMore: boolean }>(
          config.table,
          this.buildQuery(config, page, actualSize),
          {
            params: [page - 1, actualSize],
            ttl: config.cacheTTL,
            tags: [`lazy_load:${id}`, `table:${config.table}`]
          }
        ) || { data: [], totalCount: 0, hasMore: false }
      } else {
        result = await this.executeQuery<T>(config, page, actualSize)
      }

      // Update cache
      if (page === 1) {
        // First page - replace all data
        cacheEntry.data = result.data
      } else {
        // Additional pages - append data
        cacheEntry.data.push(...result.data)
      }

      cacheEntry.totalCount = result.totalCount
      cacheEntry.hasMore = result.hasMore
      cacheEntry.currentPage = page
      cacheEntry.lastUpdated = Date.now()

      // Check if prefetch should be triggered
      if (config.prefetchThreshold) {
        const loadedRatio = cacheEntry.data.length / cacheEntry.totalCount
        if (loadedRatio >= config.prefetchThreshold) {
          this.queuePrefetch(id, config, page + 1, 1) // Low priority prefetch
        }
      }

    } catch (error) {
      throw error
    } finally {
      cacheEntry.isLoading = false
    }
  }

  /**
   * Execute database query with pagination
   */
  private async executeQuery<T = any>(
    config: LazyLoadConfig,
    page: number,
    size: number
  ): Promise<{ data: T[]; totalCount: number; hasMore: boolean }> {
    const offset = (page - 1) * size
    const select = config.select || '*'

    try {
      // Get paginated data
      let query = this.admin
        .from(config.table)
        .select(select, { count: 'exact' })

      // Apply filters
      if (config.filters) {
        for (const [key, value] of Object.entries(config.filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        }
      }

      // Apply sorting
      if (config.sortBy) {
        query = query.order(config.sortBy, { ascending: config.sortOrder === 'asc' })
      }

      // Apply pagination
      query = query.range(offset, offset + size - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalCount = count || 0
      const hasMore = offset + data.length < totalCount

      return {
        data: data as T[],
        totalCount,
        hasMore
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Build query string for cache key
   */
  private buildQuery(config: LazyLoadConfig, page: number, size: string | number): string {
    const offset = (page - 1) * (typeof size === 'string' ? parseInt(size, 10) : size)
    const select = config.select || '*'

    let query = `SELECT ${select} FROM ${config.table}`

    // Add filters
    if (config.filters && Object.keys(config.filters).length > 0) {
      const filterConditions = Object.entries(config.filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(' AND ')

      if (filterConditions) {
        query += ` WHERE ${filterConditions}`
      }
    }

    // Add sorting
    if (config.sortBy) {
      query += ` ORDER BY ${config.sortBy} ${config.sortOrder?.toUpperCase() || 'ASC'}`
    }

    // Add pagination
    query += ` LIMIT ${size} OFFSET ${offset}`

    return query
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(id: string, config: LazyLoadConfig, page: number, size: number): string {
    const filtersHash = config.filters ?
      btoa(JSON.stringify(config.filters)).substring(0, 10) : 'nofilter'
    const sortHash = config.sortBy ?
      `${config.sortBy}_${config.sortOrder || 'asc'}` : 'nosort'

    return `lazy_load:${id}:${config.table}:${page}:${size}:${filtersHash}:${sortHash}`
  }

  /**
   * Load more data
   */
  async loadMore(id: string, config: LazyLoadConfig): Promise<void> {
    const cacheEntry = this.loadingCache.get(id)
    if (!cacheEntry || !cacheEntry.hasMore || cacheEntry.isLoading) {
      return
    }

    await this.loadPage(id, config, cacheEntry.currentPage + 1)
  }

  /**
   * Refresh data
   */
  async refresh(id: string, config: LazyLoadConfig): Promise<void> {
    const cacheEntry = this.loadingCache.get(id)
    if (!cacheEntry) {
      return
    }

    // Clear cache and reload
    await this.invalidateCache(id, config)
    await this.loadPage(id, config, 1, cacheEntry.data.length || config.pageSize)
  }

  /**
   * Reset lazy loading instance
   */
  reset(id: string): void {
    this.loadingCache.delete(id)

    // Remove from prefetch queue
    this.prefetchQueue = this.prefetchQueue.filter(item => item.id !== id)
  }

  /**
   * Queue prefetch request
   */
  private queuePrefetch(id: string, config: LazyLoadConfig, page: number, priority: number): void {
    // Check if already queued
    const exists = this.prefetchQueue.some(item =>
      item.id === id && item.page === page
    )

    if (!exists) {
      this.prefetchQueue.push({
        id,
        config,
        page,
        priority
      })

      // Sort by priority (lower number = higher priority)
      this.prefetchQueue.sort((a, b) => a.priority - b.priority)

      // Process queue
      this.processPrefetchQueue()
    }
  }

  /**
   * Process prefetch queue
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.isProcessingPrefetch || this.prefetchQueue.length === 0) {
      return
    }

    this.isProcessingPrefetch = true

    try {
      while (this.prefetchQueue.length > 0) {
        const item = this.prefetchQueue.shift()!

        try {
          await this.prefetchNext(item.id, item.config, item.config.pageSize || 20)
        } catch (error) {
        }
      }
    } finally {
      this.isProcessingPrefetch = false
    }
  }

  /**
   * Prefetch next page
   */
  async prefetchNext(id: string, config: LazyLoadConfig, size?: number): Promise<void> {
    const cacheEntry = this.loadingCache.get(id)
    if (!cacheEntry || !cacheEntry.hasMore) {
      return
    }

    const nextPage = cacheEntry.currentPage + 1

    // Check if already loaded
    const expectedSize = (nextPage - 1) * (size || config.pageSize)
    if (cacheEntry.data.length >= expectedSize) {
      return // Already loaded
    }

    // Load next page silently (don't update loading state)
    const originalLoadingState = cacheEntry.isLoading

    try {
      await this.loadPage(id, config, nextPage, size)
    } catch (error) {
    } finally {
      cacheEntry.isLoading = originalLoadingState
    }
  }

  /**
   * Invalidate cache for lazy loading instance
   */
  async invalidateCache(id: string, config: LazyLoadConfig): Promise<void> {
    const patterns = [
      `lazy_load:${id}:`,
      `table:${config.table}`
    ]

    for (const pattern of patterns) {
      await advancedCacheManager.invalidate('query_results', pattern)
    }
  }

  /**
   * Get lazy loading statistics
   */
  getStatistics(): {
    totalInstances: number
    loadedItems: number
    totalItems: number
    cacheHitRate: number
    prefetchQueueSize: number
  } {
    let totalInstances = 0
    let loadedItems = 0
    let totalItems = 0

    for (const cacheEntry of this.loadingCache.values()) {
      totalInstances++
      loadedItems += cacheEntry.data.length
      totalItems += cacheEntry.totalCount
    }

    const cacheStats = advancedCacheManager.getStats('query_results')
    const cacheHitRate = cacheStats.get('query_results')?.hitRate || 0

    return {
      totalInstances,
      loadedItems,
      totalItems,
      cacheHitRate,
      prefetchQueueSize: this.prefetchQueue.length
    }
  }
}

/**
 * Virtual Scrolling Manager for Large Lists
 */
export class VirtualScrollingManager {
  /**
   * Create virtual scrolling instance
   */
  createVirtualScroll<T = any>(
    items: T[],
    config: VirtualScrollConfig,
    onScroll?: (scrollTop: number, visibleRange: [number, number]) => void
  ): VirtualScrollResult<T> {
    if (!config.enabled) {
      // If virtual scrolling is disabled, return all items
      return {
        visibleItems: items,
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * config.itemHeight,
        scrollTop: 0,
        scrollContainerProps: {
          style: {
            height: config.containerHeight,
            overflowY: 'auto'
          }
        },
        itemProps: (index: number) => ({
          key: index,
          style: {
            height: config.itemHeight
          }
        })
      }
    }

    const overscan = config.overscan || 5
    const totalHeight = items.length * config.itemHeight
    let scrollTop = 0

    // Calculate visible range
    const getVisibleRange = (scrollPosition: number): [number, number] => {
      const startIndex = Math.max(0, Math.floor(scrollPosition / config.itemHeight) - overscan)
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollPosition + config.containerHeight) / config.itemHeight) + overscan
      )
      return [startIndex, endIndex]
    }

    const [startIndex, endIndex] = getVisibleRange(scrollTop)
    const visibleItems = items.slice(startIndex, endIndex + 1)

    return {
      visibleItems,
      startIndex,
      endIndex,
      totalHeight,
      scrollTop,
      scrollContainerProps: {
        style: {
          height: config.containerHeight,
          overflowY: 'auto',
          position: 'relative'
        },
        onScroll: (e: React.UIEvent<HTMLDivElement>) => {
          const newScrollTop = e.currentTarget.scrollTop
          scrollTop = newScrollTop

          if (onScroll) {
            const [newStartIndex, newEndIndex] = getVisibleRange(newScrollTop)
            onScroll(newScrollTop, [newStartIndex, newEndIndex])
          }
        }
      },
      itemProps: (index: number) => ({
        key: index,
        style: {
          height: config.itemHeight,
          position: 'absolute',
          top: index * config.itemHeight,
          left: 0,
          right: 0
        }
      })
    }
  }
}

// Singleton instances
export const lazyLoadingManager = new LazyLoadingManager()
export const virtualScrollingManager = new VirtualScrollingManager()

// Convenience functions
export const createLazyLoad = <T = any>(
  id: string,
  config: LazyLoadConfig
) => lazyLoadingManager.createLazyLoad<T>(id, config)

export const createVirtualScroll = <T = any>(
  items: T[],
  config: VirtualScrollConfig,
  onScroll?: (scrollTop: number, visibleRange: [number, number]) => void
) => virtualScrollingManager.createVirtualScroll<T>(items, config, onScroll)

export const getLazyLoadingStatistics = () =>
  lazyLoadingManager.getStatistics()