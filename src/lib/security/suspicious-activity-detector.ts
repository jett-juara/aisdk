import { sessionManager, type SessionInfo } from './session-manager'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface SuspiciousActivity {
  id: string
  type: 'failed_login' | 'privilege_escalation' | 'data_access' | 'session_hijack' | 'rate_limit' | 'security_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  activity: string
  userId?: string
  sessionId?: string
  details: any
  timestamp: string
  autoAction?: 'block_ip' | 'require_reauth' | 'notify_admin' | 'lock_account'
}

export interface SecurityRule {
  id: string
  name: string
  description: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  conditions: {
    timeWindow: number // in minutes
    threshold: number
    cooldown: number // in minutes
  }
  actions: string[]
  autoResponse?: {
    type: 'block_ip' | 'require_reauth' | 'notify_admin' | 'lock_account'
    threshold: number
  }
}

export class SuspiciousActivityDetector {
  private admin = createSupabaseAdminClient()

  // Predefined security rules
  private securityRules: SecurityRule[] = [
    {
      id: 'multiple_failed_logins',
      name: 'Multiple Failed Logins',
      description: 'Detects multiple failed login attempts within time window',
      type: 'failed_login',
      severity: 'high',
      enabled: true,
      conditions: {
        timeWindow: 15, // 15 minutes
        threshold: 5, // 5 failed attempts
        cooldown: 60 // 1 hour cooldown
      },
      actions: ['notify_admin', 'require_reauth'],
      autoResponse: {
        type: 'block_ip',
        threshold: 10 // Block IP after 10 failed attempts
      }
    },
    {
      id: 'privilege_escalation',
      name: 'Privilege Escalation Attempt',
      description: 'Detects unauthorized privilege escalation attempts',
      type: 'privilege_escalation',
      severity: 'critical',
      enabled: true,
      conditions: {
        timeWindow: 60, // 1 hour
        threshold: 1, // Any attempt is critical
        cooldown: 1440 // 24 hour cooldown
      },
      actions: ['notify_admin', 'lock_account'],
      autoResponse: {
        type: 'lock_account',
        threshold: 1
      }
    },
    {
      id: 'unusual_data_access',
      name: 'Unusual Data Access Pattern',
      description: 'Detects unusual data access patterns',
      type: 'data_access',
      severity: 'medium',
      enabled: true,
      conditions: {
        timeWindow: 30, // 30 minutes
        threshold: 100, // 100 records accessed
        cooldown: 120 // 2 hour cooldown
      },
      actions: ['notify_admin']
    },
    {
      id: 'session_hijacking',
      name: 'Session Hijacking Attempt',
      description: 'Detects potential session hijacking',
      type: 'session_hijack',
      severity: 'critical',
      enabled: true,
      conditions: {
        timeWindow: 5, // 5 minutes
        threshold: 1, // Any suspicious activity
        cooldown: 60 // 1 hour cooldown
      },
      actions: ['notify_admin', 'require_reauth'],
      autoResponse: {
        type: 'require_reauth',
        threshold: 1
      }
    },
    {
      id: 'rate_limit_violation',
      name: 'Rate Limit Violation',
      description: 'Detects rate limit violations',
      type: 'rate_limit',
      severity: 'medium',
      enabled: true,
      conditions: {
        timeWindow: 1, // 1 minute
        threshold: 1000, // 1000 requests
        cooldown: 15 // 15 minute cooldown
      },
      actions: ['notify_admin'],
      autoResponse: {
        type: 'require_reauth',
        threshold: 5000
      }
    },
    {
      id: 'impossible_travel',
      name: 'Impossible Travel',
      description: 'Detects login from geographically impossible locations',
      type: 'security_violation',
      severity: 'high',
      enabled: true,
      conditions: {
        timeWindow: 60, // 1 hour
        threshold: 1, // Any impossible travel
        cooldown: 240 // 4 hour cooldown
      },
      actions: ['notify_admin', 'require_reauth']
    },
    {
      id: 'concurrent_sessions',
      name: 'Excessive Concurrent Sessions',
      description: 'Detects too many concurrent sessions',
      type: 'security_violation',
      severity: 'medium',
      enabled: true,
      conditions: {
        timeWindow: 1, // 1 minute
        threshold: 10, // 10 concurrent sessions
        cooldown: 60 // 1 hour cooldown
      },
      actions: ['notify_admin']
    }
  ]

