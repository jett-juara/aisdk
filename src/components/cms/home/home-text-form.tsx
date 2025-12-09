'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface HomeTextFormProps {
    initialData: {
        hero_text_h2: string | null
        hero_text_p: string | null
        svg_headline_url: string | null
    }
    onDataChange: (field: 'hero_text_h2' | 'hero_text_p', value: string) => void
    onFileChange: (file: File | null) => void // for SVG
}

export function HomeTextForm({ initialData, onDataChange, onFileChange }: HomeTextFormProps) {
    const [previewSvg, setPreviewSvg] = useState<string | null>(initialData.svg_headline_url)
    const [hasNewFile, setHasNewFile] = useState(false)

    const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setHasNewFile(true)
            setPreviewSvg(URL.createObjectURL(file))
            onFileChange(file)
        }
    }

    return (
        <div className="flex flex-col gap-6">

            {/* 1. Pengelolaan Gambar (SVG) */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Pengelolaan Gambar (Headline SVG)</Label>
                    <div className="rounded-xl border border-white/10 bg-background-900 p-6 space-y-4">
                        <div className="grid md:grid-cols-[240px_1fr] gap-6">
                            {/* Preview Area */}
                            <div className="relative aspect-video w-full md:w-60 overflow-hidden rounded-lg border border-white/5 bg-black/20 flex items-center justify-center p-2">
                                {previewSvg ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previewSvg} alt="SVG Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No SVG
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <input
                                        id="svg-upload"
                                        type="file"
                                        accept=".svg"
                                        className="hidden"
                                        onChange={handleSvgChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => document.getElementById('svg-upload')?.click()}
                                        className="glass-card rounded-2xl h-10 w-full text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
                                    >
                                        Upload SVG
                                    </Button>
                                    <p className="text-xs text-muted-foreground break-words mt-6 text-center">
                                        Format: .svg (Transparent Background)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Pengelolaan Teks */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Pengelolaan Teks</Label>
                <div className="space-y-4 rounded-xl border border-white/10 bg-background-900 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="h2" className="text-xs uppercase tracking-wider text-text-400">Headline (H2)</Label>
                        <Textarea
                            id="h2"
                            placeholder="We are forged by..."
                            defaultValue={initialData.hero_text_h2 ?? ''}
                            onChange={(e) => onDataChange('hero_text_h2', e.target.value)}
                            rows={3}
                            className="bg-background-800/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="p" className="text-xs uppercase tracking-wider text-text-400">Description (P)</Label>
                        <Textarea
                            id="p"
                            placeholder="Meet JETT..."
                            defaultValue={initialData.hero_text_p ?? ''}
                            onChange={(e) => onDataChange('hero_text_p', e.target.value)}
                            rows={4}
                            className="bg-background-800/50"
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}
