'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { createLazyLoad, createVirtualScroll } from './lazy-loading'
import type { LazyLoadConfig, LazyLoadResult, VirtualScrollConfig } from './lazy-loading'

/**
 * Hook for lazy loading large datasets
 */
export function useLazyLoad<T = any>(
  id: string,
  config: LazyLoadConfig
): LazyLoadResult<T> {
  const [result, setResult] = useState<LazyLoadResult<T>>({
    data: [],
    isLoading: false,
    hasMore: true,
    totalCount: 0,
    currentPage: 1,
    pageSize: config.pageSize,
    error: null,
    loadMore: async () => {},
    refresh: async () => {},
    reset: () => {},
    prefetchNext: async () => {}
  })

  const [forceUpdate, setForceUpdate] = useState(0)
  const resultRef = useRef<LazyLoadResult<T>>()

  // Initialize lazy loading
  useEffect(() => {
    const initializeLazyLoad = async () => {
      try {
        const lazyLoadResult = await createLazyLoad<T>(id, config)
        setResult(lazyLoadResult)
        resultRef.current = lazyLoadResult
      } catch (error) {
        setResult(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Unknown error'),
          isLoading: false
        }))
      }
    }

    initializeLazyLoad()
  }, [id, config.table, config.pageSize, JSON.stringify(config.filters)])

  // Force update to trigger re-render when data changes
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1)
  }, [])

  // Enhanced methods with state updates
  const enhancedResult = useMemo(() => ({
    ...result,
    loadMore: async () => {
      if (resultRef.current) {
        await resultRef.current.loadMore()
        triggerUpdate()
      }
    },
    refresh: async () => {
      if (resultRef.current) {
        await resultRef.current.refresh()
        triggerUpdate()
      }
    },
    reset: () => {
      if (resultRef.current) {
        resultRef.current.reset()
        triggerUpdate()
      }
    },
    prefetchNext: async () => {
      if (resultRef.current) {
        await resultRef.current.prefetchNext()
        triggerUpdate()
      }
    }
  }), [result, triggerUpdate])

  return enhancedResult
}

/**
 * Hook for lazy loading with search functionality
 */
export function useLazyLoadWithSearch<T = any>(
  id: string,
  config: LazyLoadConfig,
  searchFields: string[] = [],
  debounceMs = 300
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, debounceMs])

  // Create search filter
  const searchFilter = useMemo(() => {
    if (!debouncedSearchTerm || searchFields.length === 0) {
      return config.filters || {}
    }

    const searchConditions = searchFields.map(field => ({
      [field]: `ilike.*${debouncedSearchTerm}*`
    }))

    return {
      ...config.filters,
      or: searchConditions
    }
  }, [debouncedSearchTerm, searchFields, config.filters])

  // Use lazy load with search filter
  const lazyLoadResult = useLazyLoad<T>(`${id}_search`, {
    ...config,
    filters: searchFilter
  })

  return {
    ...lazyLoadResult,
    searchTerm,
    setSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}

/**
 * Hook for lazy loading with infinite scroll
 */
export function useInfiniteScroll<T = any>(
  id: string,
  config: LazyLoadConfig,
  options: {
    threshold?: number // pixels from bottom to trigger load more
    enabled?: boolean
  } = {}
) {
  const { threshold = 100, enabled = true } = options
  const lazyLoadResult = useLazyLoad<T>(id, config)
  const containerRef = useRef<HTMLElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!enabled || !lazyLoadResult.hasMore || lazyLoadResult.isLoading) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        setIsIntersecting(target.isIntersecting)
      },
      {
        root: containerRef.current,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    // Create a sentinel element at the bottom
    const sentinel = document.createElement('div')
    sentinel.style.height = '1px'
    sentinel.style.width = '1px'
    sentinel.style.position = 'absolute'
    sentinel.style.bottom = '0'
    sentinel.style.left = '0'
    sentinel.style.visibility = 'hidden'

    if (containerRef.current) {
      containerRef.current.appendChild(sentinel)
      observer.observe(sentinel)
    }

    return () => {
      observer.disconnect()
      if (containerRef.current && containerRef.current.contains(sentinel)) {
        containerRef.current.removeChild(sentinel)
      }
    }
  }, [enabled, lazyLoadResult.hasMore, lazyLoadResult.isLoading, threshold])

  // Load more when intersecting
  useEffect(() => {
    if (!isIntersecting || !lazyLoadResult.hasMore || lazyLoadResult.isLoading) {
      return
    }

    lazyLoadResult.loadMore()
    const timeout = setTimeout(() => {
      setIsIntersecting(false)
    }, 0)

    return () => clearTimeout(timeout)
  }, [isIntersecting, lazyLoadResult])

  return {
    ...lazyLoadResult,
    containerRef,
    canLoadMore: lazyLoadResult.hasMore && !lazyLoadResult.isLoading
  }
}

