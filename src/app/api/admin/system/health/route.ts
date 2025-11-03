import { NextResponse } from 'next/server'
import { getSuperadminContext } from '../../invitations/utils'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  try {
    const startTime = Date.now()

    // Database health check
    const dbHealth = await checkDatabaseHealth(admin)

    // System metrics
    const systemMetrics = await getSystemMetrics(admin)

    // Recent activity
    const recentActivity = await getRecentActivity(admin)

    // Performance metrics
    const responseTime = Date.now() - startTime

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: dbHealth,
      system: systemMetrics,
      activity: recentActivity,
    }

    // Determine overall health status
    if (dbHealth.status !== 'healthy' || responseTime > 5000) {
      healthStatus.status = 'degraded'
    }

    return NextResponse.json(healthStatus)
  } catch (_error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'System health check failed',
      },
      { status: 500 }
    )
  }
}

async function checkDatabaseHealth(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const startTime = Date.now()

  try {
    // Test basic connectivity
    const { error: connectionError } = await admin.from('users').select('id').limit(1)

    if (connectionError) {
      return {
        status: 'unhealthy',
        error: connectionError.message,
        responseTime: `${Date.now() - startTime}ms`,
      }
    }

    // Check table counts
    const [
      usersCount,
      auditLogsCount,
      invitationsCount,
      permissionsCount,
    ] = await Promise.all([
      admin.from('users').select('id', { count: 'exact' }),
      admin.from('audit_logs').select('id', { count: 'exact' }),
      admin.from('admin_invitations').select('id', { count: 'exact' }),
      admin.from('user_permissions').select('id', { count: 'exact' }),
    ])

    // Check for recent errors in logs
    const { data: recentErrors } = await admin
      .from('audit_logs')
      .select('action, created_at')
      .ilike('action', '%error%')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(5)

    return {
      status: 'healthy',
      responseTime: `${Date.now() - startTime}ms`,
      tables: {
        users: usersCount.count || 0,
        auditLogs: auditLogsCount || 0,
        invitations: invitationsCount.count || 0,
        permissions: permissionsCount.count || 0,
      },
      recentErrors: recentErrors?.length || 0,
      lastCheck: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database check failed',
      responseTime: `${Date.now() - startTime}ms`,
    }
  }
}

async function getSystemMetrics(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const _last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    const [
      totalUsers,
      activeUsers24h,
      newUsers24h,
      totalInvitations,
      pendingInvitations,
      acceptedInvitations24h,
      totalActions24h,
      systemMetrics,
    ] = await Promise.all([
      // Total users
      admin.from('users').select('id', { count: 'exact' }),

      // Active users in last 24h (users with recent audit log entries)
      admin.rpc('count_active_users', { since: last24h.toISOString() }),

      // New users in last 24h
      admin.from('users').select('id', { count: 'exact' }).gte('created_at', last24h.toISOString()),

      // Total invitations
      admin.from('admin_invitations').select('id', { count: 'exact' }),

      // Pending invitations
      admin.from('admin_invitations').select('id', { count: 'exact' }).in('status', ['pending', 'sent']),

      // Accepted invitations in last 24h
      admin.from('admin_invitations').select('id', { count: 'exact' }).eq('status', 'accepted').gte('responded_at', last24h.toISOString()),

      // Total actions in last 24h
      admin.from('audit_logs').select('id', { count: 'exact' }).gte('created_at', last24h.toISOString()),

      // System metrics from system_metrics table
      admin
        .from('system_metrics')
        .select('*')
        .gte('recorded_at', last24h.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(10),
    ])

    return {
      users: {
        total: totalUsers.count || 0,
        active24h: typeof activeUsers24h === 'number' ? activeUsers24h : 0,
        new24h: newUsers24h.count || 0,
      },
      invitations: {
        total: totalInvitations.count || 0,
        pending: pendingInvitations.count || 0,
        accepted24h: acceptedInvitations24h.count || 0,
      },
      activity: {
        totalActions24h: totalActions24h.count || 0,
      },
      metrics: systemMetrics || [],
    }
  } catch (_error) {
    return {
      error: 'Failed to fetch system metrics',
    }
  }
}

async function getRecentActivity(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const last1h = new Date(Date.now() - 60 * 60 * 1000)

  try {
    const { data: recentActions } = await admin
      .from('audit_logs')
      .select(`
        action,
        resource_type,
        created_at,
        user_id,
        users!inner (
          email,
          first_name,
          last_name
        )
      `)
      .gte('created_at', last1h.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: recentInvitations } = await admin
      .from('admin_invitations')
      .select(`
        status,
        email,
        first_name,
        last_name,
        created_at,
        last_sent_at
      `)
      .gte('created_at', last1h.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      recentActions: recentActions || [],
      recentInvitations: recentInvitations || [],
      summary: {
        totalActions1h: recentActions?.length || 0,
        totalInvitations1h: recentInvitations?.length || 0,
      },
    }
  } catch (_error) {
    return {
      error: 'Failed to fetch recent activity',
    }
  }
}