  /**
   * Analyze activity for suspicious patterns
   */
  async analyzeActivity(
    activity: {
      type: string
      userId?: string
      sessionId?: string
      ipAddress: string
      userAgent: string
      details?: any
    },
    context?: {
      previousSessions?: SessionInfo[]
      currentTime?: Date
    }
  ): Promise<SuspiciousActivity[]> {
    const suspiciousActivities: SuspiciousActivity[] = []
    const currentTime = context?.currentTime || new Date()

    // Check against all enabled security rules
    for (const rule of this.securityRules.filter(r => r.enabled)) {
      if (activity.type === rule.type) {
        const isSuspicious = await this.evaluateRule(rule, activity, currentTime)

        if (isSuspicious) {
          const suspiciousActivity = await this.createSuspiciousActivity(
            rule,
            activity,
            currentTime
          )
          suspiciousActivities.push(suspiciousActivity)

          // Check for auto-response
          await this.handleAutoResponse(rule, suspiciousActivity)
        }
      }
    }

    // Additional context-based checks
    await this.performContextualChecks(activity, suspiciousActivities, currentTime)

    return suspiciousActivities
  }

  /**
   * Check for unusual patterns in user behavior
   */
  async detectAnomalousBehavior(
    userId: string,
    currentActivity: {
      ipAddress: string
      userAgent: string
      resource: string
      timestamp: Date
    }
  ): Promise<SuspiciousActivity[]> {
    const suspiciousActivities: SuspiciousActivity[] = []

    // Get user's historical behavior
    const historicalData = await this.getUserBehaviorPattern(userId, 30) // Last 30 days

    if (historicalData.length === 0) {
      return suspiciousActivities // No history to compare
    }

    // Check for IP address anomaly
    const ipAnomaly = this.detectIPAnomaly(currentActivity.ipAddress, historicalData)
    if (ipAnomaly.isAnomalous) {
      suspiciousActivities.push({
        id: crypto.randomUUID(),
        type: 'session_hijack',
        severity: 'high',
        activity: 'Unusual IP address detected',
        userId,
        details: {
          currentIP: currentActivity.ipAddress,
          usualIPs: ipAnomaly.usualIPs,
          confidence: ipAnomaly.confidence
        },
        timestamp: currentActivity.timestamp.toISOString(),
        autoAction: 'require_reauth'
      })
    }

    // Check for user agent anomaly
    const userAgentAnomaly = this.detectUserAgentAnomaly(currentActivity.userAgent, historicalData)
    if (userAgentAnomaly.isAnomalous) {
      suspiciousActivities.push({
        id: crypto.randomUUID(),
        type: 'session_hijack',
        severity: 'medium',
        activity: 'Unusual user agent detected',
        userId,
        details: {
          currentUserAgent: currentActivity.userAgent,
          usualUserAgents: userAgentAnomaly.usualUserAgents,
          confidence: userAgentAnomaly.confidence
        },
        timestamp: currentActivity.timestamp.toISOString(),
        autoAction: 'require_reauth'
      })
    }

    // Check for time-based anomaly
    const timeAnomaly = this.detectTimeAnomaly(currentActivity.timestamp, historicalData)
    if (timeAnomaly.isAnomalous) {
      suspiciousActivities.push({
        id: crypto.randomUUID(),
        type: 'security_violation',
        severity: 'low',
        activity: 'Unusual access time detected',
        userId,
        details: {
          currentTime: currentActivity.timestamp.toISOString(),
          usualHours: timeAnomaly.usualHours,
          confidence: timeAnomaly.confidence
        },
        timestamp: currentActivity.timestamp.toISOString()
      })
    }

    return suspiciousActivities
  }

  /**
   * Check for impossible travel scenarios
   */
  async detectImpossibleTravel(
    userId: string,
    currentLocation: { country: string; city: string },
    currentTimestamp: Date
  ): Promise<SuspiciousActivity | null> {
    // Get recent sessions for the user
    const recentSessions = await sessionManager.getUserSessions(userId)
    const activeSessions = recentSessions.filter(s => s.isActive && s.location)

    if (activeSessions.length === 0) {
      return null
    }

    // Check if user was in a location that makes current access impossible
    for (const session of activeSessions) {
      if (!session.location) continue

      const travelTime = this.calculateTravelTime(
        {
          country: session.location?.country || 'unknown',
          city: session.location?.city || 'unknown'
        },
        {
          country: currentLocation?.country || 'unknown',
          city: currentLocation?.city || 'unknown'
        }
      )

      const timeDiff = currentTimestamp.getTime() - new Date(session.lastActivity).getTime()

      // If travel time is longer than actual time difference, it's impossible travel
      if (travelTime > timeDiff) {
        return {
          id: crypto.randomUUID(),
          type: 'security_violation',
          severity: 'high',
          activity: 'Impossible travel detected',
          userId,
          sessionId: session.sessionId,
          details: {
            previousLocation: session.location,
            currentLocation,
            travelTimeMinutes: Math.round(travelTime / (1000 * 60)),
            actualTimeDiffMinutes: Math.round(timeDiff / (1000 * 60)),
            confidence: 0.95
          },
          timestamp: currentTimestamp.toISOString(),
          autoAction: 'require_reauth'
        }
      }
    }

    return null
  }

