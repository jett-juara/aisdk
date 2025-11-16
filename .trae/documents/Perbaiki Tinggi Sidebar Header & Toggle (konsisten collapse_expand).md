## Target
- Header sidebar tinggi tetap, tidak berubah saat collapsed/expanded.
- Container tombol "Toggle Sidebar" tinggi tetap, tidak berubah saat collapsed/expanded.
- Hilangkan efek garis pembatas memotong baris toggle dengan penataan jarak yang stabil.

## Perubahan Teknis
1. Header Sidebar (src/components/dashboard/sidebar/sidebar-header.tsx)
- Pastikan tinggi fixed: tambah `overflow-hidden` pada container header dan `items-center h-full` pada wrapper konten agar vertikal stabil.
- Rapikan divider: ubah pembatas menjadi bagian dari header dengan margin yang konsisten supaya tidak menindih baris pertama konten.

2. Komponen Sidebar Menu Button (global)
- Lokasi: src/components/ui/sidebar.tsx, bagian `sidebarMenuButtonVariants`.
- Hapus rule yang mengubah tinggi saat collapsed: `group-data-[collapsible=icon]:group-data-[state=collapsed]:!h-11` dan padding paksa `!px-4`.
- Tetapkan tinggi konsisten untuk semua menu button (termasuk toggle), misal `h-9` sebagai standar.
- Pertahankan behavior menyembunyikan label saat collapsed, tanpa mempengaruhi tinggi.

3. Toggle Sidebar (src/components/dashboard/sidebar/nav-main.tsx)
- Pastikan tombol toggle menggunakan tinggi standar (mengandalkan perubahan di step #2). Tidak perlu class khusus per-item.

## Verifikasi
- Jalankan `npm run type-check` dan `npm run lint` untuk memastikan tidak ada error TS/lint.
- Jalankan dev server dan cek manual: tinggi header tetap 64px (`h-16`), tinggi toggle tetap ~36px (`h-9`) pada dua state.
- Ambil screenshot bukti: state expanded vs collapsed menunjukkan tinggi identik.

## Catatan Nilai Tetap
- Header: `h-16` (64px) sebagai baseline.
- Menu button: `h-9` (~36px) untuk semua item, termasuk toggle.

## Pertanyaan
- Setuju dengan nilai `h-16` untuk header dan `h-9` untuk tombol? Jika ingin angka lain, sebutkan preferensi lo sebelum gue eksekusi.