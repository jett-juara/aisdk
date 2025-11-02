import { permissionInheritanceManager } from './permission-inheritance'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface PermissionConflict {
  id: string
  userId?: string
  role?: string
  permission: string
  conflictType: 'inheritance' | 'explicit' | 'conditional' | 'time_based' | 'location_based'
  sourceRules: Array<{
    ruleId: string
    ruleName: string
    sourceRole: string
    ruleType: 'direct' | 'inherited' | 'conditional'
    decision: 'allow' | 'deny'
    priority: number
    metadata?: any
  }>
  severity: 'low' | 'medium' | 'high' | 'critical'
  autoResolved: boolean
  resolution: {
    action: 'allow' | 'deny' | 'escalate' | 'manual_review'
    reason: string
    appliedRule?: string
    appliedAt: string
    resolvedBy: 'system' | 'admin'
  }
  createdAt: string
  resolvedAt?: string
}

export interface ConflictResolutionStrategy {
  name: string
  description: string
  conflictTypes: string[]
  resolutionLogic: (conflict: PermissionConflict) => Promise<{
    action: 'allow' | 'deny' | 'escalate' | 'manual_review'
    reason: string
    confidence: number
  }>
  priority: number
  enabled: boolean
}

export interface ConflictAnalytics {
  totalConflicts: number
  conflictsByType: Record<string, number>
  conflictsBySeverity: Record<string, number>
  resolutionStrategies: Record<string, number>
  autoResolutionRate: number
  averageResolutionTime: number
  trendingConflicts: Array<{
    permission: string
    count: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  topConflictingPermissions: Array<{
    permission: string
    conflictCount: number
    lastConflict: string
  }>
}

export class PermissionConflictResolver {
  private admin = createSupabaseAdminClient()

