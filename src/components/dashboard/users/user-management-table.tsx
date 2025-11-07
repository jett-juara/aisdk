'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Loader2, RefreshCcw, Search, ShieldAlert, CheckSquare, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/hooks/use-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type DashboardUserRole = 'user' | 'admin' | 'superadmin'
type DashboardUserStatus = 'active' | 'blocked' | 'deleted'

type DashboardUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: DashboardUserRole
  status: DashboardUserStatus
  deletedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

type UserManagementTableProps = {
  currentUserId: string
  currentUserRole: DashboardUserRole
  initialUsers?: DashboardUser[]
}

const statusOptions: Array<{ value: DashboardUserStatus; label: string }> = [
  { value: 'active', label: 'Aktif' },
  { value: 'blocked', label: 'Diblokir' },
  { value: 'deleted', label: 'Dihapus (soft delete)' },
]

export function UserManagementTable({
  currentUserId,
  currentUserRole,
  initialUsers,
}: UserManagementTableProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [users, setUsers] = useState<DashboardUser[]>(() => sortUsers(initialUsers || []))
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DashboardUserStatus>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | DashboardUserRole>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkOperation, setBulkOperation] = useState<{
    type: 'status_change' | 'permission_assign' | 'delete'
    data: any
  } | null>(null)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    user: DashboardUser
    targetStatus: DashboardUserStatus
  } | null>(null)
  const [changeReason, setChangeReason] = useState('')

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setUsers((prev) => prev.filter((entry) => entry.id !== payload.old.id))
            return
          }

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const mapped = mapRowToUser(payload.new)
            setUsers((prev) => {
              const existingIndex = prev.findIndex((entry) => entry.id === mapped.id)
              if (existingIndex >= 0) {
                const next = [...prev]
                next[existingIndex] = mapped
                return sortUsers(next)
              }
              return sortUsers([...prev, mapped])
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return users.filter((user) => {
      const haystack = `${user.firstName} ${user.lastName} ${user.email} ${user.username}`.toLowerCase()
      const matchesSearch = term.length === 0 || haystack.includes(term)
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [users, searchTerm, statusFilter, roleFilter])

  // Bulk selection handlers
  const handleSelectUser = useCallback((userId: string, selected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
  }, [filteredUsers, selectedUsers.size])

  const handleBulkOperation = useCallback((type: 'status_change' | 'permission_assign' | 'delete', data: any) => {
    if (selectedUsers.size === 0) {
      toast({
        title: 'Tidak ada user yang dipilih',
        description: 'Pilih minimal satu user untuk operasi bulk.',
      })
      return
    }
    setBulkOperation({ type, data })
    setShowBulkDialog(true)
  }, [selectedUsers.size, toast])

  const refreshFromServer = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Gagal memuat ulang data user.')
      }
      const payload = await response.json()
      setUsers(sortUsers(payload.users as DashboardUser[]))
    } catch (error) {
      toast({
        title: 'Gagal refresh',
        description: error instanceof Error ? error.message : 'Refresh data gagal.',
      })
    } finally {
      setRefreshing(false)
    }
  }, [toast])

  const executeBulkOperation = useCallback(async () => {
    if (!bulkOperation || selectedUsers.size === 0) return

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/users/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: bulkOperation.type,
            userIds: Array.from(selectedUsers),
            data: bulkOperation.data,
            metadata: {
              ipAddress: null, // Would be populated server-side
              userAgent: navigator.userAgent,
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData?.error?.message ?? 'Operasi bulk gagal.')
        }

        const result = await response.json()

        // Show results summary
        const { successful, failed, total } = result.summary
        toast({
          title: 'Operasi Bulk Selesai',
          description: `${successful}/${total} user berhasil diproses${failed > 0 ? `, ${failed} gagal` : ''}`,
        })

        // Refresh data
        await refreshFromServer()

        // Clear selection
        setSelectedUsers(new Set())
        setShowBulkDialog(false)
        setBulkOperation(null)
      } catch (error) {
        toast({
          title: 'Operasi Bulk Gagal',
          description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
        })
      }
    })
  }, [bulkOperation, selectedUsers, toast, refreshFromServer])

  const refreshingDisabled = refreshing || isPending

  const performStatusUpdate = useCallback(
    (user: DashboardUser, targetStatus: DashboardUserStatus, reason: string | null) => {
      startTransition(async () => {
        try {
          const response = await fetch(`/api/admin/users/${user.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetStatus, reason }),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload?.error?.message ?? 'Gagal mengubah status user.')
          }

          toast({
            title: 'Status diperbarui',
            description: `Status ${formatDisplayName(user)} sekarang ${formatStatusLabel(
              targetStatus
            )}.`,
          })

          setUsers((prev) => {
            const next = prev.map((entry) =>
              entry.id === user.id
                ? {
                    ...entry,
                    status: targetStatus,
                    deletedAt: targetStatus === 'deleted' ? new Date().toISOString() : null,
                  }
                : entry
            )
            return sortUsers(next)
          })
        } catch (error) {
          toast({
            title: 'Gagal mengubah status',
            description:
              error instanceof Error ? error.message : 'Ada masalah waktu ubah status user.',
          })
        }
      })
    },
    [toast]
  )

  const handleOpenConfirmation = useCallback(
    (user: DashboardUser, targetStatus: DashboardUserStatus) => {
      if (targetStatus === user.status) return

      const needsConfirmation = targetStatus === 'blocked' || targetStatus === 'deleted'
      if (!needsConfirmation) {
        performStatusUpdate(user, targetStatus, null)
        return
      }

      setPendingChange({ user, targetStatus })
      setChangeReason('')
    },
    [performStatusUpdate]
  )

  const confirmStatusChange = useCallback(() => {
    if (!pendingChange) return
    performStatusUpdate(pendingChange.user, pendingChange.targetStatus, changeReason || null)
    setPendingChange(null)
    setChangeReason('')
  }, [changeReason, pendingChange, performStatusUpdate])

  const cancelStatusChange = useCallback(() => {
    setPendingChange(null)
    setChangeReason('')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-auth-text-primary">Manajemen Pengguna</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Pantau dan atur status akses admin maupun user dalam satu tempat.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-auth-text-muted" aria-hidden="true" />
              <Input
                placeholder="Cari nama, email, atau username"
                className="pl-9 text-auth-text-primary"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-[160px] border-auth-border text-auth-text-primary">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                <SelectItem value="all">Semua status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="blocked">Diblokir</SelectItem>
                <SelectItem value="deleted">Dihapus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
              <SelectTrigger className="w-[160px] border-auth-border text-auth-text-primary">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                <SelectItem value="all">Semua role</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="border-auth-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
              onClick={refreshFromServer}
              disabled={refreshingDisabled}
            >
              {refreshingDisabled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Bulk Actions Bar */}
        {selectedUsers.size > 0 && (
          <div className="px-6 py-3 border-b border-auth-border bg-auth-info/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-auth-info" />
                <span className="text-sm font-medium text-auth-text-primary">
                  {selectedUsers.size} user terpilih
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('status_change', { status: 'active', reason: 'Bulk activation' })}
                  className="border-auth-border text-auth-text-secondary hover:border-auth-success hover:text-auth-success"
                >
                  Aktifkan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('status_change', { status: 'blocked', reason: 'Bulk blocking' })}
                  className="border-auth-border text-auth-text-secondary hover:border-auth-warning hover:text-auth-warning"
                >
                  Block
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('delete', { reason: 'Bulk deletion' })}
                  className="border-auth-border text-auth-text-secondary hover:border-auth-text-error hover:text-auth-text-error"
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardContent className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-auth-text-secondary">
            <thead>
              <tr className="border-b border-auth-border text-xxs uppercase tracking-wide text-auth-text-muted">
                <th className="px-4 py-3 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center text-auth-text-muted hover:text-auth-text-primary"
                  >
                    {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Terakhir Diupdate</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-auth-text-muted"
                  >
                    Belum ada data yang cocok dengan filter lo.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const canEdit =
                    user.id !== currentUserId &&
                    (currentUserRole === 'superadmin' || user.role !== 'superadmin')

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-auth-border/60 text-xs last:border-0",
                        selectedUsers.has(user.id) && "bg-auth-info/5"
                      )}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleSelectUser(user.id, !selectedUsers.has(user.id))}
                          className="flex items-center justify-center"
                        >
                          {selectedUsers.has(user.id) ? (
                            <CheckSquare className="h-4 w-4 text-auth-info" />
                          ) : (
                            <Square className="h-4 w-4 text-auth-text-muted" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-auth-text-primary">
                            {formatDisplayName(user)}
                          </span>
                          <span className="text-xxs uppercase tracking-wide text-auth-text-muted">
                            {user.username || 'Belum ada username'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            'bg-auth-button-secondary/20 text-auth-text-primary',
                            user.role === 'superadmin' && 'bg-auth-button-brand text-auth-text-primary'
                          )}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={user.status} deletedAt={user.deletedAt} />
                      </td>
                      <td className="px-4 py-4 text-xxs text-auth-text-muted">
                        {user.updatedAt ? formatRelativeDate(user.updatedAt) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={user.status}
                          onValueChange={(value) =>
                            handleOpenConfirmation(user, value as DashboardUserStatus)
                          }
                          disabled={!canEdit || isPending}
                        >
                          <SelectTrigger className="w-[180px] border-auth-border text-auth-text-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open) cancelStatusChange()
        }}
      >
        <DialogContent className="max-w-lg border-auth-border bg-auth-bg-form text-auth-text-primary">
          <DialogHeader>
            <DialogTitle>Konfirmasi perubahan status</DialogTitle>
          </DialogHeader>
          {pendingChange ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-auth-border bg-auth-bg-hover px-4 py-3 text-sm">
                <p className="font-medium text-auth-text-primary">{formatDisplayName(pendingChange.user)}</p>
                <p className="text-xxs uppercase tracking-wide text-auth-text-muted">
                  Status sekarang: {formatStatusLabel(pendingChange.user.status)}
                </p>
                <p className="mt-2 text-xs text-auth-text-secondary">
                  Status bakal diganti jadi{' '}
                  <span className="font-semibold text-auth-text-primary">
                    {formatStatusLabel(pendingChange.targetStatus)}
                  </span>
                  .
                </p>
                {pendingChange.targetStatus === 'deleted' ? (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-auth-bg-form px-3 py-2 text-xs text-auth-text-muted">
                    <ShieldAlert className="mt-0.5 h-4 w-4 text-auth-warning" aria-hidden="true" />
                    <p>
                      Akun bakal disembunyikan dan dihapus permanen kalau nggak dipulihkan dalam 30
                      hari. Semua akses user ini bakal dicabut selama periode tersebut.
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-auth-text-muted">
                  Alasan (opsional)
                </label>
                <Textarea
                  placeholder="Contoh: terindikasi aktivitas mencurigakan"
                  className="min-h-[96px] resize-none border-auth-border bg-auth-bg-hover text-auth-text-primary"
                  value={changeReason}
                  onChange={(event) => setChangeReason(event.target.value)}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              size="md"
              className="border-auth-border text-auth-text-secondary hover:border-[#ececec] hover:text-auth-text-primary"
              onClick={cancelStatusChange}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="jetta"
              size="md"
              onClick={confirmStatusChange}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Menyimpan...
                </>
              ) : (
                'Konfirmasi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Operation Confirmation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md border-auth-border bg-auth-bg-form text-auth-text-primary">
          <DialogHeader>
            <DialogTitle>Konfirmasi Operasi Bulk</DialogTitle>
            <DialogDescription className="text-auth-text-muted">
              Operasi ini akan mempengaruhi {selectedUsers.size} user yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {bulkOperation?.type === 'status_change' && (
              <div className="space-y-2">
                <p className="text-sm text-auth-text-secondary">
                  Mengubah status {selectedUsers.size} user menjadi:
                </p>
                <div className="p-3 rounded-lg bg-auth-bg-hover border border-auth-border">
                  <p className="font-medium text-auth-text-primary">
                    {bulkOperation.data.status === 'active' && 'Aktif'}
                    {bulkOperation.data.status === 'blocked' && 'Diblock'}
                    {bulkOperation.data.status === 'deleted' && 'Dihapus'}
                  </p>
                  {bulkOperation.data.reason && (
                    <p className="text-xs text-auth-text-muted mt-1">
                      Alasan: {bulkOperation.data.reason}
                    </p>
                  )}
                </div>
              </div>
            )}
            {bulkOperation?.type === 'delete' && (
              <div className="space-y-2">
                <p className="text-sm text-auth-text-secondary">
                  Menghapus {selectedUsers.size} user secara permanen.
                </p>
                <div className="p-3 rounded-lg bg-auth-text-error/10 border border-auth-text-error">
                  <p className="font-medium text-auth-text-error">
                    ⚠️ Operasi tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowBulkDialog(false)}
              className="border-auth-border text-auth-text-secondary hover:border-auth-text-primary hover:text-auth-text-primary"
            >
              Batal
            </Button>
            <Button
              variant={bulkOperation?.type === 'delete' ? 'destructive' : 'jetta'}
              size="md"
              onClick={executeBulkOperation}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {bulkOperation?.type === 'delete' ? 'Hapus' : 'Konfirmasi'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function mapRowToUser(row: Record<string, any>): DashboardUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    username: row.username ?? '',
    role: row.role,
    status: row.status,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function sortUsers(entries: DashboardUser[]): DashboardUser[] {
  return [...entries].sort((a, b) => {
    if (a.role === 'superadmin' && b.role !== 'superadmin') return -1
    if (b.role === 'superadmin' && a.role !== 'superadmin') return 1
    return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
  })
}

function formatDisplayName(user: DashboardUser) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  if (fullName.length > 0) return fullName
  if (user.username) return user.username
  return user.email
}

function formatStatusLabel(status: DashboardUserStatus) {
  switch (status) {
    case 'active':
      return 'Aktif'
    case 'blocked':
      return 'Diblokir'
    case 'deleted':
      return 'Dihapus'
    default:
      return status
  }
}

function formatRelativeDate(value: string | null) {
  if (!value) return '—'
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

function StatusBadge({ status, deletedAt }: { status: DashboardUserStatus; deletedAt: string | null }) {
  const baseClass = 'px-2 py-1 text-xxs font-semibold uppercase tracking-wide rounded-full'

  if (status === 'active') {
    return <span className={cn(baseClass, 'bg-auth-success/20 text-auth-success')}>Aktif</span>
  }

  if (status === 'blocked') {
    return <span className={cn(baseClass, 'bg-auth-warning/20 text-auth-warning')}>Diblokir</span>
  }

  return (
    <span className={cn(baseClass, 'bg-auth-text-error/20 text-auth-text-error')}>
      Dihapus {deletedAt ? `(${formatRelativeDate(deletedAt)})` : ''}
    </span>
  )
}
