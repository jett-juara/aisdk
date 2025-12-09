'use client'

/**
 * Image Upload Dialog - Form for uploading new images
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { uploadImageAction } from '@/app/cms/actions'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface ImageUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pageSlug: string
    section: string
    nextPosition: number
}

export function ImageUploadDialog({
    open,
    onOpenChange,
    pageSlug,
    section,
    nextPosition,
}: ImageUploadDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        slug: '',
        label: '',
        labelLine1: '',
        labelLine2: '',
        iconName: '',
        imagePosition: 'left' as 'left' | 'right',
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            toast({ title: 'Error', description: 'Please select an image', variant: 'destructive' })
            return
        }

        if (!formData.label.trim()) {
            toast({ title: 'Error', description: 'Label is required', variant: 'destructive' })
            return
        }

        startTransition(async () => {
            const data = new FormData()
            data.append('file', file)
            data.append('pageSlug', pageSlug)
            data.append('section', section)
            data.append('slug', formData.slug || formData.label.toLowerCase().replace(/\s+/g, '-'))
            data.append('label', formData.label)
            data.append('labelLine1', formData.labelLine1)
            data.append('labelLine2', formData.labelLine2)
            data.append('iconName', formData.iconName)
            data.append('imagePosition', formData.imagePosition)
            data.append('position', nextPosition.toString())

            const result = await uploadImageAction(data)

            if (result.success) {
                toast({ title: 'Success', description: 'Image uploaded successfully' })
                onOpenChange(false)
                router.refresh()
                // Reset form
                setFile(null)
                setPreview(null)
                setFormData({
                    slug: '',
                    label: '',
                    labelLine1: '',
                    labelLine2: '',
                    iconName: '',
                    imagePosition: 'left',
                })
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to upload image',
                    variant: 'destructive',
                })
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload New Image</DialogTitle>
                    <DialogDescription>
                        Add a new image to the {pageSlug} page grid. All fields are required except Icon Name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* File Input */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Image File *</Label>
                        <Input
                            id="file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isPending}
                            required
                        />
                        {preview && (
                            <div className="relative h-48 w-full overflow-hidden rounded-md border">
                                <Image src={preview} alt="Preview" fill className="object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Label */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Label *</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., Events"
                            disabled={isPending}
                            required
                        />
                    </div>

                    {/* Label Line 1 */}
                    <div className="space-y-2">
                        <Label htmlFor="labelLine1">Label Line 1</Label>
                        <Input
                            id="labelLine1"
                            value={formData.labelLine1}
                            onChange={(e) => setFormData({ ...formData, labelLine1: e.target.value })}
                            placeholder="e.g., Premium Event"
                            disabled={isPending}
                        />
                    </div>

                    {/* Label Line 2 */}
                    <div className="space-y-2">
                        <Label htmlFor="labelLine2">Label Line 2</Label>
                        <Input
                            id="labelLine2"
                            value={formData.labelLine2}
                            onChange={(e) => setFormData({ ...formData, labelLine2: e.target.value })}
                            placeholder="e.g., Experiences"
                            disabled={isPending}
                        />
                    </div>

                    {/* Icon Name (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="iconName">Icon Name (Optional)</Label>
                        <Input
                            id="iconName"
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
                        <Label htmlFor="imagePosition">Image Position</Label>
                        <Select
                            value={formData.imagePosition}
                            onValueChange={(value) =>
                                setFormData({ ...formData, imagePosition: value as 'left' | 'right' })
                            }
                            disabled={isPending}
                        >
                            <SelectTrigger id="imagePosition">
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
                            {isPending ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
