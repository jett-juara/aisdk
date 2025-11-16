## Analisis Akurat
- Kolom collapsed memakai `--sidebar-width-icon` (saat ini 3.5rem). Dengan padding `p-2` di `SidebarMenu`, lebar efektif tinggal 2.5rem.
- Tombol collapsed berukuran `size-8` (2rem). Kombinasi padding wrapper + border kolom menyebabkan tombol bergeser optik ke kanan, sehingga avatar (h-6 w-6) tampak keluar dari batas tombol.
- `mx-auto` di tombol dan konten sudah ada, namun offset berasal dari padding wrapper dan lebar kolom yang sempit.

## Rencana Perbaikan Presisi
1. Lebarkan kolom collapsed
- Ubah `SIDEBAR_WIDTH_ICON` dari `3.5rem` → `4rem` di `src/components/ui/sidebar.tsx` agar memberi ruang aman untuk padding dan tombol.

2. Samakan padding kiri/kanan wrapper di collapsed
- Hapus padding sisi pada wrapper footer saat collapsed agar pusat geometris akurat:
  - Tambah kelas pada `SidebarMenu` di `src/components/dashboard/sidebar/sidebar-footer.tsx`:
    - `group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0`

3. Tambahkan padding internal simetris pada tombol di collapsed
- Di `SidebarMenuButton` (file yang sama), tambahkan:
  - `group-data-[collapsible=icon]:group-data-[state=collapsed]:pl-1 group-data-[collapsible=icon]:group-data-[state=collapsed]:pr-1`
- Pertahankan `mx-auto`, `justify-center`, `items-center` untuk centering konten.

4. Verifikasi & QA
- `npm run type-check` dan `npm run lint` harus lulus.
- Visual check:
  - Collapsed: avatar berada tepat di tengah tombol, jarak kiri/kanan avatar terhadap tepi tombol simetris; tidak ada bagian avatar yang keluar.
  - Expanded: tidak ada perubahan visual yang tidak diinginkan.

## Scope Perubahan
- `src/components/ui/sidebar.tsx` (ubah konstanta `SIDEBAR_WIDTH_ICON`)
- `src/components/dashboard/sidebar/sidebar-footer.tsx` (kelas `SidebarMenu` dan `SidebarMenuButton` untuk collapsed-only)

## Catatan
- Jika setelah ini masih terlihat bias optik karena border sisi kolom, opsi tambahan: set tombol collapsed `w-9 h-9` (sedikit lebih besar) untuk kompensasi border, tapi default `size-8` + lebar kolom 4rem biasanya cukup.

## Siap Eksekusi
- Perubahan kecil, terisolasi, dan tidak memengaruhi komponen lain. Setelah disetujui, gue akan terapkan dua edit kelas di footer dan satu edit konstanta lebar kolom, lalu verifikasi build & lint dan kirim bukti visual/teknis.