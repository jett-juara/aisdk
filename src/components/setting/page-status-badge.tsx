'use client'

/**
 * Page Status Badge Component
 * Displays visual status indicator for CMS pages
 */

import { Badge } from '@/components/ui/badge'

export type CMSPageStatus = 'draft' | 'review' | 'published' | 'archived'

interface PageStatusBadgeProps {
    status: CMSPageStatus
}

const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    review: {
        label: 'In Review',
        variant: 'default' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    published: {
        label: 'Published',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    archived: {
        label: 'Archived',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
}

export function PageStatusBadge({ status }: PageStatusBadgeProps) {
    const config = STATUS_CONFIG[status]

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    )
}
