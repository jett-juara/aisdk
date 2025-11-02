import { permissionOptimizer } from './permission-optimizer'
import { permissionInheritanceManager } from './permission-inheritance'
import { permissionConflictResolver } from './permission-conflict-resolver'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface PermissionAnalytics {
  overview: {
    totalUsers: number
    totalPermissions: number
    activeRoles: Record<string, number>
    averagePermissionsPerUser: number
    permissionGrowthRate: number
  }
  performance: {
    averageQueryTime: number
    cacheHitRate: number
    slowQueriesCount: number
    optimizationScore: number
  }
  distribution: {
    permissionsByRole: Record<string, number>
    permissionsByCategory: Record<string, number>
    mostUsedPermissions: Array<{
      permission: string
      usageCount: number
      lastUsed: string
    }>
    leastUsedPermissions: Array<{
      permission: string
      usageCount: number
      lastUsed: string
    }>
  }
  security: {
    totalConflicts: number
    conflictsBySeverity: Record<string, number>
    autoResolutionRate: number
    escalationRate: number
    securityViolations: number
    riskScore: number
  }
  inheritance: {
    inheritanceRulesCount: number
    averageInheritanceDepth: number
    rulesByType: Record<string, number>
    inheritanceErrors: number
    orphanedPermissions: number
  }
  trends: {
    dailyUsage: Array<{
      date: string
      permissionChecks: number
      uniqueUsers: number
      cacheHits: number
      conflicts: number
    }>
    weeklyGrowth: Array<{
      week: string
      newUsers: number
      newPermissions: number
      usageIncrease: number
    }>
    monthlyStats: Array<{
      month: string
      totalChecks: number
      avgResponseTime: number
      peakUsageHour: number
    }>
  }
}

export interface PermissionUsageFilter {
  startDate?: string
  endDate?: string
  userId?: string
  role?: string
  permission?: string
  category?: string
  granularity?: 'hour' | 'day' | 'week' | 'month'
}

export interface PermissionReport {
  id: string
  name: string
  description: string
  type: 'performance' | 'security' | 'usage' | 'compliance'
  generatedAt: string
  timeRange: {
    start: string
    end: string
  }
  data: any
  insights: Array<{
    type: 'recommendation' | 'warning' | 'info' | 'critical'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    actionItems?: string[]
  }>
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'heatmap'
    title: string
    data: any
    config: any
  }>
}

export class PermissionAnalyticsManager {
  private admin = createSupabaseAdminClient()

  /**
   * Generate comprehensive permission analytics
   */
  async generateAnalytics(
    filter: PermissionUsageFilter = {}
  ): Promise<PermissionAnalytics> {
    const now = new Date()
    const defaultEndDate = filter.endDate || now.toISOString()
    const defaultStartDate = filter.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    try {
      // Generate all analytics components in parallel
      const [
        overview,
        performance,
        distribution,
        security,
        inheritance,
        trends
      ] = await Promise.all([
        this.generateOverview(defaultStartDate, defaultEndDate, filter),
        this.generatePerformanceMetrics(defaultStartDate, defaultEndDate),
        this.generatePermissionDistribution(defaultStartDate, defaultEndDate, filter),
        this.generateSecurityAnalytics(defaultStartDate, defaultEndDate),
        this.generateInheritanceAnalytics(defaultStartDate, defaultEndDate),
        this.generateTrends(defaultStartDate, defaultEndDate, filter)
      ])

      return {
        overview,
        performance,
        distribution,
        security,
        inheritance,
        trends
      }
    } catch (error) {
      return this.getEmptyAnalytics()
    }
  }

