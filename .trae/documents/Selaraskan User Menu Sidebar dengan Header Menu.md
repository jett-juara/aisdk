## Tujuan
- Menyamakan tampilan dan perilaku user menu di sidebar dengan user menu di header (desktop), termasuk avatar, tipografi, warna, spacing, dan dropdown.

## Referensi Desain (Sumber Konsistensi)
- Komponen acuan: `src/components/layout/header/header-menu.tsx`
  - Trigger: Button dengan kelas `font-button` + `bg-button-primary`, `text-text-50`, `hover/active` tokens
  - Avatar: `Avatar` + `AvatarFallback` (ikon SVG `user`) ukuran h-8 w-8
  - Chevron: `ChevronDown` rotasi saat open
  - Dropdown: `DropdownMenuContent` `bg-background-900` + `border-border-900`, item `min-h-[44px]`, separator `bg-border-800`
  - Item urutan: `Dashboard` → Separator → `Logout`

## Perubahan yang Diusulkan
1. Trigger (SidebarMenuButton)
- Terapkan kelas konsisten:
  - Struktur: `group h-11 justify-between font-button font-medium text-sm px-4 overflow-hidden transition-all duration-200 tracking-wide`
  - Warna: `bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none`
- Collapsed behavior:
  - Tetap memakai aturan hide untuk teks dan chevron saat `state=collapsed`
  - Pusatkan konten (ikon avatar) saat collapsed (selaras aturan global di `sidebar.tsx`)

2. Avatar
- Ganti avatar gradient custom menjadi `Avatar` + `AvatarFallback`
- Ukuran:
  - Expanded: `h-8 w-8`
  - Collapsed: `h-6 w-6`
- Fallback isi: SVG user ala header-menu (warna mengikuti tokens)

3. Teks Nama + Email
- Teks nama: `text-sm` dengan truncate bila lebar terbatas
- Teks email: `text-xs text-text-200`
- Sembunyikan saat collapsed (tetap)

4. ChevronDown
- Ukuran: `h-4 w-4`
- Rotasi saat open: `group-data-[state=open]:rotate-180`
- Sembunyikan saat collapsed

5. DropdownMenuContent
- Gunakan lebar mengikuti trigger:
  - `className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background-900 border-border-900 p-0"`
- Isi item:
  - Group: `Dashboard` (`/dashboard`) – ikon `LayoutDashboard`, teks `font-button font-medium text-sm`, padding `px-3 py-2`, min height `min-h-[44px]`
  - Separator: `bg-border-800`
  - Item: `Logout` – ikon `LogOut` atau `Loader2` saat logging, teks `font-button font-medium text-sm`
- Event handler: `onSelect` untuk logout sesuai implementasi sekarang

6. Aksesibilitas & Detail
- `aria-label` pada trigger tetap
- Pastikan `DropdownMenuTrigger asChild` dipertahankan
- Pastikan tidak ada console statements

7. Implementasi Teknis
- File yang diubah: `src/components/dashboard/sidebar/sidebar-footer.tsx`
- Impor baru: `Avatar, AvatarFallback` dari `@/components/ui/avatar`
- Hapus impor/kelas yang tidak dipakai (gradient custom avatar, kelas lama yang tidak konsisten)

8. Pengujian & Validasi
- Jalankan `npm run type-check` (pastikan nol error)
- Jalankan `npm run lint` (pastikan nol error)
- Manual QA (dev server):
  - Expanded: tampil avatar bulat h-8 w-8 + nama/email + chevron; dropdown gaya sama dengan header
  - Collapsed: hanya avatar kecil h-6 w-6 (center), chevron & teks tersembunyi; klik membuka dropdown dengan posisi dan gaya konsisten
  - Logging out: ikon berubah ke `Loader2`, teks `Keluar...`
  - Dark theme kontras sesuai tokens

## Opsional (Jika Disetujui)
- Tambahkan item `Profil` di dropdown (link `/dashboard/profile`) di atas `Dashboard` bila dibutuhkan; default meniru header (Dashboard + Logout)
- Sinkronkan bahasa label ("Logout" → "Keluar") bila ingin sepenuhnya Bahasa Indonesia.

## Risiko & Mitigasi
- Risiko perbedaan ukuran/spacing antar layout: mitigasi dengan menggunakan kelas persis dari header-menu.
- Risiko lebar dropdown tidak sesuai: gunakan `w-[var(--radix-dropdown-menu-trigger-width)]` agar menyamai trigger.

## Output Akhir
- Sidebar user menu yang tampak dan berperilaku sama dengan user menu di header: tipografi, warna, avatar, dropdown, dan interaksi konsisten; tetap responsif untuk collapsed/expanded.