  /**
   * Get security analytics
   */
  async getSecurityAnalytics(
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    topRiskyUsers: Array<{ userId: string; riskScore: number; eventsCount: number }>
    blockedIPs: string[]
    recentEvents: SuspiciousActivity[]
  }> {
    const timeRangeInHours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[timeRange]

    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - timeRangeInHours * 60 * 60 * 1000)

    try {
      // Get security events
      const { data: events, error } = await this.admin
        .from('security_events')
        .select('*')
        .gte('timestamp', cutoffTime.toISOString())
        .order('timestamp', { ascending: false })

      if (error) throw error

      const eventsByType: Record<string, number> = {}
      const eventsBySeverity: Record<string, number> = {}
      const userRiskScores: Record<string, { score: number; count: number }> = {}
      const blockedIPs: Set<string> = new Set()

      events?.forEach(event => {
        // Count by type
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1

        // Count by severity
        const severityKey = event.severity as any
        eventsBySeverity[severityKey] = (eventsBySeverity[severityKey] || 0) + 1

        // Track user risk scores
        if (event.userId) {
          if (!userRiskScores[event.userId]) {
            userRiskScores[event.userId] = { score: 0, count: 0 }
          }
          const severityScore = ({ low: 1, medium: 2, high: 3, critical: 4 } as any)[event.severity] || 1
          userRiskScores[event.userId].score += severityScore
          userRiskScores[event.userId].count += 1
        }

        // Track blocked IPs
        if (event.details?.blockedIP) {
          blockedIPs.add(event.details.blockedIP)
        }
      })

      // Sort users by risk score
      const topRiskyUsers = Object.entries(userRiskScores)
        .map(([userId, data]) => ({
          userId,
          riskScore: data.score,
          eventsCount: data.count
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10)

      return {
        totalEvents: events?.length || 0,
        eventsByType,
        eventsBySeverity,
        topRiskyUsers,
        blockedIPs: Array.from(blockedIPs),
        recentEvents: events?.slice(0, 50).map(event => ({
          id: event.id,
          type: event.type,
          severity: event.severity,
          activity: event.activity,
          userId: event.userId || undefined,
          sessionId: event.sessionId || undefined,
          details: event.details,
          timestamp: event.timestamp
        })) || []
      }
    } catch (error) {
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topRiskyUsers: [],
        blockedIPs: [],
        recentEvents: []
      }
    }
  }

  // Private helper methods
  private async evaluateRule(
    rule: SecurityRule,
    activity: any,
    currentTime: Date
  ): Promise<boolean> {
    const cutoffTime = new Date(currentTime)
    cutoffTime.setTime(cutoffTime.getTime() - rule.conditions.timeWindow * 60 * 1000)

    try {
      // Count similar events in time window
      const { count, error } = await this.admin
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('type', rule.type)
        .gte('timestamp', cutoffTime.toISOString())
        .lt('timestamp', currentTime.toISOString())

      if (error) return false

      return (count || 0) >= rule.conditions.threshold
    } catch (error) {
      return false
    }
  }

  private async createSuspiciousActivity(
    rule: SecurityRule,
    activity: any,
    currentTime: Date
  ): Promise<SuspiciousActivity> {
    const suspiciousActivity: SuspiciousActivity = {
      id: crypto.randomUUID(),
      type: rule.type as any,
      severity: rule.severity,
      activity: rule.name,
      userId: activity.userId,
      sessionId: activity.sessionId,
      details: activity.details || {},
      timestamp: currentTime.toISOString()
    }

    // Store in database
    try {
      await this.admin
        .from('security_events')
        .insert({
          id: suspiciousActivity.id,
          sessionId: suspiciousActivity.sessionId,
          userId: suspiciousActivity.userId,
          type: suspiciousActivity.type,
          activity: suspiciousActivity.activity,
          details: suspiciousActivity.details,
          severity: suspiciousActivity.severity,
          timestamp: suspiciousActivity.timestamp
        })
    } catch (error) {
    }

    return suspiciousActivity
  }

  private async handleAutoResponse(
    rule: SecurityRule,
    activity: SuspiciousActivity
  ): Promise<void> {
    if (!rule.autoResponse) return

    try {
      switch (rule.autoResponse.type) {
        case 'block_ip':
          await this.blockIPAddress(activity.details?.ipAddress)
          break
        case 'require_reauth':
          if (activity.sessionId) {
            await this.requireReauthentication(activity.sessionId)
          }
          break
        case 'notify_admin':
          await this.notifyAdministrators(activity)
          break
        case 'lock_account':
          if (activity.userId) {
            await this.lockUserAccount(activity.userId)
          }
          break
      }
    } catch (error) {
    }
  }

