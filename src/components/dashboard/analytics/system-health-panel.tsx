'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, Database, Server, AlertTriangle, CheckCircle, XCircle, RefreshCw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/hooks/use-toast'
import { cn } from '@/lib/utils'

type SystemHealthData = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  responseTime: string
  database: {
    status: 'healthy' | 'unhealthy'
    responseTime: string
    tables: {
      users: number
      auditLogs: number
      invitations: number
      permissions: number
    }
    recentErrors: number
    lastCheck: string
    error?: string
  }
  system: {
    users: {
      total: number
      active24h: number
      new24h: number
    }
    invitations: {
      total: number
      pending: number
      accepted24h: number
    }
    activity: {
      totalActions24h: number
    }
    metrics: Array<{
      id: string
      metric_name: string
      metric_value: number
      recorded_at: string
      metadata?: any
    }>
    error?: string
  }
  activity: {
    recentActions: Array<{
      action: string
      resource_type: string
      created_at: string
      users: {
        email: string
        first_name: string | null
        last_name: string | null
      }
    }>
    recentInvitations: Array<{
      status: string
      email: string
      first_name: string | null
      last_name: string | null
      created_at: string
      last_sent_at: string | null
    }>
    summary: {
      totalActions1h: number
      totalInvitations1h: number
    }
    error?: string
  }
  error?: string
}

type SystemHealthPanelProps = {
  className?: string
}

