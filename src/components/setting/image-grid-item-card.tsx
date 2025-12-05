'use client'

/**
 * Image Grid Item Card - Individual grid item with controls
 */

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

interface ImageGridItemCardProps {
    item: ImageGridItem
}

export function ImageGridItemCard({ item }: ImageGridItemCardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.label}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-text-50">{item.label}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        {item.label_line_1 && <span className="truncate">{item.label_line_1}</span>}
                        {item.label_line_2 && (
                            <>
                                <span>•</span>
                                <span className="truncate">{item.label_line_2}</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Position: {item.position}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white/10 hover:text-text-50"
                        disabled={isPending}
                        onClick={() => router.push(`/cms/${item.page_slug}/hero/edit/${item.id}`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
