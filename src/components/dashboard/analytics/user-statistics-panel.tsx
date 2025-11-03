'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, UserCheck, UserX, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/hooks/use-toast'
import { cn } from '@/lib/utils'

type UserAnalyticsData = {
  timeframe: string
  granularity: string
  dateRange: {
    start: string
    end: string
  }
  userGrowth: Array<{
    date: string
    newUsers: number
    totalUsers: number
  }>
  currentStats: {
    totalUsers: number
    activeUsers: number
    blockedUsers: number
    deletedUsers: number
    verifiedUsers: number
    newUsersThisWeek: number
  }
  roleDistribution: Array<{
    role: string
    count: number
  }>
  activity: Array<{
    date: string
    actions: number
  }>
}

type UserStatisticsPanelProps = {
  className?: string
}

const ROLE_COLORS = {
  superadmin: '#dc2626',
  admin: '#2563eb',
  user: '#16a34a',
}

export function UserStatisticsPanel({ className }: UserStatisticsPanelProps) {
  const { toast } = useToast()
  const [timeframe, setTimeframe] = useState('30d')
  const [granularity, setGranularity] = useState('day')
  const [data, setData] = useState<UserAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        timeframe,
        granularity,
      })

      const response = await fetch(`/api/admin/analytics/users?${params}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error?.message || 'Gagal mengambil data analytics')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(message)
      toast({
        title: 'Gagal memuat data',
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [timeframe, granularity, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExportData = useCallback(async () => {
    if (!data) return

    try {
      const csvContent = generateCSV(data)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `user-analytics-${timeframe}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Data berhasil diekspor',
        description: `File CSV user analytics ${timeframe} sudah diunduh.`,
      })
    } catch (_err) {
      toast({
        title: 'Export gagal',
        description: 'Gagal mengekspor data analytics',
      })
    }
  }, [data, timeframe, toast])

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  const growthChartData = useMemo(() => {
    if (!data?.userGrowth) return []
    return data.userGrowth.map(item => ({
      ...item,
      date: formatDate(item.date),
    }))
  }, [data?.userGrowth, formatDate])

  const activityChartData = useMemo(() => {
    if (!data?.activity) return []
    return data.activity.map(item => ({
      ...item,
      date: formatDate(item.date),
    }))
  }, [data?.activity, formatDate])

  if (error) {
    return (
      <Card className={cn('border-auth-border bg-card text-card-foreground', className)}>
        <CardHeader>
          <CardTitle className="text-auth-text-primary">User Statistics</CardTitle>
          <CardDescription className="text-auth-text-muted">
            Analitik pertumbuhan dan demografi pengguna
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-auth-text-error mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-auth-text-primary">User Statistics</CardTitle>
              <CardDescription className="text-auth-text-muted">
                Analitik pertumbuhan dan demografi pengguna
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] border-auth-border text-auth-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                  <SelectItem value="7d">7 Hari</SelectItem>
                  <SelectItem value="30d">30 Hari</SelectItem>
                  <SelectItem value="90d">90 Hari</SelectItem>
                  <SelectItem value="1y">1 Tahun</SelectItem>
                </SelectContent>
              </Select>
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="w-[100px] border-auth-border text-auth-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                  <SelectItem value="day">Harian</SelectItem>
                  <SelectItem value="week">Mingguan</SelectItem>
                  <SelectItem value="month">Bulanan</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleExportData}
                disabled={!data || isLoading}
                className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={data?.currentStats.totalUsers || 0}
          icon={Users}
          trend={data?.currentStats.newUsersThisWeek || 0}
          trendLabel="minggu ini"
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={data?.currentStats.activeUsers || 0}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Blocked Users"
          value={data?.currentStats.blockedUsers || 0}
          icon={UserX}
          color="red"
        />
      </div>

      {isLoading ? (
        <Card className="border-auth-border bg-card text-card-foreground">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-auth-button-brand border-t-transparent" />
              <p className="mt-2 text-sm text-auth-text-muted">Memuat data analytics...</p>
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* User Growth Chart */}
          <Card className="border-auth-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-auth-text-primary">Pertumbuhan User</CardTitle>
              <CardDescription className="text-auth-text-muted">
                Jumlah user baru dan total user per {granularity === 'day' ? 'hari' : granularity === 'week' ? 'minggu' : 'bulan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-auth-border/30" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-auth-text-muted"
                      tick={{ fill: 'hsl(var(--auth-text-muted))' }}
                    />
                    <YAxis
                      className="text-xs text-auth-text-muted"
                      tick={{ fill: 'hsl(var(--auth-text-muted))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--auth-bg-form))',
                        border: '1px solid hsl(var(--auth-border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--auth-text-primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalUsers"
                      stroke="hsl(var(--auth-button-brand))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--auth-button-brand))' }}
                      name="Total Users"
                    />
                    <Bar dataKey="newUsers" fill="hsl(var(--auth-info))" name="Users Baru" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution and Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Role Distribution */}
            <Card className="border-auth-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-auth-text-primary">Distribusi Role</CardTitle>
                <CardDescription className="text-auth-text-muted">
                  Jumlah user berdasarkan role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ role, count, percent }) => `${role}: ${count} (${((percent as number) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role as keyof typeof ROLE_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Activity */}
            <Card className="border-auth-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-auth-text-primary">Aktivitas User</CardTitle>
                <CardDescription className="text-auth-text-muted">
                  Jumlah aktivitas per {granularity === 'day' ? 'hari' : granularity === 'week' ? 'minggu' : 'bulan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-auth-border/30" />
                      <XAxis
                        dataKey="date"
                        className="text-xs text-auth-text-muted"
                        tick={{ fill: 'hsl(var(--auth-text-muted))' }}
                      />
                      <YAxis
                        className="text-xs text-auth-text-muted"
                        tick={{ fill: 'hsl(var(--auth-text-muted))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--auth-bg-form))',
                          border: '1px solid hsl(var(--auth-border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--auth-text-primary))' }}
                      />
                      <Bar dataKey="actions" fill="hsl(var(--auth-success))" name="Aktivitas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color
}: {
  title: string
  value: number
  icon: any
  trend?: number
  trendLabel?: string
  color: 'blue' | 'green' | 'red' | 'yellow'
}) {
  const colorStyles = {
    blue: 'text-auth-info bg-auth-info/10 border-auth-info/20',
    green: 'text-auth-success bg-auth-success/10 border-auth-success/20',
    red: 'text-auth-text-error bg-auth-text-error/10 border-auth-text-error/20',
    yellow: 'text-auth-warning bg-auth-warning/10 border-auth-warning/20',
  }

  const iconColors = {
    blue: 'text-auth-info',
    green: 'text-auth-success',
    red: 'text-auth-text-error',
    yellow: 'text-auth-warning',
  }

  return (
    <Card className={cn('border-auth-border bg-card text-card-foreground', colorStyles[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-auth-text-muted">{title}</p>
            <p className="text-2xl font-bold text-auth-text-primary">{value.toLocaleString('id-ID')}</p>
            {trend !== undefined && trendLabel && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-auth-success" />
                <p className="text-xs text-auth-success">
                  +{trend.toLocaleString('id-ID')} {trendLabel}
                </p>
              </div>
            )}
          </div>
          <Icon className={cn('h-8 w-8', iconColors[color])} />
        </div>
      </CardContent>
    </Card>
  )
}

function generateCSV(data: UserAnalyticsData): string {
  const headers = ['Tanggal', 'User Baru', 'Total User', 'Aktivitas']
  const rows = data.userGrowth.map((growth, _index) => {
    const activity = data.activity.find(a => a.date === growth.date)
    return [
      growth.date,
      growth.newUsers.toString(),
      growth.totalUsers.toString(),
      activity?.actions.toString() || '0',
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '', // Empty row
    'Current Statistics',
    `Total Users,${data.currentStats.totalUsers}`,
    `Active Users,${data.currentStats.activeUsers}`,
    `Blocked Users,${data.currentStats.blockedUsers}`,
    `Verified Users,${data.currentStats.verifiedUsers}`,
    `New Users This Week,${data.currentStats.newUsersThisWeek}`,
    '', // Empty row
    'Role Distribution',
    ...data.roleDistribution.map(role => `${role.role},${role.count}`),
  ].join('\n')

  return csvContent
}