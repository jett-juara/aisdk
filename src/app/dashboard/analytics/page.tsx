import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/dashboard/analytics/analytics-dashboard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseRSCClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createSupabaseRSCClient()
  const admin = createSupabaseAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    redirect('/dashboard')
  }

  const [{ data: analytics }, { data: health }] = await Promise.all([
    admin.rpc('get_user_analytics', { range_days: 30 }),
    admin.rpc('get_system_health'),
  ])

  return (
    <AnalyticsDashboard
      currentUserId={profile.id}
      initialAnalytics={analytics}
      initialHealth={health}
    />
  )
}
