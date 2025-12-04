'use client'

/**
 * Image Edit Dialog - Form for editing existing item metadata
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveImageGridAction } from '@/app/setting/content/actions'
import { useToast } from '@/hooks/use-toast'

interface ImageEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: {
        id: string
        label: string
        label_line_1: string | null
        label_line_2: string | null
        icon_name: string | null
        image_position: 'left' | 'right' | null
    }
}

export function ImageEditDialog({ open, onOpenChange, item }: ImageEditDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    const [formData, setFormData] = useState({
        label: item.label,
        labelLine1: item.label_line_1 || '',
        labelLine2: item.label_line_2 || '',
        iconName: item.icon_name || '',
        imagePosition: (item.image_position || 'left') as 'left' | 'right',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.label.trim()) {
            toast({ title: 'Error', description: 'Label is required', variant: 'destructive' })
            return
        }

        startTransition(async () => {
            const result = await saveImageGridAction(item.id, {
                label: formData.label,
                labelLine1: formData.labelLine1 || null,
                labelLine2: formData.labelLine2 || null,
                iconName: formData.iconName || null,
                imagePosition: formData.imagePosition,
            })

            if (result.success) {
                toast({ title: 'Success', description: 'Image metadata updated successfully' })
                onOpenChange(false)
                router.refresh()
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update image',
                    variant: 'destructive',
                })
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Image Metadata</DialogTitle>
                    <DialogDescription>
                        Update the label and metadata for this image. Changes will be reflected immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Label */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-label">Label *</Label>
                        <Input
                            id="edit-label"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., Events"
                            disabled={isPending}
                            required
                        />
                    </div>

                    {/* Label Line 1 */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-labelLine1">Label Line 1</Label>
                        <Input
                            id="edit-labelLine1"
                            value={formData.labelLine1}
                            onChange={(e) => setFormData({ ...formData, labelLine1: e.target.value })}
                            placeholder="e.g., Premium Event"
                            disabled={isPending}
                        />
                    </div>

                    {/* Label Line 2 */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-labelLine2">Label Line 2</Label>
                        <Input
                            id="edit-labelLine2"
                            value={formData.labelLine2}
                            onChange={(e) => setFormData({ ...formData, labelLine2: e.target.value })}
                            placeholder="e.g., Experiences"
                            disabled={isPending}
                        />
                    </div>

                    {/* Icon Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-iconName">Icon Name (Optional)</Label>
                        <Input
                            id="edit-iconName"
                            value={formData.iconName}
                            onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                            placeholder="e.g., sparkles"
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            Lucide icon name (if applicable)
                        </p>
                    </div>

                    {/* Image Position */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-imagePosition">Image Position</Label>
                        <Select
                            value={formData.imagePosition}
                            onValueChange={(value) =>
                                setFormData({ ...formData, imagePosition: value as 'left' | 'right' })
                            }
                            disabled={isPending}
                        >
                            <SelectTrigger id="edit-imagePosition">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
