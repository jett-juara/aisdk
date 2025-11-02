'use client'

import type { ReactNode } from 'react'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/hooks/use-toast'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Nama depan minimal 2 karakter')
    .max(60, 'Nama depan maksimal 60 karakter'),
  lastName: z
    .string()
    .optional()
    .transform((value) => value ?? ''),
  email: z.string().email('Format email nggak valid'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(24, 'Username maksimal 24 karakter')
    .regex(/^[a-z0-9._-]+$/, 'Pakai huruf kecil, angka, titik, atau strip'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

type ProfilePanelProps = {
  profile: {
    id: string
    email: string
    firstName: string
    lastName: string
    username: string
    usernameChanged: boolean
    status: string
    role: string
  }
}

export function ProfilePanel({ profile }: ProfilePanelProps) {
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [usernameChanged, setUsernameChanged] = useState(profile.usernameChanged)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<ProfileFormValues | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      username: profile.username,
    },
    resolver: zodResolver(profileSchema),
  })

  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      username: profile.username,
    }),
    [profile.email, profile.firstName, profile.lastName, profile.username]
  )

  const hasDirtyFields = form.formState.isDirty

  const resetToInitial = useCallback(() => {
    form.reset(initialValues, { keepDirty: false })
    setIsEditing(false)
  }, [form, initialValues])

  const executeUpdate = useCallback(
    async (values: ProfileFormValues) => {
      startTransition(async () => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              username: values.username,
            }),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload?.error?.message ?? 'Gagal memperbarui profil.')
          }

          const payload = await response.json()
          const nextValues: ProfileFormValues = {
            firstName: payload.firstName,
            lastName: payload.lastName ?? '',
            email: payload.email,
            username: payload.username ?? '',
          }

          form.reset(nextValues, { keepDirty: false })
          setUsernameChanged(payload.usernameChanged)
          setIsEditing(false)
          toast({
            title: 'Profil diperbarui',
            description: 'Detail akun lo sudah disimpan dan siap dipakai di seluruh modul.',
          })
        } catch (error) {
          toast({
            title: 'Gagal menyimpan',
            description:
              error instanceof Error ? error.message : 'Terjadi masalah waktu nyimpen profil. Coba lagi ya.',
          })
        }
      })
    },
    [form, toast]
  )

  const onSubmit = useCallback(
    (values: ProfileFormValues) => {
      const usernameChangedByUser = !usernameChanged && values.username !== initialValues.username

      if (usernameChangedByUser) {
        setPendingValues(values)
        setConfirmDialogOpen(true)
        return
      }

      executeUpdate(values)
    },
    [executeUpdate, initialValues.username, usernameChanged]
  )

  const confirmUsernameChange = useCallback(() => {
    if (!pendingValues) return
    executeUpdate(pendingValues)
    setPendingValues(null)
    setConfirmDialogOpen(false)
  }, [executeUpdate, pendingValues])

  return (
    <>
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-auth-text-primary">Informasi Profil</CardTitle>
            <CardDescription className="text-auth-text-muted">
              Data ini dipakai buat semua alur internal dan komunikasi email.
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            className={cn(
              isEditing
                ? 'border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary'
                : 'auth-button-brand hover:auth-button-brand-hover'
            )}
            onClick={() => {
              if (isEditing) {
                resetToInitial()
              } else {
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? (
              'Batal'
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Ubah Profil
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
              aria-label="Form ubah profil"
            >
              <div className="grid gap-2 md:grid-cols-2">
                <Field
                  label="Nama Depan"
                  htmlFor="firstName"
                  error={form.formState.errors.firstName?.message}
                >
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    placeholder="Nama depan lo"
                    className="bg-auth-bg-form text-auth-text-primary"
                    {...form.register('firstName')}
                  />
                </Field>
                <Field
                  label="Nama Belakang"
                  htmlFor="lastName"
                  error={form.formState.errors.lastName?.message}
                >
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="Opsional"
                    className="bg-auth-bg-form text-auth-text-primary"
                    {...form.register('lastName')}
                  />
                </Field>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@juara.co.id"
                    className="bg-auth-bg-form text-auth-text-primary"
                    {...form.register('email')}
                  />
                </Field>
                <Field
                  label="Username"
                  htmlFor="username"
                  hint={
                    usernameChanged
                      ? 'Username sudah diganti sekali dan nggak bisa diubah lagi.'
                      : 'Hanya huruf kecil, angka, titik, atau strip.'
                  }
                  error={form.formState.errors.username?.message}
                >
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="username lo"
                    disabled={usernameChanged}
                    className={cn(
                      'bg-auth-bg-form text-auth-text-primary',
                      usernameChanged && 'opacity-60'
                    )}
                    {...form.register('username')}
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
                  onClick={resetToInitial}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="auth-button-brand hover:auth-button-brand-hover"
                  disabled={isPending || !hasDirtyFields}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-6 md:grid-cols-2">
              <SummaryItem title="Nama Lengkap">
                {formatFullName(profile.firstName, profile.lastName)}
              </SummaryItem>
              <SummaryItem title="Email">{profile.email}</SummaryItem>
              <SummaryItem title="Username">{profile.username || 'Belum diatur'}</SummaryItem>
              <SummaryItem title="Status Akun" accent={profile.status === 'active'}>
                {profile.status}
              </SummaryItem>
              <SummaryItem title="Role">{profile.role}</SummaryItem>
              <SummaryItem title="Hak Ubah Username">
                {usernameChanged ? 'Sudah dipakai' : 'Masih tersedia sekali'}
              </SummaryItem>
            </dl>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="border-auth-border bg-auth-bg-form text-auth-text-primary">
          <DialogHeader>
            <DialogTitle>Ganti username sekarang?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-auth-text-secondary">
            Username cuma bisa diganti sekali. Pastikan lo udah yakin karena seterusnya nggak bisa
            diubah lagi tanpa bantuan superadmin.
          </p>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              className="border-auth-border text-auth-text-secondary hover:border-auth-button-brand hover:text-auth-text-primary"
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingValues(null)
              }}
            >
              Batal
            </Button>
            <Button
              className="auth-button-brand hover:auth-button-brand-hover"
              onClick={confirmUsernameChange}
            >
              Ya, Ganti Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SummaryItem({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-auth-border bg-auth-bg-hover px-4 py-3">
      <dt className="text-xxs uppercase tracking-wide text-auth-text-muted">{title}</dt>
      <dd
        className={cn(
          'mt-1 text-sm font-medium text-auth-text-primary',
          accent ? 'text-auth-success' : 'text-auth-text-primary'
        )}
      >
        {children}
      </dd>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  error?: string
  hint?: string
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-wide text-auth-text-muted">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xxs text-auth-text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xxs text-auth-text-muted">{hint}</p> : null}
    </div>
  )
}

function formatFullName(firstName: string, lastName: string) {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim()
  return full || 'Belum diisi'
}
