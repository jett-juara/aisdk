## Analisis Masalah
- Avatar terlihat keluar ke kanan dari batas tombol saat collapsed karena:
  - Lebar kolom collapsed (`--sidebar-width-icon`) masih terlalu sempit untuk menampung tombol + padding wrapper.
  - Wrapper footer (`SidebarMenu`) punya `p-2` yang memberi offset horizontal.
  - `SidebarMenuItem` tidak memusatkan tombol; `SidebarMenuButton` membawa `justify-between` yang tidak ideal saat collapsed.

## Rencana Perbaikan
1. Lebarkan kolom collapsed sedikit
- Ubah `SIDEBAR_WIDTH_ICON` dari `4rem` → `4.25rem` di `src/components/ui/sidebar.tsx` untuk ekstra ruang.

2. Nolkan padding wrapper footer saat collapsed
- `src/components/dashboard/sidebar/sidebar-footer.tsx`
  - Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:px-0` pada `SidebarMenu` (sudah ada untuk px-0, dipertahankan).

3. Pusatkan tombol di container item saat collapsed
- Tambahkan pada `SidebarMenuItem` collapsed-only:
  - `group-data-[collapsible=icon]:group-data-[state=collapsed]:flex`
  - `group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center`

4. Jadikan tombol benar-benar kotak dan center
- `SidebarMenuButton` collapsed-only:
  - Tambahkan `group-data-[collapsible=icon]:group-data-[state=collapsed]:size-9` (w-9 h-9) agar avatar h-6 punya ruang + padding simetris.
  - Pertahankan `px-0`, `mx-auto`, `justify-center`, `items-center`.
  - Simetris padding internal: `pl-1 pr-1` collapsed-only.

5. Validasi
- Jalankan `npm run type-check` dan `npm run lint`.
- Visual check: avatar h-6 w-6 berada tepat di tengah tombol, tidak keluar batas. 

## Scope
- `src/components/ui/sidebar.tsx` (konstanta lebar)
- `src/components/dashboard/sidebar/sidebar-footer.tsx` (kelas Tailwind untuk `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`)

## Output
- Collapsed: avatar center-center tanpa overflow, padding kiri/kanan avatar terhadap tepi tombol simetris. Expanded: tanpa efek samping.