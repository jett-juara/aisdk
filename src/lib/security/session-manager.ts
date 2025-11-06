import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { createSupabaseFetch } from '@/lib/supabase/safe-fetch'

// Session configuration
export const SESSION_CONFIG = {
  // Session timeout settings
  INACTIVE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  WARNING_TIMEOUT: 25 * 60 * 1000, // 25 minutes (5 min warning)

  // Security settings
  MAX_CONCURRENT_SESSIONS: 3,
  REQUIRE_REAUTH_after: 60 * 60 * 1000, // 1 hour for sensitive actions

  // Cleanup settings
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  BATCH_SIZE: 100,
} as const

export interface SessionInfo {
  userId: string
  sessionId: string
  createdAt: string
  lastActivity: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  deviceInfo?: {
    browser?: string
    os?: string
    device?: string
  }
  location?: {
    country?: string
    city?: string
  }
}

export interface SecurityContext {
  sessionId: string
  userId: string
  isAuthenticated: boolean
  riskScore: number
  requiresReauth: boolean
  suspiciousActivities: string[]
}

// Cache for active sessions
const sessionCache = new Map<string, SessionInfo>()
const securityContextCache = new Map<string, SecurityContext>()

const sessionSupabaseFetch = createSupabaseFetch('session-manager')

