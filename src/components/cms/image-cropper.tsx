'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import getCroppedImg from '@/lib/cms/crop-image'

interface ImageCropperProps {
    imageSrc: string
    aspect: number // Ratio, e.g. 1, 16/9, 4/3
    open: boolean
    onOpenChange: (open: boolean) => void
    onCropComplete: (croppedBlob: Blob) => void
}

export function ImageCropper({ imageSrc, aspect, open, onOpenChange, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [loading, setLoading] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!croppedAreaPixels) return
        setLoading(true)
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
                onOpenChange(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-background-900 border border-white/10 bg-background-900 border border-white/10">
                <DialogHeader>
                    <DialogTitle>Sesuaikan Gambar</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[400px] bg-black/5 rounded-md overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div className="py-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <Label>Zoom</Label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setZoom(val[0])}
                            className="w-full"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="glass-card rounded-2xl h-10 w-28 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover shadow-lg shadow-brand-500/20 h-10 w-36 transition-colors duration-200"
                    >
                        {loading ? 'Memproses...' : 'Terapkan Crop'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
