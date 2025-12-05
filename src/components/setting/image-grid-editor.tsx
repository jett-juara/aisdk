'use client'

/**
 * Image Grid Editor - Card display for hero images
 */

import React from 'react'
import { ImageGridItemCard } from './image-grid-item-card'

interface ImageGridItem {
    id: string
    page_slug: string
    section: string
    slug: string
    label: string
    label_line_1: string | null
    label_line_2: string | null
    icon_name: string | null
    image_url: string | null
    image_position: 'left' | 'right' | null
    position: number
}

interface ImageGridEditorProps {
    pageSlug: string
    section: string
    initialItems: ImageGridItem[]
    maxItems: number
}

export function ImageGridEditor({
    pageSlug,
    section,
    initialItems,
    maxItems,
}: ImageGridEditorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {initialItems.length} of {maxItems} image slots filled
                    </p>
                </div>
            </div>

            {initialItems.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No images yet. Click on a position in the grid preview to upload.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {initialItems.map((item) => (
                        <ImageGridItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
