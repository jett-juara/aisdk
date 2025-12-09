import { createSupabaseRSCClient, createClient as createServerClient } from '@/lib/supabase/server'

export interface HomeCtaButton {
    id: string
    label: string
    href: string
    icon: string
    is_active: boolean
}

export interface HomeData {
    id: string
    bg_mobile_url: string | null
    bg_tablet_url: string | null
    bg_desktop_url: string | null
    svg_headline_url: string | null
    hero_text_h2: string | null
    hero_text_p: string | null
    cta_buttons: HomeCtaButton[]
    updated_at: string
}

export interface UpdateHomeDataInput {
    bg_mobile_url?: string | null
    bg_tablet_url?: string | null
    bg_desktop_url?: string | null
    svg_headline_url?: string | null
    hero_text_h2?: string | null
    hero_text_p?: string | null
    cta_buttons?: HomeCtaButton[]
}

/**
 * Get the singleton Home Page data
 */
export async function getHomeData(): Promise<HomeData | null> {
    const supabase = await createSupabaseRSCClient()

    const { data, error } = await supabase
        .from('cms_home')
        .select('*')
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            // No row found, return null (should ideally initiate via seed)
            return null
        }
        console.error('Failed to fetch home data:', error)
        return null
    }

    return data as HomeData
}

/**
 * Update Home Page data (merged update)
 */
export async function updateHomeData(input: UpdateHomeDataInput) {
    const supabase = await createServerClient()

    // First check if row exists, if not create it (auto-healing)
    const { data: existing } = await supabase.from('cms_home').select('id').single()

    let result;

    if (!existing) {
        // This case should ideally not happen if migration ran, but good for robustness
        result = await supabase
            .from('cms_home')
            .insert({
                bg_mobile_url: input.bg_mobile_url,
                bg_tablet_url: input.bg_tablet_url,
                bg_desktop_url: input.bg_desktop_url,
                svg_headline_url: input.svg_headline_url,
                hero_text_h2: input.hero_text_h2,
                hero_text_p: input.hero_text_p,
                cta_buttons: input.cta_buttons ? JSON.stringify(input.cta_buttons) : undefined
            })
            .select()
            .single()
    } else {
        // Construct update object removing undefined values
        const updatePayload: Record<string, any> = {}
        if (input.bg_mobile_url !== undefined) updatePayload.bg_mobile_url = input.bg_mobile_url
        if (input.bg_tablet_url !== undefined) updatePayload.bg_tablet_url = input.bg_tablet_url
        if (input.bg_desktop_url !== undefined) updatePayload.bg_desktop_url = input.bg_desktop_url
        if (input.svg_headline_url !== undefined) updatePayload.svg_headline_url = input.svg_headline_url
        if (input.hero_text_h2 !== undefined) updatePayload.hero_text_h2 = input.hero_text_h2
        if (input.hero_text_p !== undefined) updatePayload.hero_text_p = input.hero_text_p
        if (input.cta_buttons !== undefined) updatePayload.cta_buttons = input.cta_buttons

        updatePayload.updated_at = new Date().toISOString()

        result = await supabase
            .from('cms_home')
            .update(updatePayload)
            .eq('id', existing.id)
            .select()
            .single()
    }

    if (result.error) {
        console.error('Failed to update home data:', result.error)
        throw new Error(`Failed to update home data: ${result.error.message}`)
    }

    return result.data as HomeData
}