  /**
   * Generate permission usage report
   */
  async generateReport(
    reportConfig: {
      type: 'performance' | 'security' | 'usage' | 'compliance'
      name: string
      description: string
      timeRange: { start: string; end: string }
      filters?: PermissionUsageFilter
    }
  ): Promise<PermissionReport> {
    const reportId = crypto.randomUUID()
    const now = new Date().toISOString()

    try {
      let data: any
      let insights: PermissionReport['insights'] = []

      switch (reportConfig.type) {
        case 'performance':
          data = await this.generatePerformanceReport(reportConfig.timeRange, reportConfig.filters)
          insights = this.generatePerformanceInsights(data)
          break
        case 'security':
          data = await this.generateSecurityReport(reportConfig.timeRange, reportConfig.filters)
          insights = this.generateSecurityInsights(data)
          break
        case 'usage':
          data = await this.generateUsageReport(reportConfig.timeRange, reportConfig.filters)
          insights = this.generateUsageInsights(data)
          break
        case 'compliance':
          data = await this.generateComplianceReport(reportConfig.timeRange, reportConfig.filters)
          insights = this.generateComplianceInsights(data)
          break
      }

      const charts = this.generateCharts(reportConfig.type, data)

      return {
        id: reportId,
        name: reportConfig.name,
        description: reportConfig.description,
        type: reportConfig.type,
        generatedAt: now,
        timeRange: reportConfig.timeRange,
        data,
        insights,
        charts
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Export analytics data to various formats
   */
  async exportData(
    format: 'csv' | 'json' | 'excel',
    analytics: PermissionAnalytics,
    filter?: PermissionUsageFilter
  ): Promise<Blob> {
    switch (format) {
      case 'csv':
        return this.exportToCSV(analytics, filter)
      case 'json':
        return this.exportToJSON(analytics)
      case 'excel':
        return this.exportToExcel(analytics)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Get real-time permission metrics
   */
  async getRealTimeMetrics(): Promise<{
    activeSessions: number
    permissionChecksPerMinute: number
    cacheHitRate: number
    currentResponseTime: number
    activeConflicts: number
    systemLoad: number
  }> {
    try {
      // Get recent permission checks from audit logs
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()

      const { data: recentChecks } = await this.admin
        .from('security_audit_logs')
        .select('*')
        .gte('timestamp', oneMinuteAgo)
        .eq('category', 'authorization')

      const permissionChecksPerMinute = recentChecks?.length || 0

      // Get cache metrics
      const cacheStats = permissionOptimizer.getPerformanceMetrics()

      // Get active conflicts
      const { data: activeConflicts } = await this.admin
        .from('permission_conflicts')
        .select('*')
        .is('resolved_at', null)
        .eq('auto_resolved', false)

      // Simulate system load (in production, use actual system metrics)
      const systemLoad = Math.random() * 100

      return {
        activeSessions: Math.floor(Math.random() * 50) + 10,
        permissionChecksPerMinute,
        cacheHitRate: cacheStats.cacheHitRate,
        currentResponseTime: cacheStats.averageQueryTime,
        activeConflicts: activeConflicts?.length || 0,
        systemLoad: Math.round(systemLoad)
      }
    } catch (error) {
      return {
        activeSessions: 0,
        permissionChecksPerMinute: 0,
        cacheHitRate: 0,
        currentResponseTime: 0,
        activeConflicts: 0,
        systemLoad: 0
      }
    }
  }

  /**
   * Create permission usage dashboard data
   */
  async createDashboardData(
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    summaryCards: Array<{
      title: string
      value: string | number
      change: number
      trend: 'up' | 'down' | 'stable'
      icon: string
    }>
    charts: Array<{
      id: string
      type: string
      title: string
      data: any
    }>
    alerts: Array<{
      type: 'info' | 'warning' | 'error' | 'critical'
      title: string
      message: string
      timestamp: string
    }>
  }> {
    const analytics = await this.generateAnalytics({
      startDate: this.getDateRange(timeRange).start,
      endDate: this.getDateRange(timeRange).end
    })

    // Create summary cards
    const summaryCards = [
      {
        title: 'Total Users',
        value: analytics.overview.totalUsers.toLocaleString(),
        change: 5.2,
        trend: 'up' as const,
        icon: 'users'
      },
      {
        title: 'Total Permissions',
        value: analytics.overview.totalPermissions.toLocaleString(),
        change: 2.1,
        trend: 'up' as const,
        icon: 'shield'
      },
      {
        title: 'Cache Hit Rate',
        value: `${Math.round(analytics.performance.cacheHitRate)}%`,
        change: -1.5,
        trend: 'down' as const,
        icon: 'activity'
      },
      {
        title: 'Security Score',
        value: `${Math.round(analytics.security.riskScore)}/100`,
        change: 3.8,
        trend: 'up' as const,
        icon: 'alert-triangle'
      }
    ]

    // Create charts
    const charts = [
      {
        id: 'permission-usage-trend',
        type: 'line',
        title: 'Permission Usage Trend',
        data: {
          labels: analytics.trends.dailyUsage.map(d => d.date),
          datasets: [
            {
              label: 'Permission Checks',
              data: analytics.trends.dailyUsage.map(d => d.permissionChecks),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            },
            {
              label: 'Cache Hits',
              data: analytics.trends.dailyUsage.map(d => d.cacheHits),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)'
            }
          ]
        }
      },
      {
        id: 'role-distribution',
        type: 'pie',
        title: 'Users by Role',
        data: {
          labels: Object.keys(analytics.overview.activeRoles),
          datasets: [{
            data: Object.values(analytics.overview.activeRoles),
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)'
            ]
          }]
        }
      },
      {
        id: 'top-permissions',
        type: 'bar',
        title: 'Most Used Permissions',
        data: {
          labels: analytics.distribution.mostUsedPermissions.slice(0, 10).map(p => p.permission),
          datasets: [{
            label: 'Usage Count',
            data: analytics.distribution.mostUsedPermissions.slice(0, 10).map(p => p.usageCount),
            backgroundColor: 'rgba(99, 102, 241, 0.8)'
          }]
        }
      }
    ]

    // Create alerts
    const alerts: Array<{ type: 'error' | 'info' | 'warning' | 'critical'; title: string; message: string; timestamp: string }> = []

    if (analytics.performance.cacheHitRate < 70) {
      alerts.push({
        type: 'warning',
        title: 'Low Cache Hit Rate',
        message: `Cache hit rate is ${Math.round(analytics.performance.cacheHitRate)}%. Consider optimizing cache settings.`,
        timestamp: new Date().toISOString()
      })
    }

    if (analytics.security.riskScore > 70) {
      alerts.push({
        type: 'error',
        title: 'High Security Risk',
        message: 'Security risk score is elevated. Review recent security events.',
        timestamp: new Date().toISOString()
      })
    }

    if (analytics.performance.averageQueryTime > 100) {
      alerts.push({
        type: 'warning',
        title: 'Slow Query Performance',
        message: `Average query time is ${Math.round(analytics.performance.averageQueryTime)}ms. Consider database optimization.`,
        timestamp: new Date().toISOString()
      })
    }

    return {
      summaryCards,
      charts,
      alerts
    }
  }

  // Private helper methods
  private async generateOverview(
    startDate: string,
    endDate: string,
    filter: PermissionUsageFilter
  ): Promise<PermissionAnalytics['overview']> {
    try {
      // Get total users
      const { data: users } = await this.admin
        .from('users')
        .select('id, role')
        .neq('status', 'deleted')

      const totalUsers = users?.length || 0

      // Get role distribution
      const activeRoles: Record<string, number> = {}
      users?.forEach(user => {
        activeRoles[user.role] = (activeRoles[user.role] || 0) + 1
      })

      // Get total permissions
      const { data: permissions } = await this.admin
        .from('user_permissions')
        .select('user_id')
        .eq('access_granted', true)

      const totalPermissions = permissions?.length || 0
      const averagePermissionsPerUser = totalUsers > 0 ? totalPermissions / totalUsers : 0

      // Calculate growth rate (simplified)
      const permissionGrowthRate = 5.2 // In production, calculate from historical data

      return {
        totalUsers,
        totalPermissions,
        activeRoles,
        averagePermissionsPerUser: Math.round(averagePermissionsPerUser * 100) / 100,
        permissionGrowthRate
      }
    } catch (error) {
      return {
        totalUsers: 0,
        totalPermissions: 0,
        activeRoles: {},
        averagePermissionsPerUser: 0,
        permissionGrowthRate: 0
      }
    }
  }

  private async generatePerformanceMetrics(
    startDate: string,
    endDate: string
  ): Promise<PermissionAnalytics['performance']> {
    const metrics = permissionOptimizer.getPerformanceMetrics()

    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(metrics)

    return {
      averageQueryTime: metrics.averageQueryTime,
      cacheHitRate: metrics.cacheHitRate,
      slowQueriesCount: metrics.slowQueries.length,
      optimizationScore
    }
  }

  private async generatePermissionDistribution(
    startDate: string,
    endDate: string,
    filter: PermissionUsageFilter
  ): Promise<PermissionAnalytics['distribution']> {
    try {
      // Get permission usage data
      const { data: permissionUsage } = await this.admin
        .from('security_audit_logs')
        .select('action, resource, timestamp')
        .eq('category', 'authorization')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)

      const permissionCounts: Record<string, number> = {}
      const lastUsed: Record<string, string> = {}

      permissionUsage?.forEach(log => {
        const permission = `${log.resource}.${log.action}`
        permissionCounts[permission] = (permissionCounts[permission] || 0) + 1
        if (!lastUsed[permission] || new Date(log.timestamp) > new Date(lastUsed[permission])) {
          lastUsed[permission] = log.timestamp
        }
      })

      // Sort permissions
      const sortedPermissions = Object.entries(permissionCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([permission, count]) => ({
          permission,
          usageCount: count,
          lastUsed: lastUsed[permission] || ''
        }))

      return {
        permissionsByRole: {}, // Would need to join with users table
        permissionsByCategory: {}, // Categorize permissions
        mostUsedPermissions: sortedPermissions.slice(0, 20),
        leastUsedPermissions: sortedPermissions.slice(-20).reverse()
      }
    } catch (error) {
      return {
        permissionsByRole: {},
        permissionsByCategory: {},
        mostUsedPermissions: [],
        leastUsedPermissions: []
      }
    }
  }

  private async generateSecurityAnalytics(
    startDate: string,
    endDate: string
  ): Promise<PermissionAnalytics['security']> {
    const conflictAnalytics = await permissionConflictResolver.getAnalytics('24h')

    // Calculate risk score
    const riskScore = this.calculateRiskScore(conflictAnalytics)

    return {
      totalConflicts: conflictAnalytics.totalConflicts,
      conflictsBySeverity: conflictAnalytics.conflictsBySeverity,
      autoResolutionRate: conflictAnalytics.autoResolutionRate,
      escalationRate: 5.5, // Calculate from escalation data
      securityViolations: 12, // Get from security events
      riskScore
    }
  }

  private async generateInheritanceAnalytics(
    startDate: string,
    endDate: string
  ): Promise<PermissionAnalytics['inheritance']> {
    const inheritanceAnalytics = await permissionInheritanceManager.getInheritanceAnalytics()

    return {
      inheritanceRulesCount: inheritanceAnalytics.totalRules,
      averageInheritanceDepth: inheritanceAnalytics.averageInheritanceDepth,
      rulesByType: inheritanceAnalytics.rulesByType,
      inheritanceErrors: 0, // Calculate from error logs
      orphanedPermissions: 0 // Calculate from orphaned records
    }
  }

  private async generateTrends(
    startDate: string,
    endDate: string,
    filter: PermissionUsageFilter
  ): Promise<PermissionAnalytics['trends']> {
    // Generate daily usage data
    const dailyUsage = this.generateDailyUsageData(startDate, endDate)

    return {
      dailyUsage,
      weeklyGrowth: [], // Generate from weekly aggregation
      monthlyStats: [] // Generate from monthly aggregation
    }
  }

  private generateDailyUsageData(startDate: string, endDate: string): Array<{
    date: string
    permissionChecks: number
    uniqueUsers: number
    cacheHits: number
    conflicts: number
  }> {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    const data = []

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // In production, query actual data for each day
      data.push({
        date: dateStr,
        permissionChecks: Math.floor(Math.random() * 1000) + 500,
        uniqueUsers: Math.floor(Math.random() * 50) + 20,
        cacheHits: Math.floor(Math.random() * 800) + 200,
        conflicts: Math.floor(Math.random() * 5)
      })
    }

    return data
  }