/**
 * Hook for virtual scrolling
 */
export function useVirtualScroll<T = any>(
  items: T[],
  config: VirtualScrollConfig,
  onScroll?: (scrollTop: number, visibleRange: [number, number]) => void
) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const virtualScrollResult = useMemo(() => {
    return createVirtualScroll(items, config, (newScrollTop, visibleRange) => {
      setScrollTop(newScrollTop)
      if (onScroll) {
        onScroll(newScrollTop, visibleRange)
      }
    })
  }, [items, config, onScroll])

  // Scroll to item
  const scrollToItem = useCallback((index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current) return

    const itemTop = index * config.itemHeight
    const containerHeight = config.containerHeight

    let scrollTo = itemTop

    switch (alignment) {
      case 'center':
        scrollTo = itemTop - (containerHeight / 2) + (config.itemHeight / 2)
        break
      case 'end':
        scrollTo = itemTop - containerHeight + config.itemHeight
        break
    }

    scrollElementRef.current.scrollTop = Math.max(0, scrollTo)
  }, [config])

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0
    }
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = scrollElementRef.current.scrollHeight
    }
  }, [])

  return {
    ...virtualScrollResult,
    scrollTop,
    scrollElementRef,
    scrollToItem,
    scrollToTop,
    scrollToBottom
  }
}

/**
 * Hook for combined lazy loading and virtual scrolling
 */
export function useLazyVirtualScroll<T = any>(
  id: string,
  lazyConfig: LazyLoadConfig,
  virtualConfig: VirtualScrollConfig,
  options: {
    loadMoreThreshold?: number
    enabled?: boolean
  } = {}
) {
  const { loadMoreThreshold = 0.8, enabled = true } = options
  const lazyLoadResult = useLazyLoad<T>(id, lazyConfig)
  const virtualScrollResult = useVirtualScroll(
    lazyLoadResult.data,
    virtualConfig,
    (scrollTop, [startIndex, endIndex]) => {
      // Check if we should load more data
      if (enabled && lazyLoadResult.hasMore && !lazyLoadResult.isLoading) {
        const loadedRatio = endIndex / lazyLoadResult.data.length
        if (loadedRatio >= loadMoreThreshold) {
          lazyLoadResult.loadMore()
        }
      }
    }
  )

  return {
    ...lazyLoadResult,
    ...virtualScrollResult,
    // Merge conflicting properties
    data: virtualScrollResult.visibleItems,
    isLoading: lazyLoadResult.isLoading,
    hasMore: lazyLoadResult.hasMore,
    totalCount: lazyLoadResult.totalCount
  }
}

/**
 * Hook for lazy loading with filtering and sorting
 */
export function useLazyLoadWithFilters<T = any>(
  id: string,
  baseConfig: LazyLoadConfig
) {
  const [filters, setFilters] = useState<Record<string, any>>(baseConfig.filters || {})
  const [sortBy, setSortBy] = useState(baseConfig.sortBy || '')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(baseConfig.sortOrder || 'asc')

  // Create dynamic config
  const dynamicConfig = useMemo(() => ({
    ...baseConfig,
    filters,
    sortBy,
    sortOrder
  }), [baseConfig, filters, sortBy, sortOrder])

  const lazyLoadResult = useLazyLoad<T>(`${id}_filtered`, dynamicConfig)

  // Update filter methods
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(baseConfig.filters || {})
  }, [baseConfig.filters])

  const updateSorting = useCallback((newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    if (newSortOrder) {
      setSortOrder(newSortOrder)
    }
  }, [])

  const reset = useCallback(() => {
    setFilters(baseConfig.filters || {})
    setSortBy(baseConfig.sortBy || '')
    setSortOrder(baseConfig.sortOrder || 'asc')
    lazyLoadResult.reset()
  }, [baseConfig, lazyLoadResult])

  return {
    ...lazyLoadResult,
    filters,
    sortBy,
    sortOrder,
    updateFilter,
    removeFilter,
    clearFilters,
    updateSorting,
    reset
  }
}

/**
 * Hook for lazy loading with pagination
 */
export function useLazyPagination<T = any>(
  id: string,
  config: LazyLoadConfig,
  initialPage = 1
) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(config.pageSize)

  const lazyLoadResult = useLazyLoad<T>(id, {
    ...config,
    pageSize
  })

  // Calculate pagination info
  const totalPages = Math.ceil(lazyLoadResult.totalCount / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Navigation methods
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  const firstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  // Change page size
  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page
  }, [])

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return lazyLoadResult.data.slice(startIndex, endIndex)
  }, [lazyLoadResult.data, currentPage, pageSize])

  return {
    ...lazyLoadResult,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    currentPageData,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize
  }
}
