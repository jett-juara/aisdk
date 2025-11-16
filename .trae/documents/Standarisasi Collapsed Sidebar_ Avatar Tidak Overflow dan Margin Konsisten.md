## Fakta Kode (akar masalah)
- Varian tombol collapsed di global (`src/components/ui/sidebar.tsx`) masih memaksa ukuran/padding: `group-data-[collapsible=icon]:!size-8` dan `!p-2`. Ini meng‑override kelas lokal di footer, menyebabkan avatar tampak keluar.
- Wrapper footer (`SidebarMenu`) berbeda padding antar state: expanded `p-2`, collapsed `px-0`, sehingga margin kiri–kanan tidak konsisten.

## Prinsip Desain Ideal
- Margin kiri–kanan konsisten antar state (expanded & collapsed) terhadap tepi sidebar.
- Tombol collapsed berbentuk kotak, konten grid‑center, avatar tidak overflow.

## Perubahan yang Diusulkan
1. Global variant (wajib agar lokal tidak kalah):
- Ubah rule collapsed untuk `sidebarMenuButtonVariants` di `src/components/ui/sidebar.tsx`:
  - Ganti `!size-8 !p-2` → `group-data-[collapsible=icon]:group-data-[state=collapsed]:size-9 p-0`
  - Tambah centering: `group-data-[collapsible=icon]:group-data-[state=collapsed]:grid place-items-center`
  - Tujuan: tombol 36px kotak, konten center sempurna, tanpa padding yang mendorong avatar keluar.

2. Konsistensi margin wrapper footer:
- `src/components/dashboard/sidebar/sidebar-footer.tsx`:
  - Samakan padding wrapper untuk kedua state: gunakan `p-2` (tanpa `px-0` saat collapsed)
  - Pusatkan tombol di item saat collapsed: `SidebarMenuItem` tambah `flex justify-center` collapsed‑only (agar tombol tersebar simetris).

3. Tombol & avatar di footer (collapsed‑only):
- `SidebarMenuButton` di footer:
  - Pertahankan `mx-auto`, hapus `pl/pr` tambahan; dengan tombol 36px dan avatar 24px, sisa ruang 12px terdistribusi simetris.
- Avatar:
  - Tetap `h-6 w-6` (24px).

4. Lebar kolom icon (opsi aman):
- Tetapkan `SIDEBAR_WIDTH_ICON` ke `4.25rem` (cukup untuk wrapper `p-2` + tombol 36px + margin simetris). Hanya jika perlu, naikkan ke `4.5rem`.

## Verifikasi
- Jalankan `npm run type-check` dan `npm run lint`.
- QA visual:
  - Collapsed: avatar berada di tengah kotak tombol, tidak overflow; margin kiri–kanan terhadap tepi tombol simetris; margin terhadap tepi sidebar konsisten dengan expanded.
  - Expanded: tampilan tidak berubah selain konsistensi margin.

## Dampak & Keamanan
- Perubahan di global variant memastikan semua menu collapsed (bukan hanya footer) patuh pada aturan baru yang konsisten.
- Perubahan lokal di footer hanya menyelaraskan wrapper/tombol dengan standar global.

## Siap Eksekusi
- Setelah konfirmasi, gue terapkan update di dua file: `src/components/ui/sidebar.tsx` (varian) dan `src/components/dashboard/sidebar/sidebar-footer.tsx` (padding wrapper & item/tombol).