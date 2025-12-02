import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSystemHealthMetrics } from '@/lib/system/health'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  // Get authenticated user
  const { data: { user } } = await server.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if superadmin
  const { data: profile } = await server
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Use shared logic for core metrics
    const metrics = await getSystemHealthMetrics()

    // Get additional detailed data for the admin view (recent activity etc)
    const recentActivity = await getRecentActivity(admin)
    const systemMetrics = await getDetailedSystemMetrics(admin)

    const healthStatus = {
      status: metrics.status,
      timestamp: new Date().toISOString(),
      responseTime: `${metrics.latencyMs}ms`,
      database: {
        status: metrics.checks.database ? 'healthy' : 'unhealthy',
        responseTime: `${metrics.latencyMs}ms`
      },
      system: {
        users: systemMetrics.users,
        invitations: systemMetrics.invitations,
        activity: {
          totalActions24h: metrics.totalRequests24h
        },
        metrics: systemMetrics.metrics
      },
      activity: recentActivity,
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

async function getDetailedSystemMetrics(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  try {
    const [
      totalUsers,
      newUsers24h,
      totalInvitations,
      pendingInvitations,
      acceptedInvitations24h,
      systemMetrics,
    ] = await Promise.all([
      // Total users
      admin.from('users').select('id', { count: 'exact' }),

      // New users in last 24h
      admin.from('users').select('id', { count: 'exact' }).gte('created_at', last24h.toISOString()),

      // Total invitations
      admin.from('admin_invitations').select('id', { count: 'exact' }),

      // Pending invitations
      admin.from('admin_invitations').select('id', { count: 'exact' }).in('status', ['pending', 'sent']),

      // Accepted invitations in last 24h
      admin.from('admin_invitations').select('id', { count: 'exact' }).eq('status', 'accepted').gte('responded_at', last24h.toISOString()),

      // System metrics from system_metrics table (if exists, or fallback)
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
        new24h: newUsers24h.count || 0,
      },
      invitations: {
        total: totalInvitations.count || 0,
        pending: pendingInvitations.count || 0,
        accepted24h: acceptedInvitations24h.count || 0,
      },
      metrics: systemMetrics.data || [],
    }
  } catch (_error) {
    return {
      users: { total: 0, new24h: 0 },
      invitations: { total: 0, pending: 0, accepted24h: 0 },
      metrics: []
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