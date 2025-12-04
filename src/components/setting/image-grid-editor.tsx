'use client'

/**
 * Image Grid Editor - Grid display with drag-drop reordering
 */

import { useState, useTransition } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ImageGridItemCard } from './image-grid-item-card'
import { ImageUploadDialog } from './image-upload-dialog'
import { reorderGridItemsAction } from '@/app/setting/content/actions'
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
    const router = useRouter()
    const [items, setItems] = useState(initialItems)
    const [isPending, startTransition] = useTransition()
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id)
            const newIndex = items.findIndex((item) => item.id === over.id)

            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)

            // Update positions in database
            startTransition(async () => {
                await reorderGridItemsAction(
                    pageSlug,
                    section,
                    newItems.map((item) => item.id)
                )
                router.refresh()
            })
        }
    }

    const canAddMore = items.length < maxItems

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {items.length} of {maxItems} image slots used
                    </p>
                </div>
                <Button size="sm" disabled={!canAddMore || isPending} onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No images yet. Click &quot;Add Image&quot; to get started.
                    </p>
                </div>
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="grid gap-4">
                            {items.map((item) => (
                                <ImageGridItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <ImageUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                pageSlug={pageSlug}
                section={section}
                nextPosition={items.length + 1}
            />
        </div>
    )
}
