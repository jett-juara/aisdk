/**
 * CMS Admin Functions
 * Server-side functions for managing CMS content (admin-only)
 */

import { createClient } from '@/lib/supabase/server'

export interface CreateImageGridItemData {
    pageSlug: string
    section: string
    slug: string
    label: string
    labelLine1?: string | null
    labelLine2?: string | null
    iconName?: string | null
    imageUrl: string
    imagePosition?: 'left' | 'right' | null
    position: number
}

export interface UpdateImageGridItemData {
    label?: string
    labelLine1?: string | null
    labelLine2?: string | null
    iconName?: string | null
    imageUrl?: string
    imagePosition?: 'left' | 'right' | null
    position?: number
}

/**
 * Create a new image grid item
 */
export async function createImageGridItem(data: CreateImageGridItemData) {
    const supabase = await createClient()

    const { data: result, error } = await supabase
        .from('cms_image_grid_items')
        .insert({
            page_slug: data.pageSlug,
            section: data.section,
            slug: data.slug,
            label: data.label,
            label_line_1: data.labelLine1,
            label_line_2: data.labelLine2,
            icon_name: data.iconName,
            image_url: data.imageUrl,
            image_position: data.imagePosition,
            position: data.position,
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to create image grid item:', error)
        throw new Error(`Failed to create image grid item: ${error.message}`)
    }

    return result
}

/**
 * Update an existing image grid item
 */
export async function updateImageGridItem(id: string, data: UpdateImageGridItemData) {
    const supabase = await createClient()

    const updateData: Record<string, any> = {}
    if (data.label !== undefined) updateData.label = data.label
    if (data.labelLine1 !== undefined) updateData.label_line_1 = data.labelLine1
    if (data.labelLine2 !== undefined) updateData.label_line_2 = data.labelLine2
    if (data.iconName !== undefined) updateData.icon_name = data.iconName
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
    if (data.imagePosition !== undefined) updateData.image_position = data.imagePosition
    if (data.position !== undefined) updateData.position = data.position

    const { data: result, error } = await supabase
        .from('cms_image_grid_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Failed to update image grid item:', error)
        throw new Error(`Failed to update image grid item: ${error.message}`)
    }

    return result
}

/**
 * Delete an image grid item
 */
export async function deleteImageGridItem(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('cms_image_grid_items').delete().eq('id', id)

    if (error) {
        console.error('Failed to delete image grid item:', error)
        throw new Error(`Failed to delete image grid item: ${error.message}`)
    }

    return { success: true }
}

/**
 * Reorder image grid items (bulk update positions)
 */
export async function reorderImageGridItems(
    pageSlug: string,
    section: string,
    itemIds: string[]
) {
    const supabase = await createClient()

    // Update each item with its new position (index + 1)
    const updates = itemIds.map((id, index) => ({
        id,
        position: index + 1,
    }))

    // Execute updates in transaction-like manner
    for (const update of updates) {
        const { error } = await supabase
            .from('cms_image_grid_items')
            .update({ position: update.position })
            .eq('id', update.id)
            .eq('page_slug', pageSlug)
            .eq('section', section)

        if (error) {
            console.error('Failed to reorder item:', update.id, error)
            throw new Error(`Failed to reorder items: ${error.message}`)
        }
    }

    return { success: true }
}

/**
 * Get all image grid items for a page/section
 */
export async function getImageGridItems(pageSlug: string, section: string = 'hero_grid') {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cms_image_grid_items')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section', section)
        .order('position', { ascending: true })

    if (error) {
        console.error('Failed to fetch image grid items:', error)
        return []
    }

    return data || []
}

// ============================================
// Page Status Management
// ============================================

export type CMSPageStatus = 'draft' | 'review' | 'published' | 'archived'

/**
 * Get current status of a CMS page
 */
export async function getPageStatus(pageSlug: string): Promise<CMSPageStatus | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cms_pages')
        .select('status')
        .eq('slug', pageSlug)
        .single()

    if (error) {
        console.error('Failed to fetch page status:', error)
        return null
    }

    return data?.status as CMSPageStatus || null
}

/**
 * Update status of a CMS page
 */
export async function updatePageStatus(
    pageSlug: string,
    newStatus: CMSPageStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cms_pages')
        .update({ status: newStatus })
        .eq('slug', pageSlug)

    if (error) {
        console.error('Failed to update page status:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
