# CMS Detail Content – Task Plan

## Prinsip
- Data detail (state 2) dikelola via CMS, terpisah dari hero grid.
- Gambar detail wajib beda dari gambar hero grid; fallback pakai placeholder + ikon eksisting.
- Heading/paragraf di detail mempertahankan styling/hirarki sekarang.
- Role akses: admin/superadmin saja.
- Setiap task selesai wajib tulis report di `agent-os/specs/cms-details-page/implementation/` dan update `agent-os/specs/cms-details-page/log.md`.

## Phase 1 – Schema & Data Layer
**Task 1.1 – Tambah schema detail blocks**
- [x] Buat tabel `cms_detail_blocks` (id, page_slug, item_slug, title, paragraphs jsonb, image_url, alt_text, status, position, timestamps).
- [x] RLS: public read hanya jika page published & block status published; admin/superadmin full write.
- [x] Bucket/folder: `cms_marketing_images/detail/{page_slug}/{item_slug}/*`.
- [x] Report: simpan ringkasan di `implementation/task-1.1.md` dan update `log.md`.

**Task 1.2 – Seeder awal detail**
- [x] Seed detail per slug (About 4, Product 6, Services 4) dengan teks/placeholder yang sekarang.
- [x] Pastikan URL image detail beda dari hero grid; jika reuse placeholder, dokumentasikan.
- [x] Report: `implementation/task-1.2.md` + update `log.md`.

## Phase 2 – Read Layer & Types
**Task 2.1 – Helper pembaca detail**
- [x] Tambah `getDetailBlocks(pageSlug)` di `src/lib/cms/marketing.ts` (typed, return map/array dengan title, paragraphs[], imageUrl, altText, status filter).
- [x] Tambah tipe `DetailBlock` dan eksport untuk komponen.
- [x] Fallback: jika kosong, kembalikan [] dan biarkan komponen pakai fallback statis.
- [x] Report: `implementation/task-2.1.md` + update `log.md`.

## Phase 3 – Admin UI Detail
**Task 3.1 – Form edit detail per item**
- [x] Buat UI di `/cms` untuk detail: daftar item per page dengan edit dialog (title, paragraphs textarea → disimpan sebagai array, image upload alt text wajib).
- [x] Validasi: peringatkan jika image sama dengan hero grid; alt text required; minimal satu paragraf.
- [x] Server actions untuk create/update/delete detail block + revalidate.
- [x] Report: `implementation/task-3.1.md` + update `log.md`.

**Task 3.2 – Navigasi & preview detail**
- [x] Tambah tab/section “Detail Content” di `/cms` per page (About/Product/Services/Collaboration).
- [ ] Opsional: tombol preview detail (gunakan route preview jika ada).
- [x] Report: `implementation/task-3.2.md` + update `log.md`.

## Phase 4 – Frontend Integration
**Task 4.1 – About detail integration**
- [x] Komponen Event/Community/Tech/Analytic terima `detailBlock`; render title/paragraphs dari CMS, fallback ke teks lama.
- [x] Gambar detail: pakai CMS jika ada; fallback placeholder + ikon lama.
- [x] Pastikan heading level tetap sama seperti sekarang.
- [x] Report: `implementation/task-4.1.md` + update `log.md`.

**Task 4.2 – Product detail integration**
- [x] Enam detail slug (audience-flow-management, creative-agency, event-activation, mice-event, music-concert-management, sport-event-management) ambil CMS detail.
- [x] Render title/paragraphs CMS; fallback teks lama; gambar detail dari CMS atau placeholder+ikon.
- [x] Report: `implementation/task-4.2.md` + update `log.md`.

**Task 4.3 – Services detail integration**
- [x] Empat slug (creative-and-plan-development, execution-handling, talent-and-logistic-management, local-authority-liaison) integrasi CMS detail.
- [x] Jaga heading/paragraf style existing; fallback aman.
- [x] Report: `implementation/task-4.3.md` + update `log.md`.

**Task 4.4 – Collaboration detail (jika ada)**
- [x] Evaluasi kebutuhan detail state; jika ada, sambungkan CMS detail dengan fallback yang ada.
- [x] Report: `implementation/task-4.4.md` + update `log.md`.

## Phase 5 – QA & Docs
**Task 5.1 – Validasi & lint**
- [ ] Lint, type-check, dan minimal smoke test halaman About/Product/Services/CMS.
- [ ] Report: `implementation/task-5.1.md` + update `log.md`.

**Task 5.2 – Dokumentasi**
- [ ] Dokumen singkat: cara edit detail, format paragraphs, aturan image berbeda dari hero grid.
- [ ] Update `log.md` dan simpan ringkasan di `implementation/task-5.2.md`.
