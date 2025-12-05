'use client'

import { useMemo, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { deleteDetailAction } from '@/app/cms/actions'
import { AlertTriangle, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DetailItemAdmin {
  id: string
  page_slug: string
  item_slug: string
  title: string
  paragraphs: string[]
  image_url: string | null
  alt_text: string | null
  status: 'draft' | 'review' | 'published' | 'archived'
  position: number
}

interface DetailConfig {
  pageSlug: string
  itemSlug: string
  label: string
  position: number
}

interface DetailSectionEditorProps {
  pageSlug: string
  label: string
  items: DetailItemAdmin[]
  config: DetailConfig[]
}

export function DetailSectionEditor({ pageSlug, label, items, config }: DetailSectionEditorProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const mapped = useMemo(() => {
    const bySlug = new Map(items.map((i) => [i.item_slug, i]))
    return config.map((cfg) => ({
      cfg,
      data: bySlug.get(cfg.itemSlug) || null,
    }))
  }, [items, config])

  const handleDelete = (id?: string | null, imageUrl?: string | null) => {
    if (!id) return
    startTransition(async () => {
      const res = await deleteDetailAction(id, imageUrl || undefined, pageSlug)
      if (!res.success) {
        toast({ title: 'Gagal hapus', description: res.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Detail dihapus', description: 'Detail direset ke fallback' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-background-800/70 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-1" />
        <div className="text-sm text-text-200">
          Detail Content memuat state 2 (setelah tile diklik). Pastikan gambar detail berbeda dari gambar hero grid, alt text wajib saat upload, dan minimal satu paragraf.
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mapped.map(({ cfg, data }) => (
          <div key={cfg.itemSlug} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-300">{label} / {cfg.label}</p>
                <h3 className="text-lg font-semibold text-text-50">{data?.title || 'Belum diisi'}</h3>
              </div>
              <Badge variant={data ? 'default' : 'secondary'}>
                {data ? data.status : 'fallback'}
              </Badge>
            </div>
            <div className="text-sm text-text-300 flex flex-col gap-1">
              <span>Paragraf: {data?.paragraphs?.length || 0}</span>
              <span>Gambar: {data?.image_url ? 'Ada' : 'Belum ada'}</span>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/cms/${cfg.pageSlug}/detail/edit/${cfg.itemSlug}`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
              {data?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(data.id, data.image_url)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
