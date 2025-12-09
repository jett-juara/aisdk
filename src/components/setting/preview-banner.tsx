'use client'

/**
 * Preview Banner Component
 * Displays banner at top of preview pages to indicate preview mode
 */

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye } from 'lucide-react'

interface PreviewBannerProps {
    status: 'draft' | 'review'
}

export function PreviewBanner({ status }: PreviewBannerProps) {
    return (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
            <Eye className="h-4 w-4" />
            <AlertDescription>
                <strong>Preview Mode</strong> - You are viewing {status} content. This page is not public and will not be indexed by search engines.
            </AlertDescription>
        </Alert>
    )
}