export class SessionManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: sessionSupabaseFetch,
      },
    }
  )

  /**
   * Create or update session with security tracking
   */
  async createSession(userId: string, request: Request): Promise<SessionInfo> {
    const now = new Date().toISOString()
    const sessionId = crypto.randomUUID()
    const ipAddress = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const deviceInfo = this.parseUserAgent(userAgent)
    const location = await this.getLocationFromIP(ipAddress)

    const sessionInfo: SessionInfo = {
      userId,
      sessionId,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent,
      isActive: true,
      deviceInfo,
      location
    }

    // Store in database
    await this.storeSession(sessionInfo)

    // Update cache
    sessionCache.set(sessionId, sessionInfo)

    // Check for concurrent sessions
    await this.manageConcurrentSessions(userId, sessionId)

    return sessionInfo
  }

  /**
   * Validate and refresh session
   */
  async validateSession(sessionId: string, request: Request): Promise<SecurityContext | null> {
    // Check cache first
    let sessionInfo = sessionCache.get(sessionId)

    if (!sessionInfo) {
      // Load from database
      const loaded = await this.loadSession(sessionId)
      if (!loaded) {
        return null
      }
      sessionInfo = loaded
      sessionCache.set(sessionId, sessionInfo)
    }

    const now = new Date()
    const lastActivity = new Date(sessionInfo.lastActivity)
    const createdAt = new Date(sessionInfo.createdAt)

    // Check timeouts
    const inactiveDiff = now.getTime() - lastActivity.getTime()
    const absoluteDiff = now.getTime() - createdAt.getTime()

    if (inactiveDiff > SESSION_CONFIG.INACTIVE_TIMEOUT ||
        absoluteDiff > SESSION_CONFIG.ABSOLUTE_TIMEOUT) {
      await this.invalidateSession(sessionId)
      sessionCache.delete(sessionId)
      return null
    }

    // Update last activity
    sessionInfo.lastActivity = now.toISOString()
    await this.updateSessionActivity(sessionId, now.toISOString())

    // Create security context
    const securityContext = await this.createSecurityContext(sessionInfo, request)

    // Cache security context
    securityContextCache.set(sessionId, securityContext)

    return securityContext
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({
          isActive: false,
          invalidatedAt: new Date().toISOString()
        })
        .eq('sessionId', sessionId)

      sessionCache.delete(sessionId)
      securityContextCache.delete(sessionId)
    } catch (error) {
    }
  }

  /**
   * Invalidate all user sessions except current
   */
  async invalidateOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({
          isActive: false,
          invalidatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .neq('sessionId', currentSessionId)

      // Clear cache entries for this user
      for (const [sessionId, session] of Array.from(sessionCache.entries())) {
        if (session.userId === userId && sessionId !== currentSessionId) {
          sessionCache.delete(sessionId)
          securityContextCache.delete(sessionId)
        }
      }
    } catch (error) {
    }
  }

  /**
   * Get all active sessions for user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('userId', userId)
        .eq('isActive', true)
        .order('lastActivity', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      return []
    }
  }

  /**
   * Check if session requires re-authentication
   */
  async requiresReauthentication(sessionId: string): Promise<boolean> {
    const securityContext = securityContextCache.get(sessionId)
    if (!securityContext) return true

    const sessionInfo = sessionCache.get(sessionId)
    if (!sessionInfo) return true

    const now = new Date()
    const lastActivity = new Date(sessionInfo.lastActivity)
    const diff = now.getTime() - lastActivity.getTime()

    return diff > SESSION_CONFIG.REQUIRE_REAUTH_after
  }

  /**
   * Mark session as suspicious
   */
  async markSuspiciousActivity(sessionId: string, activity: string, details?: any): Promise<void> {
    try {
      // Log suspicious activity
      await this.supabase
        .from('security_events')
        .insert({
          sessionId,
          userId: sessionCache.get(sessionId)?.userId,
          type: 'suspicious_activity',
          activity,
          details,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })

      // Update security context
      const securityContext = securityContextCache.get(sessionId)
      if (securityContext) {
        securityContext.suspiciousActivities.push(activity)
        securityContext.riskScore = Math.min(securityContext.riskScore + 20, 100)

        // If high risk, require re-authentication
        if (securityContext.riskScore > 70) {
          securityContext.requiresReauth = true
        }
      }
    } catch (error) {
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - SESSION_CONFIG.INACTIVE_TIMEOUT)

    try {
      await this.supabase
        .from('user_sessions')
        .update({
          isActive: false,
          invalidatedAt: new Date().toISOString()
        })
        .lt('lastActivity', cutoffTime.toISOString())
        .eq('isActive', true)
    } catch (error) {
    }
  }

  // Private helper methods
  private async storeSession(sessionInfo: SessionInfo): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .insert({
          sessionId: sessionInfo.sessionId,
          userId: sessionInfo.userId,
          createdAt: sessionInfo.createdAt,
          lastActivity: sessionInfo.lastActivity,
          ipAddress: sessionInfo.ipAddress,
          userAgent: sessionInfo.userAgent,
          deviceInfo: sessionInfo.deviceInfo,
          location: sessionInfo.location,
          isActive: true
        })
    } catch (error) {
      throw error
    }
  }

  private async loadSession(sessionId: string): Promise<SessionInfo | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('sessionId', sessionId)
        .eq('isActive', true)
        .single()

      if (error || !data) return null

      return {
        userId: data.userId,
        sessionId: data.sessionId,
        createdAt: data.createdAt,
        lastActivity: data.lastActivity,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: data.isActive,
        deviceInfo: data.deviceInfo,
        location: data.location
      }
    } catch (error) {
      return null
    }
  }

  private async updateSessionActivity(sessionId: string, lastActivity: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({ lastActivity })
        .eq('sessionId', sessionId)
    } catch (error) {
    }
  }

  private async manageConcurrentSessions(userId: string, newSessionId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)

    if (sessions.length >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
      // Invalidate oldest sessions
      const sessionsToInvalidate = sessions
        .slice(SESSION_CONFIG.MAX_CONCURRENT_SESSIONS - 1)
        .map(s => s.sessionId)

      for (const sessionId of sessionsToInvalidate) {
        await this.invalidateSession(sessionId)
      }
    }
  }

  private async createSecurityContext(sessionInfo: SessionInfo, request: Request): Promise<SecurityContext> {
    const riskScore = await this.calculateRiskScore(sessionInfo, request)
    const suspiciousActivities = await this.getSuspiciousActivities(sessionInfo.sessionId)
    const requiresReauth = riskScore > 50 || suspiciousActivities.length > 0

    return {
      sessionId: sessionInfo.sessionId,
      userId: sessionInfo.userId,
      isAuthenticated: true,
      riskScore,
      requiresReauth,
      suspiciousActivities
    }
  }

  private async calculateRiskScore(sessionInfo: SessionInfo, request: Request): Promise<number> {
    let score = 0

    // IP-based risk
    const currentIP = this.getClientIP(request)
    if (currentIP !== sessionInfo.ipAddress) {
      score += 30 // IP change is high risk
    }

    // User agent risk
    const currentUserAgent = request.headers.get('user-agent') || 'Unknown'
    if (currentUserAgent !== sessionInfo.userAgent) {
      score += 20 // User agent change is medium risk
    }

    // Location-based risk
    if (sessionInfo.location?.country) {
      const currentLocation = await this.getLocationFromIP(currentIP)
      if (currentLocation?.country !== sessionInfo.location.country) {
        score += 40 // Country change is very high risk
      }
    }

    // Time-based risk
    const now = new Date()
    const lastActivity = new Date(sessionInfo.lastActivity)
    const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 6) {
      score += 15 // Long inactive period
    }

    return Math.min(score, 100)
  }

  private async getSuspiciousActivities(sessionId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_events')
        .select('activity')
        .eq('sessionId', sessionId)
        .eq('type', 'suspicious_activity')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

      if (error) return []

      return data?.map(e => e.activity) || []
    } catch (error) {
      return []
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

  private parseUserAgent(userAgent: string): SessionInfo['deviceInfo'] {
    // Simple user agent parsing (in production, use a proper library)
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown'

    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown'

    const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop'

    return { browser, os, device }
  }

  private async getLocationFromIP(ip: string): Promise<SessionInfo['location']> {
    // In production, use a proper IP geolocation service
    try {
      // Mock implementation
      if (ip.startsWith('127.') || ip.startsWith('192.168.')) {
        return { country: 'Local', city: 'Local' }
      }

      // Use a free geolocation API or service
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()

      return {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown'
      }
    } catch (error) {
      return { country: 'Unknown', city: 'Unknown' }
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager()

// React cache for server-side session validation
export const validateSession = cache(async (sessionId: string, request: Request) => {
  return sessionManager.validateSession(sessionId, request)
})

export const createSession = cache(async (userId: string, request: Request) => {
  return sessionManager.createSession(userId, request)
})
