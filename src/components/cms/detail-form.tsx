'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { deleteDetailAction, upsertDetailAction } from '@/app/cms/actions'
import type { CMSPageStatus } from '@/components/setting/page-status-badge'

interface DetailFormProps {
  pageSlug: string
  pageLabel: string
  itemSlug: string
  position: number
  existing?: {
    id?: string
    title?: string
    paragraphs?: string[]
    imageUrl?: string | null
    altText?: string | null
    status?: CMSPageStatus
  } | null
}

const STATUS_OPTIONS: CMSPageStatus[] = ['draft', 'review', 'published', 'archived']

export function DetailForm({ pageSlug, pageLabel, itemSlug, position, existing }: DetailFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(existing?.imageUrl ?? null)
  const [hasNewFile, setHasNewFile] = useState(false)
  const [status, setStatus] = useState<CMSPageStatus>(existing?.status ?? 'draft')

  const paragraphsValue = (existing?.paragraphs || []).join('\n')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('pageSlug', pageSlug)
    formData.set('itemSlug', itemSlug)
    formData.set('position', String(position))
    formData.set('status', status)
    formData.set('existingImageUrl', existing?.imageUrl ?? '')

    startTransition(async () => {
      const res = await upsertDetailAction(formData)
      if (!res.success) {
        toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Detail disimpan', description: `${pageLabel} / ${itemSlug} diperbarui` })
      router.push(`/cms/${pageSlug}/detail`)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!existing?.id) return
    startTransition(async () => {
      const res = await deleteDetailAction(existing.id!, existing.imageUrl || undefined, pageSlug)
      if (!res.success) {
        toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Detail dihapus', description: `${pageLabel} / ${itemSlug} direset ke fallback` })
      router.push(`/cms/${pageSlug}/detail`)
      router.refresh()
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" name="title" defaultValue={existing?.title ?? ''} required disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="paragraphs">Paragraf (satu per baris)</Label>
            <Textarea
              id="paragraphs"
              name="paragraphs"
              defaultValue={paragraphsValue}
              rows={8}
              required
              disabled={isPending}
              placeholder="Tulis paragraf, satu per baris"
            />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as CMSPageStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="file">Gambar detail (opsional)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              disabled={isPending}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setHasNewFile(true)
                  const url = URL.createObjectURL(file)
                  setPreview(url)
                } else {
                  setHasNewFile(false)
                  setPreview(existing?.imageUrl ?? null)
                }
              }}
            />
            {existing?.imageUrl && <p className="text-xs text-muted-foreground break-words">Gambar saat ini: {existing.imageUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="altText">Alt text {hasNewFile ? '(wajib karena upload baru)' : '(disarankan)'}</Label>
            <Input
              id="altText"
              name="altText"
              defaultValue={existing?.altText ?? ''}
              placeholder="Deskripsi singkat gambar"
              disabled={isPending}
              required={hasNewFile}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-background-900/60 p-4">
            {preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image src={preview} alt={existing?.title ?? 'Preview'} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Belum ada gambar
              </div>
            )}
          </div>
        </div>
      </div>
      <input type="hidden" name="pageSlug" value={pageSlug} />
      <input type="hidden" name="itemSlug" value={itemSlug} />
      <input type="hidden" name="position" value={position} />
      <input type="hidden" name="existingImageUrl" value={existing?.imageUrl ?? ''} />
      <div className="flex items-center gap-3">
        {existing?.id && (
          <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
            Hapus detail
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(`/cms/${pageSlug}/detail`)}>
          Batal
        </Button>
      </div>
    </form>
  )
}
