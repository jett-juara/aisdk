'use server'

/**
 * Server Actions for CMS Content Management
 */

import { revalidatePath } from 'next/cache'
import {
    createImageGridItem,
    updateImageGridItem,
    deleteImageGridItem,
    reorderImageGridItems,
} from '@/lib/cms/cms-admin'
import {
    uploadImageToStorage,
    generateImagePath,
    deleteImageFromStorage,
    extractPathFromUrl,
} from '@/lib/cms/upload-utils'

/**
 * Upload image and create grid item
 */
export async function uploadImageAction(formData: FormData) {
    try {
        const file = formData.get('file') as File
        const pageSlug = formData.get('pageSlug') as string
        const section = formData.get('section') as string
        const slug = formData.get('slug') as string
        const label = formData.get('label') as string
        const labelLine1 = formData.get('labelLine1') as string | null
        const labelLine2 = formData.get('labelLine2') as string | null
        const iconName = formData.get('iconName') as string | null
        const imagePosition = formData.get('imagePosition') as 'left' | 'right' | null
        const position = parseInt(formData.get('position') as string)

        if (!file || !pageSlug || !section || !slug || !label) {
            throw new Error('Missing required fields')
        }

        // Upload image to storage
        const path = generateImagePath(pageSlug, section, file.name)
        const { url } = await uploadImageToStorage(file, path)

        // Create image grid item
        const result = await createImageGridItem({
            pageSlug,
            section,
            slug,
            label,
            labelLine1,
            labelLine2,
            iconName,
            imageUrl: url,
            imagePosition,
            position,
        })

        revalidatePath('/setting/content')
        return { success: true, data: result }
    } catch (error) {
        console.error('Upload failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

/**
 * Update image grid item metadata
 */
export async function saveImageGridAction(id: string, data: any) {
    try {
        const result = await updateImageGridItem(id, {
            label: data.label,
            labelLine1: data.labelLine1,
            labelLine2: data.labelLine2,
            iconName: data.iconName,
            imagePosition: data.imagePosition,
        })

        revalidatePath('/setting/content')
        return { success: true, data: result }
    } catch (error) {
        console.error('Save failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
        }
    }
}

/**
 * Delete image grid item and optionally its image
 */
export async function deleteImageGridItemAction(id: string, imageUrl?: string) {
    try {
        // Delete from database
        await deleteImageGridItem(id)

        // Optionally delete image from storage
        if (imageUrl) {
            const path = extractPathFromUrl(imageUrl)
            if (path) {
                await deleteImageFromStorage(path)
            }
        }

        revalidatePath('/setting/content')
        return { success: true }
    } catch (error) {
        console.error('Delete failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        }
    }
}

/**
 * Reorder image grid items
 */
export async function reorderGridItemsAction(
    pageSlug: string,
    section: string,
    itemIds: string[]
) {
    try {
        await reorderImageGridItems(pageSlug, section, itemIds)

        revalidatePath('/setting/content')
        return { success: true }
    } catch (error) {
        console.error('Reorder failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Reorder failed',
        }
    }
}

/**
 * Update page status with role-based permission check
 */
export async function updatePageStatusAction(
    pageSlug: string,
    newStatus: 'draft' | 'review' | 'published' | 'archived',
    userRole: 'superadmin' | 'admin' | 'user'
) {
    try {
        // Permission check: Only superadmin can publish or archive
        if ((newStatus === 'published' || newStatus === 'archived') && userRole !== 'superadmin') {
            return {
                success: false,
                error: 'Only superadmin can publish or archive content',
            }
        }

        // Admin can set to draft or review
        if (userRole !== 'admin' && userRole !== 'superadmin') {
            return {
                success: false,
                error: 'Insufficient permissions',
            }
        }

        // Import here to avoid circular dependencies
        const { updatePageStatus } = await import('@/lib/cms/cms-admin')
        const result = await updatePageStatus(pageSlug, newStatus)

        if (!result.success) {
            return {
                success: false,
                error: result.error || 'Failed to update status',
            }
        }

        revalidatePath('/setting/content')
        revalidatePath(`/${pageSlug}`) // Revalidate public page
        revalidatePath(`/preview/${pageSlug}`) // Revalidate preview

        return { success: true, status: newStatus }
    } catch (error) {
        console.error('Update status failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Update status failed',
        }
    }
}
