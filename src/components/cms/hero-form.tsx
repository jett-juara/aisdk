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
import type { CmsPageSlug } from '@/lib/cms/config'

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
  const [imagePosition, setImagePosition] = useState<string>(item?.image_position ?? 'right')

  const isNew = !item
  const position = item?.position ?? nextPosition

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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" defaultValue={item?.label} required />
          </div>
          <div className="space-y-1">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="labelLine1">Label Line 1</Label>
              <Input id="labelLine1" name="labelLine1" defaultValue={item?.label_line_1 ?? ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="labelLine2">Label Line 2</Label>
              <Input id="labelLine2" name="labelLine2" defaultValue={item?.label_line_2 ?? ''} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="iconName">Icon Name (lucide)</Label>
            <Input id="iconName" name="iconName" defaultValue={item?.icon_name ?? ''} />
          </div>
          <div className="space-y-1">
            <Label>Image Position</Label>
            <Select
              value={imagePosition}
              onValueChange={(val) => setImagePosition(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih posisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="imagePosition" value={imagePosition} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="file">Gambar Hero</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreview(url)
                }
              }}
            />
            {isNew && <p className="text-xs text-muted-foreground">Wajib unggah gambar untuk item baru.</p>}
            {!isNew && <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak mengganti gambar.</p>}
          </div>
          <div className="rounded-xl border border-white/10 bg-background-900/60 p-4">
            {preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image src={preview} alt={item?.label ?? 'Preview'} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Belum ada gambar
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Opsional: catatan internal"
              className="h-20"
            />
          </div>
          <input type="hidden" name="position" value={position} />
          <input type="hidden" name="pageSlug" value={pageSlug} />
          <input type="hidden" name="section" value={section} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(`/cms/${pageSlug}/hero`)}>
          Batal
        </Button>
      </div>
    </form>
  )
}