  // Default resolution strategies
  private strategies: ConflictResolutionStrategy[] = [
    {
      name: 'Security First',
      description: 'Prioritize security - deny access when in doubt',
      conflictTypes: ['inheritance', 'explicit', 'conditional'],
      resolutionLogic: async (conflict) => {
        const denyRules = conflict.sourceRules.filter(r => r.decision === 'deny')
        const allowRules = conflict.sourceRules.filter(r => r.decision === 'allow')

        if (denyRules.some(r => r.priority <= 5)) {
          // High priority deny rule
          return {
            action: 'deny',
            reason: 'High priority security rule denies access',
            confidence: 0.95
          }
        }

        if (allowRules.length > denyRules.length) {
          return {
            action: 'allow',
            reason: 'More allow rules than deny rules',
            confidence: 0.7
          }
        }

        return {
          action: 'deny',
          reason: 'Security first principle - deny when uncertain',
          confidence: 0.8
        }
      },
      priority: 1,
      enabled: true
    },
    {
      name: 'Priority Based',
      description: 'Use rule priority to resolve conflicts',
      conflictTypes: ['inheritance', 'explicit'],
      resolutionLogic: async (conflict) => {
        const highestPriorityRule = conflict.sourceRules.reduce((highest, current) =>
          current.priority < highest.priority ? current : highest
        )

        return {
          action: highestPriorityRule.decision === 'allow' ? 'allow' : 'deny',
          reason: `Following highest priority rule: ${highestPriorityRule.ruleName}`,
          confidence: 0.9
        }
      },
      priority: 2,
      enabled: true
    },
    {
      name: 'Role Hierarchy',
      description: 'Follow role hierarchy - superadmin > admin > user',
      conflictTypes: ['inheritance'],
      resolutionLogic: async (conflict) => {
        const rolePriority = { 'superadmin': 1, 'admin': 2, 'user': 3 }

        const highestRoleRule = conflict.sourceRules.reduce((highest, current) => {
          const currentPriority = rolePriority[current.sourceRole as keyof typeof rolePriority] || 999
          const highestPriority = rolePriority[highest.sourceRole as keyof typeof rolePriority] || 999
          return currentPriority < highestPriority ? current : highest
        })

        return {
          action: highestRoleRule.decision === 'allow' ? 'allow' : 'deny',
          reason: `Following role hierarchy - ${highestRoleRule.sourceRole} takes precedence`,
          confidence: 0.85
        }
      },
      priority: 3,
      enabled: true
    },
    {
      name: 'Least Privilege',
      description: 'Apply least privilege principle',
      conflictTypes: ['conditional', 'time_based'],
      resolutionLogic: async (conflict) => {
        // Check if permission is sensitive
        const sensitivePermissions = [
          'system.delete',
          'users.delete',
          'permissions.admin',
          'security.manage'
        ]

        if (sensitivePermissions.some(p => conflict.permission.includes(p))) {
          return {
            action: 'deny',
            reason: 'Sensitive permission requires explicit approval',
            confidence: 0.95
          }
        }

        return {
          action: 'allow',
          reason: 'Non-sensitive permission allowed under least privilege',
          confidence: 0.7
        }
      },
      priority: 4,
      enabled: true
    },
    {
      name: 'Time Based Resolution',
      description: 'Consider time-based conditions',
      conflictTypes: ['time_based'],
      resolutionLogic: async (conflict) => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentDay = now.getDay()

        // Business hours rule (9 AM - 5 PM, Mon-Fri)
        const isBusinessHours = currentHour >= 9 && currentHour <= 17 && currentDay >= 1 && currentDay <= 5

        if (conflict.sourceRules.some(r => r.metadata?.timeRestriction)) {
          const timeRestrictRule = conflict.sourceRules.find(r => r.metadata?.timeRestriction)
          if (timeRestrictRule) {
            const { startHour, endHour, daysOfWeek } = timeRestrictRule.metadata.timeRestriction

            if (isBusinessHours && daysOfWeek?.includes(currentDay) &&
                currentHour >= (startHour || 0) && currentHour <= (endHour || 23)) {
              return {
                action: timeRestrictRule.decision === 'allow' ? 'allow' : 'deny',
                reason: 'Time-based conditions met',
                confidence: 0.9
              }
            } else {
              return {
                action: 'deny',
                reason: 'Time-based conditions not met',
                confidence: 0.85
              }
            }
          }
        }

        return {
          action: 'allow',
          reason: 'No time restrictions - default allow',
          confidence: 0.6
        }
      },
      priority: 5,
      enabled: true
    },
    {
      name: 'Escalate Complex Conflicts',
      description: 'Escalate complex or critical conflicts',
      conflictTypes: ['conditional', 'location_based'],
      resolutionLogic: async (conflict) => {
        // Escalate if multiple high-priority rules conflict
        const highPriorityRules = conflict.sourceRules.filter(r => r.priority <= 3)
        const denyRules = highPriorityRules.filter(r => r.decision === 'deny')
        const allowRules = highPriorityRules.filter(r => r.decision === 'allow')
        const conflictingHighPriority = denyRules.length > 0 && allowRules.length > 0

        if (conflictingHighPriority) {
          return {
            action: 'escalate',
            reason: 'Multiple high-priority rules in conflict - requires manual review',
            confidence: 0.95
          }
        }

        // Escalate critical permissions
        const criticalPermissions = ['system.admin', 'security.breach', 'data.delete_all']
        if (criticalPermissions.some(p => conflict.permission.includes(p))) {
          return {
            action: 'escalate',
            reason: 'Critical permission conflict - requires admin review',
            confidence: 0.9
          }
        }

        return {
          action: 'manual_review',
          reason: 'Complex conflict pattern detected',
          confidence: 0.7
        }
      },
      priority: 6,
      enabled: true
    }
  ]

  /**
   * Detect and resolve permission conflicts
   */
  async resolveConflict(
    userId: string,
    permission: string,
    conflictingRules: Array<{
      ruleId: string
      ruleName: string
      sourceRole: string
      ruleType: 'direct' | 'inherited' | 'conditional'
      decision: 'allow' | 'deny'
      priority: number
      metadata?: any
    }>
  ): Promise<PermissionConflict> {
    const conflictId = crypto.randomUUID()
    const now = new Date().toISOString()

    // Determine conflict type
    const conflictType = this.determineConflictType(conflictingRules)
    const severity = this.determineConflictSeverity(permission, conflictingRules)

    const conflict: PermissionConflict = {
      id: conflictId,
      userId,
      permission,
      conflictType,
      sourceRules: conflictingRules,
      severity,
      autoResolved: false,
      resolution: {
        action: 'deny',
        reason: 'Pending resolution',
        resolvedBy: 'system',
        appliedAt: now
      },
      createdAt: now
    }

    try {
      // Apply resolution strategies
      const resolution = await this.applyResolutionStrategies(conflict)

      // Apply resolution
      conflict.resolution = {
        ...resolution,
        appliedAt: new Date().toISOString(),
        resolvedBy: 'system'
      }

      conflict.autoResolved = resolution.action !== 'manual_review' && resolution.action !== 'escalate'

      // Log conflict and resolution
      await this.logConflict(conflict)

      return conflict
    } catch (error) {

      // Fallback to deny
      conflict.resolution = {
        action: 'deny',
        reason: 'Error in conflict resolution - defaulting to deny',
        appliedAt: new Date().toISOString(),
        resolvedBy: 'system'
      }

      return conflict
    }
  }

