import { cache } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Whether to count successful requests
  skipFailedRequests?: boolean // Whether to count failed requests
  message?: string // Custom error message
  onLimitReached?: (key: string, req: Request) => void // Callback when limit is reached
  blockDuration?: number // How long to block after limit is reached (ms)
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: Date
  retryAfter?: number
  blocked?: boolean
  blockUntil?: Date
}

export interface RateLimitRule {
  id: string
  name: string
  description: string
  config: RateLimitConfig
  enabled: boolean
  priority: number
  appliesTo: string[] // IP addresses, user IDs, or patterns
}

export class RateLimiter {
  private admin = createSupabaseAdminClient()

  // Default rate limit rules
  private defaultRules: RateLimitRule[] = [
    {
      id: 'global',
      name: 'Global Rate Limit',
      description: 'Global rate limit for all requests',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000, // 1000 requests per minute
        keyGenerator: (req) => 'global',
        blockDuration: 5 * 60 * 1000 // 5 minutes block
      },
      enabled: true,
      priority: 1,
      appliesTo: ['*']
    },
    {
      id: 'ip',
      name: 'IP-based Rate Limit',
      description: 'Rate limit per IP address',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute per IP
        keyGenerator: (req) => this.getClientIP(req),
        blockDuration: 15 * 60 * 1000 // 15 minutes block
      },
      enabled: true,
      priority: 2,
      appliesTo: ['*']
    },
    {
      id: 'auth',
      name: 'Authentication Rate Limit',
      description: 'Rate limit for authentication endpoints',
      config: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 auth attempts per 15 minutes
        keyGenerator: (req) => `auth:${this.getClientIP(req)}`,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        blockDuration: 60 * 60 * 1000 // 1 hour block
      },
      enabled: true,
      priority: 3,
      appliesTo: ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password']
    },
    {
      id: 'admin',
      name: 'Admin Operations Rate Limit',
      description: 'Rate limit for admin operations',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50, // 50 admin operations per minute
        keyGenerator: (req) => `admin:${this.getClientIP(req)}`,
        blockDuration: 10 * 60 * 1000 // 10 minutes block
      },
      enabled: true,
      priority: 4,
      appliesTo: ['/api/admin/*']
    },
    {
      id: 'sensitive',
      name: 'Sensitive Operations Rate Limit',
      description: 'Rate limit for sensitive operations',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5, // 5 sensitive operations per minute
        keyGenerator: (req) => `sensitive:${this.getClientIP(req)}`,
        blockDuration: 30 * 60 * 1000 // 30 minutes block
      },
      enabled: true,
      priority: 5,
      appliesTo: ['/api/admin/users/bulk', '/api/admin/permissions/*', '/api/admin/invitations/*']
    },
    {
      id: 'api_key',
      name: 'API Key Rate Limit',
      description: 'Rate limit for API key usage',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 500, // 500 requests per minute per API key
        keyGenerator: (req) => `api:${this.getAPIKey(req)}`,
        blockDuration: 5 * 60 * 1000 // 5 minutes block
      },
      enabled: true,
      priority: 6,
      appliesTo: ['*'] // Only applies if API key is present
    }
  ]

  /**
   * Check if request is allowed
   */
  async checkRateLimit(request: Request, config?: RateLimitConfig): Promise<RateLimitResult> {
    const key = config?.keyGenerator ? config.keyGenerator(request) : this.getClientIP(request)
    const now = new Date()

    try {
      // Check if IP is blocked
      const isBlocked = await this.isBlocked(key)
      if (isBlocked) {
        const blockUntil = await this.getBlockUntil(key)
        return {
          allowed: false,
          limit: 0,
          remaining: 0,
          resetTime: blockUntil || new Date(now.getTime() + 60000),
          blocked: true,
          blockUntil: blockUntil || undefined
        }
      }

      // Get current rate limit data
      const rateLimitData = await this.getRateLimitData(key, config?.windowMs || 60000)

      if (!rateLimitData) {
        // First request, create entry
        await this.createRateLimitEntry(key, config)
        return {
          allowed: true,
          limit: config?.maxRequests || 100,
          remaining: (config?.maxRequests || 100) - 1,
          resetTime: new Date(now.getTime() + (config?.windowMs || 60000))
        }
      }

      const windowStart = new Date(rateLimitData.windowStart)
      const windowEnd = new Date(windowStart.getTime() + (config?.windowMs || 60000))

      // If window has expired, reset
      if (now > windowEnd) {
        await this.resetRateLimit(key, config)
        return {
          allowed: true,
          limit: config?.maxRequests || 100,
          remaining: (config?.maxRequests || 100) - 1,
          resetTime: new Date(now.getTime() + (config?.windowMs || 60000))
        }
      }

      // Check if limit exceeded
      const maxRequests = config?.maxRequests || 100
      const remaining = Math.max(0, maxRequests - rateLimitData.count)

      if (rateLimitData.count >= maxRequests) {
        // Limit reached, potentially block
        if (config?.blockDuration) {
          await this.blockKey(key, config.blockDuration)
        }

        config?.onLimitReached?.(key, request)

        return {
          allowed: false,
          limit: maxRequests,
          remaining: 0,
          resetTime: windowEnd,
          retryAfter: Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)
        }
      }

      // Increment counter
      await this.incrementRateLimit(key)

      return {
        allowed: true,
        limit: maxRequests,
        remaining: remaining - 1,
        resetTime: windowEnd
      }
    } catch (error) {
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        limit: config?.maxRequests || 100,
        remaining: (config?.maxRequests || 100) - 1,
        resetTime: new Date(now.getTime() + (config?.windowMs || 60000))
      }
    }
  }

  /**
   * Check rate limits with multiple rules
   */
  async checkRateLimits(request: Request): Promise<{
    allowed: boolean
    results: RateLimitResult[]
    blockedBy?: string
  }> {
    const applicableRules = this.getApplicableRules(request)
    const results: RateLimitResult[] = []

    for (const rule of applicableRules) {
      const result = await this.checkRateLimit(request, rule.config)
      results.push(result)

      if (!result.allowed || result.blocked) {
        return {
          allowed: false,
          results,
          blockedBy: rule.id
        }
      }
    }

    return {
      allowed: true,
      results
    }
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(
    timeRange: '1h' | '24h' | '7d' = '24h'
  ): Promise<{
    totalRequests: number
    blockedRequests: number
    topBlockedIPs: Array<{ ip: string; blockCount: number; lastBlocked: string }>
    rateLimitHits: Array<{ rule: string; hits: number; lastHit: string }>
    activeBlocks: Array<{ key: string; blockUntil: string; reason: string }>
  }> {
    const timeRangeInHours = { '1h': 1, '24h': 24, '7d': 168 }[timeRange]
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - timeRangeInHours * 60 * 60 * 1000)

    try {
      // Get rate limit data
      const { data: rateLimits, error: rateLimitError } = await this.admin
        .from('rate_limits')
        .select('*')
        .gte('windowStart', cutoffTime.toISOString())

      if (rateLimitError) throw rateLimitError

      // Get blocked entries
      const { data: blockedEntries, error: blockedError } = await this.admin
        .from('rate_limits')
        .select('key, blockUntil, metadata')
        .not('blockUntil', 'is', null)
        .gt('blockUntil', new Date().toISOString())

      if (blockedError) throw blockedError

      // Calculate statistics
      const totalRequests = rateLimits?.reduce((sum, rl) => sum + rl.count, 0) || 0
      const blockedRequests = rateLimits?.filter(rl => rl.count > (rl.maxCount || 100)).length || 0

      // Get top blocked IPs
      const ipBlocks: Record<string, { count: number; lastBlocked: string }> = {}
      rateLimits?.forEach(rl => {
        if (rl.key.startsWith('ip:') && rl.count > (rl.maxCount || 100)) {
          const ip = rl.key.replace('ip:', '')
          if (!ipBlocks[ip]) {
            ipBlocks[ip] = { count: 0, lastBlocked: rl.windowStart }
          }
          ipBlocks[ip].count += rl.count
          if (new Date(rl.windowStart) > new Date(ipBlocks[ip].lastBlocked)) {
            ipBlocks[ip].lastBlocked = rl.windowStart
          }
        }
      })

      const topBlockedIPs = Object.entries(ipBlocks)
        .map(([ip, data]) => ({ ip, blockCount: data.count, lastBlocked: data.lastBlocked }))
        .sort((a, b) => b.blockCount - a.blockCount)
        .slice(0, 10)

      // Get rate limit hits by rule
      const ruleHits: Record<string, { hits: number; lastHit: string }> = {}
      rateLimits?.forEach(rl => {
        const rule = rl.key.split(':')[0]
        if (!ruleHits[rule]) {
          ruleHits[rule] = { hits: 0, lastHit: rl.windowStart }
        }
        ruleHits[rule].hits += rl.count
        if (new Date(rl.windowStart) > new Date(ruleHits[rule].lastHit)) {
          ruleHits[rule].lastHit = rl.windowStart
        }
      })

      const rateLimitHitsData = Object.entries(ruleHits)
        .map(([rule, data]) => ({ rule, ...data }))
        .sort((a, b) => b.hits - a.hits)

      // Get active blocks
      const activeBlocks = blockedEntries?.map(entry => ({
        key: entry.key,
        blockUntil: entry.blockUntil,
        reason: entry.metadata?.reason || 'Rate limit exceeded'
      })) || []

      return {
        totalRequests,
        blockedRequests,
        topBlockedIPs,
        rateLimitHits: rateLimitHitsData,
        activeBlocks
      }
    } catch (error) {
      return {
        totalRequests: 0,
        blockedRequests: 0,
        topBlockedIPs: [],
        rateLimitHits: [],
        activeBlocks: []
      }
    }
  }

  /**
   * Manually block a key
   */
  async blockKey(key: string, durationMs: number, reason?: string): Promise<void> {
    const blockUntil = new Date(Date.now() + durationMs)

    try {
      await this.admin
        .from('rate_limits')
        .upsert({
          key,
          count: 999999, // Very high count to ensure block
          windowStart: new Date().toISOString(),
          windowDuration: Math.ceil(durationMs / 1000),
          maxCount: 1,
          blockUntil: blockUntil.toISOString(),
          metadata: {
            reason: reason || 'Manual block',
            blockedAt: new Date().toISOString(),
            blockedBy: 'admin'
          }
        })
    } catch (error) {
    }
  }

  /**
   * Unblock a key
   */
  async unblockKey(key: string): Promise<void> {
    try {
      await this.admin
        .from('rate_limits')
        .update({
          blockUntil: null,
          metadata: {
            unblockedAt: new Date().toISOString(),
            unblockedBy: 'admin'
          }
        })
        .eq('key', key)
    } catch (error) {
    }
  }

  /**
   * Clean up old rate limit data
   */
  async cleanup(retentionDays: number = 7): Promise<number> {
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - retentionDays * 24 * 60 * 60 * 1000)

    try {
      const { data, error } = await this.admin
        .from('rate_limits')
        .delete()
        .lt('windowStart', cutoffTime.toISOString())
        .select('id')

      if (error) throw error

      const deletedCount = data?.length || 0

      return deletedCount
    } catch (error) {
      return 0
    }
  }

  // Private helper methods
  private getApplicableRules(request: Request): RateLimitRule[] {
    const url = new URL(request.url)
    const path = url.pathname

    return this.defaultRules
      .filter(rule => rule.enabled)
      .filter(rule => {
        if (rule.appliesTo.includes('*')) return true

        // Check if path matches any pattern
        return rule.appliesTo.some(pattern => {
          if (pattern.endsWith('/*')) {
            return path.startsWith(pattern.slice(0, -2))
          }
          return path === pattern
        })
      })
      .sort((a, b) => a.priority - b.priority) // Sort by priority (lower number = higher priority)
  }

  private async getRateLimitData(key: string, windowMs: number): Promise<any> {
    const windowStart = new Date(Date.now() - windowMs).toISOString()

    try {
      const { data, error } = await this.admin
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .gte('windowStart', windowStart)
        .order('windowStart', { ascending: false })
        .limit(1)
        .single()

      return data
    } catch (error) {
      return null
    }
  }

  private async createRateLimitEntry(key: string, config?: RateLimitConfig): Promise<void> {
    const windowMs = config?.windowMs || 60000

    try {
      await this.admin
        .from('rate_limits')
        .insert({
          key,
          count: 1,
          windowStart: new Date().toISOString(),
          windowDuration: Math.ceil(windowMs / 1000),
          maxCount: config?.maxRequests || 100,
          metadata: {
            rule: config?.keyGenerator?.name || 'default',
            createdAt: new Date().toISOString()
          }
        })
    } catch (error) {
    }
  }

  private async incrementRateLimit(key: string): Promise<void> {
    try {
      await this.admin.rpc('increment_rate_limit', { key_to_update: key })
    } catch (error) {
      // Fallback if RPC doesn't exist
      try {
        const { data: current } = await this.admin
          .from('rate_limits')
          .select('count')
          .eq('key', key)
          .single()

        if (current) {
          await this.admin
            .from('rate_limits')
            .update({ count: current.count + 1 })
            .eq('key', key)
        }
      } catch (fallbackError) {
      }
    }
  }

  private async resetRateLimit(key: string, config?: RateLimitConfig): Promise<void> {
    const windowMs = config?.windowMs || 60000

    try {
      await this.admin
        .from('rate_limits')
        .upsert({
          key,
          count: 1,
          windowStart: new Date().toISOString(),
          windowDuration: Math.ceil(windowMs / 1000),
          maxCount: config?.maxRequests || 100,
          blockUntil: null,
          metadata: {
            resetAt: new Date().toISOString()
          }
        })
    } catch (error) {
    }
  }

  private async isBlocked(key: string): Promise<boolean> {
    try {
      const { data, error } = await this.admin
        .from('rate_limits')
        .select('blockUntil')
        .eq('key', key)
        .not('blockUntil', 'is', null)
        .gt('blockUntil', new Date().toISOString())
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  private async getBlockUntil(key: string): Promise<Date | null> {
    try {
      const { data, error } = await this.admin
        .from('rate_limits')
        .select('blockUntil')
        .eq('key', key)
        .not('blockUntil', 'is', null)
        .single()

      return data ? new Date(data.blockUntil) : null
    } catch (error) {
      return null
    }
  }

  private getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const real = request.headers.get('x-real-ip')
    const ip = request.headers.get('x-client-ip')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (real) {
      return real.trim()
    }
    if (ip) {
      return ip.trim()
    }

    return '127.0.0.1' // Default fallback
  }

  private getAPIKey(request: Request): string {
    // Try to get API key from various sources
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }

    const apiKey = request.headers.get('x-api-key')
    if (apiKey) {
      return apiKey
    }

    const url = new URL(request.url)
    const urlKey = url.searchParams.get('api_key')
    if (urlKey) {
      return urlKey
    }

    return 'unknown'
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// React cache for server-side rate limiting
export const checkRateLimit = cache(async (request: Request, config?: RateLimitConfig) => {
  return rateLimiter.checkRateLimit(request, config)
})

export const checkRateLimits = cache(async (request: Request) => {
  return rateLimiter.checkRateLimits(request)
})

// Middleware function for Next.js
export function createRateLimitMiddleware(config?: RateLimitConfig) {
  return async function rateLimitMiddleware(request: Request) {
    const result = await checkRateLimit(request, config)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            message: config?.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toISOString(),
            ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
          }
        }
      )
    }

    // Continue with request if allowed
    return null
  }
}