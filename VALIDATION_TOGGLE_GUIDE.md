# Panduan Toggle Validasi Form Collaboration Wizard

Dokumen ini berfungsi sebagai context refresher untuk mematikan (disable) dan menghidupkan kembali (enable) validasi pada form wizard kolaborasi (`src/components/collaboration/form-schema.ts`).

**Tujuan:** Memudahkan proses styling dan desain UI tanpa terhalang oleh kewajiban mengisi field form.

## 1. Cara Mematikan Validasi (Mode Desain)

Untuk membebaskan form agar bisa navigasi "Next" tanpa isi data, modifikasi file:
`src/components/collaboration/form-schema.ts`

### Langkah A: Ubah Schema menjadi Optional
Ubah definisi field yang wajib (`.min()`, `.email()`, `.enum()`) menjadi `.optional()`.

```typescript
// SEBELUM (Strict):
export const vendorFormSchema = z.object({
    role: z.enum(["company", "individual"], { required_error: "..." }),
    picName: z.string().min(2, "..."),
    // ...
});

// SESUDAH (Loose):
export const vendorFormSchema = z.object({
    role: z.enum(["company", "individual"]).optional(), // atau z.string().optional()
    picName: z.string().optional(),
    // ... ubah semua field menjadi .optional()
});
```

### Langkah B: Matikan Logic `superRefine`
Comment seluruh blok `.superRefine` di bagian bawah schema. Blok ini berisi validasi kondisional (misal: jika role Company, maka Company Name wajib).

```typescript
// ... akhir z.object

// COMMENT BLOK INI:
// .superRefine((data, ctx) => {
//     if (data.role === "company") {
//         ...
//     }
// });
```

---

## 2. Cara Mengembalikan Validasi (Mode Produksi)

Setelah proses desain selesai, validasi **WAJIB** dikembalikan ke kondisi semula.

### Opsi 1: Git Revert (Disarankan)
Jika Anda belum melakukan commit pada file ini selama proses desain, cukup discard changes:
```bash
git checkout src/components/collaboration/form-schema.ts
```

### Opsi 2: Manual Revert
Jika Opsi 1 tidak memungkinkan, kembalikan kode secara manual:

1.  **Uncomment** blok `.superRefine`.
2.  **Hapus** `.optional()` pada field-field wajib.
3.  **Pasang kembali** validator seperti `.min(1)`, `.email()`, dan `.enum(...)`.

**Checklist Revert:**
- [ ] `role` harus enum & required.
- [ ] `picName`, `picEmail`, `picPhone` harus required/valid format.
- [ ] Blok `.superRefine` aktif kembali untuk validasi conditional (Company vs Individual).
