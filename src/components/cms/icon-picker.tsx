'use client'

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface IconPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (iconName: string) => void
    currentIcon?: string
}

export function IconPicker({ open, onOpenChange, onSelect, currentIcon }: IconPickerProps) {
    const [search, setSearch] = useState('')

    // Get all icon names from lucide-react
    const allIconNames = useMemo(() => {
        // Lucide exports icons in pairs: 'Home' and 'HomeIcon'
        // We want the base names (without 'Icon' suffix)
        const iconNames = Object.keys(LucideIcons)
            .filter(key => {
                // Skip if ends with 'Icon' (we want base names)
                if (key.endsWith('Icon')) return false

                // Skip utility exports
                if (key === 'icons' || key === 'default' || key.startsWith('create')) return false

                // Only include if it's a valid icon component (object with $$typeof)
                const value = (LucideIcons as any)[key]
                if (!value || typeof value !== 'object') return false

                // Must start with uppercase letter (React component convention)
                return key.charAt(0) === key.charAt(0).toUpperCase()
            })
            .sort()

        console.log('[IconPicker] Total icons loaded:', iconNames.length)
        console.log('[IconPicker] First 20:', iconNames.slice(0, 20))

        return iconNames
    }, [])

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!search.trim()) return allIconNames
        const searchLower = search.toLowerCase()
        return allIconNames.filter(name =>
            name.toLowerCase().includes(searchLower)
        )
    }, [search, allIconNames])

    const handleSelect = (iconName: string) => {
        onSelect(iconName)
        onOpenChange(false)
        setSearch('') // Reset search when closing
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] bg-background-900 border border-white/10">
                <DialogHeader>
                    <DialogTitle>Pilih Icon</DialogTitle>
                    <DialogDescription>
                        Cari dan pilih icon dari {allIconNames.length} Lucide icons yang tersedia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <Input
                        placeholder="Cari icon... (contoh: user, home, star)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background-800/50"
                        autoFocus
                    />

                    {/* Icon Grid */}
                    <ScrollArea className="h-[400px] w-full rounded-md border border-white/10 bg-background-800/30 p-4">
                        {filteredIcons.length > 0 ? (
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1">
                                {filteredIcons.map((iconName) => {
                                    // Access the base icon component (without 'Icon' suffix)
                                    // E.g., 'Home' not 'HomeIcon'
                                    const IconComponent = (LucideIcons as any)[iconName]
                                    const isSelected = iconName === currentIcon

                                    if (!IconComponent) return null

                                    return (
                                        <button
                                            key={iconName}
                                            onClick={() => handleSelect(iconName)}
                                            className={`
                                                flex items-center justify-center p-2 rounded-lg 
                                                transition-all duration-200 hover:bg-white/20 hover:scale-110
                                                ${isSelected ? 'bg-brand-500/30 border-2 border-brand-400' : 'border border-white/5 bg-white/5'}
                                            `}
                                            title={iconName}
                                            type="button"
                                        >
                                            <IconComponent size={20} />
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Tidak ada icon yang cocok dengan &quot;{search}&quot;
                            </div>
                        )}
                    </ScrollArea>

                    {/* Info Footer */}
                    <div className="text-xs text-muted-foreground text-center">
                        Menampilkan {filteredIcons.length} dari {allIconNames.length} icons
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
