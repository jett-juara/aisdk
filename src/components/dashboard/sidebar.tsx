'use client'

import type { ComponentType } from 'react'
import { Fragment, useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  LogOut,
  ChevronDown,
  Settings2,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DashboardIconKey,
  DashboardNavSection,
  DashboardRole,
} from '@/lib/dashboard/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/hooks/use-toast'

type SidebarUser = {
  name: string
  email: string
  role: DashboardRole
  status: string
}

type SidebarProps = {
  sections: DashboardNavSection[]
  user: SidebarUser
}

const ICON_MAP: Record<DashboardIconKey, ComponentType<any>> = {
  'layout-dashboard': LayoutDashboard,
  settings: Settings2,
  users: Users,
  permissions: LockKeyhole,
  invitations: Settings2,
  analytics: BarChart3,
}

// Fallback icon untuk handle missing icon cases
const FALLBACK_ICON = Settings2

// Separate UserDropdown component to prevent hydration issues
function UserDropdown({ user, loggingOut, handleLogout }: {
  user: SidebarUser
  loggingOut: boolean
  handleLogout: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="mx-4 mb-6 w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-left text-auth-text-primary transition-opacity hover:opacity-90 bg-[var(--color-auth-button-brand)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-sm font-medium">{user.name}</p>
            </div>
            <ChevronDown
              className={cn(
                'mt-1 h-4 w-4 flex-shrink-0 text-auth-text-primary transition-transform duration-fast',
                menuOpen ? 'rotate-180' : 'rotate-0'
              )}
              aria-hidden="true"
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="dashboard-bg-main p-0 text-auth-text-secondary"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-auth-text-primary hover:bg-auth-bg-hover data-[highlighted]:bg-auth-bg-hover border-none border-t border-t-button-border [&:focus-visible]:outline-none"
          disabled={loggingOut}
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DashboardSidebar({ sections, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = typeof payload?.error === 'string' ? payload.error : 'Logout gagal. Coba lagi.'
        throw new Error(message)
      }

      toast({
        title: 'Logout sukses',
        description: 'Gue bawa lo balik ke halaman login.',
      })
      setOpen(false)
      router.replace('/auth/login')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout gagal. Coba lagi.'
      toast({
        title: 'Logout gagal',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoggingOut(false)
    }
  }, [loggingOut, router, toast])

  const navContent = useMemo(
    () => (
      <div className="flex h-full flex-col gap-6 dashboard-bg-sidebar text-auth-text-secondary">
        <div className="flex flex-col gap-2 border-b border-auth-border px-6 pb-4 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity duration-fast hover:opacity-90"
            title="Kembali ke Homepage"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-auth-button-brand)]">
              <Zap className="h-6 w-6 text-[var(--color-auth-text-primary)]" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-brand uppercase tracking-wide text-auth-text-muted">JETT</span>
              <h2 className="text-xl font-heading text-auth-text-primary">Dashboard</h2>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-8">
          {sections.map((section) => (
            <Fragment key={section.title}>
              <div className="px-2">
                <p className="text-xxs uppercase tracking-wide text-auth-text-muted">{section.title}</p>
              </div>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
                  const Icon = ICON_MAP[item.icon] ?? FALLBACK_ICON

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-start gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-fast',
                        'hover:bg-auth-bg-hover hover:text-auth-text-primary',
                        isActive
                          ? 'bg-auth-bg-hover text-auth-text-primary'
                          : 'text-auth-text-secondary'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'mt-px h-5 w-5 flex-shrink-0 transition-colors duration-fast',
                          isActive ? 'text-auth-text-primary' : 'text-auth-text-muted'
                        )}
                        aria-hidden={true}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">{item.title}</span>
                        {item.description ? (
                          <span className="text-xxs leading-tight text-auth-text-muted">{item.description}</span>
                        ) : null}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </Fragment>
          ))}
        </div>
        <UserDropdown user={user} loggingOut={loggingOut} handleLogout={handleLogout} />
      </div>
    ),
    [sections, pathname, user, loggingOut, handleLogout])

  return (
    <>
      <div className="hidden w-72 shrink-0 border-r border-auth-border md:block">{navContent}</div>
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-auth-border dashboard-bg-sidebar px-4 py-3 md:hidden">
        <div>
          <p className="text-xs uppercase tracking-wide text-auth-text-muted">JETT</p>
          <h2 className="text-lg font-heading text-auth-text-primary">Dashboard</h2>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-auth-text-primary hover:bg-auth-bg-hover"
              aria-label="Buka navigasi"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-auth-border dashboard-bg-sidebar p-0 text-auth-text-primary">
            <SheetHeader className="sr-only" />
            {navContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
