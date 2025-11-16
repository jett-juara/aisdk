## Tujuan
- Pindahkan/override styling navigasi sidebar (padding, margin, text, warna, font) langsung di `src/components/dashboard/sidebar/nav-main.tsx`, bukan bergantung default shadcn.
- Konsisten di dua state: collapsed dan expanded.

## Implementasi
1. Label Grup (`SidebarGroupLabel`)
- Tambah `className` yang menetapkan tipografi dan warna: `h-8 px-2 text-xs font-medium text-sidebar-foreground/70`.
- Pertahankan selector collapsed yang sudah ada.

2. Tombol Menu Utama (`SidebarMenuButton`)
- Override `className` untuk semua tombol (toggle dan item): `h-9 p-2 text-sm text-text-50`.
- Tambah aturan collapsed scoped di nav-main: `group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center px-0 gap-0`.
- Pastikan ikon `h-4 w-4` konsisten.

3. Submenu (`SidebarMenuSubButton`)
- Override `className`: `h-7 px-2 text-sm text-sidebar-foreground`.
- Biarkan hide saat collapsed via selector yang sudah ada.

4. Menu List (`SidebarMenu`)
- Pastikan jarak antar item tetap (`gap-1` default) dan sesuai separator yang sudah ditambah; tidak merusak spacing.

## Verifikasi
- Jalankan `type-check` dan `lint` untuk memastikan tidak ada error.
- Cek secara visual: warna/spacing/typografi pada label dan item mengikuti override di nav-main.

## Catatan
- Tidak mengubah token di `globals.css`; hanya override di nav-main.

## Pertanyaan
- Font family untuk item nav lo mau `font-heading` atau biarin `font-sans` default? Jika ada preferensi, gue sesuaikan setelah implementasi awal.