'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { upsertDetailAction, deleteDetailAction } from '@/app/cms/actions'
import { AlertTriangle } from 'lucide-react'

interface DetailEditDialogProps {
  pageSlug: string
  itemSlug: string
  label: string
  position: number
  existing?: {
    id: string
    title: string
    paragraphs: string[]
    imageUrl?: string | null
    altText?: string | null
    status: string
  } | null
  onUpdated?: () => void
}

export function DetailEditDialog({ pageSlug, itemSlug, label, position, existing, onUpdated }: DetailEditDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await upsertDetailAction(formData)
      if (!result.success) {
        toast({ title: 'Gagal menyimpan', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Detail disimpan', description: `${label} berhasil diperbarui` })
      setOpen(false)
      setFile(null)
      onUpdated?.()
    })
  }

  const handleDelete = () => {
    if (!existing?.id) return
    startTransition(async () => {
      const result = await deleteDetailAction(existing.id, existing.imageUrl || undefined, pageSlug)
      if (!result.success) {
        toast({ title: 'Gagal menghapus', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Detail dihapus', description: `${label} direset ke fallback` })
      setOpen(false)
      setFile(null)
      onUpdated?.()
    })
  }

  const paragraphsValue = (existing?.paragraphs || []).join('\n')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Detail: {label}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-amber-600/50 bg-amber-900/20 p-3 text-sm text-amber-100 flex gap-2">
          <AlertTriangle className="h-4 w-4" />
          <div>
            Pastikan gambar detail berbeda dari gambar hero grid. Alt text wajib jika mengunggah gambar. Minimal satu paragraf.
          </div>
        </div>

        <form
          action={(formData) => handleSubmit(formData)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="pageSlug" value={pageSlug} />
          <input type="hidden" name="itemSlug" value={itemSlug} />
          <input type="hidden" name="position" value={position} />
          <input type="hidden" name="status" value={existing?.status || 'draft'} />
          <input type="hidden" name="existingImageUrl" value={existing?.imageUrl || ''} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-200">Judul</label>
            <Input name="title" defaultValue={existing?.title || ''} required disabled={isPending} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-200">Paragraf (satu per baris)</label>
            <Textarea
              name="paragraphs"
              defaultValue={paragraphsValue}
              placeholder="Tulis paragraf, satu baris per paragraf"
              rows={8}
              disabled={isPending}
              required
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-200">Gambar detail (opsional)</label>
              <Input
                name="file"
                type="file"
                accept="image/*"
                disabled={isPending}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {existing?.imageUrl && (
                <p className="text-xs text-text-300 break-words">Gambar saat ini: {existing.imageUrl}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-200">Alt text {file ? '(wajib karena upload baru)' : '(disarankan)'}</label>
              <Input
                name="altText"
                defaultValue={existing?.altText || ''}
                placeholder="Deskripsi singkat gambar"
                disabled={isPending}
                required={!!file}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            {existing?.id ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                Hapus detail
              </Button>
            ) : <div />}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
