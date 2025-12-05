'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { upsertHeroGridAction } from '@/app/cms/actions'
import { useToast } from '@/hooks/use-toast'
import { type CmsPageSlug, CMS_HERO_ASPECT_RATIOS } from '@/lib/cms/config'
import { ImageCropper } from './image-cropper'

export interface HeroGridItem {
  id?: string
  page_slug: string
  section: string
  slug: string
  label: string
  label_line_1: string | null
  label_line_2: string | null
  icon_name: string | null
  image_url: string | null
  image_position: 'left' | 'right' | null
  position: number
}

interface HeroFormProps {
  pageSlug: CmsPageSlug
  pageLabel: string
  section: string
  item: HeroGridItem | null
  nextPosition: number
}

export function HeroForm({ pageSlug, pageLabel, section, item, nextPosition }: HeroFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(item?.image_url || null)

  // Cropper States
  const [cropOpen, setCropOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)

  const isNew = !item
  const position = item?.position ?? nextPosition
  const requiredRatioConfig = CMS_HERO_ASPECT_RATIOS[pageSlug]?.[position]

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('pageSlug', pageSlug)
        formData.set('section', section)
        formData.set('position', String(position))
        formData.set('existingImageUrl', item?.image_url ?? '')
        if (item?.id) formData.set('id', item.id)

        // If we have a cropped image, use it instead of the original file input
        if (croppedBlob) {
          formData.delete('file') // Remove the original file input
          formData.append('file', croppedBlob, 'hero-image.jpg')
        }

        startTransition(async () => {
          const res = await upsertHeroGridAction(formData)
          if (!res.success) {
            toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
            return
          }
          toast({ title: 'Hero disimpan', description: `${pageLabel} hero berhasil diperbarui` })
          router.push(`/cms/${pageSlug}/hero`)
          router.refresh()
        })
      }}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6 h-full">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" defaultValue={item?.label} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={item?.slug ?? `${pageSlug}-${position}`}
              required
              disabled={!isNew}
            />
            {!isNew && <p className="text-xs text-muted-foreground">Slug tidak diubah pada mode edit.</p>}
            {!isNew && <input type="hidden" name="slug" value={item?.slug ?? ''} />}
          </div>

          {/* Layout Position Guide */}
          <div className="flex flex-col gap-2 flex-1">
            <Label>Posisi di Grid</Label>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex-1 flex flex-col min-h-[400px]">
              <div className="grid grid-cols-2 gap-6 flex-1">
                {/* Desktop Layout */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground text-center">Desktop</p>
                  <div
                    className={`grid ${pageSlug === 'collaboration' ? 'grid-cols-2' : 'grid-cols-3'} ${pageSlug === 'product' ? 'gap-x-2 gap-y-2 content-start' : 'gap-2'} min-h-[280px]`}
                    style={
                      pageSlug === 'product'
                        ? { gridAutoRows: 'auto' }
                        : pageSlug === 'collaboration'
                          ? { gridAutoRows: 'minmax(120px, auto)' }
                          : { gridAutoRows: 'minmax(60px, 1fr)' }
                    }
                  >
                    {(pageSlug === 'product'
                      ? [1, 2, 3, 4, 5, 6]
                      : pageSlug === 'collaboration'
                        ? [1, 2]
                        : [1, 2, 3, 4]
                    ).map((pos) => {
                      const isCurrentPos = pos === position
                      let gridClass = ''
                      if (pageSlug === 'product') {
                        // Product: 6 items - ALL SQUARE 1:1, 3x2 grid
                        if (pos === 1) gridClass = 'col-span-1 row-start-1 col-start-1'
                        else if (pos === 2) gridClass = 'col-span-1 row-start-1 col-start-2'
                        else if (pos === 3) gridClass = 'col-span-1 row-start-1 col-start-3'
                        else if (pos === 4) gridClass = 'col-span-1 row-start-2 col-start-1'
                        else if (pos === 5) gridClass = 'col-span-1 row-start-2 col-start-2'
                        else if (pos === 6) gridClass = 'col-span-1 row-start-2 col-start-3'
                      } else if (pageSlug === 'collaboration') {
                        // Collaboration: 2 items - tall portrait pillars
                        if (pos === 1) gridClass = 'col-start-1 row-start-1'
                        else if (pos === 2) gridClass = 'col-start-2 row-start-1'
                      } else {
                        // About/Services/Collaboration: 4 items
                        if (pos === 1) gridClass = 'col-span-2 row-span-2'
                        else if (pos === 2) gridClass = 'col-start-3 row-span-2'
                        else if (pos === 3) gridClass = 'col-start-1 row-start-3'
                        else if (pos === 4) gridClass = 'col-span-2 col-start-2 row-start-3'
                      }
                      return (
                        <div
                          key={pos}
                          className={`${gridClass} ${pageSlug === 'product' ? 'aspect-square' : pageSlug === 'collaboration' ? 'aspect-[3/5]' : ''} rounded border ${isCurrentPos ? 'bg-brand-500/50 border-brand-400' : 'bg-white/15 border-white/20'} flex items-center justify-center text-xs font-medium ${isCurrentPos ? 'text-brand-200' : 'text-text-200'}`}
                        >
                          {pos}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* Mobile Layout */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground text-center">Mobile</p>
                  <div className="grid grid-cols-2 gap-2 auto-rows-min">
                    {(pageSlug === 'product'
                      ? [1, 2, 3, 4, 5, 6]
                      : pageSlug === 'collaboration'
                        ? [1, 2]
                        : [1, 2, 3, 4]
                    ).map((pos) => {
                      const isCurrentPos = pos === position
                      let gridClass = ''
                      let styleProps: React.CSSProperties = {}

                      if (pageSlug === 'product') {
                        // Product mobile: ALL SQUARE 1:1, 2x3 grid
                        if (pos === 1) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 2) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 3) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 4) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 5) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 6) {
                          gridClass = 'col-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        }
                      } else if (pageSlug === 'collaboration') {
                        // Collaboration mobile: 2 items, portrait pillars
                        gridClass = 'col-span-1'
                        styleProps = { aspectRatio: '3 / 5' }
                      } else {
                        // About/Services/Collaboration mobile
                        if (pos === 1) {
                          gridClass = 'col-start-1 row-span-1'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 2) {
                          gridClass = 'col-start-2 row-span-2 h-full'
                          styleProps = {} // h-full for alignment
                        } else if (pos === 3) {
                          gridClass = 'col-start-1 row-start-2'
                          styleProps = { aspectRatio: '1 / 1' }
                        } else if (pos === 4) {
                          gridClass = 'col-span-2 row-start-3'
                          styleProps = { aspectRatio: '2 / 1' }
                        }
                      }
                      return (
                        <div
                          key={pos}
                          className={`${gridClass} rounded border ${isCurrentPos ? 'bg-brand-500/50 border-brand-400' : 'bg-white/15 border-white/20'} flex items-center justify-center text-xs font-medium ${isCurrentPos ? 'text-brand-200' : 'text-text-200'}`}
                          style={styleProps}
                        >
                          {pos}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Gambar ini akan tampil di posisi <span className="text-brand-300 font-semibold">{position}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Upload Gambar Hero</Label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)

                  if (requiredRatioConfig) {
                    // Open Cropper
                    setPendingFile(url)
                    setCropOpen(true)
                  } else {
                    // Direct Preview (No mandatory crop)
                    setPreview(url)
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => document.getElementById('file')?.click()}
              className="glass-card rounded-2xl h-10 w-full text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
            >
              Upload
            </Button>
            {requiredRatioConfig && (
              <p className="text-xs font-medium text-blue-400 mt-1">
                Akan dicrop ke rasio: {requiredRatioConfig.label}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            {preview ? (
              <div className="flex flex-col gap-3">
                <div
                  className="relative w-full overflow-hidden rounded-lg"
                  style={{
                    aspectRatio: requiredRatioConfig ? requiredRatioConfig.ratio : 16 / 9
                  }}
                >
                  <Image src={preview} alt={item?.label ?? 'Preview'} fill className="object-cover" />
                </div>
                {requiredRatioConfig && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPendingFile(preview)
                      setCropOpen(true)
                    }}
                    className="glass-card rounded-2xl h-10 w-full text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
                  >
                    Edit / Crop Ulang
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Belum ada gambar
              </div>
            )}
          </div>
          <input type="hidden" name="position" value={position} />
          <input type="hidden" name="pageSlug" value={pageSlug} />
          <input type="hidden" name="section" value={section} />
        </div>
      </div>

      {requiredRatioConfig && pendingFile && (
        <ImageCropper
          open={cropOpen}
          onOpenChange={(open) => {
            setCropOpen(open)
            if (!open && !croppedBlob) {
              setPendingFile(null)
              const fileInput = document.getElementById('file') as HTMLInputElement
              if (fileInput) fileInput.value = ''
            }
          }}
          imageSrc={pendingFile}
          aspect={requiredRatioConfig.ratio}
          onCropComplete={(blob) => {
            setCroppedBlob(blob)
            const url = URL.createObjectURL(blob)
            setPreview(url)
          }}
        />
      )}

      <div className="flex items-center justify-center gap-6 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover shadow-lg shadow-brand-500/20 h-10 w-32 transition-colors duration-200"
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/cms/${pageSlug}/hero`)}
          className="glass-card rounded-2xl h-10 w-32 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
        >
          Batal
        </Button>
      </div>
    </form >
  )
}
