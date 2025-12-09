'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { HomeData } from '@/lib/cms/home-service'
import { updateHomeAction } from '@/app/cms/home/actions'

// Sub-forms
import { HomeBackgroundUploader } from './home-background-uploader'
import { HomeTextForm } from './home-text-form'
import { HomeButtonsEditor } from './home-buttons-editor'

interface HomeFormWrapperProps {
    initialData: HomeData
    defaultTab: 'backgrounds' | 'content' | 'buttons'
}

export function HomeFormWrapper({ initialData, defaultTab }: HomeFormWrapperProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Local state for all fields
    // We initialize state with server data.
    const [data, setData] = useState<HomeData>(initialData)

    // Pending files state (not yet uploaded)
    const [files, setFiles] = useState<{
        bg_mobile?: Blob | null
        bg_tablet?: Blob | null
        bg_desktop?: Blob | null
        svg_headline?: File | null
    }>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()

        // Only append data relevant to the current tab to save bandwidth/processing? 
        // Actually the server action expects everything or handles partials?
        // The server action `updateHomeAction` updates everything based on what's present.
        // Ideally we should send everything to be safe, or refactor server action.
        // Since `cms_home` is a singleton row, sending everything is safer to avoid overwriting with nulls if logic is flawed, 
        // but here we are maintaining `data` state which holds ALL data. So sending all `data` is correct.

        // Previous URLs (for cleanup)
        if (initialData.bg_mobile_url) formData.set('prev_bg_mobile', initialData.bg_mobile_url)
        if (initialData.bg_tablet_url) formData.set('prev_bg_tablet', initialData.bg_tablet_url)
        if (initialData.bg_desktop_url) formData.set('prev_bg_desktop', initialData.bg_desktop_url)
        if (initialData.svg_headline_url) formData.set('prev_svg_headline', initialData.svg_headline_url)

        // New Files
        if (files.bg_mobile) formData.set('bg_mobile', files.bg_mobile, 'bg-mobile.jpg')
        if (files.bg_tablet) formData.set('bg_tablet', files.bg_tablet, 'bg-tablet.jpg')
        if (files.bg_desktop) formData.set('bg_desktop', files.bg_desktop, 'bg-desktop.jpg')
        if (files.svg_headline) formData.set('svg_headline', files.svg_headline)

        // Text Data
        formData.set('hero_text_h2', data.hero_text_h2 || '')
        formData.set('hero_text_p', data.hero_text_p || '')

        // Buttons JSON
        formData.set('cta_buttons', JSON.stringify(data.cta_buttons))

        startTransition(async () => {
            const res = await updateHomeAction(formData)
            if (!res.success) {
                toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
                return
            }
            toast({ title: 'Berhasil', description: 'Konfigurasi Home berhasil disimpan.' })
            router.refresh()
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">

            {/* Conditionally Render Component based on defaultTab */}
            {defaultTab === 'backgrounds' && (
                <HomeBackgroundUploader
                    initialUrls={{
                        mobile: initialData.bg_mobile_url,
                        tablet: initialData.bg_tablet_url,
                        desktop: initialData.bg_desktop_url
                    }}
                    onFileChange={(type, blob) => setFiles(prev => ({ ...prev, [type]: blob }))}
                />
            )}

            {defaultTab === 'content' && (
                <HomeTextForm
                    initialData={{
                        hero_text_h2: data.hero_text_h2,
                        hero_text_p: data.hero_text_p,
                        svg_headline_url: data.svg_headline_url
                    }}
                    onDataChange={(field, val) => setData(prev => ({ ...prev, [field]: val }))}
                    onFileChange={(file) => setFiles(prev => ({ ...prev, svg_headline: file }))}
                />
            )}

            {defaultTab === 'buttons' && (
                <HomeButtonsEditor
                    buttons={data.cta_buttons}
                    onChange={(newButtons) => setData(prev => ({ ...prev, cta_buttons: newButtons }))}
                />
            )}

            {/* Action Bar - Fixed Bottom or Inline? DetailForm has it inline. Let's keep it inline/bottom of form */}
            <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/10 mt-8">
                <Button
                    type="submit"
                    className="rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover shadow-lg shadow-brand-500/20 h-10 w-32 transition-colors duration-200"
                    disabled={isPending}
                >
                    {isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                    variant="ghost"
                    type="button"
                    disabled={isPending}
                    onClick={() => router.refresh()} // Reset form
                    className="glass-card rounded-2xl h-10 w-32 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
                >
                    Batal
                </Button>
            </div>
        </form>
    )
}
