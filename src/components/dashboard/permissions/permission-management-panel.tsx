'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import {
  PERMISSION_DEFINITIONS,
  type PermissionDefinition,
  type PermissionItem,
  type PermissionTemplate,
} from '@/lib/dashboard/permissions'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type DashboardUserSummary = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: 'user' | 'admin' | 'superadmin'
}

type PermissionManagementPanelProps = {
  currentUserId: string
  currentUserRole: 'admin' | 'superadmin'
  users?: DashboardUserSummary[]
  definitions?: PermissionDefinition[]
  templates?: PermissionTemplate[]
}

type PermissionState = Record<string, boolean>
type PermissionStore = Record<string, PermissionState>

export function PermissionManagementPanel({
  currentUserId,
  currentUserRole,
  users = [],
  definitions = PERMISSION_DEFINITIONS,
  templates = [],
}: PermissionManagementPanelProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(users.length ? [users[0].id] : [])
  const activeUserId = selectedIds[0] ?? null
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionStore>({})
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set())

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (term.length === 0) return users
    return users.filter((user) => {
      const label = `${user.firstName} ${user.lastName} ${user.email} ${user.username}`.toLowerCase()
      return label.includes(term)
    })
  }, [users, searchTerm])

  const defaultPermissionMap = useMemo(() => buildDefaultPermissionState(definitions), [definitions])

  const canEditUser = useCallback(
    (user: DashboardUserSummary) => {
      if (user.id === currentUserId) return true
      if (user.role === 'superadmin') {
        return currentUserRole === 'superadmin'
      }
      return true
    },
    [currentUserId, currentUserRole]
  )

  const ensureUserPermissionsLoaded = useCallback(
    async (userId: string) => {
      if (permissionState[userId] || loadingUsers.has(userId)) return

      setLoadingUsers((prev) => {
        const next = new Set(prev)
        next.add(userId)
        return next
      })
      try {
        const response = await fetch(`/api/admin/permissions/${userId}`, { cache: 'no-store' })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload?.error?.message ?? 'Gagal memuat izin user.')
        }
        const payload = await response.json()
        const mapped = mapPermissionsToState(payload.permissions as PermissionItem[], defaultPermissionMap)
        setPermissionState((prev) => ({ ...prev, [userId]: mapped }))
      } catch (error) {
        toast({
          title: 'Gagal memuat izin',
          description: error instanceof Error ? error.message : 'Terjadi masalah waktu load izin.',
        })
      } finally {
        setLoadingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [defaultPermissionMap, loadingUsers, permissionState, toast]
  )

  useEffect(() => {
    if (activeUserId) {
      ensureUserPermissionsLoaded(activeUserId)
    }
  }, [activeUserId, ensureUserPermissionsLoaded])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-permissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_permissions' },
        (payload) => {
          const userId = ((payload.new as any)?.user_id as string) ?? ((payload.old as any)?.user_id as string) ?? null
          if (!userId) return

          setPermissionState((prev) => {
            if (!(userId in prev)) return prev
            const next = { ...prev }
            const current = { ...(next[userId] ?? defaultPermissionMap) }
            const targetFeature =
              payload.eventType === 'DELETE'
                ? buildPermissionId(payload.old?.page_key ?? null, payload.old?.feature_key as string)
                : buildPermissionId(payload.new?.page_key ?? null, payload.new?.feature_key as string)

            if (!targetFeature) return prev

            if (payload.eventType === 'DELETE') {
              current[targetFeature] = false
            } else {
              current[targetFeature] = Boolean(payload.new?.access_granted)
            }
            next[userId] = current
            return next
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, defaultPermissionMap])

  const activeUser = useMemo(
    () => users.find((entry) => entry.id === activeUserId) ?? null,
    [users, activeUserId]
  )

  const activePermissions = activeUserId
    ? permissionState[activeUserId] ?? defaultPermissionMap
    : defaultPermissionMap

  const selectedUserEntries = useMemo(
    () => selectedIds.map((id) => users.find((entry) => entry.id === id)).filter(Boolean) as DashboardUserSummary[],
    [selectedIds, users]
  )

  const toggleSelection = useCallback(
    (userId: string, checked: boolean) => {
      setSelectedIds((prev) => {
        if (checked) {
          if (prev.includes(userId)) return prev
          return [userId, ...prev]
        }
        const filtered = prev.filter((id) => id !== userId)
        return filtered.length ? filtered : []
      })
    },
    []
  )

  const handleTogglePermission = useCallback(
    (permissionId: string, nextValue: boolean) => {
      if (!activeUserId) return
      const user = users.find((entry) => entry.id === activeUserId)
      if (!user || !canEditUser(user)) return

      const nextState = {
        ...activePermissions,
        [permissionId]: nextValue,
      }

      setPermissionState((prev) => ({
        ...prev,
        [activeUserId]: nextState,
      }))

      startTransition(async () => {
        try {
          const payload = buildPermissionPayload(nextState, definitions)
          const response = await fetch(`/api/admin/permissions/${activeUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: payload }),
          })
          if (!response.ok) {
            const result = await response.json().catch(() => ({}))
            throw new Error(result?.error?.message ?? 'Gagal menyimpan izin.')
          }
          toast({
            title: 'Izin diperbarui',
            description: `Akses ${formatPermissionLabel(permissionId, definitions)} sudah diupdate.`,
          })
        } catch (error) {
          toast({
            title: 'Gagal menyimpan izin',
            description:
              error instanceof Error ? error.message : 'Terjadi masalah waktu menyimpan izin.',
          })
          // revert
          setPermissionState((prev) => ({
            ...prev,
            [activeUserId]: activePermissions,
          }))
        }
      })
    },
    [activeUserId, activePermissions, definitions, toast, users, canEditUser]
  )

  const applyTemplateToSelection = useCallback(
    (templateId: string) => {
      if (!templateId || selectedIds.length === 0) return
      const template = templates.find((entry) => entry.id === templateId)
      if (!template) return

      const targetUsers = selectedIds
        .map((id) => users.find((entry) => entry.id === id))
        .filter((entry): entry is DashboardUserSummary => Boolean(entry) && canEditUser(entry as DashboardUserSummary))

      if (targetUsers.length === 0) {
        toast({
          title: 'Akses ditolak',
          description: 'Lo nggak bisa menerapkan template ke user yang dipilih.',
        })
        return
      }

      const payload = resolveTemplatePayload(template, definitions)

      startTransition(async () => {
        try {
          await Promise.all(
            targetUsers.map(async (user) => {
              const response = await fetch(`/api/admin/permissions/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template: template.id }),
              })
              if (!response.ok) {
                const result = await response.json().catch(() => ({}))
                throw new Error(result?.error?.message ?? 'Gagal menerapkan template.')
              }
              setPermissionState((prev) => ({
                ...prev,
                [user.id]: mapPermissionsToState(payload, defaultPermissionMap),
              }))
            })
          )
          toast({
            title: 'Template diterapkan',
            description: `${template.label} berhasil diterapkan ke ${targetUsers.length} user.`,
          })
        } catch (error) {
          toast({
            title: 'Gagal menerapkan template',
            description:
              error instanceof Error ? error.message : 'Template gagal diterapkan ke user.',
          })
        }
      })
    },
    [selectedIds, templates, toast, users, canEditUser, definitions, defaultPermissionMap]
  )

  return (
    <Card className="border-auth-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-auth-text-primary">Kontrol Izin</CardTitle>
        <CardDescription className="text-auth-text-muted">
          Kelola akses modul berdasarkan user dan template yang disiapkan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="flex flex-col gap-4 rounded-2xl border border-auth-border bg-auth-bg-hover p-4">
          <Input
            placeholder="Cari user"
            className="bg-auth-bg-form text-auth-text-primary"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1 text-sm">
            {filteredUsers.map((user) => {
              const checked = selectedIds.includes(user.id)
              const handleActivate = () => {
                toggleSelection(user.id, !checked)
                ensureUserPermissionsLoaded(user.id)
              }
              return (
                <div
                  key={user.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={checked}
                  onClick={handleActivate}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleActivate()
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border border-auth-border px-4 py-3 text-left transition-colors duration-fast outline-none focus-visible:ring-2 focus-visible:ring-auth-button-brand',
                    checked ? 'bg-auth-bg-form text-auth-text-primary' : 'bg-transparent text-auth-text-secondary hover:bg-auth-bg-form'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleSelection(user.id, Boolean(value))}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <div>
                      <p className="font-medium text-auth-text-primary">
                        {formatUserLabel(user)}
                      </p>
                      <p className="text-xxs text-auth-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      'bg-auth-button-secondary/20 text-auth-text-primary',
                      user.role === 'superadmin' && 'bg-auth-button-brand text-auth-text-primary'
                    )}
                  >
                    {user.role}
                  </Badge>
                </div>
              )
            })}
            {filteredUsers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-auth-border/60 px-4 py-6 text-center text-xs text-auth-text-muted">
                Nggak ada user yang cocok sama pencarian lo.
              </p>
            ) : null}
          </div>
          <div className="space-y-3 rounded-xl border border-auth-border bg-auth-bg-form p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-auth-text-muted" aria-hidden="true" />
              <p className="text-xs font-medium text-auth-text-primary">Terapkan Template</p>
            </div>
            <Select value={selectedTemplate ?? undefined} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="border-auth-border text-auth-text-primary">
                <SelectValue placeholder="Pilih template" />
              </SelectTrigger>
              <SelectContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="auth-button-brand hover:auth-button-brand-hover"
              disabled={!selectedTemplate || isPending || selectedIds.length === 0}
              onClick={() => {
                if (selectedTemplate) {
                  applyTemplateToSelection(selectedTemplate)
                }
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Menerapkan...
                </>
              ) : (
                `Terapkan ke ${selectedIds.length} user`
              )}
            </Button>
          </div>
        </aside>
        <section className="flex flex-col gap-4 rounded-2xl border border-auth-border bg-auth-bg-hover p-6">
          {activeUser ? (
            <>
              <header className="flex flex-col gap-1">
                <h2 className="text-lg font-heading text-auth-text-primary">
                  {formatUserLabel(activeUser)}
                </h2>
                <p className="text-xs text-auth-text-muted">
                  Atur akses modul untuk user ini. Perubahan tersimpan otomatis.
                </p>
              </header>
              <div className="grid gap-4">
                {groupDefinitionsByPage(definitions).map((group) => (
                  <div key={group.pageKey ?? 'general'} className="rounded-xl border border-auth-border bg-auth-bg-form p-4">
                    <p className="text-sm font-medium text-auth-text-primary">{group.title}</p>
                    <p className="text-xxs text-auth-text-muted">{group.description}</p>
                    <div className="mt-4 space-y-3">
                      {group.permissions.map((definition) => {
                        const permissionId = definition.id
                        const value = Boolean(activePermissions[permissionId])
                        const disabled = !canEditUser(activeUser) || isPending
                        return (
                          <div key={permissionId} className="flex items-start justify-between gap-3 rounded-lg border border-auth-border px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-auth-text-primary">
                                {definition.label}
                              </p>
                              <p className="text-xxs text-auth-text-muted">{definition.description}</p>
                            </div>
                            <Switch
                              checked={value}
                              disabled={disabled}
                              onCheckedChange={(checked) => handleTogglePermission(permissionId, checked)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-auth-text-muted">
              Pilih minimal satu user buat mulai atur izin.
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

function buildDefaultPermissionState(definitions: PermissionDefinition[]): PermissionState {
  return Object.fromEntries(definitions.map((definition) => [definition.id, false]))
}

function mapPermissionsToState(
  permissions: PermissionItem[],
  defaultState: PermissionState
): PermissionState {
  const next = { ...defaultState }
  permissions.forEach((item) => {
    const permissionId = buildPermissionId(item.pageKey, item.featureKey)
    if (permissionId) {
      next[permissionId] = item.accessGranted
    }
  })
  return next
}

function buildPermissionPayload(state: PermissionState, definitions: PermissionDefinition[]): PermissionItem[] {
  return definitions.map((definition) => ({
    pageKey: definition.pageKey,
    featureKey: definition.featureKey,
    accessGranted: Boolean(state[definition.id]),
  }))
}

function resolveTemplatePayload(
  template: PermissionTemplate,
  definitions: PermissionDefinition[]
): PermissionItem[] {
  const allowed = new Set(template.permissionIds)
  return definitions.map((definition) => ({
    pageKey: definition.pageKey,
    featureKey: definition.featureKey,
    accessGranted: allowed.has(definition.id),
  }))
}

function buildPermissionId(pageKey: string | null, featureKey: string | undefined): string | null {
  if (!featureKey) return null
  return pageKey ? `${pageKey}.${featureKey}` : featureKey
}

function groupDefinitionsByPage(definitions: PermissionDefinition[]) {
  const groups = new Map<
    string,
    { pageKey: string | null; title: string; description: string; permissions: PermissionDefinition[] }
  >()

  definitions.forEach((definition) => {
    const key = definition.pageKey ?? 'general'
    if (!groups.has(key)) {
      groups.set(key, {
        pageKey: definition.pageKey ?? null,
        title: formatSectionTitle(definition.pageKey),
        description: definition.pageKey
          ? `Kontrol akses untuk halaman ${definition.pageKey}.`
          : 'Kontrol akses umum yang tidak terikat halaman tertentu.',
        permissions: [],
      })
    }
    groups.get(key)!.permissions.push(definition)
  })

  return Array.from(groups.values())
}

function formatSectionTitle(pageKey: string | null | undefined) {
  if (!pageKey) return 'Akses Umum'
  switch (pageKey) {
    case 'dashboard':
      return 'Dashboard'
    case 'profile':
      return 'Profil'
    case 'users':
      return 'Manajemen Pengguna'
    case 'permissions':
      return 'Kontrol Izin'
    case 'analytics':
      return 'Analitik'
    default:
      return pageKey
  }
}

function formatUserLabel(user: DashboardUserSummary) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  if (fullName.length > 0) return fullName
  if (user.username) return user.username
  return user.email
}

function formatPermissionLabel(permissionId: string, definitions: PermissionDefinition[]) {
  const definition = definitions.find((entry) => entry.id === permissionId)
  return definition?.label ?? permissionId
}
