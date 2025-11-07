'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Loader2, MailPlus, RefreshCcw, XCircle } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/hooks/use-toast'
import type { InvitationMetadata } from '@/lib/dashboard/invitations-types'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const invitationSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  firstName: z
    .string()
    .min(2)
    .max(60)
    .transform((value) => value.trim()),
  lastName: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
  role: z.enum(['admin', 'superadmin']),
  expiresInDays: z.number().int().min(1).max(30),
})

type InvitationRecord = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'admin' | 'superadmin' | 'user'
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
  inviter_id: string | null
  invited_user_id: string | null
  invite_link: string | null
  expires_at: string | null
  sent_at: string | null
  last_sent_at: string | null
  responded_at: string | null
  created_at: string | null
  updated_at: string | null
  metadata: InvitationMetadata | null
}

type InvitationManagementPanelProps = {
  currentUserId: string
  invitations: Array<Record<string, any>>
}

export function InvitationManagementPanel({ currentUserId: _currentUserId, invitations }: InvitationManagementPanelProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const [isSubmitting, startTransition] = useTransition()
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'superadmin',
    expiresInDays: 7,
  })
  const [filterTerm, setFilterTerm] = useState('')
  const [records, setRecords] = useState<InvitationRecord[]>(() =>
    sortInvitations(invitations.map((entry) => mapPayloadToInvitation(entry)))
  )

  useEffect(() => {
    setRecords(sortInvitations(invitations.map((entry) => mapPayloadToInvitation(entry))))
  }, [invitations])

  useEffect(() => {
    const channel = supabase
      .channel('admin-invitations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_invitations' },
        (payload) => {
          setRecords((prev) => {
            const next = [...prev]
            if (payload.eventType === 'DELETE') {
              return sortInvitations(next.filter((item) => item.id !== payload.old.id))
            }
            const record = mapPayloadToInvitation(payload.new)
            const idx = next.findIndex((item) => item.id === record.id)
            if (idx >= 0) {
              next[idx] = record
            } else {
              next.unshift(record)
            }
            return sortInvitations(next)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredRecords = useMemo(() => {
    const term = filterTerm.trim().toLowerCase()
    if (!term) return records
    return records.filter((record) => {
      const label = `${record.first_name ?? ''} ${record.last_name ?? ''} ${record.email}`.toLowerCase()
      return label.includes(term)
    })
  }, [records, filterTerm])

  const statusSummary = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        acc.total += 1
        if (record.status === 'accepted') {
          acc.accepted += 1
        } else if (record.status === 'expired') {
          acc.expired += 1
        } else if (record.status === 'cancelled') {
          acc.cancelled += 1
        } else {
          acc.waiting += 1
        }
        return acc
      },
      { total: 0, waiting: 0, accepted: 0, expired: 0, cancelled: 0 }
    )
  }, [records])

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleExpiresChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, expiresInDays: Number(value) }))
  }, [])

  const handleRoleChange = useCallback((value: 'admin' | 'superadmin') => {
    setFormState((prev) => ({ ...prev, role: value }))
  }, [])

  const handleCreateInvitation = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const validation = invitationSchema.safeParse({
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        role: formState.role,
        expiresInDays: formState.expiresInDays,
      })
      if (!validation.success) {
        toast({
          title: 'Form belum valid',
          description: validation.error.issues.map((issue) => issue.message).join(', '),
        })
        return
      }

      startTransition(async () => {
        try {
          const response = await fetch('/api/admin/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validation.data),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload?.error?.message ?? 'Gagal membuat undangan admin.')
          }

          const payload = await response.json()
          const invitation = mapPayloadToInvitation(payload.invitation)
          setRecords((prev) => {
            const withoutDuplicate = prev.filter((item) => item.id !== invitation.id)
            return sortInvitations([invitation, ...withoutDuplicate])
          })
          setFormState({ email: '', firstName: '', lastName: '', role: 'admin', expiresInDays: 7 })
          toast({
            title: 'Undangan dikirim',
            description: `Email undangan buat ${validation.data.email} sudah dikirim.`,
          })
        } catch (error) {
          toast({
            title: 'Gagal mengirim undangan',
            description: error instanceof Error ? error.message : 'Terjadi masalah waktu kirim undangan.',
          })
        }
      })
    },
    [formState, toast]
  )

  const performAction = useCallback(
    async (id: string, action: 'resend' | 'cancel') => {
      setSubmittingId(id)
      startTransition(async () => {
        try {
          const response = await fetch(`/api/admin/invitations/${id}/${action}`, { method: 'POST' })
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload?.error?.message ?? 'Operasi gagal dieksekusi.')
          }
          const payload = await response.json()
          if (payload.invitation) {
            const invitation = mapPayloadToInvitation(payload.invitation)
            setRecords((prev) => {
              const next = prev.filter((item) => item.id !== invitation.id)
              return sortInvitations([invitation, ...next])
            })
          }
          toast({
            title: action === 'resend' ? 'Undangan dikirim ulang' : 'Undangan dibatalkan',
            description:
              action === 'resend'
                ? 'Penerima bakal nerima email re-invite terbaru.'
                : 'Undangan sudah ditandai batal dan nggak bisa dipakai lagi.',
          })
        } catch (error) {
          toast({
            title: 'Operasi gagal',
            description: error instanceof Error ? error.message : 'Ada kendala saat menjalankan aksi ini.',
          })
        } finally {
          setSubmittingId(null)
        }
      })
    },
    [toast]
  )

  return (
    <Card className="border-auth-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-auth-text-primary">Admin Invitation System</CardTitle>
        <CardDescription className="text-auth-text-muted">
          Kirim undangan admin baru, pantau status, dan kelola re-invite langsung dari dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusSummaryCard label="Total Undangan" value={statusSummary.total} tone="info" />
          <StatusSummaryCard label="Menunggu Respons" value={statusSummary.waiting} tone="warning" />
          <StatusSummaryCard label="Diterima" value={statusSummary.accepted} tone="success" />
          <StatusSummaryCard label="Expired / Batal" value={statusSummary.expired + statusSummary.cancelled} tone="muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <section className="space-y-4 rounded-2xl border border-auth-border bg-auth-bg-hover p-6">
          <header>
            <h2 className="text-lg font-heading text-auth-text-primary">Buat Undangan Baru</h2>
            <p className="text-xs text-auth-text-muted">
              Isi email calon admin. Mereka bakal nerima email Supabase buat set password pertama.
            </p>
          </header>
          <form className="space-y-4" onSubmit={handleCreateInvitation}>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-auth-text-muted">Email</label>
              <Input
                name="email"
                placeholder="admin@juara.co.id"
                className="bg-auth-bg-form text-auth-text-primary"
                value={formState.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-auth-text-muted">Nama Depan</label>
              <Input
                name="firstName"
                placeholder="Nama depan"
                className="bg-auth-bg-form text-auth-text-primary"
                value={formState.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-auth-text-muted">Nama Belakang</label>
              <Input
                name="lastName"
                placeholder="Opsional"
                className="bg-auth-bg-form text-auth-text-primary"
                value={formState.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-auth-text-muted">Role</label>
                <Select value={formState.role} onValueChange={(value) => handleRoleChange(value as 'admin' | 'superadmin')}>
                  <SelectTrigger className="border-auth-border text-auth-text-primary">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-auth-text-muted">Masa berlaku (hari)</label>
                <Select value={String(formState.expiresInDays)} onValueChange={handleExpiresChange}>
                  <SelectTrigger className="border-auth-border text-auth-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                    {[3, 7, 14, 30].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} hari
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="auth-button-brand hover:auth-button-brand-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Mengirim...
                </>
              ) : (
                <>
                  <MailPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Kirim Undangan
                </>
              )}
            </Button>
          </form>
        </section>
          <section className="space-y-4 rounded-2xl border border-auth-border bg-auth-bg-hover p-6">
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-heading text-auth-text-primary">Daftar Undangan</h2>
              <p className="text-xs text-auth-text-muted">
                Lihat status dan lakukan re-invite kalau link sudah kedaluwarsa.
              </p>
            </div>
            <Input
              placeholder="Cari email atau nama"
              className="w-full bg-auth-bg-form text-auth-text-primary md:w-64"
              value={filterTerm}
              onChange={(event) => setFilterTerm(event.target.value)}
            />
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm text-auth-text-secondary">
              <thead>
                <tr className="border-b border-auth-border text-xxs uppercase tracking-wide text-auth-text-muted">
                  <th className="px-4 py-3 text-left">Penerima</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Kadaluarsa</th>
                  <th className="px-4 py-3 text-left">Terakhir dikirim</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-auth-text-muted">
                      Belum ada undangan yang cocok sama filter lo.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const actionsDisabled = submittingId === record.id
                    const showResend = record.status === 'pending' || record.status === 'sent'
                    const showCancel = record.status === 'pending' || record.status === 'sent'
                    return (
                      <tr key={record.id} className="border-b border-auth-border/60 text-xs last:border-0">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-auth-text-primary">
                              {formatRecipient(record)}
                            </span>
                            <span className="text-xxs text-auth-text-muted">{record.email}</span>
                            {record.metadata?.deliveries?.length ? (
                              <span className="text-xxs text-auth-text-muted">
                                Percobaan kirim: {record.metadata.deliveries.length}x
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <InvitationStatusBadge status={record.status} />
                        </td>
                        <td className="px-4 py-4 text-xxs text-auth-text-muted">
                          {record.expires_at ? formatRelativeDate(record.expires_at) : '—'}
                        </td>
                        <td className="px-4 py-4 text-xxs text-auth-text-muted">
                          {record.last_sent_at ? formatRelativeDate(record.last_sent_at) : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            {showResend ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="border-auth-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
                                disabled={actionsDisabled}
                                onClick={() => performAction(record.id, 'resend')}
                              >
                                {actionsDisabled ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                                )}
                              </Button>
                            ) : null}
                            {showCancel ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="border-auth-border text-auth-text-secondary hover:border-auth-text-error"
                                disabled={actionsDisabled}
                                onClick={() => performAction(record.id, 'cancel')}
                              >
                                {actionsDisabled ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <XCircle className="h-4 w-4" aria-hidden="true" />
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
        </div>
      </CardContent>
    </Card>
  )
}

function mapPayloadToInvitation(payload: Record<string, any>): InvitationRecord {
  return {
    id: payload.id,
    email: payload.email,
    first_name: payload.first_name,
    last_name: payload.last_name,
    role: payload.role,
    status: payload.status,
    inviter_id: payload.inviter_id,
    invited_user_id: payload.invited_user_id,
    invite_link: payload.invite_link,
    expires_at: payload.expires_at,
    sent_at: payload.sent_at,
    last_sent_at: payload.last_sent_at,
    responded_at: payload.responded_at,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    metadata:
      typeof payload.metadata === 'string'
        ? safeParseJson(payload.metadata)
        : (payload.metadata ?? null),
  }
}

function sortInvitations(entries: InvitationRecord[]): InvitationRecord[] {
  return [...entries].sort((a, b) => {
    if (!a.created_at && !b.created_at) return 0
    if (!a.created_at) return 1
    if (!b.created_at) return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function formatRecipient(record: InvitationRecord) {
  const name = `${record.first_name ?? ''} ${record.last_name ?? ''}`.trim()
  if (name.length > 0) return name
  return record.email
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function safeParseJson(value: string): InvitationMetadata | null {
  try {
    return JSON.parse(value) as InvitationMetadata
  } catch {
    return null
  }
}

function InvitationStatusBadge({ status }: { status: InvitationRecord['status'] }) {
  const base = 'px-2 py-1 text-xxs font-semibold uppercase tracking-wide rounded-full'
  switch (status) {
    case 'pending':
      return <span className={cn(base, 'bg-auth-warning/20 text-auth-warning')}>Menunggu</span>
    case 'sent':
      return <span className={cn(base, 'bg-auth-info/20 text-auth-info')}>Dikirim</span>
    case 'accepted':
      return <span className={cn(base, 'bg-auth-success/20 text-auth-success')}>Diterima</span>
    case 'expired':
      return <span className={cn(base, 'bg-auth-text-muted/20 text-auth-text-muted')}>Expired</span>
    case 'cancelled':
      return <span className={cn(base, 'bg-auth-text-error/20 text-auth-text-error')}>Batal</span>
    default:
      return <span className={cn(base, 'bg-auth-text-muted/20 text-auth-text-muted')}>{status}</span>
  }
}

function StatusSummaryCard({ label, value, tone }: {
  label: string
  value: number
  tone: 'info' | 'warning' | 'success' | 'muted'
}) {
  const toneStyles: Record<'info' | 'warning' | 'success' | 'muted', { container: string; text: string }> = {
    info: { container: 'border-auth-info/40 bg-auth-info/10', text: 'text-auth-info' },
    warning: { container: 'border-auth-warning/40 bg-auth-warning/10', text: 'text-auth-warning' },
    success: { container: 'border-auth-success/40 bg-auth-success/10', text: 'text-auth-success' },
    muted: { container: 'border-auth-border bg-auth-bg-hover', text: 'text-auth-text-muted' },
  }
  const styles = toneStyles[tone]
  return (
    <div className={cn('rounded-2xl border p-4', styles.container)}>
      <p className="text-xxs uppercase tracking-wide text-auth-text-muted">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold', styles.text)}>{value}</p>
    </div>
  )
}
