import { type SessionInfo } from './session-manager'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface AuditTrail {
  id: string
  userId?: string
  sessionId?: string
  action: string
  resource: string
  resourceId?: string
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'security' | 'system'
  severity: 'info' | 'warning' | 'error' | 'critical'
  success: boolean
  oldValues?: any
  newValues?: any
  ipAddress: string
  userAgent: string
  timestamp: string
  metadata?: any
  chainId?: string // For linking related audit events
  parentEventId?: string // For hierarchical relationships
}

export interface AuditTrailFilter {
  userId?: string
  sessionId?: string
  action?: string
  resource?: string
  category?: string
  severity?: string
  success?: boolean
  startDate?: string
  endDate?: string
  chainId?: string
  parentEventId?: string
  search?: string // Text search across all fields
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'action' | 'resource' | 'severity'
  sortOrder?: 'asc' | 'desc'
}

export interface AuditTrailAnalytics {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsByAction: Record<string, number>
  eventsBySeverity: Record<string, number>
  successRate: number
  errorRate: number
  timeSeriesData: Array<{
    date: string
    count: number
    successCount: number
    errorCount: number
  }>
  topUsers: Array<{
    userId: string
    eventCount: number
    lastActivity: string
    riskScore: number
  }>
  topResources: Array<{
    resource: string
    eventCount: number
    lastActivity: string
  }>
  criticalEvents: AuditTrail[]
  errorPatterns: Array<{
    pattern: string
    count: number
    description: string
  }>
}

export class AuditTrailManager {
  private admin = createSupabaseAdminClient()

  /**
   * Create an audit trail entry
   */
  async create(entry: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<AuditTrail> {
    const auditEntry: AuditTrail = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }

    try {
      // Store in security_audit_logs table
      await this.admin
        .from('security_audit_logs')
        .insert({
          id: auditEntry.id,
          userId: auditEntry.userId,
          sessionId: auditEntry.sessionId,
          action: auditEntry.action,
          resource: auditEntry.resource,
          resourceId: auditEntry.resourceId,
          category: auditEntry.category,
          severity: auditEntry.severity,
          success: auditEntry.success,
          oldValues: auditEntry.oldValues,
          newValues: auditEntry.newValues,
          ipAddress: auditEntry.ipAddress,
          userAgent: auditEntry.userAgent,
          timestamp: auditEntry.timestamp,
          metadata: {
            ...auditEntry.metadata,
            chainId: auditEntry.chainId,
            parentEventId: auditEntry.parentEventId
          }
        })

      return auditEntry
    } catch (error) {
      throw error
    }
  }

  /**
   * Create an audit trail chain for related operations
   */
  async createChain(
    entries: Omit<AuditTrail, 'id' | 'timestamp' | 'chainId'>[],
    chainId?: string
  ): Promise<AuditTrail[]> {
    const actualChainId = chainId || crypto.randomUUID()
    const createdEntries: AuditTrail[] = []

    for (const entry of entries) {
      const auditEntry = await this.create({
        ...entry,
        chainId: actualChainId
      })
      createdEntries.push(auditEntry)
    }

    return createdEntries
  }

  /**
   * Query audit trail entries
   */
  async query(filter: AuditTrailFilter = {}): Promise<{
    entries: AuditTrail[]
    total: number
    hasMore: boolean
  }> {
    try {
      let query = this.admin
        .from('security_audit_logs')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filter.userId) {
        query = query.eq('userId', filter.userId)
      }

      if (filter.sessionId) {
        query = query.eq('sessionId', filter.sessionId)
      }

      if (filter.action) {
        query = query.eq('action', filter.action)
      }

      if (filter.resource) {
        query = query.eq('resource', filter.resource)
      }

      if (filter.category) {
        query = query.eq('category', filter.category)
      }

      if (filter.severity) {
        query = query.eq('severity', filter.severity)
      }

      if (filter.success !== undefined) {
        query = query.eq('success', filter.success)
      }

      if (filter.startDate) {
        query = query.gte('timestamp', filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte('timestamp', filter.endDate)
      }

      if (filter.chainId) {
        query = query.eq('metadata->>chainId', filter.chainId)
      }

      if (filter.parentEventId) {
        query = query.eq('metadata->>parentEventId', filter.parentEventId)
      }

      // Text search
      if (filter.search) {
        query = query.or(`
          action.ilike.%${filter.search}%,
          resource.ilike.%${filter.search}%,
          resourceId.ilike.%${filter.search}%,
          errorMessage.ilike.%${filter.search}%
        `)
      }

      // Apply ordering
      const sortBy = filter.sortBy || 'timestamp'
      const sortOrder = filter.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const limit = filter.limit || 50
      const offset = filter.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      const entries: AuditTrail[] = (data || []).map(entry => ({
        id: entry.id,
        userId: entry.userId,
        sessionId: entry.sessionId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        category: entry.category,
        severity: entry.severity,
        success: entry.success,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: entry.timestamp,
        metadata: entry.metadata,
        chainId: entry.metadata?.chainId,
        parentEventId: entry.metadata?.parentEventId
      }))

      return {
        entries,
        total: count || 0,
        hasMore: offset + entries.length < (count || 0)
      }
    } catch (error) {
      return { entries: [], total: 0, hasMore: false }
    }
  }

