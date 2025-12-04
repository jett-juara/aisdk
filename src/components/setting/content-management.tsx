'use client'

/**
 * Content Management - Main client component with tabs
 */

import { useMemo, useState } from 'react'
import { ImageGridEditor } from './image-grid-editor'
import { PageStatusBadge, CMSPageStatus } from './page-status-badge'
import { PageStatusDropdown } from './page-status-dropdown'
import type { User } from '@/lib/setting/types'
import { DetailSectionEditor } from '@/components/cms/detail-section-editor'
import { CMS_DETAIL_CONFIG, CMS_PAGE_CONFIG, type CmsPageSlug } from '@/lib/cms/config'

type ContentPage = CmsPageSlug
type PageSlug = 'overview' | CmsPageSlug

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

const DETAIL_CONFIG: Record<PageSlug, { pageSlug: PageSlug; itemSlug: string; label: string; position: number }[]> = {
    overview: [],
    about: CMS_DETAIL_CONFIG.about,
    product: CMS_DETAIL_CONFIG.product,
    services: CMS_DETAIL_CONFIG.services,
    collaboration: CMS_DETAIL_CONFIG.collaboration,
}

export function ContentManagement({ user, initialData, initialDetailData, initialStatuses, initialTab }: ContentManagementProps) {
    const [activeTab] = useState<PageSlug>(initialTab || 'overview')
    const [statuses, setStatuses] = useState(initialStatuses)

    const handleStatusChange = (page: ContentPage, newStatus: CMSPageStatus) => {
        setStatuses((prev) => ({ ...prev, [page]: newStatus }))
    }

    const overviewCards = useMemo(() => {
        const pages: ContentPage[] = ['about', 'product', 'services', 'collaboration']
        return pages.map((page) => {
            const detailItems = initialDetailData ? initialDetailData[page] ?? [] : []
            const heroItems = initialData[page] ?? []
            return {
                page,
                label: CMS_PAGE_CONFIG[page].label,
                status: statuses[page],
                heroCount: heroItems.length,
                detailCount: detailItems.length,
            }
        })
    }, [initialData, initialDetailData, statuses])

    return (
        <div className="w-full">
            {activeTab === 'overview' ? (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">CMS Overview</h3>
                    <p className="text-sm text-text-300">
                        Ringkasan status, jumlah hero grid, dan detail untuk setiap halaman.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {overviewCards.map((card) => (
                            <div
                                key={card.page}
                                className="rounded-xl border border-white/10 bg-background-900/80 px-4 py-3 shadow-sm space-y-3"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold">{card.label}</span>
                                    <PageStatusBadge status={card.status} />
                                </div>
                                <dl className="text-sm text-text-300 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <dt>Hero grid</dt>
                                        <dd className="font-medium text-text-50">{card.heroCount}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt>Detail blocks</dt>
                                        <dd className="font-medium text-text-50">{card.detailCount}</dd>
                                    </div>
                                </dl>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <a
                                        href={`/cms/${card.page}/hero`}
                                        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                                    >
                                        Kelola Hero
                                    </a>
                                    <a
                                        href={`/cms/${card.page}/detail`}
                                        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                                    >
                                        Kelola Detail
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                (['about', 'product', 'services', 'collaboration'] as ContentPage[])
                    .filter((k) => k === activeTab)
                    .map((key) => (
                        <div key={key} className="mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {CMS_PAGE_CONFIG[key].label} Page Content
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
                                        section={CMS_PAGE_CONFIG[key].section}
                                        initialItems={initialData[key]}
                                        maxItems={CMS_PAGE_CONFIG[key].maxItems}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base font-semibold">Detail Content</h4>
                                    <p className="text-sm text-text-300">
                                        Konten state 2 (tampilan detail setelah tile di-klik). Gambar detail harus berbeda dari hero grid.
                                    </p>
                                    <DetailSectionEditor
                                        pageSlug={key}
                                        label={CMS_PAGE_CONFIG[key].label}
                                        items={initialDetailData ? initialDetailData[key] : []}
                                        config={DETAIL_CONFIG[key]}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
            )}
        </div>
    )
}