export function SystemHealthPanel({ className }: SystemHealthPanelProps) {
  const { toast } = useToast()
  const [data, setData] = useState<SystemHealthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchHealthData = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/system/health')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || 'Gagal mengambil data health check')
      }

      const healthData = await response.json()
      setData(healthData)
      setLastRefresh(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast({
        title: 'Gagal memuat data health',
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchHealthData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [fetchHealthData])

  const statusColor = useMemo(() => {
    switch (data?.status) {
      case 'healthy':
        return 'text-auth-success bg-auth-success/10 border-auth-success/20'
      case 'degraded':
        return 'text-auth-warning bg-auth-warning/10 border-auth-warning/20'
      case 'unhealthy':
        return 'text-auth-text-error bg-auth-text-error/10 border-auth-text-error/20'
      default:
        return 'text-auth-text-muted bg-auth-bg-hover border-auth-border'
    }
  }, [data?.status])

  const statusIcon = useMemo(() => {
    switch (data?.status) {
      case 'healthy':
        return CheckCircle
      case 'degraded':
        return AlertTriangle
      case 'unhealthy':
        return XCircle
      default:
        return Activity
    }
  }, [data?.status])

  const statusText = useMemo(() => {
    switch (data?.status) {
      case 'healthy':
        return 'Sehat'
      case 'degraded':
        return 'Terdegradasi'
      case 'unhealthy':
        return 'Tidak Sehat'
      default:
        return 'Unknown'
    }
  }, [data?.status])

  const metricsData = useMemo(() => {
    if (!data?.system.metrics) return []
    return data.system.metrics.map(metric => ({
      name: metric.metric_name,
      value: Number(metric.metric_value),
      time: new Date(metric.recorded_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
  }, [data?.system.metrics])

  const formatRelativeTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`
    return `${Math.floor(diffMins / 1440)} hari lalu`
  }, [])

  if (!data && !isLoading) {
    return (
      <Card className={cn('border-auth-border bg-card text-card-foreground', className)}>
        <CardHeader>
          <CardTitle className="text-auth-text-primary">System Health</CardTitle>
          <CardDescription className="text-auth-text-muted">
            Monitor kesehatan dan performa sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-auth-text-muted mb-4">Data health tidak tersedia</p>
            <Button onClick={fetchHealthData} variant="outline">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-auth-text-primary">System Health</CardTitle>
              <CardDescription className="text-auth-text-muted">
                Monitor kesehatan dan performa sistem
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <span className="text-xs text-auth-text-muted">
                  Last refresh: {formatRelativeTime(lastRefresh.toISOString())}
                </span>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={fetchHealthData}
                disabled={isLoading}
                className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="System Status"
          status={data?.status || 'unknown'}
          value={statusText}
          icon={statusIcon}
          responseTime={data?.responseTime}
        />
        <StatusCard
          title="Database"
          status={data?.database.status || 'unknown'}
          value={data?.database.status === 'healthy' ? 'Online' : 'Offline'}
          icon={Database}
          responseTime={data?.database.responseTime}
        />
        <StatusCard
          title="Active Users"
          status="info"
          value={data?.system.users.active24h?.toString() || '0'}
          icon={Users}
          subtitle="24 jam terakhir"
        />
        <StatusCard
          title="System Actions"
          status="info"
          value={data?.system.activity.totalActions24h?.toString() || '0'}
          icon={Activity}
          subtitle="24 jam terakhir"
        />
      </div>

      {isLoading ? (
        <Card className="border-auth-border bg-card text-card-foreground">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-auth-button-brand border-t-transparent" />
              <p className="mt-2 text-sm text-auth-text-muted">Memeriksa kesehatan sistem...</p>
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Database Health */}
          <Card className="border-auth-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-auth-text-primary">Database Health</CardTitle>
              <CardDescription className="text-auth-text-muted">
                Status dan metrik database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-auth-text-primary">
                    {data.database.tables.users.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-auth-text-muted">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-auth-text-primary">
                    {data.database.tables.auditLogs.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-auth-text-muted">Audit Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-auth-text-primary">
                    {data.database.tables.invitations.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-auth-text-muted">Invitations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-auth-text-primary">
                    {data.database.tables.permissions.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-auth-text-muted">Permissions</p>
                </div>
              </div>
              {data.database.recentErrors > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-auth-warning/10 border border-auth-warning/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-auth-warning" />
                    <span className="text-sm text-auth-warning">
                      {data.database.recentErrors} error terdeteksi dalam 1 jam terakhir
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Metrics */}
          {metricsData.length > 0 && (
            <Card className="border-auth-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-auth-text-primary">System Metrics</CardTitle>
                <CardDescription className="text-auth-text-muted">
                  Performa sistem real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-auth-border/30" />
                      <XAxis
                        dataKey="time"
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
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--auth-button-brand))"
                        fill="hsl(var(--auth-button-brand))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Actions */}
            <Card className="border-auth-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-auth-text-primary">Aktivitas Terkini</CardTitle>
                <CardDescription className="text-auth-text-muted">
                  {data.activity.summary.totalActions1h} aktivitas dalam 1 jam terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.activity.recentActions.length > 0 ? (
                    data.activity.recentActions.slice(0, 5).map((action, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-auth-text-primary">{action.action}</p>
                          <p className="text-xs text-auth-text-muted">
                            oleh {action.users.first_name} {action.users.last_name || action.users.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-auth-text-muted">
                            {formatRelativeTime(action.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-auth-text-muted py-4">
                      Tidak ada aktivitas terkini
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Invitations */}
            <Card className="border-auth-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-auth-text-primary">Undangan Terkini</CardTitle>
                <CardDescription className="text-auth-text-muted">
                  {data.activity.summary.totalInvitations1h} undangan dalam 1 jam terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.activity.recentInvitations.length > 0 ? (
                    data.activity.recentInvitations.slice(0, 5).map((invitation, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-auth-text-primary">
                            {invitation.first_name} {invitation.last_name || invitation.email}
                          </p>
                          <p className="text-xs text-auth-text-muted">{invitation.email}</p>
                        </div>
                        <div className="text-right">
                          <InvitationStatusBadge status={invitation.status} />
                          <p className="text-xs text-auth-text-muted mt-1">
                            {formatRelativeTime(invitation.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-auth-text-muted py-4">
                      Tidak ada undangan terkini
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

function StatusCard({
  title,
  status,
  value,
  icon: Icon,
  responseTime,
  subtitle
}: {
  title: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'info' | 'unknown'
  value: string
  icon: any
  responseTime?: string
  subtitle?: string
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-auth-success bg-auth-success/10 border-auth-success/20'
      case 'degraded':
        return 'text-auth-warning bg-auth-warning/10 border-auth-warning/20'
      case 'unhealthy':
        return 'text-auth-text-error bg-auth-text-error/10 border-auth-text-error/20'
      case 'info':
        return 'text-auth-info bg-auth-info/10 border-auth-info/20'
      default:
        return 'text-auth-text-muted bg-auth-bg-hover border-auth-border'
    }
  }

  const getIconColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-auth-success'
      case 'degraded':
        return 'text-auth-warning'
      case 'unhealthy':
        return 'text-auth-text-error'
      case 'info':
        return 'text-auth-info'
      default:
        return 'text-auth-text-muted'
    }
  }

  return (
    <Card className={cn('border-auth-border bg-card text-card-foreground', getStatusColor(status))}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-auth-text-muted">{title}</p>
            <p className="text-xl font-bold text-auth-text-primary">{value}</p>
            {subtitle && (
              <p className="text-xs text-auth-text-muted mt-1">{subtitle}</p>
            )}
            {responseTime && (
              <p className="text-xs text-auth-text-muted mt-1">{responseTime}</p>
            )}
          </div>
          <Icon className={cn('h-6 w-6', getIconColor(status))} />
        </div>
      </CardContent>
    </Card>
  )
}

function InvitationStatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-auth-warning/20 text-auth-warning'
      case 'sent':
        return 'bg-auth-info/20 text-auth-info'
      case 'accepted':
        return 'bg-auth-success/20 text-auth-success'
      case 'expired':
        return 'bg-auth-text-muted/20 text-auth-text-muted'
      case 'cancelled':
        return 'bg-auth-text-error/20 text-auth-text-error'
      default:
        return 'bg-auth-text-muted/20 text-auth-text-muted'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu'
      case 'sent':
        return 'Dikirim'
      case 'accepted':
        return 'Diterima'
      case 'expired':
        return 'Kadaluarsa'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  return (
    <Badge className={cn('text-xs', getStatusStyle(status))}>
      {getStatusText(status)}
    </Badge>
  )
}