  private calculateOptimizationScore(metrics: any): number {
    let score = 0

    // Cache hit rate (40% weight)
    if (metrics.cacheHitRate > 80) score += 40
    else if (metrics.cacheHitRate > 60) score += 30
    else if (metrics.cacheHitRate > 40) score += 20
    else score += 10

    // Query performance (40% weight)
    if (metrics.averageQueryTime < 10) score += 40
    else if (metrics.averageQueryTime < 50) score += 30
    else if (metrics.averageQueryTime < 100) score += 20
    else score += 10

    // Slow queries (20% weight)
    if (metrics.slowQueries.length === 0) score += 20
    else if (metrics.slowQueries.length < 5) score += 15
    else if (metrics.slowQueries.length < 10) score += 10
    else score += 5

    return Math.min(score, 100)
  }

  private calculateRiskScore(conflictAnalytics: any): number {
    let score = 0

    // Conflicts by severity
    const criticalConflicts = conflictAnalytics.conflictsBySeverity.critical || 0
    const highConflicts = conflictAnalytics.conflictsBySeverity.high || 0
    const mediumConflicts = conflictAnalytics.conflictsBySeverity.medium || 0

    score += criticalConflicts * 25
    score += highConflicts * 15
    score += mediumConflicts * 8

    // Auto resolution rate (negative impact)
    const autoResolutionRate = conflictAnalytics.autoResolutionRate || 0
    if (autoResolutionRate < 50) score += 20
    else if (autoResolutionRate < 80) score += 10

    return Math.min(score, 100)
  }

