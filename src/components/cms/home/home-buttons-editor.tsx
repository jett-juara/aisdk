'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
import type { HomeCtaButton } from '@/lib/cms/home-service'
import { IconPicker } from '@/components/cms/icon-picker'

interface HomeButtonsEditorProps {
    buttons: HomeCtaButton[]
    onChange: (buttons: HomeCtaButton[]) => void
}

export function HomeButtonsEditor({ buttons, onChange }: HomeButtonsEditorProps) {
    const [pickerState, setPickerState] = useState<{ open: boolean; index: number | null }>({
        open: false,
        index: null
    })

    const handleChange = (index: number, field: keyof HomeCtaButton, value: any) => {
        const newButtons = [...buttons]
        newButtons[index] = { ...newButtons[index], [field]: value }
        onChange(newButtons)
    }

    const openPicker = (index: number) => {
        setPickerState({ open: true, index })
    }

    const handleIconSelect = (iconName: string) => {
        if (pickerState.index !== null) {
            handleChange(pickerState.index, 'icon', iconName)
        }
        setPickerState({ open: false, index: null })
    }

    return (
        <div className="space-y-8">
            {buttons.map((btn, idx) => (
                <div key={btn.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Tombol #{idx + 1}: {btn.label}</Label>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Tampilkan</Label>
                            <Switch
                                checked={btn.is_active}
                                onCheckedChange={(checked) => handleChange(idx, 'is_active', checked)}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-background-900 p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-text-400">Label</Label>
                                <Input
                                    value={btn.label}
                                    onChange={(e) => handleChange(idx, 'label', e.target.value)}
                                    className="bg-background-800/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-text-400">Link Destinasi</Label>
                                <Input
                                    value={btn.href}
                                    onChange={(e) => handleChange(idx, 'href', e.target.value)}
                                    className="bg-background-800/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-text-400">Icon (Lucide React Name)</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    value={btn.icon}
                                    onChange={(e) => handleChange(idx, 'icon', e.target.value)}
                                    className="bg-background-800/50 flex-1"
                                    placeholder="Ketik nama atau klik tombol pilih"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => openPicker(idx)}
                                    className="glass-card rounded-xl h-10 px-4 text-text-50 hover:text-text-50 hover:bg-white/10 transition-all duration-500 ease-out hover:scale-105 border border-glass-border"
                                >
                                    Pilih Icon
                                </Button>
                                <div className="w-10 h-10 flex items-center justify-center rounded bg-white/10 border border-white/5">
                                    {(() => {
                                        const Icon = (LucideIcons as any)[btn.icon]
                                        return Icon ? <Icon size={20} /> : <span className="text-xs text-muted-foreground">?</span>
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                <p><strong>Note:</strong> Urutan tombol sesuai dengan tampilan di Home Page. Gunakan switch di kanan atas setiap kartu untuk menyembunyikan tombol.</p>
            </div>

            {/* Icon Picker Dialog */}
            <IconPicker
                open={pickerState.open}
                onOpenChange={(open) => setPickerState({ open, index: pickerState.index })}
                onSelect={handleIconSelect}
                currentIcon={pickerState.index !== null ? buttons[pickerState.index]?.icon : undefined}
            />
        </div>
    )
}
