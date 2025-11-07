'use client'

import { useState } from 'react'
import {
  UserPlus,
  Shield,
  Download,
  RefreshCw,
  BarChart3,
  Settings,
  Lock,
  Unlock,
  Trash2,
  Users,
  Key
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  action: () => void
  requiresConfirmation?: boolean
  confirmationText?: string
  badge?: string
}

interface QuickActionsPanelProps {
  onRefresh?: () => void
  onExportData?: () => void
  onInviteUser?: () => void
  onManagePermissions?: () => void
  onViewAnalytics?: () => void
  onSystemSettings?: () => void
  className?: string
}

export function QuickActionsPanel({
  onRefresh,
  onExportData,
  onInviteUser,
  onManagePermissions,
  onViewAnalytics,
  onSystemSettings,
  className
}: QuickActionsPanelProps) {
  const [isExecuting, setIsExecuting] = useState<string | null>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'invite-user',
      title: 'Undang User Baru',
      description: 'Kirim undangan ke admin atau user baru',
      icon: UserPlus,
      color: 'blue',
      action: () => {
        setIsExecuting('invite-user')
        setTimeout(() => {
          onInviteUser?.()
          setIsExecuting(null)
        }, 500)
      },
      badge: 'Cepat'
    },
    {
      id: 'manage-permissions',
      title: 'Kelola Permissions',
      description: 'Atur akses dan fitur untuk user',
      icon: Shield,
      color: 'purple',
      action: () => {
        setIsExecuting('manage-permissions')
        setTimeout(() => {
          onManagePermissions?.()
          setIsExecuting(null)
        }, 500)
      },
      badge: 'Admin'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download data user dan analytics',
      icon: Download,
      color: 'green',
      action: () => {
        setIsExecuting('export-data')
        setTimeout(() => {
          onExportData?.()
          setIsExecuting(null)
        }, 500)
      }
    },
    {
      id: 'view-analytics',
      title: 'Lihat Analytics',
      description: 'Pantau statistik dan performa sistem',
      icon: BarChart3,
      color: 'yellow',
      action: () => {
        setIsExecuting('view-analytics')
        setTimeout(() => {
          onViewAnalytics?.()
          setIsExecuting(null)
        }, 500)
      }
    },
    {
      id: 'refresh-data',
      title: 'Refresh Data',
      description: 'Perbarui semua data dashboard',
      icon: RefreshCw,
      color: 'blue',
      action: () => {
        setIsExecuting('refresh-data')
        setTimeout(() => {
          onRefresh?.()
          setIsExecuting(null)
          toast.success('Data berhasil diperbarui')
        }, 1000)
      }
    },
    {
      id: 'system-settings',
      title: 'Pengaturan Sistem',
      description: 'Konfigurasi sistem dan keamanan',
      icon: Settings,
      color: 'red',
      action: () => {
        setIsExecuting('system-settings')
        setTimeout(() => {
          onSystemSettings?.()
          setIsExecuting(null)
        }, 500)
      },
      badge: 'Superadmin'
    }
  ]

  const bulkActions: QuickAction[] = [
    {
      id: 'bulk-block',
      title: 'Block User Terpilih',
      description: 'Block beberapa user sekaligus',
      icon: Lock,
      color: 'red',
      action: () => {
        toast.error('Pilih user terlebih dahulu di tabel management')
      },
      requiresConfirmation: true,
      confirmationText: 'Block user yang dipilih?'
    },
    {
      id: 'bulk-unblock',
      title: 'Unblock User Terpilih',
      description: 'Unblock beberapa user sekaligus',
      icon: Unlock,
      color: 'green',
      action: () => {
        toast.error('Pilih user terlebih dahulu di tabel management')
      }
    },
    {
      id: 'bulk-delete',
      title: 'Hapus User Terpilih',
      description: 'Hapus permanen user yang dipilih',
      icon: Trash2,
      color: 'red',
      action: () => {
        toast.error('Pilih user terlebih dahulu di tabel management')
      },
      requiresConfirmation: true,
      confirmationText: 'Hapus user yang dipilih? Tindakan tidak bisa dibatalkan!'
    },
    {
      id: 'bulk-permissions',
      title: 'Atur Ulang Permissions',
      description: 'Reset permissions user terpilih',
      icon: Key,
      color: 'purple',
      action: () => {
        toast.error('Pilih user terlebih dahulu di tabel management')
      }
    }
  ]

  const handleActionClick = (action: QuickAction) => {
    if (isExecuting) return

    if (action.requiresConfirmation && action.confirmationText) {
      if (confirm(action.confirmationText)) {
        executeAction(action)
      }
    } else {
      executeAction(action)
    }
  }

  const executeAction = (action: QuickAction) => {
    setIsExecuting(action.id)
    try {
      action.action()
    } catch (_error) {
      toast.error('Gagal menjalankan aksi')
    } finally {
      setTimeout(() => setIsExecuting(null), 1000)
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'hover:bg-auth-info/10 border-auth-info/20 text-auth-info',
      green: 'hover:bg-auth-success/10 border-auth-success/20 text-auth-success',
      yellow: 'hover:bg-auth-warning/10 border-auth-warning/20 text-auth-warning',
      red: 'hover:bg-auth-text-error/10 border-auth-text-error/20 text-auth-text-error',
      purple: 'hover:bg-auth-purple/10 border-auth-purple/20 text-auth-purple'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="md"
                  className={cn(
                    'h-auto p-4 flex flex-col items-start text-left space-y-2 border',
                    getColorClasses(action.color),
                    isExecuting === action.id && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleActionClick(action)}
                  disabled={isExecuting === action.id}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="h-5 w-5" />
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-auth-text-muted mt-1">
                      {action.description}
                    </p>
                  </div>
                  {isExecuting === action.id && (
                    <div className="w-full">
                      <div className="h-1 bg-auth-border rounded-full overflow-hidden">
                        <div className="h-full bg-auth-primary animate-pulse" />
                      </div>
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-auth-text-muted">
              Pilih user terlebih dahulu di tabel User Management untuk menggunakan operasi bulk.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {bulkActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-auto p-3 flex flex-col items-center text-center space-y-1 border',
                    getColorClasses(action.color)
                  )}
                  onClick={() => handleActionClick(action)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{action.title}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Sync</span>
              <Badge variant="outline" className="text-xs">
                {new Date().toLocaleTimeString('id-ID')}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Status</span>
              <Badge className="bg-auth-success text-auth-success-foreground text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-auth-success text-auth-success-foreground text-xs">
                Connected
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Sessions</span>
              <span className="text-sm text-auth-text-muted">
                {Math.floor(Math.random() * 50) + 10} sessions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}