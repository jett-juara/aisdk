'use server'

import { revalidatePath } from 'next/cache'
import {
  createImageGridItem,
  updateImageGridItem,
  deleteImageGridItem,
  reorderImageGridItems,
  updatePageStatus,
  upsertDetailBlock,
  deleteDetailBlock,
} from '@/lib/cms/cms-admin'
import {
  uploadImageToStorage,
  generateImagePath,
  deleteImageFromStorage,
  extractPathFromUrl,
} from '@/lib/cms/upload-utils'

// ===============
// Image Grid Actions (reuse for /cms)
// ===============
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

    const path = generateImagePath(pageSlug, section, file.name)
    const { url } = await uploadImageToStorage(file, path)

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

    revalidatePath('/cms')
    revalidatePath(`/${pageSlug}`)
    revalidatePath(`/preview/${pageSlug}`)
    return { success: true, data: result }
  } catch (error) {
    console.error('Upload failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' }
  }
}

export async function saveImageGridAction(id: string, data: any) {
  try {
    const result = await updateImageGridItem(id, {
      label: data.label,
      labelLine1: data.labelLine1,
      labelLine2: data.labelLine2,
      iconName: data.iconName,
      imagePosition: data.imagePosition,
    })

    revalidatePath('/cms')
    revalidatePath(`/${result.page_slug}`)
    revalidatePath(`/preview/${result.page_slug}`)
    return { success: true, data: result }
  } catch (error) {
    console.error('Save failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Save failed' }
  }
}

export async function deleteImageGridItemAction(id: string, imageUrl?: string, pageSlug?: string) {
  try {
    await deleteImageGridItem(id)

    if (imageUrl) {
      const path = extractPathFromUrl(imageUrl)
      if (path) {
        await deleteImageFromStorage(path)
      }
    }

    if (pageSlug) {
      revalidatePath(`/${pageSlug}`)
      revalidatePath(`/preview/${pageSlug}`)
    }
    revalidatePath('/cms')
    return { success: true }
  } catch (error) {
    console.error('Delete failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' }
  }
}

export async function reorderGridItemsAction(pageSlug: string, section: string, itemIds: string[]) {
  try {
    await reorderImageGridItems(pageSlug, section, itemIds)
    revalidatePath('/cms')
    revalidatePath(`/${pageSlug}`)
    revalidatePath(`/preview/${pageSlug}`)
    return { success: true }
  } catch (error) {
    console.error('Reorder failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Reorder failed' }
  }
}

export async function updatePageStatusAction(
  pageSlug: string,
  newStatus: 'draft' | 'review' | 'published' | 'archived',
  userRole: 'superadmin' | 'admin' | 'user'
) {
  try {
    if ((newStatus === 'published' || newStatus === 'archived') && userRole !== 'superadmin') {
      return { success: false, error: 'Only superadmin can publish or archive content' }
    }
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return { success: false, error: 'Insufficient permissions' }
    }

    const result = await updatePageStatus(pageSlug, newStatus)
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to update status' }
    }

    revalidatePath('/cms')
    revalidatePath(`/${pageSlug}`)
    revalidatePath(`/preview/${pageSlug}`)
    return { success: true, status: newStatus }
  } catch (error) {
    console.error('Update status failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Update status failed' }
  }
}

// ===============
// Detail Actions
// ===============
export async function upsertDetailAction(formData: FormData) {
  try {
    const pageSlug = formData.get('pageSlug') as string
    const itemSlug = formData.get('itemSlug') as string
    const title = formData.get('title') as string
    const paragraphsRaw = (formData.get('paragraphs') as string) || ''
    const status = (formData.get('status') as any) || 'draft'
    const position = Number(formData.get('position') || 1)
    const altText = (formData.get('altText') as string) || null
    const existingImageUrl = (formData.get('existingImageUrl') as string) || null
    const file = formData.get('file') as File | null

    if (!pageSlug || !itemSlug || !title) {
      return { success: false, error: 'Missing required fields' }
    }

    const paragraphs = paragraphsRaw
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    if (file && !altText) {
      return { success: false, error: 'Alt text is required when uploading an image' }
    }

    let imageUrl = existingImageUrl
    if (file) {
      const path = generateImagePath(pageSlug, `detail/${itemSlug}`, file.name)
      const { url } = await uploadImageToStorage(file, path)
      imageUrl = url
      if (existingImageUrl) {
        const oldPath = extractPathFromUrl(existingImageUrl)
        if (oldPath) {
          await deleteImageFromStorage(oldPath)
        }
      }
    }

    const result = await upsertDetailBlock({
      pageSlug,
      itemSlug,
      title,
      paragraphs,
      imageUrl,
      altText,
      status,
      position,
    })

    revalidatePath('/cms')
    revalidatePath(`/${pageSlug}`)
    revalidatePath(`/preview/${pageSlug}`)
    return { success: true, data: result }
  } catch (error) {
    console.error('Upsert detail failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Upsert detail failed' }
  }
}

export async function deleteDetailAction(id: string, imageUrl?: string, pageSlug?: string) {
  try {
    await deleteDetailBlock(id)
    if (imageUrl) {
      const path = extractPathFromUrl(imageUrl)
      if (path) {
        await deleteImageFromStorage(path)
      }
    }
    if (pageSlug) {
      revalidatePath(`/${pageSlug}`)
      revalidatePath(`/preview/${pageSlug}`)
    }
    revalidatePath('/cms')
    return { success: true }
  } catch (error) {
    console.error('Delete detail failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Delete detail failed' }
  }
}
