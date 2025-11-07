'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Download, Loader2, Signal, Zap, RefreshCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/hooks/use-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type TimelinePoint = { date: string; count: number }

type UserAnalyticsPayload = {
  generatedAt: string
  rangeDays: number
  timeline: TimelinePoint[]
  demographics: Record<string, number>
  statusBreakdown: Record<string, number>
  totals: {
    totalUsers: number
    activeUsers: number
    blockedUsers: number
    deletedUsers: number
  }
}

type SystemHealthPayload = {
  generatedAt: string
  database: {
    status: string
    uptimeSeconds: number
    sizeBytes: number
    activeConnections: number
    maxConnections: number
    txPerMinuteEstimate: number
  }
}

type AnalyticsDashboardProps = {
  currentUserId: string
  initialAnalytics: UserAnalyticsPayload
  initialHealth: SystemHealthPayload
}

const RANGE_OPTIONS = [7, 30, 90]

export function AnalyticsDashboard({ currentUserId: _currentUserId, initialAnalytics, initialHealth }: AnalyticsDashboardProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<UserAnalyticsPayload>(initialAnalytics)
  const [health, setHealth] = useState<SystemHealthPayload>(initialHealth)
  const [range, setRange] = useState<number>(initialAnalytics?.rangeDays ?? 30)
  const [isFetchingAnalytics, startAnalyticsTransition] = useTransition()
  const [isRefreshingHealth, startHealthTransition] = useTransition()

  useEffect(() => {
    const channel = supabase
      .channel('analytics-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        setAnalytics((prev) => {
          if (!prev) return prev
          const next = { ...prev }
          const statusBefore = (payload.old as any)?.status as string | undefined
          const statusAfter = (payload.new as any)?.status as string | undefined

          if (payload.eventType === 'INSERT') {
            next.totals.totalUsers += 1
            if (statusAfter === 'active') next.totals.activeUsers += 1
            if (statusAfter === 'blocked') next.totals.blockedUsers += 1
            if (statusAfter === 'deleted') next.totals.deletedUsers += 1
          }

          if (payload.eventType === 'DELETE') {
            next.totals.totalUsers = Math.max(0, next.totals.totalUsers - 1)
            if (statusBefore === 'active') next.totals.activeUsers = Math.max(0, next.totals.activeUsers - 1)
            if (statusBefore === 'blocked') next.totals.blockedUsers = Math.max(0, next.totals.blockedUsers - 1)
            if (statusBefore === 'deleted') next.totals.deletedUsers = Math.max(0, next.totals.deletedUsers - 1)
          }

          if (payload.eventType === 'UPDATE') {
            if (statusBefore !== statusAfter) {
              adjustStatusCount(next.totals, statusBefore, -1)
              adjustStatusCount(next.totals, statusAfter, 1)
            }
          }

          return { ...next }
        })
      })
      .subscribe()

  return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const timelineSource = analytics?.timeline
  const timeline = useMemo(() => timelineSource ?? [], [timelineSource])
  const maxNewUsers = Math.max(...timeline.map((point) => point.count), 0)

  const handleRangeChange = useCallback(
    (value: string) => {
      const nextRange = Number(value)
      setRange(nextRange)
      startAnalyticsTransition(async () => {
        try {
          const response = await fetch(`/api/admin/analytics/users?range=${nextRange}`)
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload?.error?.message ?? 'Gagal mengambil data analytics.')
          }
          const payload = await response.json()
          setAnalytics(payload.analytics as UserAnalyticsPayload)
        } catch (error) {
          toast({
            title: 'Gagal mengambil data',
            description: error instanceof Error ? error.message : 'Terjadi masalah saat ambil data analytics.',
          })
        }
      })
    },
    [toast]
  )

  const refreshHealth = useCallback(() => {
    startHealthTransition(async () => {
      try {
        const response = await fetch('/api/admin/analytics/system/health')
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload?.error?.message ?? 'Gagal mengambil data health.')
        }
        const payload = await response.json()
        setHealth(payload.health as SystemHealthPayload)
      } catch (error) {
        toast({
          title: 'Gagal refresh health',
          description: error instanceof Error ? error.message : 'Terjadi masalah saat refresh health.',
        })
      }
    })
  }, [toast])

  const exportTimeline = useCallback(() => {
    if (!timeline.length) {
      toast({ title: 'Tidak ada data', description: 'Belum ada timeline yang bisa diexport.' })
      return
    }
    const header = 'date,count\n'
    const rows = timeline.map((point) => `${point.date},${point.count}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-growth-${range}d.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast({ title: 'Export berhasil', description: 'File CSV siap diunduh.' })
  }, [timeline, range, toast])

  return (
    <div className="grid gap-6">
      <Card className="border-auth-border dashboard-bg-sidebar text-auth-text-primary">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-auth-text-primary">User Analytics</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Monitor pertumbuhan user, demografi role, dan status akun secara real-time.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={String(range)} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-[140px] border-auth-border text-auth-text-primary">
                <SelectValue placeholder="Rentang" />
              </SelectTrigger>
              <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} hari
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              onClick={exportTimeline}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-auth-border bg-auth-bg-hover p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-auth-text-muted">Pertumbuhan</p>
                <p className="text-3xl font-heading text-auth-text-primary">
                  {analytics?.totals?.totalUsers ?? 0}
                </p>
                <p className="text-xs text-auth-text-muted">Total user terdaftar</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-auth-text-secondary">
                <Badge variant="secondary" className="bg-auth-success/20 text-auth-success hover:bg-auth-success/30">Aktif {analytics?.totals?.activeUsers ?? 0}</Badge>
                <Badge variant="secondary" className="bg-auth-warning/20 text-auth-warning hover:bg-auth-warning/30">Block {analytics?.totals?.blockedUsers ?? 0}</Badge>
                <Badge variant="secondary" className="bg-auth-text-error/20 text-auth-text-error hover:bg-auth-text-error/30">Deleted {analytics?.totals?.deletedUsers ?? 0}</Badge>
              </div>
            </div>
            <div className="mt-6 h-48 rounded-xl border border-auth-border bg-auth-bg-form p-4">
              {isFetchingAnalytics ? (
                <div className="flex h-full items-center justify-center text-auth-text-muted">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                </div>
              ) : (
                <MiniLineChart data={timeline} maxValue={maxNewUsers} />
              )}
            </div>
          </div>
          <div className="space-y-4">
            <StatCard title="Demografi Role">
              {renderKeyValueList(analytics?.demographics)}
            </StatCard>
            <StatCard title="Status Akun">
              {renderKeyValueList(analytics?.statusBreakdown)}
            </StatCard>
          </div>
        </CardContent>
      </Card>

      <Card className="border-auth-border dashboard-bg-sidebar text-auth-text-primary">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-auth-text-primary">System Health</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Pantau kondisi database Supabase dan indikator performa penting.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
            onClick={refreshHealth}
            disabled={isRefreshingHealth}
          >
            {isRefreshingHealth ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <HealthMetric
            label="Status"
            icon={Signal}
            value={health.database.status}
            highlight={health.database.status === 'online'}
          />
          <HealthMetric
            label="Uptime"
            icon={Zap}
            value={formatDuration(health.database.uptimeSeconds)}
          />
          <HealthMetric
            label="Aktif / Max Connection"
            value={`${health.database.activeConnections}/${health.database.maxConnections}`}
          />
          <HealthMetric
            label="Database Size"
            value={formatBytes(health.database.sizeBytes)}
          />
          <HealthMetric
            label="Estimasi TX/menit"
            value={Math.round(health.database.txPerMinuteEstimate).toLocaleString('id-ID')}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function adjustStatusCount(
  totals: UserAnalyticsPayload['totals'],
  status: string | undefined,
  delta: number
) {
  if (!status || !totals) return
  switch (status) {
    case 'active':
      totals.activeUsers = Math.max(0, totals.activeUsers + delta)
      break
    case 'blocked':
      totals.blockedUsers = Math.max(0, totals.blockedUsers + delta)
      break
    case 'deleted':
      totals.deletedUsers = Math.max(0, totals.deletedUsers + delta)
      break
    default:
      break
  }
}

function renderKeyValueList(map: Record<string, number> | undefined) {
  if (!map || Object.keys(map).length === 0) {
    return <p className="text-xs text-auth-text-muted">Belum ada data.</p>
  }
  return (
    <div className="space-y-2 text-xs text-auth-text-secondary">
      {Object.entries(map).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between rounded-lg border border-auth-border px-3 py-2">
          <span className="capitalize text-auth-text-primary">{key}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function MiniLineChart({ data, maxValue }: { data: TimelinePoint[]; maxValue: number }) {
  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-xs text-auth-text-muted">Belum ada data timeline.</div>
  }
  const viewBoxWidth = 100
  const viewBoxHeight = 40
  const points = data.map((point, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * viewBoxWidth : viewBoxWidth / 2
    const value = maxValue === 0 ? 0 : (point.count / maxValue) * viewBoxHeight
    const y = viewBoxHeight - value
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const areaPoints = [`0,${viewBoxHeight}`, ...points, `${viewBoxWidth},${viewBoxHeight}`].join(' ')

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="h-full w-full">
      <polyline
        fill="url(#chartGradient)"
        stroke="none"
        points={areaPoints}
        opacity={0.6}
      />
      <polyline
        fill="none"
        stroke="var(--color-auth-button-brand)"
        strokeWidth={1.5}
        points={points.join(' ')}
      />
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-auth-button-brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-auth-button-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-auth-border bg-auth-bg-hover p-4">
      <p className="text-sm font-medium text-auth-text-primary">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function HealthMetric({ label, value, icon: Icon, highlight }: { label: string; value: string | number; icon?: React.ComponentType<{ className?: string }>; highlight?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-auth-border bg-auth-bg-hover p-4', highlight && 'border-auth-success/60')}> 
      <p className="text-xs uppercase tracking-wide text-auth-text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-auth-text-primary">
        {Icon ? <Icon className="h-4 w-4 text-auth-text-muted" aria-hidden="true" /> : null}
        <span>{value}</span>
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}h ${hours}j ${mins}m`
  if (hours > 0) return `${hours}j ${mins}m`
  return `${mins}m`
}

function formatBytes(bytes: number) {
  if (!bytes || Number.isNaN(bytes)) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}
