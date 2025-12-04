'use client'

/**
 * Content Management - Main client component with tabs
 */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageGridEditor } from './image-grid-editor'
import { PageStatusBadge, CMSPageStatus } from './page-status-badge'
import { PageStatusDropdown } from './page-status-dropdown'
import type { User } from '@/lib/setting/types'

type PageSlug = 'about' | 'product' | 'services' | 'collaboration'

interface ContentManagementProps {
    user: User
    initialData: {
        about: any[]
        product: any[]
        services: any[]
        collaboration: any[]
    }
    initialStatuses: {
        about: CMSPageStatus
        product: CMSPageStatus
        services: CMSPageStatus
        collaboration: CMSPageStatus
    }
    initialTab?: PageSlug
}

const PAGE_CONFIG = {
    about: { label: 'About', maxItems: 6, section: 'hero_grid' },
    product: { label: 'Product', maxItems: 6, section: 'hero_grid' },
    services: { label: 'Services', maxItems: 6, section: 'hero_grid' },
    collaboration: { label: 'Collaboration', maxItems: 4, section: 'hero_grid' },
} as const

export function ContentManagement({ user, initialData, initialStatuses, initialTab }: ContentManagementProps) {
    const [activeTab, setActiveTab] = useState<PageSlug>(initialTab || 'about')
    const [statuses, setStatuses] = useState(initialStatuses)

    const handleStatusChange = (page: PageSlug, newStatus: CMSPageStatus) => {
        setStatuses((prev) => ({ ...prev, [page]: newStatus }))
    }

    return (
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PageSlug)}>
                <TabsList className="grid w-full grid-cols-4">
                    {(Object.keys(PAGE_CONFIG) as PageSlug[]).map((key) => (
                        <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                            {PAGE_CONFIG[key].label}
                            <PageStatusBadge status={statuses[key]} />
                        </TabsTrigger>
                    ))}
                </TabsList>

                {(Object.keys(PAGE_CONFIG) as PageSlug[]).map((key) => (
                    <TabsContent key={key} value={key} className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {PAGE_CONFIG[key].label} Page Content
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Current status: {statuses[key]}
                                </p>
                            </div>
                            <PageStatusDropdown
                                pageSlug={key}
                                currentStatus={statuses[key]}
                                userRole={user.role}
                                onStatusChange={(newStatus) => handleStatusChange(key, newStatus)}
                            />
                        </div>
                        <ImageGridEditor
                            pageSlug={key}
                            section={PAGE_CONFIG[key].section}
                            initialItems={initialData[key]}
                            maxItems={PAGE_CONFIG[key].maxItems}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
