'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
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
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        {/* 1. Pengelolaan Gambar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-base font-semibold">Pengelolaan Gambar</Label>
            <div className="rounded-xl border border-white/10 bg-background-900/60 p-6 space-y-4">
              <div className="grid md:grid-cols-[240px_1fr] gap-6">
                {/* Preview Area */}
                <div className="relative aspect-video w-full md:w-60 overflow-hidden rounded-lg border border-white/5 bg-black/20">
                  {preview ? (
                    <Image src={preview} alt={existing?.title ?? 'Preview'} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="file" className="text-xs uppercase tracking-wider text-text-400">Upload Image</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      disabled={isPending}
                      className="bg-background-800/50"
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
                    {existing?.imageUrl && <p className="text-xs text-muted-foreground break-words mt-1">Current: {existing.imageUrl}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="altText" className="text-xs uppercase tracking-wider text-text-400">
                      Alt Text {hasNewFile ? '(Required)' : ''}
                    </Label>
                    <Input
                      id="altText"
                      name="altText"
                      defaultValue={existing?.altText ?? ''}
                      placeholder="Deskripsi singkat gambar"
                      disabled={isPending}
                      required={hasNewFile}
                      className="bg-background-800/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Pengelolaan Teks */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Pengelolaan Teks</Label>
          <div className="space-y-4 rounded-xl border border-white/10 bg-background-900/60 p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-text-400">Judul</Label>
              <Input id="title" name="title" defaultValue={existing?.title ?? ''} required disabled={isPending} className="bg-background-800/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paragraphs" className="text-xs uppercase tracking-wider text-text-400">Paragraf (satu per baris)</Label>
              <Textarea
                id="paragraphs"
                name="paragraphs"
                defaultValue={paragraphsValue}
                rows={6}
                required
                disabled={isPending}
                placeholder="Tulis paragraf, satu per baris"
                className="bg-background-800/50"
              />
            </div>
          </div>
        </div>

        {/* 3. Status */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Status</Label>
          <div className="rounded-xl border border-white/10 bg-background-900/60 p-6">
            <Select value={status} onValueChange={(val) => setStatus(val as CMSPageStatus)}>
              <SelectTrigger className="bg-background-800/50 w-full md:w-1/3">
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
      </div>

      <input type="hidden" name="pageSlug" value={pageSlug} />
      <input type="hidden" name="itemSlug" value={itemSlug} />
      <input type="hidden" name="position" value={position} />
      <input type="hidden" name="existingImageUrl" value={existing?.imageUrl ?? ''} />

      {/* Buttons: Center to content area */}
      <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/10">
        {/* Simpan - Sidebar Overview Active Style */}
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover shadow-lg shadow-brand-500/20 h-10 w-32 transition-colors duration-200"
        >
          {isPending ? '...' : 'Simpan'}
        </Button>

        {/* Batal - Hero47 Glass Card Style (Rectangle) */}
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.push(`/cms/${pageSlug}/detail`)}
          className="glass-card rounded-2xl h-10 w-32 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
        >
          Batal
        </Button>

        {/* Hapus - Hero47 Glass Card Style (Rectangle) */}
        {existing?.id && (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={handleDelete}
            className="glass-card rounded-2xl h-10 w-32 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
            title="Hapus detail"
          >
            Hapus
          </Button>
        )}
      </div>
    </form>
  )
}
