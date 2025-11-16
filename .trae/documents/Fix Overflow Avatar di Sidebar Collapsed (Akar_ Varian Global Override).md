## Akar Masalah
- Kelas varian global `sidebarMenuButtonVariants` di `src/components/ui/sidebar.tsx:519` masih memaksa ukuran tombol saat collapsed: `group-data-[collapsible=icon]:group-data-[state=collapsed]:!size-8` dan padding `!p-2`. Ini OVERRIDE kelas yang gue tambahkan di footer, sehingga tombol tetap 32px + padding yang bikin avatar (24px) terlihat keluar ke kanan.
- Wrapper footer (`SidebarMenu`) punya `p-2`, memberi offset horizontal, makin memperparah kesan geser.

## Rencana Perbaikan
1. Update varian global tombol di collapsed
- File: `src/components/ui/sidebar.tsx` (blok `sidebarMenuButtonVariants`)
- Ganti aturan collapsed:
  - `!size-8` → `!size-9` (36px) agar memberi ruang cukup untuk avatar 24px + padding simetris
  - `!p-2` → `!p-0` (biar konten tepat di tengah kotak)
  - Tambah `group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center items-center` (atau `grid place-items-center`) untuk centering konten tombol secara pasti

2. Simetris & pusatkan wrapper/footer di collapsed
- File: `src/components/dashboard/sidebar/sidebar-footer.tsx`
  - `SidebarMenu`: pertahankan `group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0`
  - `SidebarMenuItem`: pastikan `group-data-[collapsible=icon]:group-data-[state=collapsed]:flex justify-center` (sudah ditambahkan, cek tetap)
  - `SidebarMenuButton`: pertahankan `mx-auto`, `justify-center`, `items-center`, `pl-1 pr-1` (collapsed-only) — ini akan berlaku setelah varian global tidak lagi meng-override

3. Lebar kolom collapsed
- File: `src/components/ui/sidebar.tsx`
  - Tetap di `SIDEBAR_WIDTH_ICON = "4.25rem"` untuk ruang aman

## Verifikasi
- `npm run type-check` dan `npm run lint`
- Visual QA (collapsed): avatar berada di tengah kotak tombol 36px, tidak ada bagian yang keluar; padding kanan/kiri avatar di dalam tombol simetris
- Expanded: tidak ada perubahan yang tidak diinginkan

## Catatan
- Perubahan di varian global diperlukan karena kelas per-komponen kalah oleh `!size-8`/`!p-2` yang bersifat override. Tanpa ini, penyesuaian di footer tidak punya efek.

## Siap Eksekusi
- Setelah lo setujui, gue akan update varian global di satu tempat, cek kembali footer kelas yang sudah ada, lalu verifikasi build/lint dan hasil visual.