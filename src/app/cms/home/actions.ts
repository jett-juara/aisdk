'use server'

import { revalidatePath } from 'next/cache'
import { updateHomeData, type HomeCtaButton } from '@/lib/cms/home-service'
import { uploadImageToStorage, generateImagePath, deleteImageFromStorage, extractPathFromUrl } from '@/lib/cms/upload-utils'

export async function updateHomeAction(formData: FormData) {
    try {
        const bgMobile = formData.get('bg_mobile') as File | null
        const bgTablet = formData.get('bg_tablet') as File | null
        const bgDesktop = formData.get('bg_desktop') as File | null
        const svgHeadline = formData.get('svg_headline') as File | null

        // Previous URLs to delete if replaced
        const prevBgMobile = formData.get('prev_bg_mobile') as string | null
        const prevBgTablet = formData.get('prev_bg_tablet') as string | null
        const prevBgDesktop = formData.get('prev_bg_desktop') as string | null
        const prevSvgHeadline = formData.get('prev_svg_headline') as string | null

        // Text Content
        // Note: formData.get returns empty string if field exists but is empty, or null if field missing
        const heroTextH2 = formData.get('hero_text_h2')
        const heroTextP = formData.get('hero_text_p')

        const ctaButtonsJson = formData.get('cta_buttons') as string | null
        const ctaButtons = ctaButtonsJson ? JSON.parse(ctaButtonsJson) as HomeCtaButton[] : undefined

        let bgMobileUrl: string | undefined
        let bgTabletUrl: string | undefined
        let bgDesktopUrl: string | undefined
        let svgHeadlineUrl: string | undefined

        // Helper to upload and cleanup
        const handleUpload = async (file: File, section: string, prevUrl: string | null) => {
            if (file && file.size > 0) {
                const path = generateImagePath('home', section, file.name)
                const result = await uploadImageToStorage(file, path)

                // Clean up old image if it exists
                if (prevUrl) {
                    const oldPath = extractPathFromUrl(prevUrl)
                    if (oldPath) await deleteImageFromStorage(oldPath)
                }
                return result.url
            }
            return undefined
        }

        if (bgMobile) bgMobileUrl = await handleUpload(bgMobile, 'background', prevBgMobile)
        if (bgTablet) bgTabletUrl = await handleUpload(bgTablet, 'background', prevBgTablet)
        if (bgDesktop) bgDesktopUrl = await handleUpload(bgDesktop, 'background', prevBgDesktop)
        if (svgHeadline) svgHeadlineUrl = await handleUpload(svgHeadline, 'headline', prevSvgHeadline)

        const result = await updateHomeData({
            bg_mobile_url: bgMobileUrl,
            bg_tablet_url: bgTabletUrl,
            bg_desktop_url: bgDesktopUrl,
            svg_headline_url: svgHeadlineUrl,
            hero_text_h2: typeof heroTextH2 === 'string' ? heroTextH2 : undefined,
            hero_text_p: typeof heroTextP === 'string' ? heroTextP : undefined,
            cta_buttons: ctaButtons
        })

        revalidatePath('/')
        revalidatePath('/cms/home')

        return { success: true, data: result }
    } catch (error) {
        console.error('Update home failed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Update home failed' }
    }
}
