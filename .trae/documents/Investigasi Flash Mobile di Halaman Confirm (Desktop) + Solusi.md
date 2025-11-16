**Temuan Utama**

* Halaman adalah client component: `src/app/auth/confirm/page.tsx:1`.

* Menggunakan `Suspense` dengan fallback yang berisi UI lengkap untuk mobile dan desktop: `src/app/auth/confirm/page.tsx:90-121`.

* Di fallback, bagian mobile dibungkus `lg:hidden` dan desktop dibungkus `hidden lg:block`. Saat CSS Tailwind belum ter-apply sesaat di awal, kelas utilitas seperti `hidden`/`lg:hidden` belum bekerja → markup mobile sempat tampak di desktop (FOUC).

* Konten utama (`ConfirmContent`) membutuhkan `useSearchParams` hanya untuk side effect `fetch('/api/admin/invitations/accept')` saat query `invited` terdeteksi: `src/app/auth/confirm/page.tsx:14-20`. Ini tidak perlu memblok UI via Suspense.

**Akar Masalah**

* Fallback Suspense yang berisi UI responsif lengkap memunculkan FOUC di desktop, karena CSS responsif belum aktif beberapa waktu di initial paint.

**Solusi Terbaik (urut prioritas)**

1. Hilangkan `Suspense` atau gunakan fallback minimal yang tidak mengandung UI mobile/desktop.

   * `ConfirmContent` tidak me-render async data; `useSearchParams` tidak perlu Suspense. Cukup render konten utama tanpa Suspense.

   * Jika tetap ingin fallback, pakai `fallback={null}` atau skeleton kecil tanpa elemen mobile (`lg:hidden`).

   * Dampak: menghilangkan flash, tanpa mengubah UX inti.

2. Refactor menjadi server component + client child untuk efek undangan.

   * Jadikan `ConfirmPage` server component (hapus `'use client'` di file root), render UI responsif secara SSR.

   * Buat child kecil `InvitationEffect` (client) yang hanya menjalankan efek `useSearchParams` dan `fetch`.

   * Dampak: UI desktop sudah final dari SSR, tidak ada fallback client yang bisa mem-flash konten mobile.

3. Force-hide mobile dengan inline style default.

   * Jika fallback harus ada, bungkus konten mobile dengan `style={{ display: 'none' }}` lalu toggle visibilitas via CSS setelah load (lebih rumit dan kurang idiomatik).

   * Tidak direkomendasikan dibanding opsi 1/2.

**Verifikasi**

* Jalankan pada viewport desktop dan amati initial paint: tidak

