## Tujuan
- Buat halaman publik `/product-services` yang rapi dan siap pakai dengan dua bagian: Hero dan Content.
- Tidak mengubah isi/implementasi komponen sumber; hanya compose di page.
- Tersambung dari main menu “Product & Services”.

## Konteks & Temuan
- Link menu sudah ada dan mengarah ke `/product-services`: `src/components/layout/header/config.ts:11–15`.
- Halaman sudah ada namun isinya berbeda: `src/app/product-services/page.tsx` saat ini merender `Hero47 + ProductsSection + ServicesSection`.
- Komponen referensi sudah tersedia di codebase:
  - Hero: `src/components/blocks/hero47.tsx` (sama dengan template hero) 
  - Content: `src/components/blocks/compliance1.tsx` (sama dengan template content)

## Rencana Perubahan File
- Modifikasi 1 file: `src/app/product-services/page.tsx`.

## Implementasi
1. Ganti isi page agar hanya merender:
   - `<Hero47 />` (boleh pakai props ringan untuk heading/subheading/cta, tanpa ubah file komponen)
   - Anchor target untuk tombol sekunder: `<div id="services" />`
   - `<Compliance1 />`
2. Hapus import dan pemanggilan `ProductsSection` dan `ServicesSection` agar fokus ke dua blok yang diminta.
3. Pastikan import:
   - `import { Hero47 } from "@/components/blocks/hero47"`
   - `import { Compliance1 } from "@/components/blocks/compliance1"`
4. Opsional agar “solid”: set props minimal di `Hero47` supaya copy relevan (tanpa mengubah file komponen), contoh:
   - `heading="Product"`, `subheading=" & Services"`
   - `description` bisa reuse yang ada sekarang (kalau mau) atau default
   - `buttons.secondary.url="#services"` supaya scroll ke section

## Verifikasi
- Jalankan `npm run type-check` dan `npm run build` untuk pastikan TS dan build bersih.
- Buka `/product-services` lewat menu utama dan cek:
  - Hero tampil sesuai
  - Klik tombol sekunder mengarah ke section (anchor `#services` berfungsi)
  - Content (Compliance) tampil utuh dengan styling shadcn/ui.

## Catatan Kompatibilitas
- Tidak ada perubahan di menu: sudah benar mengarah ke `/product-services`.
- Tidak menyentuh file di `.references/`; gunakan komponen yang sudah ada di `src/components/blocks/`.

## Pertanyaan Singkat
1. Lo setuju kita mengganti konten halaman `/product-services` yang ada sekarang dengan komposisi Hero + Compliance sesuai permintaan?
2. Untuk teks di `Hero47`, mau pakai default atau pakai teks sederhana: `heading="Product"`, `subheading=" & Services"`? 
3. Anchor tombol sekunder oke memakai `#services` (gue tambahin `<div id="services" />` sebelum `<Compliance1 />`)?