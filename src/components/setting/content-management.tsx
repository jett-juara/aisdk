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
import { DetailSectionEditor } from '@/components/cms/detail-section-editor'

type PageSlug = 'about' | 'product' | 'services' | 'collaboration'

interface ContentManagementProps {
    user: User
    initialData: {
        about: any[]
        product: any[]
        services: any[]
        collaboration: any[]
    }
    initialDetailData?: {
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

const DETAIL_CONFIG: Record<PageSlug, { pageSlug: PageSlug; itemSlug: string; label: string; position: number }[]> = {
    about: [
        { pageSlug: 'about', itemSlug: 'event', label: 'Event', position: 1 },
        { pageSlug: 'about', itemSlug: 'community', label: 'Community', position: 2 },
        { pageSlug: 'about', itemSlug: 'tech', label: 'Tech', position: 3 },
        { pageSlug: 'about', itemSlug: 'analytic', label: 'Analytics', position: 4 },
    ],
    product: [
        { pageSlug: 'product', itemSlug: 'audience-flow-management', label: 'Audience Flow', position: 1 },
        { pageSlug: 'product', itemSlug: 'creative-agency', label: 'Creative Agency', position: 2 },
        { pageSlug: 'product', itemSlug: 'event-activation', label: 'Event Activation', position: 3 },
        { pageSlug: 'product', itemSlug: 'mice-event', label: 'MICE Event', position: 4 },
        { pageSlug: 'product', itemSlug: 'music-concert-management', label: 'Music Concert', position: 5 },
        { pageSlug: 'product', itemSlug: 'sport-event-management', label: 'Sport Event', position: 6 },
    ],
    services: [
        { pageSlug: 'services', itemSlug: 'creative-and-plan-development', label: 'Creative & Plan', position: 1 },
        { pageSlug: 'services', itemSlug: 'execution-handling', label: 'Execution Handling', position: 2 },
        { pageSlug: 'services', itemSlug: 'talent-and-logistic-management', label: 'Talent & Logistic', position: 3 },
        { pageSlug: 'services', itemSlug: 'local-authority-liaison', label: 'Local Authority Liaison', position: 4 },
    ],
    collaboration: [
        { pageSlug: 'collaboration', itemSlug: 'partnership-guide', label: 'Partnership Guide', position: 1 },
        { pageSlug: 'collaboration', itemSlug: 'chat-jett', label: 'Chat JETT', position: 2 },
    ],
}

export function ContentManagement({ user, initialData, initialDetailData, initialStatuses, initialTab }: ContentManagementProps) {
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
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-base font-semibold">Hero Grid</h4>
                                <p className="text-sm text-text-300">Atur gambar grid hero (CMS utama).</p>
                                <ImageGridEditor
                                    pageSlug={key}
                                    section={PAGE_CONFIG[key].section}
                                    initialItems={initialData[key]}
                                    maxItems={PAGE_CONFIG[key].maxItems}
                                />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-base font-semibold">Detail Content</h4>
                                <p className="text-sm text-text-300">
                                    Konten state 2 (tampilan detail setelah tile di-klik). Gambar detail harus berbeda dari hero grid.
                                </p>
                                <DetailSectionEditor
                                    pageSlug={key}
                                    label={PAGE_CONFIG[key].label}
                                    items={initialDetailData ? initialDetailData[key] : []}
                                    config={DETAIL_CONFIG[key]}
                                />
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
