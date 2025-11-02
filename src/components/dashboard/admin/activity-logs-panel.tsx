'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Activity,
  Users,
  Shield,
  Mail,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ActivityLog {
  id: string
  user_id: string
  user_email?: string
  user_name?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  metadata?: any
  created_at: string
}

interface ActivityLogsPanelProps {
  className?: string
  currentUserId: string
  currentUserRole: 'admin' | 'superadmin'
}

// Mock data - in real app, this would come from API
const mockLogs: ActivityLog[] = [
  {
    id: '1',
    user_id: 'user1',
    user_email: 'erik.supit@gmail.com',
    user_name: 'Erik Supit',
    action: 'user.status_change',
    resource_type: 'user',
    resource_id: 'user2',
    old_values: { status: 'active' },
    new_values: { status: 'blocked', reason: 'Violation detected' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    user_email: 'erik.supit@gmail.com',
    user_name: 'Erik Supit',
    action: 'user.bulk_status_change',
    resource_type: 'user',
    old_values: { status: 'active' },
    new_values: { status: 'deleted' },
    ip_address: '192.168.1.100',
    metadata: { bulkOperation: true, operatorRole: 'superadmin' },
    created_at: '2025-01-15T09:15:00Z'
  },
  {
    id: '3',
    user_id: 'user2',
    user_email: 'jett.juara@gmail.com',
    user_name: 'Jett Juara',
    action: 'invitation.create',
    resource_type: 'invitation',
    resource_id: 'inv1',
    new_values: { email: 'newuser@example.com', role: 'admin' },
    ip_address: '192.168.1.101',
    created_at: '2025-01-15T08:45:00Z'
  },
  {
    id: '4',
    user_id: 'user3',
    user_email: 'tokayakuwi@gmail.com',
    user_name: 'Kaya Kuwi',
    action: 'permission.update',
    resource_type: 'user_permissions',
    resource_id: 'user4',
    old_values: { permissions: ['dashboard.view'] },
    new_values: { permissions: ['dashboard.view', 'users.manage'] },
    ip_address: '192.168.1.102',
    created_at: '2025-01-15T07:30:00Z'
  },
  {
    id: '5',
    user_id: 'user1',
    user_email: 'erik.supit@gmail.com',
    user_name: 'Erik Supit',
    action: 'auth.login',
    resource_type: 'session',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-01-15T06:00:00Z'
  }
]

export function ActivityLogsPanel({
  className,
  currentUserId,
  currentUserRole
}: ActivityLogsPanelProps) {
  const [logs, setLogs] = useState<ActivityLog[]>(mockLogs)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  // In real app, fetch logs from API
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real app: const response = await fetch('/api/admin/activity-logs')
      setLogs(mockLogs)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by action type
      if (filter !== 'all') {
        const actionType = log.action.split('.')[0]
        if (actionType !== filter) return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          log.user_email?.toLowerCase().includes(query) ||
          log.user_name?.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.resource_type.toLowerCase().includes(query)
        )
      }

      // Filter by time range
      const logDate = new Date(log.created_at)
      const now = new Date()
      const hoursDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60)

      switch (timeRange) {
        case '1h':
          return hoursDiff <= 1
        case '24h':
          return hoursDiff <= 24
        case '7d':
          return hoursDiff <= 168
        case '30d':
          return hoursDiff <= 720
        default:
          return true
      }
    })
  }, [logs, filter, timeRange, searchQuery])

  const getActionIcon = (action: string) => {
    const actionType = action.split('.')[0]
    switch (actionType) {
      case 'user':
        return Users
      case 'auth':
        return Shield
      case 'invitation':
        return Mail
      case 'permission':
        return Settings
      default:
        return Activity
    }
  }

  const getActionColor = (action: string) => {
    const actionType = action.split('.')[0]
    switch (actionType) {
      case 'user':
        return 'text-auth-info bg-auth-info/10 border-auth-info/20'
      case 'auth':
        return 'text-auth-success bg-auth-success/10 border-auth-success/20'
      case 'invitation':
        return 'text-auth-warning bg-auth-warning/10 border-auth-warning/20'
      case 'permission':
        return 'text-auth-purple bg-auth-purple/10 border-auth-purple/20'
      default:
        return 'text-auth-text-muted bg-auth-border/10 border-auth-border/20'
    }
  }

  const formatAction = (action: string) => {
    return action.replace('.', ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const exportLogs = useCallback(() => {
    const csvContent = [
      'Timestamp,User,Action,Resource Type,IP Address,Details',
      ...filteredLogs.map(log => [
        log.created_at,
        log.user_name || log.user_email || 'Unknown',
        log.action,
        log.resource_type,
        log.ip_address || 'N/A',
        JSON.stringify(log.new_values || {})
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredLogs])

  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      const actionType = log.action.split('.')[0]
      counts[actionType] = (counts[actionType] || 0) + 1
    })
    return counts
  }, [logs])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription className="text-auth-text-muted">
                Track all admin actions and system events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
                className="border-auth-border"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                className="border-auth-border"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(actionCounts).map(([action, count]) => {
              const Icon = getActionIcon(`${action}.test`)
              return (
                <div key={action} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-auth-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-auth-text-primary">{count}</p>
                    <p className="text-xs text-auth-text-muted capitalize">{action}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-auth-text-muted" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-auth-border rounded-md bg-background text-auth-text-primary placeholder:text-auth-text-muted focus:outline-none focus:ring-2 focus:ring-auth-button-brand focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px] border-auth-border">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user">User Actions</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="invitation">Invitations</SelectItem>
                  <SelectItem value="permission">Permissions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px] border-auth-border">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-auth-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base">
            Recent Activity ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-auth-text-muted" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-auth-text-muted mb-4" />
              <p className="text-auth-text-muted">No activity logs found</p>
            </div>
          ) : (
            <div className="rounded-md border border-auth-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-auth-border">
                    <TableHead className="text-auth-text-primary">Time</TableHead>
                    <TableHead className="text-auth-text-primary">User</TableHead>
                    <TableHead className="text-auth-text-primary">Action</TableHead>
                    <TableHead className="text-auth-text-primary">Resource</TableHead>
                    <TableHead className="text-auth-text-primary">IP Address</TableHead>
                    <TableHead className="text-auth-text-primary text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const ActionIcon = getActionIcon(log.action)
                    return (
                      <TableRow key={log.id} className="border-auth-border">
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-auth-text-muted" />
                            <span className="text-auth-text-secondary">
                              {formatTime(log.created_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-auth-border flex items-center justify-center">
                              <span className="text-xs font-medium text-auth-text-muted">
                                {(log.user_name || log.user_email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-auth-text-primary">
                                {log.user_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-auth-text-muted">
                                {log.user_email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'p-1 rounded border',
                              getActionColor(log.action)
                            )}>
                              <ActionIcon className="h-3 w-3" />
                            </div>
                            <span className="text-sm text-auth-text-primary">
                              {formatAction(log.action)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-auth-text-primary">
                              {log.resource_type}
                            </span>
                            {log.resource_id && (
                              <Badge variant="outline" className="text-xs border-auth-border">
                                {log.resource_id.slice(0, 8)}...
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-auth-text-secondary">
                            {log.ip_address || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                                className="text-auth-info hover:text-auth-info/80"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-auth-border bg-card text-card-foreground">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Activity className="h-5 w-5" />
                                  Activity Details
                                </DialogTitle>
                                <DialogDescription className="text-auth-text-muted">
                                  {log.created_at} • {formatAction(log.action)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-auth-text-primary">User</p>
                                    <p className="text-auth-text-secondary">
                                      {log.user_name} ({log.user_email})
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-auth-text-primary">Resource</p>
                                    <p className="text-auth-text-secondary">
                                      {log.resource_type}
                                      {log.resource_id && ` (${log.resource_id})`}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-auth-text-primary">IP Address</p>
                                    <p className="text-auth-text-secondary">{log.ip_address || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-auth-text-primary">User Agent</p>
                                    <p className="text-auth-text-secondary text-xs">
                                      {log.user_agent || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {(log.old_values || log.new_values) && (
                                  <>
                                    <Separator />
                                    <div>
                                      <p className="font-medium text-auth-text-primary mb-2">Changes</p>
                                      {log.old_values && (
                                        <div className="mb-2">
                                          <p className="text-sm text-auth-text-muted mb-1">Before:</p>
                                          <pre className="text-xs bg-auth-bg-form p-2 rounded border border-auth-border">
                                            {JSON.stringify(log.old_values, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {log.new_values && (
                                        <div>
                                          <p className="text-sm text-auth-text-muted mb-1">After:</p>
                                          <pre className="text-xs bg-auth-bg-form p-2 rounded border border-auth-border">
                                            {JSON.stringify(log.new_values, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}

                                {log.metadata && (
                                  <>
                                    <Separator />
                                    <div>
                                      <p className="font-medium text-auth-text-primary mb-2">Metadata</p>
                                      <pre className="text-xs bg-auth-bg-form p-2 rounded border border-auth-border">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}