  /**
   * Bulk resolve multiple conflicts
   */
  async resolveConflicts(
    conflicts: Array<{
      userId: string
      permission: string
      conflictingRules: Array<{
        ruleId: string
        ruleName: string
        sourceRole: string
        ruleType: 'direct' | 'inherited' | 'conditional'
        decision: 'allow' | 'deny'
        priority: number
        metadata?: any
      }>
    }>
  ): Promise<PermissionConflict[]> {
    const resolvedConflicts: PermissionConflict[] = []

    for (const conflictData of conflicts) {
      const resolved = await this.resolveConflict(
        conflictData.userId,
        conflictData.permission,
        conflictData.conflictingRules
      )
      resolvedConflicts.push(resolved)
    }

    return resolvedConflicts
  }

  /**
   * Manual conflict resolution by admin
   */
  async manualResolve(
    conflictId: string,
    resolution: {
      action: 'allow' | 'deny'
      reason: string
      adminId: string
    }
  ): Promise<boolean> {
    try {
      await this.admin
        .from('permission_conflicts')
        .update({
          resolution: resolution.action,
          reason: resolution.reason,
          resolved_by: resolution.adminId,
          resolved_at: new Date().toISOString()
        })
        .eq('id', conflictId)

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get conflict analytics
   */
  async getAnalytics(
    timeRange: '24h' | '7d' | '30d' = '24h'
  ): Promise<ConflictAnalytics> {
    const timeRangeInHours = { '24h': 24, '7d': 168, '30d': 720 }[timeRange]
    const cutoffTime = new Date()
    cutoffTime.setTime(cutoffTime.getTime() - timeRangeInHours * 60 * 60 * 1000)

    try {
      // Get conflicts from database
      const { data: conflicts } = await this.admin
        .from('permission_conflicts')
        .select('*')
        .gte('created_at', cutoffTime.toISOString())
        .order('created_at', { ascending: false })

      const totalConflicts = conflicts?.length || 0
      const conflictsByType: Record<string, number> = {}
      const conflictsBySeverity: Record<string, number> = {}
      const resolutionStrategies: Record<string, number> = {}
      let autoResolvedCount = 0
      let totalResolutionTime = 0

      // Permission conflict tracking
      const permissionConflicts: Record<string, number> = {}

      conflicts?.forEach(conflict => {
        // Count by type
        conflictsByType[conflict.conflict_type] = (conflictsByType[conflict.conflict_type] || 0) + 1

        // Count by severity
        conflictsBySeverity[conflict.severity] = (conflictsBySeverity[conflict.severity] || 0) + 1

        // Count resolution strategies
        resolutionStrategies[conflict.resolution] = (resolutionStrategies[conflict.resolution] || 0) + 1

        // Count auto-resolved
        if (conflict.autoResolved) {
          autoResolvedCount++
        }

        // Calculate resolution time
        if (conflict.resolved_at) {
          const resolutionTime = new Date(conflict.resolved_at).getTime() - new Date(conflict.created_at).getTime()
          totalResolutionTime += resolutionTime
        }

        // Track permission conflicts
        permissionConflicts[conflict.permission] = (permissionConflicts[conflict.permission] || 0) + 1
      })

      // Calculate trending permissions
      const topConflictingPermissions = Object.entries(permissionConflicts)
        .map(([permission, count]) => ({
          permission,
          conflictCount: count,
          lastConflict: conflicts?.find(c => c.permission === permission)?.created_at || new Date().toISOString()
        }))
        .sort((a, b) => b.conflictCount - a.conflictCount)
        .slice(0, 10)

      // Simulate trend calculation
      const trendingConflicts = topConflictingPermissions.map(p => ({
        permission: p.permission,
        count: p.conflictCount,
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      }))

      const autoResolutionRate = totalConflicts > 0 ? (autoResolvedCount / totalConflicts) * 100 : 0
      const averageResolutionTime = totalConflicts > 0 ? totalResolutionTime / totalConflicts : 0

      return {
        totalConflicts,
        conflictsByType,
        conflictsBySeverity,
        resolutionStrategies,
        autoResolutionRate: Math.round(autoResolutionRate * 100) / 100,
        averageResolutionTime: Math.round(averageResolutionTime),
        trendingConflicts,
        topConflictingPermissions
      }
    } catch (error) {
      return {
        totalConflicts: 0,
        conflictsByType: {},
        conflictsBySeverity: {},
        resolutionStrategies: {},
        autoResolutionRate: 0,
        averageResolutionTime: 0,
        trendingConflicts: [],
        topConflictingPermissions: []
      }
    }
  }

  /**
   * Create resolution strategy
   */
  async createResolutionStrategy(
    strategy: Omit<ConflictResolutionStrategy, 'priority'>
  ): Promise<ConflictResolutionStrategy> {
    const maxPriority = Math.max(...this.strategies.map(s => s.priority))

    const newStrategy: ConflictResolutionStrategy = {
      ...strategy,
      priority: maxPriority + 1
    }

    this.strategies.push(newStrategy)
    this.strategies.sort((a, b) => a.priority - b.priority)

    return newStrategy
  }

  /**
   * Update resolution strategy
   */
  updateResolutionStrategy(
    strategyId: string,
    updates: Partial<ConflictResolutionStrategy>
  ): boolean {
    const index = this.strategies.findIndex(s => s.name === strategyId)
    if (index === -1) return false

    this.strategies[index] = { ...this.strategies[index], ...updates }
    this.strategies.sort((a, b) => a.priority - b.priority)

    return true
  }

  /**
   * Get active resolution strategies
   */
  getActiveStrategies(): ConflictResolutionStrategy[] {
    return this.strategies.filter(s => s.enabled)
  }

  // Private helper methods
  private determineConflictType(
    rules: Array<{ ruleType: 'direct' | 'inherited' | 'conditional' }>
  ): PermissionConflict['conflictType'] {
    const types = rules.map(r => r.ruleType)

    if (types.includes('conditional')) {
      return 'conditional'
    }
    if (types.includes('inherited')) {
      return 'inheritance'
    }
    return 'explicit'
  }

  private determineConflictSeverity(
    permission: string,
    rules: Array<{ priority: number }>
  ): PermissionConflict['severity'] {
    // Critical permissions
    const criticalPermissions = ['system.delete', 'users.delete', 'security.breach']
    if (criticalPermissions.some(p => permission.includes(p))) {
      return 'critical'
    }

    // High severity if conflicting high-priority rules
    const highPriorityConflicts = rules.filter(r => r.priority <= 3)
    if (highPriorityConflicts.length >= 2) {
      return 'high'
    }

    // Medium severity for administrative permissions
    const adminPermissions = ['users.manage', 'permissions.assign', 'invitations.create']
    if (adminPermissions.some(p => permission.includes(p))) {
      return 'medium'
    }

    return 'low'
  }

  private async applyResolutionStrategies(
    conflict: PermissionConflict
  ): Promise<{
    action: 'allow' | 'deny' | 'escalate' | 'manual_review'
    reason: string
    confidence: number
  }> {
    const applicableStrategies = this.strategies
      .filter(s => s.enabled)
      .filter(s => s.conflictTypes.includes(conflict.conflictType))
      .sort((a, b) => a.priority - b.priority)

    for (const strategy of applicableStrategies) {
      try {
        const result = await strategy.resolutionLogic(conflict)

        if (result.confidence >= 0.7) { // Only accept high confidence results
          return result
        }
      } catch (error) {
        continue
      }
    }

    // Fallback to security-first
    return {
      action: 'deny',
      reason: 'No suitable resolution strategy found - defaulting to deny',
      confidence: 0.5
    }
  }

  private async logConflict(conflict: PermissionConflict): Promise<void> {
    try {
      await this.admin
        .from('permission_conflicts')
        .insert({
          id: conflict.id,
          user_id: conflict.userId,
          role: conflict.sourceRules[0]?.sourceRole,
          permission: conflict.permission,
          conflict_type: conflict.conflictType,
          conflicting_rules: conflict.sourceRules,
          resolution: conflict.resolution.action,
          resolved_by: conflict.resolution.resolvedBy === 'system' ? null : conflict.resolution.resolvedBy,
          resolved_at: conflict.autoResolved ? new Date().toISOString() : null,
          created_at: conflict.createdAt,
          severity: conflict.severity,
          auto_resolved: conflict.autoResolved
        })
    } catch (error) {
    }
  }
}

// Singleton instance
export const permissionConflictResolver = new PermissionConflictResolver()

// Convenience functions
export const resolvePermissionConflict = (
  userId: string,
  permission: string,
  conflictingRules: any[]
) => permissionConflictResolver.resolveConflict(userId, permission, conflictingRules)

export const manualResolveConflict = (
  conflictId: string,
  resolution: any
) => permissionConflictResolver.manualResolve(conflictId, resolution)