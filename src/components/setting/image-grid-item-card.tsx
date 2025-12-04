'use client'

/**
 * Image Grid Item Card - Individual grid item with controls
 */

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { deleteImageGridItemAction } from '@/app/cms/actions'
import { useRouter } from 'next/navigation'
import { ImageEditDialog } from './image-edit-dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
    const [isDeleting, setIsDeleting] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        startTransition(async () => {
            await deleteImageGridItemAction(item.id, item.image_url || undefined)
            router.refresh()
        })
    }

    return (
        <Card ref={setNodeRef} style={style}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <button
                        className="cursor-grab active:cursor-grabbing touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>

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
                        <p className="font-medium truncate">{item.label}</p>
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
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setEditDialogOpen(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={isPending || isDeleting}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete &quot;{item.label}&quot;? This action cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <ImageEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    item={item}
                />
            </CardContent>
        </Card>
    )
}
