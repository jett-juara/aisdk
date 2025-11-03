import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSuperadminContext } from '../../invitations/utils'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const querySchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
})

export async function GET(request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  const { searchParams } = new URL(request.url)
  const query = querySchema.safeParse(Object.fromEntries(searchParams))

  if (!query.success) {
    const message = query.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { timeframe, granularity } = query.data

  // Calculate date range
  const now = new Date()
  let startDate: Date

  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  try {
    // Get user growth data
    const userGrowthData = await getUserGrowthData(admin, startDate, granularity)

    // Get current user statistics
    const userStats = await getUserStatistics(admin)

    // Get role distribution
    const roleDistribution = await getRoleDistribution(admin)

    // Get user activity data (from audit_logs)
    const activityData = await getUserActivityData(admin, startDate, granularity)

    return NextResponse.json({
      timeframe,
      granularity,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      userGrowth: userGrowthData,
      currentStats: userStats,
      roleDistribution,
      activity: activityData,
    })
  } catch (_error) {
    return NextResponse.json(
      { error: { message: 'Gagal mengambil data analytics' } },
      { status: 500 }
    )
  }
}

async function getUserGrowthData(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  startDate: Date,
  granularity: 'day' | 'week' | 'month'
) {
  const { data, error } = await admin
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group data by time period
  const groupedData = data.reduce((acc: Record<string, number>, user) => {
    const date = new Date(user.created_at)
    let key: string

    switch (granularity) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // Convert to array format and calculate cumulative total
  const sortedEntries = Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b))
  let cumulative = 0

  return sortedEntries.map(([date, count]) => {
    cumulative += count
    return {
      date,
      newUsers: count,
      totalUsers: cumulative,
    }
  })
}

async function getUserStatistics(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const [
    totalResult,
    activeResult,
    blockedResult,
    deletedResult,
    verifiedResult,
    recentResult,
  ] = await Promise.all([
    admin.from('users').select('id', { count: 'exact' }),
    admin.from('users').select('id', { count: 'exact' }).eq('status', 'active'),
    admin.from('users').select('id', { count: 'exact' }).eq('status', 'blocked'),
    admin.from('users').select('id', { count: 'exact' }).eq('status', 'deleted'),
    admin.from('users').select('id', { count: 'exact' }).eq('email_verified', true),
    admin.from('users').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  return {
    totalUsers: totalResult.count || 0,
    activeUsers: activeResult.count || 0,
    blockedUsers: blockedResult.count || 0,
    deletedUsers: deletedResult.count || 0,
    verifiedUsers: verifiedResult.count || 0,
    newUsersThisWeek: recentResult.count || 0,
  }
}

async function getRoleDistribution(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const { data, error } = await admin
    .from('users')
    .select('role')
    .neq('status', 'deleted')

  if (error) throw error

  const distribution = data.reduce((acc: Record<string, number>, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  return [
    { role: 'superadmin', count: distribution.superadmin || 0 },
    { role: 'admin', count: distribution.admin || 0 },
    { role: 'user', count: distribution.user || 0 },
  ]
}

async function getUserActivityData(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  startDate: Date,
  granularity: 'day' | 'week' | 'month'
) {
  const { data, error } = await admin
    .from('audit_logs')
    .select('created_at, action')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group activity by time period
  const groupedData = data.reduce((acc: Record<string, number>, log) => {
    const date = new Date(log.created_at)
    let key: string

    switch (granularity) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // Convert to array format
  const sortedEntries = Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b))

  return sortedEntries.map(([date, actions]) => ({
    date,
    actions,
  }))
}
