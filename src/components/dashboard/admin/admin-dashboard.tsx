'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Shield, Activity, RefreshCw, Settings, Download, Search, ShieldAlert } from 'lucide-react'
import { UserStatisticsPanel } from '../analytics/user-statistics-panel'
import { SystemHealthPanel } from '../analytics/system-health-panel'
import { UserManagementTable } from '../users/user-management-table'
import { PermissionManagementPanel } from '../permissions/permission-management-panel'
import { InvitationManagementPanel } from '../invitations/invitation-management-panel'
import { QuickActionsPanel } from './quick-actions-panel'
import { AdvancedSearchPanel } from './advanced-search-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/hooks/use-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type AdminDashboardProps = {
  currentUserId: string
  currentUserRole: 'superadmin' | 'admin' | 'user'
  className?: string
}

type DashboardStats = {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  deletedUsers: number
  adminUsers: number
  totalInvitations: number
  pendingInvitations: number
  systemHealth: 'healthy' | 'degraded' | 'unhealthy'
}

export function AdminDashboard({ currentUserId, currentUserRole, className }: AdminDashboardProps) {
  const { toast } = useToast()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    deletedUsers: 0,
    adminUsers: 0,
    totalInvitations: 0,
    pendingInvitations: 0,
    systemHealth: 'healthy',
  })
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setRefreshing(true)

      const [usersResponse, invitationsResponse, healthResponse] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/invitations', { cache: 'no-store' }),
        fetch('/api/admin/system/health', { cache: 'no-store' }),
      ])

      const [usersData, invitationsData, healthData] = await Promise.all([
        usersResponse.ok ? usersResponse.json().catch(() => ({ users: [] })) : { users: [] },
        invitationsResponse.ok ? invitationsResponse.json().catch(() => ({ invitations: [] })) : { invitations: [] },
        healthResponse.ok ? healthResponse.json().catch(() => ({ status: 'healthy' })) : { status: 'healthy' },
      ])

      // Calculate stats
      const users = usersData.users || []
      const invitations = invitationsData.invitations || []

      const stats: DashboardStats = {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        blockedUsers: users.filter((u: any) => u.status === 'blocked').length,
        deletedUsers: users.filter((u: any) => u.status === 'deleted').length,
        adminUsers: users.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length,
        totalInvitations: invitations.length,
        pendingInvitations: invitations.filter((i: any) => ['pending', 'sent'].includes(i.status)).length,
        systemHealth: healthData.status,
      }

      setDashboardStats(stats)
      setLastRefresh(new Date())
    } catch (error) {
      toast({
        title: 'Gagal memuat data dashboard',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      })
    } finally {
      setRefreshing(false)
    }
  }, [toast])

  // Auto-refresh dashboard stats every 30 seconds
  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardStats])

  const handleGlobalRefresh = useCallback(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const handleExportData = useCallback(async () => {
    try {
      // Get all data for export
      const [usersResponse, invitationsResponse] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/invitations', { cache: 'no-store' }),
      ])

      const [usersData, invitationsData] = await Promise.all([
        usersResponse.ok ? usersResponse.json().catch(() => ({ users: [] })) : { users: [] },
        invitationsResponse.ok ? invitationsResponse.json().catch(() => ({ invitations: [] })) : { invitations: [] },
      ])

      // Create CSV content
      const csvContent = [
        'ADMIN DASHBOARD EXPORT',
        `Generated at: ${new Date().toLocaleString('id-ID')}`,
        `Generated by: ${currentUserRole}`,
        '',
        'SYSTEM STATISTICS',
        `Total Users,${dashboardStats.totalUsers}`,
        `Active Users,${dashboardStats.activeUsers}`,
        `Blocked Users,${dashboardStats.blockedUsers}`,
        `Deleted Users,${dashboardStats.deletedUsers}`,
        `Admin Users,${dashboardStats.adminUsers}`,
        `Total Invitations,${dashboardStats.totalInvitations}`,
        `Pending Invitations,${dashboardStats.pendingInvitations}`,
        `System Health,${dashboardStats.systemHealth}`,
        '',
        'USERS',
        'ID,Email,First Name,Last Name,Username,Role,Status,Created At,Updated At,Deleted At',
        ...(usersData.users || []).map((user: any) =>
          `${user.id},${user.email},${user.first_name || ''},${user.last_name || ''},${user.username || ''},${user.role},${user.status},${user.created_at},${user.updated_at},${user.deleted_at || ''}`
        ),
        '',
        'INVITATIONS',
        'ID,Email,First Name,Last Name,Role,Status,Inviter ID,Created At,Sent At,Expires At,Responded At',
        ...(invitationsData.invitations || []).map((inv: any) =>
          `${inv.id},${inv.email},${inv.first_name || ''},${inv.last_name || ''},${inv.role},${inv.status},${inv.inviter_id || ''},${inv.created_at},${inv.sent_at || ''},${inv.expires_at || ''},${inv.responded_at || ''}`
        ),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `admin-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Berhasil',
        description: 'Data dashboard berhasil diekspor ke CSV.',
      })
    } catch (_error) {
      toast({
        title: 'Export Gagal',
        description: 'Gagal mengekspor data dashboard.',
      })
    }
  }, [dashboardStats, currentUserRole, toast])

  const handleRefresh = useCallback(async () => {
    await fetchDashboardStats()
  }, [fetchDashboardStats])

  const formatRelativeTime = useCallback((timestamp: string | null) => {
    if (!timestamp) return 'Tidak tersedia'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`
    return `${Math.floor(diffMins / 1440)} hari lalu`
  }, [])

  const _getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-auth-success bg-auth-success/10 border-auth-success/20'
      case 'degraded':
        return 'text-auth-warning bg-auth-warning/10 border-auth-warning/20'
      case 'unhealthy':
        return 'text-auth-text-error bg-auth-text-error/10 border-auth-text-error/20'
      default:
        return 'text-auth-text-muted bg-auth-bg-hover border-auth-border'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return Activity
      case 'degraded': return ShieldAlert
      case 'unhealthy': return ShieldAlert
      default: return Activity
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'search', label: 'Advanced Search', icon: Search },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'invitations', label: 'Invitations', icon: Users },
    { id: 'actions', label: 'Actions', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'health', label: 'System Health', icon: Activity },
  ]

  // Filter tabs based on role
  const availableTabs = tabs.filter(tab => {
    if (currentUserRole === 'user') {
      return ['overview', 'analytics'].includes(tab.id)
    }
    if (currentUserRole === 'admin') {
      return !['health'].includes(tab.id) // Admins can't see system health
    }
    return true // Superadmin can see all tabs
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-auth-text-primary">Admin Dashboard</CardTitle>
              <CardDescription className="text-auth-text-muted">
                Kelola user, permissions, dan monitoring sistem
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-auth-text-muted" />
                <Input
                  placeholder="Cari user atau menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 border-auth-border bg-auth-bg-form text-auth-text-primary"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGlobalRefresh}
                disabled={refreshing}
                className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          {lastRefresh && (
            <p className="text-xs text-auth-text-muted">
              Terakhir diperbarui: {formatRelativeTime(lastRefresh.toISOString())}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={Users}
          trend={dashboardStats.activeUsers}
          trendLabel="Active"
          color="blue"
        />
        <StatCard
          title="Admin Users"
          value={dashboardStats.adminUsers}
          icon={Shield}
          color="purple"
        />
        <StatCard
          title="Invitations"
          value={dashboardStats.totalInvitations}
          icon={Users}
          trend={dashboardStats.pendingInvitations}
          trendLabel="Pending"
          color="green"
        />
        <StatCard
          title="System Health"
          value={dashboardStats.systemHealth === 'healthy' ? 'Sehat' : dashboardStats.systemHealth === 'degraded' ? 'Terdegradasi' : 'Tidak Sehat'}
          icon={getHealthIcon(dashboardStats.systemHealth)}
          color={dashboardStats.systemHealth as any}
        />
      </div>

      {/* Tabs */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 border-b border-auth-border">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-auth-bg-form data-[state=active]:text-auth-text-primary data-[state=active]:border-auth-button-brand data-[state=active]:border-b-2 data-[state=active]:border-b-auth-button-brand flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <QuickActionsPanel
                onRefresh={handleRefresh}
                onExportData={handleExportData}
                onInviteUser={() => setActiveTab('invitations')}
                onManagePermissions={() => setActiveTab('permissions')}
                onViewAnalytics={() => setActiveTab('analytics')}
                onSystemSettings={() => setActiveTab('health')}
              />

              <Card className="border-auth-border bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-auth-text-primary">Recent Activity</CardTitle>
                  <CardDescription className="text-auth-text-muted">
                    Aktivitas terkini di dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-auth-success"></div>
                      <span className="text-auth-text-primary">Dashboard loaded successfully</span>
                      <span className="text-xs text-auth-text-muted ml-auto">Baru saja</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-auth-info"></div>
                      <span className="text-auth-text-primary">Data refreshed</span>
                      <span className="text-xs text-auth-text-muted ml-auto">
                        {lastRefresh ? formatRelativeTime(lastRefresh.toISOString()) : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-auth-warning"></div>
                      <span className="text-auth-text-primary">
                        {dashboardStats.systemHealth === 'healthy' ? 'System healthy' : 'System needs attention'}
                      </span>
                      <span className="text-xs text-auth-text-muted ml-auto">
                        {formatRelativeTime(lastRefresh?.toISOString() || '')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTable
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <AdvancedSearchPanel
              onSearch={(filters) => {
                // Implement search functionality
                toast({
                  title: 'Search Applied',
                  description: `Searching with ${Object.keys(filters).length} filters`,
                })
              }}
              onExport={(_filters) => {
                // Implement export functionality
                toast({
                  title: 'Export Started',
                  description: 'Exporting search results...',
                })
              }}
              resultCount={0}
              isSearching={false}
            />
          </TabsContent>

          {currentUserRole !== 'user' && (
            <TabsContent value="permissions" className="mt-6">
              <PermissionManagementPanel
                currentUserId={currentUserId}
                currentUserRole={currentUserRole as 'admin' | 'superadmin'}
              />
            </TabsContent>
          )}

          <TabsContent value="invitations" className="mt-6">
            <InvitationManagementPanel
              currentUserId={currentUserId}
              invitations={[]}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <UserStatisticsPanel />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <QuickActionsPanel
              onRefresh={handleRefresh}
              onExportData={handleExportData}
              onInviteUser={() => setActiveTab('invitations')}
              onManagePermissions={() => setActiveTab('permissions')}
              onViewAnalytics={() => setActiveTab('analytics')}
              onSystemSettings={() => setActiveTab('health')}
            />
          </TabsContent>

          {currentUserRole === 'superadmin' && (
            <TabsContent value="health" className="mt-6">
              <SystemHealthPanel />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color
}: {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}) {
  const colorStyles = {
    blue: 'text-auth-info bg-auth-info/10 border-auth-info/20',
    green: 'text-auth-success bg-auth-success/10 border-auth-success/20',
    purple: 'text-auth-purple bg-auth-purple/10 border-auth-purple/20',
    yellow: 'text-auth-warning bg-auth-warning/10 border-auth-warning/20',
    red: 'text-auth-text-error bg-auth-text-error/10 border-auth-text-error/20'
  }

  const iconColors = {
    blue: 'text-auth-info',
    green: 'text-auth-success',
    purple: 'text-auth-purple',
    yellow: 'text-auth-warning',
    red: 'text-auth-text-error'
  }

  return (
    <Card className={cn('border-auth-border bg-card text-card-foreground', colorStyles[color as keyof typeof colorStyles])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-auth-text-muted">{title}</p>
            <p className="text-2xl font-bold text-auth-text-primary">{value}</p>
            {trend !== undefined && trendLabel && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-auth-success">+{trend}</span>
                <p className="text-xs text-auth-muted">{trendLabel}</p>
              </div>
            )}
          </div>
          <Icon className={cn('h-8 w-8', iconColors[color as keyof typeof iconColors])} />
        </div>
      </CardContent>
    </Card>
  )
}