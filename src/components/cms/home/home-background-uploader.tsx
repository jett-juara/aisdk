'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { ImageCropper } from '@/components/cms/image-cropper'
import { Upload, Pencil } from 'lucide-react'

interface HomeBackgroundUploaderProps {
    initialUrls: {
        mobile: string | null
        tablet: string | null
        desktop: string | null
    }
    onFileChange: (type: 'bg_mobile' | 'bg_tablet' | 'bg_desktop', file: Blob | null) => void
}

export function HomeBackgroundUploader({ initialUrls, onFileChange }: HomeBackgroundUploaderProps) {
    const [previews, setPreviews] = useState(initialUrls)
    const [cropState, setCropState] = useState<{
        open: boolean
        file: string | null
        type: 'bg_mobile' | 'bg_tablet' | 'bg_desktop' | null
        aspect: number
    }>({
        open: false,
        file: null,
        type: null,
        aspect: 1,
    })

    // Pending file trigger (to open cropper)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg_mobile' | 'bg_tablet' | 'bg_desktop', aspect: number) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setCropState({
                open: true,
                file: url,
                type,
                aspect,
            })
            e.target.value = ''
        }
    }

    const handleCropComplete = (blob: Blob) => {
        if (cropState.type) {
            const url = URL.createObjectURL(blob)
            setPreviews(prev => ({ ...prev, [cropState.type!.replace('bg_', '')]: url }))
            onFileChange(cropState.type, blob)
            setCropState(prev => ({ ...prev, open: false, file: null, type: null }))
        }
    }

    // New Unified Card Render
    const renderDeviceCard = (
        type: 'bg_mobile' | 'bg_tablet' | 'bg_desktop',
        label: string,
        aspect: number,
        aspectLabel: string,
        previewUrl: string | null
    ) => {
        return (
            <div key={type} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <Label className="font-medium text-base">{label}</Label>
                    <span className="text-[10px] tracking-wider text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/10 uppercase font-mono">
                        Rasio {aspectLabel}
                    </span>
                </div>

                {/* Interactive Card */}
                <div
                    className="group relative w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:shadow-black/20"
                    style={{ aspectRatio: 1 }}
                    onClick={() => document.getElementById(`file-${type}`)?.click()}
                >
                    {previewUrl ? (
                        <>
                            <Image
                                src={previewUrl}
                                alt={label}
                                fill
                                className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                <div className="bg-white/10 p-3 rounded-full border border-white/20">
                                    <Pencil size={20} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Ganti Gambar</span>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-white transition-colors duration-300">
                            <div className="bg-white/5 p-4 rounded-full border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                                <Upload size={24} />
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-medium">Upload Image</span>
                                <span className="text-xs opacity-60">Format JPG/PNG</span>
                            </div>
                        </div>
                    )}

                    {/* Hidden Input */}
                    <input
                        type="file"
                        id={`file-${type}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, type, aspect)}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {renderDeviceCard('bg_mobile', 'Mobile', 9 / 16, '9:16', previews.mobile)}
                {renderDeviceCard('bg_tablet', 'Tablet', 3 / 4, '3:4', previews.tablet)}
                {renderDeviceCard('bg_desktop', 'Desktop', 16 / 10, '16:10', previews.desktop)}
            </div>

            {cropState.file && (
                <ImageCropper
                    open={cropState.open}
                    onOpenChange={(open) => {
                        if (!open) setCropState(prev => ({ ...prev, open: false, file: null }))
                    }}
                    imageSrc={cropState.file}
                    aspect={cropState.aspect}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    )
}