  private async performContextualChecks(
    activity: any,
    suspiciousActivities: SuspiciousActivity[],
    currentTime: Date
  ): Promise<void> {
    // Check for impossible travel
    if (activity.userId && activity.details?.location) {
      const impossibleTravel = await this.detectImpossibleTravel(
        activity.userId,
        activity.details.location,
        currentTime
      )
      if (impossibleTravel) {
        suspiciousActivities.push(impossibleTravel)
      }
    }
  }

  private async getUserBehaviorPattern(
    userId: string,
    days: number
  ): Promise<any[]> {
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - days * 24 * 60 * 60 * 1000)

    try {
      const { data, error } = await this.admin
        .from('security_audit_logs')
        .select('ipAddress, userAgent, timestamp')
        .eq('userId', userId)
        .gte('timestamp', cutoffTime.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000)

      return data || []
    } catch (error) {
      return []
    }
  }

  private detectIPAnomaly(
    currentIP: string,
    historicalData: any[]
  ): { isAnomalous: boolean; usualIPs: string[]; confidence: number } {
    const ipCounts: Record<string, number> = {}
    historicalData.forEach(entry => {
      ipCounts[entry.ipAddress] = (ipCounts[entry.ipAddress] || 0) + 1
    })

    const usualIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ip]) => ip)

    const isAnomalous = !usualIPs.includes(currentIP)
    const confidence = isAnomalous ? 0.8 : 0.2

    return { isAnomalous, usualIPs, confidence }
  }

  private detectUserAgentAnomaly(
    currentUserAgent: string,
    historicalData: any[]
  ): { isAnomalous: boolean; usualUserAgents: string[]; confidence: number } {
    const userAgentCounts: Record<string, number> = {}
    historicalData.forEach(entry => {
      userAgentCounts[entry.userAgent] = (userAgentCounts[entry.userAgent] || 0) + 1
    })

    const usualUserAgents = Object.entries(userAgentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([ua]) => ua)

    const isAnomalous = !usualUserAgents.some(ua => currentUserAgent.includes(ua.slice(0, 20)))
    const confidence = isAnomalous ? 0.7 : 0.3

    return { isAnomalous, usualUserAgents, confidence }
  }

  private detectTimeAnomaly(
    currentTime: Date,
    historicalData: any[]
  ): { isAnomalous: boolean; usualHours: number[]; confidence: number } {
    const hourCounts: Record<number, number> = {}
    historicalData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    const usualHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([hour]) => parseInt(hour))

    const currentHour = currentTime.getHours()
    const isAnomalous = !usualHours.includes(currentHour)
    const confidence = isAnomalous ? 0.6 : 0.4

    return { isAnomalous, usualHours, confidence }
  }

  private calculateTravelTime(
    from: { country: string; city: string },
    to: { country: string; city: string }
  ): number {
    // Simplified travel time calculation (in milliseconds)
    // In production, use a proper distance calculation API

    if (from.country === to.country && from.city === to.city) {
      return 0 // Same location
    }

    if (from.country === to.country) {
      return 2 * 60 * 60 * 1000 // 2 hours for same country
    }

    return 12 * 60 * 60 * 1000 // 12 hours for international travel
  }

  private async blockIPAddress(ipAddress: string): Promise<void> {
    try {
      await this.admin
        .from('rate_limits')
        .upsert({
          key: `blocked_ip:${ipAddress}`,
          count: 1,
          windowStart: new Date().toISOString(),
          windowDuration: 24 * 60 * 60, // 24 hours
          maxCount: 1,
          blockUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          metadata: { reason: 'Auto-blocked due to suspicious activity' }
        })
    } catch (error) {
    }
  }

  private async requireReauthentication(sessionId: string): Promise<void> {
    try {
      await sessionManager.markSuspiciousActivity(
        sessionId,
        'Re-authentication required',
        { reason: 'Suspicious activity detected' }
      )
    } catch (error) {
    }
  }

  private async notifyAdministrators(activity: SuspiciousActivity): Promise<void> {
    // In production, implement proper notification system
    console.log('Suspicious activity detected:', {
      type: activity.type,
      severity: activity.severity,
      activity: activity.activity,
      userId: activity.userId,
      timestamp: activity.timestamp,
      details: activity.details
    })
  }

  private async lockUserAccount(userId: string): Promise<void> {
    try {
      await this.admin
        .from('users')
        .update({
          status: 'blocked',
          blocked_at: new Date().toISOString(),
          blocked_reason: 'Automatic lock due to security violation'
        })
        .eq('id', userId)

      // Invalidate all sessions for this user
      const sessions = await sessionManager.getUserSessions(userId)
      for (const session of sessions) {
        await sessionManager.invalidateSession(session.sessionId)
      }
    } catch (error) {
    }
  }
}

// Singleton instance
export const suspiciousActivityDetector = new SuspiciousActivityDetector()