'use client'

/**
 * Page Status Dropdown Component
 * Allows admins to change CMS page status with role-based permissions
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, FileEdit, Eye, CheckCircle, Archive } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updatePageStatusAction } from '@/app/setting/content/actions'

export type CMSPageStatus = 'draft' | 'review' | 'published' | 'archived'
export type UserRole = 'superadmin' | 'admin' | 'user'

interface PageStatusDropdownProps {
    pageSlug: string
    currentStatus: CMSPageStatus
    userRole: UserRole
    onStatusChange?: (newStatus: CMSPageStatus) => void
}

const STATUS_OPTIONS = [
    { value: 'draft' as const, label: 'Set to Draft', icon: FileEdit, requiresSuperadmin: false },
    { value: 'review' as const, label: 'Submit for Review', icon: Eye, requiresSuperadmin: false },
    { value: 'published' as const, label: 'Publish', icon: CheckCircle, requiresSuperadmin: true },
    { value: 'archived' as const, label: 'Archive', icon: Archive, requiresSuperadmin: true },
]

export function PageStatusDropdown({
    pageSlug,
    currentStatus,
    userRole,
    onStatusChange,
}: PageStatusDropdownProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleStatusChange = async (newStatus: CMSPageStatus) => {
        if (newStatus === currentStatus) return

        setIsLoading(true)
        try {
            const result = await updatePageStatusAction(pageSlug, newStatus, userRole)

            if (result.success) {
                toast({
                    title: 'Status Updated',
                    description: `Page status changed to ${newStatus}`,
                })
                onStatusChange?.(newStatus)
            } else {
                toast({
                    title: 'Update Failed',
                    description: result.error || 'Failed to update status',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const isSuperadmin = userRole === 'superadmin'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                    Change Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Page Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isDisabled =
                        option.value === currentStatus ||
                        (option.requiresSuperadmin && !isSuperadmin)

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            disabled={isDisabled}
                            onClick={() => handleStatusChange(option.value)}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {option.label}
                            {option.requiresSuperadmin && !isSuperadmin && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                    Superadmin only
                                </span>
                            )}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
