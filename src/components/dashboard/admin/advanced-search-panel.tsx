'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Calendar,
  Shield,
  Users,
  Activity,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface SearchFilters {
  query: string
  role: 'all' | 'superadmin' | 'admin' | 'user'
  status: 'all' | 'active' | 'blocked' | 'deleted'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'
  sortBy: 'name' | 'email' | 'role' | 'status' | 'created_at' | 'last_active'
  sortOrder: 'asc' | 'desc'
  hasPermissions: 'all' | 'with' | 'without'
  lastActiveAfter: string
  lastActiveBefore: string
  createdAfter: string
  createdBefore: string
}

interface AdvancedSearchPanelProps {
  onSearch: (filters: SearchFilters) => void
  onExport?: (filters: SearchFilters) => void
  className?: string
  resultCount?: number
  isSearching?: boolean
}

export function AdvancedSearchPanel({
  onSearch,
  onExport,
  className,
  resultCount = 0,
  isSearching = false
}: AdvancedSearchPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    role: 'all',
    status: 'all',
    dateRange: 'all',
    sortBy: 'name',
    sortOrder: 'desc',
    hasPermissions: 'all',
    lastActiveAfter: '',
    lastActiveBefore: '',
    createdAfter: '',
    createdBefore: ''
  })

  const [_activeFiltersCount, _setActiveFiltersCount] = useState(0)

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      role: 'all',
      status: 'all',
      dateRange: 'all',
      sortBy: 'name',
      sortOrder: 'desc',
      hasPermissions: 'all',
      lastActiveAfter: '',
      lastActiveBefore: '',
      createdAfter: '',
      createdBefore: ''
    })
  }, [])

  const applySearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleExport = useCallback(() => {
    onExport?.(filters)
  }, [filters, onExport])

  // Count active filters (excluding defaults)
  const activeFilters = useMemo(() => {
    let count = 0
    if (filters.query) count++
    if (filters.role !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.dateRange !== 'all') count++
    if (filters.hasPermissions !== 'all') count++
    if (filters.lastActiveAfter) count++
    if (filters.lastActiveBefore) count++
    if (filters.createdAfter) count++
    if (filters.createdBefore) count++
    return count
  }, [filters])

  const getFilterSummary = useCallback(() => {
    const summaries = []
    if (filters.query) summaries.push(`"${filters.query}"`)
    if (filters.role !== 'all') summaries.push(`Role: ${filters.role}`)
    if (filters.status !== 'all') summaries.push(`Status: ${filters.status}`)
    if (filters.dateRange !== 'all') summaries.push(`Date: ${filters.dateRange}`)
    return summaries.join(', ')
  }, [filters])

  const quickFilters = [
    {
      label: 'Active Admins',
      filters: { role: 'admin', status: 'active' },
      icon: Shield,
      color: 'blue'
    },
    {
      label: 'Blocked Users',
      filters: { status: 'blocked' },
      icon: X,
      color: 'red'
    },
    {
      label: 'New Users (Week)',
      filters: { dateRange: 'week', status: 'active' },
      icon: Calendar,
      color: 'green'
    },
    {
      label: 'Inactive Users',
      filters: { status: 'active', lastActiveBefore: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Users Without Permissions',
      filters: { hasPermissions: 'without' },
      icon: Shield,
      color: 'purple'
    },
    {
      label: 'All Superadmins',
      filters: { role: 'superadmin' },
      icon: Users,
      color: 'red'
    }
  ]

  const applyQuickFilter = useCallback((quickFilter: typeof quickFilters[0]) => {
    const newFilters = { ...filters, ...quickFilter.filters } as SearchFilters
    setFilters(newFilters)
    onSearch(newFilters)
  }, [filters, onSearch])

  const getQuickFilterColor = (color: string) => {
    const colors = {
      blue: 'border-auth-info/20 text-auth-info hover:bg-auth-info/10',
      green: 'border-auth-success/20 text-auth-success hover:bg-auth-success/10',
      red: 'border-auth-text-error/20 text-auth-text-error hover:bg-auth-text-error/10',
      yellow: 'border-auth-warning/20 text-auth-warning hover:bg-auth-warning/10',
      purple: 'border-auth-purple/20 text-auth-purple hover:bg-auth-purple/10'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <Card className={cn('border-auth-border bg-card text-card-foreground', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription className="text-auth-text-muted">
              {resultCount > 0 ? `${resultCount} results found` : 'Search and filter users'}
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters} filters
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getFilterSummary() && (
              <span className="text-sm text-auth-text-muted hidden sm:inline">
                {getFilterSummary()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="border-auth-border"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((quickFilter, index) => {
            const Icon = quickFilter.icon
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyQuickFilter(quickFilter)}
                className={cn(
                  'text-xs border',
                  getQuickFilterColor(quickFilter.color)
                )}
              >
                <Icon className="h-3 w-3 mr-1" />
                {quickFilter.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="px-6 pb-6">
          <Separator className="mb-6" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Search Query</label>
              <Input
                placeholder="Search by name, email, username..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="border-auth-border"
              />
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Role</label>
              <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="last_active">Last Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Sort Order</label>
              <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permission Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Permissions</label>
              <Select value={filters.hasPermissions} onValueChange={(value) => updateFilter('hasPermissions', value)}>
                <SelectTrigger className="border-auth-border">
                  <SelectValue placeholder="Filter by permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="with">With Permissions</SelectItem>
                  <SelectItem value="without">Without Permissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Last Active After */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Last Active After</label>
              <Input
                type="date"
                value={filters.lastActiveAfter}
                onChange={(e) => updateFilter('lastActiveAfter', e.target.value)}
                className="border-auth-border"
              />
            </div>

            {/* Last Active Before */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Last Active Before</label>
              <Input
                type="date"
                value={filters.lastActiveBefore}
                onChange={(e) => updateFilter('lastActiveBefore', e.target.value)}
                className="border-auth-border"
              />
            </div>

            {/* Created After */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Created After</label>
              <Input
                type="date"
                value={filters.createdAfter}
                onChange={(e) => updateFilter('createdAfter', e.target.value)}
                className="border-auth-border"
              />
            </div>

            {/* Created Before */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-auth-text-primary">Created Before</label>
              <Input
                type="date"
                value={filters.createdBefore}
                onChange={(e) => updateFilter('createdBefore', e.target.value)}
                className="border-auth-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-auth-border">
            <Button
              onClick={applySearch}
              disabled={isSearching}
              className="bg-auth-button-brand text-auth-button-brand-foreground hover:bg-auth-button-brand/90"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-auth-border"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>

            {onExport && (
              <Button
                variant="outline"
                onClick={handleExport}
                className="border-auth-border"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}

            {activeFilters > 0 && (
              <div className="flex items-center gap-2 text-sm text-auth-text-muted ml-auto">
                <Activity className="h-4 w-4" />
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}