/**
 * CMS Upload Utilities
 * Helper functions for uploading and managing images in Supabase Storage
 */

import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'cms_marketing_images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Generate storage path for an image
 */
export function generateImagePath(pageSlug: string, section: string, filename: string): string {
    const timestamp = Date.now()
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${pageSlug}/${section}/${timestamp}_${cleanFilename}`
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToStorage(
    file: File,
    path: string
): Promise<{ url: string; path: string }> {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
    }

    const supabase = await createClient()

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    })

    if (error) {
        throw new Error(`Failed to upload image: ${error.message}`)
    }

    const url = getPublicImageUrl(data.path)
    return { url, path: data.path }
}

/**
 * Get public URL for an image
 */
export function getPublicImageUrl(path: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`
}

/**
 * Delete image from storage
 */
export async function deleteImageFromStorage(path: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
        console.error('Failed to delete image:', error)
        throw new Error(`Failed to delete image: ${error.message}`)
    }
}

/**
 * Extract storage path from public URL
 */
export function extractPathFromUrl(url: string): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const prefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`

    if (!url.startsWith(prefix)) {
        return null
    }

    return url.substring(prefix.length)
}
