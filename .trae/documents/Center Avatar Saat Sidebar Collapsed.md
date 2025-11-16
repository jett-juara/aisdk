## Analisis Penyebab
- Tombol trigger (`SidebarMenuButton`) di footer memakai `justify-between` dan `h-11`, sementara variant global untuk collapsed (`icon`) memaksa ukuran `size-8` dan tidak mengubah alignment.
- Di footer, `SidebarMenuButton` tidak diberi `mx-auto` saat collapsed, sehingga tombol berukuran 2rem tetap menempel ke kiri container `SidebarMenu` (yang memiliki `p-2`).
- Container internal avatar sudah diberi `mx-auto`, namun itu hanya memusatkan konten di dalam tombol, bukan memusatkan tombol terhadap wrapper.

## Solusi Presisi
1. Pusatkan tombol terhadap wrapper saat collapsed
- Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:mx-auto` ke `SidebarMenuButton` agar seluruh tombol (berukuran 2rem) berada di tengah.

2. Atur alignment konten di dalam tombol saat collapsed
- Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center` dan `items-center` pada `SidebarMenuButton` untuk memastikan avatar center horizontal dan vertical.
- Tetap pertahankan `group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0` agar tidak ada padding yang menggeser konten.

3. Rapikan container internal avatar
- Pertahankan `group-data-[collapsible=icon]:group-data-[state=collapsed]:gap-0` dan `mx-auto` pada div konten.
- Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center` bila diperlukan.

4. Opsional (jika masih terlihat bergeser karena padding wrapper)
- Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0` pada `SidebarMenu` di footer untuk menghapus padding kiri/kanan saat collapsed (hanya jika titik pusat masih terasa meleset).

## Implementasi Teknis (Satu File)
- File: `src/components/dashboard/sidebar/sidebar-footer.tsx`
- Ubah kelas `SidebarMenuButton`:
  - Tambahkan: `group-data-[collapsible=icon]:group-data-[state=collapsed]:mx-auto group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center group-data-[collapsible=icon]:group-data-[state=collapsed]:items-center group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0`
- Pertahankan pengaturan kontainer internal avatar (`mx-auto`, `gap-0`) seperti yang sudah ada.
- Jangan mengubah variant global di `sidebar.tsx` untuk menghindari efek samping terhadap menu lain.

## Validasi
- `npm run type-check` → 0 error.
- `npm run lint` → 0 error.
- Visual check (collapsed): avatar berada tepat di tengah kolom; tidak menempel kiri/kanan dan center vertical.

## Catatan
- Jika setelah ini masih ada selisih optik karena border/padding parent group, terapkan langkah Opsional poin 4 untuk menyamakan referensi pusat kolom dengan tombol.

## Siap Eksekusi
- Perubahan hanya menyentuh kelas Tailwind pada `SidebarMenuButton` di footer. Tidak ada logika yang diubah, aman untuk diterapkan segera.