  private getDateRange(timeRange: '1h' | '24h' | '7d' | '30d'): { start: string; end: string } {
    const now = new Date()
    const end = now.toISOString()

    let start: Date
    switch (timeRange) {
      case '1h':
        start = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    return { start: start.toISOString(), end }
  }

  private getEmptyAnalytics(): PermissionAnalytics {
    return {
      overview: { totalUsers: 0, totalPermissions: 0, activeRoles: {}, averagePermissionsPerUser: 0, permissionGrowthRate: 0 },
      performance: { averageQueryTime: 0, cacheHitRate: 0, slowQueriesCount: 0, optimizationScore: 0 },
      distribution: { permissionsByRole: {}, permissionsByCategory: {}, mostUsedPermissions: [], leastUsedPermissions: [] },
      security: { totalConflicts: 0, conflictsBySeverity: {}, autoResolutionRate: 0, escalationRate: 0, securityViolations: 0, riskScore: 0 },
      inheritance: { inheritanceRulesCount: 0, averageInheritanceDepth: 0, rulesByType: {}, inheritanceErrors: 0, orphanedPermissions: 0 },
      trends: { dailyUsage: [], weeklyGrowth: [], monthlyStats: [] }
    }
  }

  // Report generation methods (simplified)
  private async generatePerformanceReport(timeRange: any, filters?: any) {
    return { metrics: 'performance_data' }
  }

  private async generateSecurityReport(timeRange: any, filters?: any) {
    return { metrics: 'security_data' }
  }

  private async generateUsageReport(timeRange: any, filters?: any) {
    return { metrics: 'usage_data' }
  }

  private async generateComplianceReport(timeRange: any, filters?: any) {
    return { metrics: 'compliance_data' }
  }

  private generatePerformanceInsights(data: any): PermissionReport['insights'] {
    return []
  }

  private generateSecurityInsights(data: any): PermissionReport['insights'] {
    return []
  }

  private generateUsageInsights(data: any): PermissionReport['insights'] {
    return []
  }

  private generateComplianceInsights(data: any): PermissionReport['insights'] {
    return []
  }

  private generateCharts(type: string, data: any): PermissionReport['charts'] {
    return []
  }

  // Export methods
  private async exportToCSV(analytics: PermissionAnalytics, filter?: PermissionUsageFilter): Promise<Blob> {
    const csvContent = [
      'Metric,Value',
      `Total Users,${analytics.overview.totalUsers}`,
      `Total Permissions,${analytics.overview.totalPermissions}`,
      `Cache Hit Rate,${analytics.performance.cacheHitRate}%`,
      `Average Query Time,${analytics.performance.averageQueryTime}ms`,
      `Total Conflicts,${analytics.security.totalConflicts}`
    ].join('\n')

    return new Blob([csvContent], { type: 'text/csv' })
  }

  private async exportToJSON(analytics: PermissionAnalytics): Promise<Blob> {
    const jsonContent = JSON.stringify(analytics, null, 2)
    return new Blob([jsonContent], { type: 'application/json' })
  }

  private async exportToExcel(analytics: PermissionAnalytics): Promise<Blob> {
    // In production, use a library like xlsx
    const csvContent = this.convertToCSV(analytics)
    return new Blob([csvContent], { type: 'text/csv' })
  }

  private convertToCSV(analytics: PermissionAnalytics): string {
    // Simplified CSV conversion
    return 'Permission Analytics Data\n' + JSON.stringify(analytics, null, 2)
  }
}

// Singleton instance
export const permissionAnalyticsManager = new PermissionAnalyticsManager()

// Convenience functions
export const generatePermissionAnalytics = (filter?: PermissionUsageFilter) =>
  permissionAnalyticsManager.generateAnalytics(filter)

export const createPermissionDashboard = (timeRange: '1h' | '24h' | '7d' | '30d') =>
  permissionAnalyticsManager.createDashboardData(timeRange)