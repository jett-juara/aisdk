import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, RefreshCcw, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createSupabaseRSCClient } from '@/lib/supabase/server'

type MetricRow = {
  metric_name: string
  metric_value: number | null
  recorded_at: string
}

export default async function DashboardPage() {
  const supabase = await createSupabaseRSCClient()

  const { data: metrics } = await supabase
    .from('system_metrics')
    .select('metric_name, metric_value, recorded_at')
    .order('recorded_at', { ascending: false })
    .limit(6)

  const summarized = buildMetricSummary(metrics ?? [])

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-button-border dashboard-bg-sidebar px-6 py-6 text-auth-text-primary lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-auth-text-muted">Status Sistem</p>
          <h1 className="text-3xl font-heading">Selamat datang di Juara Control Center</h1>
          <p className="text-sm text-auth-text-secondary">
            Pantau aktivitas event internal dan publik, kelola tim, serta kontrol akses dalam satu tempat.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="auth-button-brand hover:auth-button-brand-hover text-xs uppercase tracking-wide">
            <Link href="/dashboard/analytics">
              Lihat Analitik
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" className="border-button-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary">
            <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Sinkronkan
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading text-auth-text-primary">Ringkasan Metrik</h2>
            <p className="text-xs text-auth-text-muted">
              Data diambil dari sistem Supabase dan diperbarui secara berkala.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summarized.map((metric) => (
            <Card key={metric.id} className="border-button-border dashboard-bg-sidebar text-auth-text-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-auth-text-secondary">{metric.title}</CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-auth-text-primary">{metric.value}</div>
                <p className="text-xs text-auth-text-muted">{metric.caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-button-border dashboard-bg-sidebar text-auth-text-primary">
          <CardHeader>
            <CardTitle className="text-auth-text-primary">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Log audit singkat akan tampil di sini setelah modul monitoring aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-10 text-sm text-auth-text-muted">
            Belum ada data aktivitas. Lanjutkan konfigurasi modul admin untuk mulai merekam log.
          </CardContent>
        </Card>
        <Card className="border-button-border dashboard-bg-sidebar text-auth-text-primary">
          <CardHeader>
            <CardTitle className="text-auth-text-primary">Tindakan Cepat</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Shortcut untuk alur kerja paling sering dipakai tim operasional.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="border-button-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
            >
              <Link href="/dashboard/users">
                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                Kelola Pengguna
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-button-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
            >
              <Link href="/dashboard/permissions">Atur Izin</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-button-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
            >
              <Link href="/dashboard/profile">Edit Profil</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function buildMetricSummary(rows: MetricRow[]): Array<{
  id: string
  title: string
  value: string
  caption: string
  icon: ReactNode
}> {
  if (!rows.length) {
    return [
      {
        id: 'active_users',
        title: 'Pengguna Aktif',
        value: '0',
        caption: 'Perlu konfigurasi data Supabase untuk menampilkan statistik.',
        icon: <Users className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
      },
      {
        id: 'uptime',
        title: 'Uptime Sistem',
        value: '0 jam',
        caption: 'Belum ada data uptime yang tercatat.',
        icon: <RefreshCcw className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
      },
      {
        id: 'events',
        title: 'Event Berjalan',
        value: '0',
        caption: 'Daftar event akan tersedia setelah modul jadwal aktif.',
        icon: <ArrowUpRight className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
      },
      {
        id: 'conversion',
        title: 'Konversi RSVP',
        value: '0%',
        caption: 'Integrasikan analitik publik untuk melihat performa kampanye.',
        icon: <BarPlaceholder />,
      },
    ]
  }

  const metricMap = new Map<string, MetricRow>()
  rows.forEach((row) => {
    const existing = metricMap.get(row.metric_name)
    if (!existing || new Date(row.recorded_at) > new Date(existing.recorded_at)) {
      metricMap.set(row.metric_name, row)
    }
  })

  return [
    {
      id: 'active_users',
      title: 'Pengguna Aktif',
      value: formatMetric(metricMap.get('active_users'), 'orang'),
      caption: 'Jumlah akun dengan status aktif dalam 24 jam terakhir.',
      icon: <Users className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
    },
    {
      id: 'uptime_hours',
      title: 'Uptime Sistem',
      value: formatMetric(metricMap.get('uptime_hours'), 'jam'),
      caption: 'Estimasi waktu sistem tersedia sejak deploy terakhir.',
      icon: <RefreshCcw className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
    },
    {
      id: 'events_live',
      title: 'Event Aktif',
      value: formatMetric(metricMap.get('events_live'), 'event'),
      caption: 'Total event internal maupun publik yang sedang berjalan.',
      icon: <ArrowUpRight className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />,
    },
    {
      id: 'conversion_rate',
      title: 'Konversi RSVP',
      value: formatMetric(metricMap.get('conversion_rate'), '%'),
      caption: 'Perbandingan undangan terhadap RSVP confirm.',
      icon: <BarPlaceholder />,
    },
  ]
}

function formatMetric(row: MetricRow | undefined, suffix: string): string {
  if (!row || row.metric_value === null) return `0 ${suffix}`.trim()
  return `${Number(row.metric_value).toLocaleString('id-ID', { maximumFractionDigits: 1 })} ${suffix}`.trim()
}

function BarPlaceholder() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-auth-text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M5 12v6m7-12v12m7-8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