  /**
   * Get audit trail analytics
   */
  async getAnalytics(
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<AuditTrailAnalytics> {
    const timeRangeInHours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[timeRange]

    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - timeRangeInHours * 60 * 60 * 1000)

    try {
      // Get all entries in time range
      const { data: entries, error } = await this.admin
        .from('security_audit_logs')
        .select('*')
        .gte('timestamp', cutoffTime.toISOString())
        .order('timestamp', { ascending: true })

      if (error) throw error

      const totalEvents = entries?.length || 0
      const eventsByCategory: Record<string, number> = {}
      const eventsByAction: Record<string, number> = {}
      const eventsBySeverity: Record<string, number> = {}
      let successCount = 0
      let errorCount = 0

      // User activity tracking
      const userActivity: Record<string, { count: number; lastActivity: string; severityScore: number }> = {}
      const resourceActivity: Record<string, { count: number; lastActivity: string }> = {}

      // Time series data
      const timeSeriesMap: Record<string, { count: number; successCount: number; errorCount: number }> = {}

      // Critical events
      const criticalEvents: AuditTrail[] = []

      // Error patterns
      const errorPatterns: Record<string, { count: number; description: string }> = {}

      entries?.forEach(entry => {
        // Count by category
        eventsByCategory[entry.category] = (eventsByCategory[entry.category] || 0) + 1

        // Count by action
        eventsByAction[entry.action] = (eventsByAction[entry.action] || 0) + 1

        // Count by severity
        eventsBySeverity[entry.severity] = (eventsBySeverity[entry.severity] || 0) + 1

        // Success/error counts
        if (entry.success) {
          successCount++
        } else {
          errorCount++
        }

        // User activity
        if (entry.userId) {
          if (!userActivity[entry.userId]) {
            userActivity[entry.userId] = { count: 0, lastActivity: entry.timestamp, severityScore: 0 }
          }
          userActivity[entry.userId].count += 1
          const severityScore = ({ info: 1, warning: 2, error: 3, critical: 4 } as any)[entry.severity] || 1
          userActivity[entry.userId].severityScore += severityScore
          if (new Date(entry.timestamp) > new Date(userActivity[entry.userId].lastActivity)) {
            userActivity[entry.userId].lastActivity = entry.timestamp
          }
        }

        // Resource activity
        if (!resourceActivity[entry.resource]) {
          resourceActivity[entry.resource] = { count: 0, lastActivity: entry.timestamp }
        }
        resourceActivity[entry.resource].count += 1

        // Time series data (group by hour)
        const hourKey = entry.timestamp.slice(0, 13) // YYYY-MM-DDTHH
        if (!timeSeriesMap[hourKey]) {
          timeSeriesMap[hourKey] = { count: 0, successCount: 0, errorCount: 0 }
        }
        timeSeriesMap[hourKey].count += 1
        if (entry.success) {
          timeSeriesMap[hourKey].successCount += 1
        } else {
          timeSeriesMap[hourKey].errorCount += 1
        }

        // Critical events
        if (entry.severity === 'critical') {
          criticalEvents.push({
            id: entry.id,
            userId: entry.userId,
            sessionId: entry.sessionId,
            action: entry.action,
            resource: entry.resource,
            resourceId: entry.resourceId,
            category: entry.category,
            severity: entry.severity,
            success: entry.success,
            oldValues: entry.oldValues,
            newValues: entry.newValues,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            timestamp: entry.timestamp,
            metadata: entry.metadata,
            chainId: entry.metadata?.chainId,
            parentEventId: entry.metadata?.parentEventId
          })
        }

        // Error patterns
        if (!entry.success && entry.errorMessage) {
          const pattern = this.extractErrorPattern(entry.errorMessage)
          if (!errorPatterns[pattern]) {
            errorPatterns[pattern] = { count: 0, description: entry.errorMessage.slice(0, 100) }
          }
          errorPatterns[pattern].count += 1
        }
      })

      // Sort and format data
      const topUsers = Object.entries(userActivity)
        .map(([userId, data]) => ({
          userId,
          eventCount: data.count,
          lastActivity: data.lastActivity,
          riskScore: Math.round((data.severityScore / data.count) * 100) / 100
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10)

      const topResources = Object.entries(resourceActivity)
        .map(([resource, data]) => ({ resource, eventCount: data.count, lastActivity: data.lastActivity }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 10)

      const timeSeriesData = Object.entries(timeSeriesMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const errorPatternsData = Object.entries(errorPatterns)
        .map(([pattern, data]) => ({ pattern, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      const successRate = totalEvents > 0 ? (successCount / totalEvents) * 100 : 0
      const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0

      return {
        totalEvents,
        eventsByCategory,
        eventsByAction,
        eventsBySeverity,
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        timeSeriesData,
        topUsers,
        topResources,
        criticalEvents,
        errorPatterns: errorPatternsData
      }
    } catch (error) {
      return {
        totalEvents: 0,
        eventsByCategory: {},
        eventsByAction: {},
        eventsBySeverity: {},
        successRate: 0,
        errorRate: 0,
        timeSeriesData: [],
        topUsers: [],
        topResources: [],
        criticalEvents: [],
        errorPatterns: []
      }
    }
  }

  /**
   * Get audit trail for a specific chain
   */
  async getChain(chainId: string): Promise<AuditTrail[]> {
    const result = await this.query({ chainId, limit: 1000 })
    return result.entries
  }

  /**
   * Get audit trail for a specific user with risk assessment
   */
  async getUserAuditTrail(
    userId: string,
    timeRange: '24h' | '7d' | '30d' = '30d'
  ): Promise<{
    entries: AuditTrail[]
    riskAssessment: {
      riskScore: number
      riskLevel: 'low' | 'medium' | 'high' | 'critical'
      riskFactors: string[]
      recommendations: string[]
    }
  }> {
    const timeRangeInHours = { '24h': 24, '7d': 168, '30d': 720 }[timeRange]
    const startDate = new Date()
    startDate.setTime(startDate.getTime() - timeRangeInHours * 60 * 60 * 1000)

    const { entries } = await this.query({
      userId,
      startDate: startDate.toISOString(),
      limit: 1000
    })

    // Calculate risk assessment
    const riskAssessment = this.calculateUserRisk(userId, entries)

    return {
      entries,
      riskAssessment
    }
  }

  /**
   * Export audit trail to CSV
   */
  async exportToCSV(filter: AuditTrailFilter = {}): Promise<string> {
    const { entries } = await this.query({
      ...filter,
      limit: 10000 // Increase limit for export
    })

    const headers = [
      'Timestamp',
      'User ID',
      'Session ID',
      'Action',
      'Resource',
      'Resource ID',
      'Category',
      'Severity',
      'Success',
      'IP Address',
      'User Agent',
      'Chain ID',
      'Parent Event ID',
      'Error Message',
      'Metadata'
    ]

    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.timestamp,
        entry.userId || '',
        entry.sessionId || '',
        entry.action,
        entry.resource,
        entry.resourceId || '',
        entry.category,
        entry.severity,
        entry.success,
        entry.ipAddress,
        `"${entry.userAgent.replace(/"/g, '""')}"`, // Escape quotes
        entry.chainId || '',
        entry.parentEventId || '',
        entry.metadata?.errorMessage ? `"${entry.metadata.errorMessage.replace(/"/g, '""')}"` : '',
        entry.metadata ? `"${JSON.stringify(entry.metadata).replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n')

    return csvContent
  }

  /**
   * Archive old audit trail entries
   */
  async archive(retentionDays: number = 365): Promise<number> {
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - retentionDays * 24 * 60 * 60 * 1000)

    try {
      // Move old entries to archive table (if it exists)
      // For now, just delete them
      const { data, error } = await this.admin
        .from('security_audit_logs')
        .delete()
        .lt('timestamp', cutoffTime.toISOString())
        .select('id')

      if (error) throw error

      const archivedCount = data?.length || 0

      return archivedCount
    } catch (error) {
      return 0
    }
  }

  // Private helper methods
  private calculateUserRisk(userId: string, entries: AuditTrail[]): {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskFactors: string[]
    recommendations: string[]
  } {
    let riskScore = 0
    const riskFactors: string[] = []
    const recommendations: string[] = []

    // Analyze recent activity patterns
    const recentEntries = entries.slice(0, 100) // Last 100 entries
    const criticalEvents = recentEntries.filter(e => e.severity === 'critical')
    const errorEvents = recentEntries.filter(e => !e.success)
    const securityEvents = recentEntries.filter(e => e.category === 'security')

    // Calculate base risk score
    riskScore += criticalEvents.length * 25
    riskScore += errorEvents.length * 10
    riskScore += securityEvents.length * 15

    // Risk factors
    if (criticalEvents.length > 0) {
      riskFactors.push(`${criticalEvents.length} critical security events`)
      recommendations.push('Review critical security events immediately')
    }

    if (errorEvents.length > recentEntries.length * 0.3) {
      riskFactors.push('High error rate (>30%)')
      recommendations.push('Investigate cause of frequent errors')
    }

    if (securityEvents.length > 0) {
      riskFactors.push(`${securityEvents.length} security-related activities`)
      recommendations.push('Monitor security activities closely')
    }

    // Check for suspicious patterns
    const uniqueIPs = new Set(recentEntries.map(e => e.ipAddress)).size
    if (uniqueIPs > 5) {
      riskScore += 20
      riskFactors.push(`Activity from ${uniqueIPs} different IP addresses`)
      recommendations.push('Verify user identity and session security')
    }

    const uniqueUserAgents = new Set(recentEntries.map(e => e.userAgent)).size
    if (uniqueUserAgents > 3) {
      riskScore += 15
      riskFactors.push(`Activity from ${uniqueUserAgents} different devices/browsers`)
      recommendations.push('Check for possible session hijacking')
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (riskScore >= 75) {
      riskLevel = 'critical'
      recommendations.push('Immediate security review required')
    } else if (riskScore >= 50) {
      riskLevel = 'high'
      recommendations.push('Elevated security monitoring recommended')
    } else if (riskScore >= 25) {
      riskLevel = 'medium'
      recommendations.push('Continue monitoring user activity')
    }

    // Add general recommendations if none
    if (recommendations.length === 0) {
      recommendations.push('User activity appears normal')
    }

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      riskFactors,
      recommendations
    }
  }

  private extractErrorPattern(errorMessage: string): string {
    // Extract common error patterns
    const patterns = [
      { pattern: /permission denied/i, name: 'Permission Denied' },
      { pattern: /authentication failed/i, name: 'Authentication Failed' },
      { pattern: /rate limit/i, name: 'Rate Limit Exceeded' },
      { pattern: /validation error/i, name: 'Validation Error' },
      { pattern: /network error/i, name: 'Network Error' },
      { pattern: /database error/i, name: 'Database Error' },
      { pattern: /timeout/i, name: 'Timeout Error' }
    ]

    for (const { pattern, name } of patterns) {
      if (pattern.test(errorMessage)) {
        return name
      }
    }

    // Return first 50 chars of error message as pattern
    return errorMessage.slice(0, 50).toLowerCase()
  }
}

// Singleton instance
export const auditTrailManager = new AuditTrailManager()

// Convenience functions
export const createAuditEntry = (entry: Omit<AuditTrail, 'id' | 'timestamp'>) =>
  auditTrailManager.create(entry)

export const createAuditChain = (entries: Omit<AuditTrail, 'id' | 'timestamp' | 'chainId'>[], chainId?: string) =>
  auditTrailManager.createChain(entries, chainId)

export const queryAuditTrail = (filter?: AuditTrailFilter) =>
  auditTrailManager.query(filter)