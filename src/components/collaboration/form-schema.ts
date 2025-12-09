import * as z from "zod";

export const vendorFormSchema = z.object({
    // Step 1: Role & Basic Info
    role: z.enum(["company", "individual"], { required_error: "Pilih peran Anda" }),
    picName: z.string().min(2, "Nama PIC minimal 2 karakter"),
    picEmail: z.string().email("Format email tidak valid"),
    picPhone: z.string().min(10, "Nomor telepon minimal 10 digit"),
    picEmailAlt: z.string().email("Format email tidak valid").optional().or(z.literal("")),
    picPosition: z.string().min(1, "Posisi wajib diisi"),

    // Step 2A: Company Details (Validated within superRefine if role is company)
    companyName: z.string().optional(),
    companyAddressStreet: z.string().optional(),
    companyAddressCity: z.string().optional(),
    companyAddressProvince: z.string().optional(),
    companyAddressCountry: z.string().optional(),
    companyEmail: z.string().optional(),
    companyPhone: z.string().optional(),
    nibNumber: z.string().optional(),

    // Step 2B: Individual Details (Validated within superRefine if role is individual)
    individualName: z.string().optional(),
    individualAddressStreet: z.string().optional(),
    individualAddressCity: z.string().optional(),
    individualAddressProvince: z.string().optional(),
    individualAddressCountry: z.string().optional(),
    individualEmail: z.string().optional(),
    individualEmailAlt: z.string().optional(),
    individualPhone: z.string().optional(),

    // Step 3: Specialization & Docs
    specializations: z.array(z.string()).min(1, "Pilih minimal satu spesialisasi"),
    specializationOther: z.string().optional(),

    // File URLs
    nibDocument: z.string().optional(),
    companyProfileDocument: z.string().optional(),
    portfolioDocument: z.string().optional(),
    invoiceDocument: z.string().optional(),

    // Step 4: Finance
    bankName: z.string().min(1, "Pilih nama bank"),
    bankNameOther: z.string().optional(),
    bankAccountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
    bankAccountHolder: z.string().min(1, "Nama pemilik rekening wajib diisi"),
    npwpNumber: z.string().min(15, "Nomor NPWP wajib diisi"),
    pkpStatus: z.enum(["pkp", "non_pkp"], { required_error: "Status PKP wajib dipilih" }),

    // File URLs
    npwpDocument: z.string().optional(),
    ktpDocument: z.string().optional(),
    pkpDocument: z.string().optional(),

    // Step 5: NDA
    ndaDocument: z.string().optional(),

    // Step 6: Review
    termsAccepted: z.boolean().refine(val => val === true, "Anda harus menyetujui syarat & ketentuan"),
}).superRefine((data, ctx) => {
    // 1. Role Based Validation
    if (data.role === 'company') {
        if (!data.companyName) ctx.addIssue({ path: ['companyName'], message: "Nama perusahaan wajib diisi", code: "custom" });
        if (!data.companyAddressStreet) ctx.addIssue({ path: ['companyAddressStreet'], message: "Alamat wajib diisi", code: "custom" });
        if (!data.companyAddressCity) ctx.addIssue({ path: ['companyAddressCity'], message: "Kota wajib diisi", code: "custom" });
        if (!data.companyAddressProvince) ctx.addIssue({ path: ['companyAddressProvince'], message: "Provinsi wajib diisi", code: "custom" });
        if (!data.companyAddressCountry) ctx.addIssue({ path: ['companyAddressCountry'], message: "Negara wajib diisi", code: "custom" });
        if (!data.companyEmail) ctx.addIssue({ path: ['companyEmail'], message: "Email perusahaan wajib diisi", code: "custom" });
        if (!data.companyPhone) ctx.addIssue({ path: ['companyPhone'], message: "Telepon perusahaan wajib diisi", code: "custom" });
        if (!data.nibNumber) ctx.addIssue({ path: ['nibNumber'], message: "Nomor NIB wajib diisi", code: "custom" });
    }

    if (data.role === 'individual') {
        if (!data.individualName) ctx.addIssue({ path: ['individualName'], message: "Nama lengkap wajib diisi", code: "custom" });
        if (!data.individualAddressStreet) ctx.addIssue({ path: ['individualAddressStreet'], message: "Alamat wajib diisi", code: "custom" });
        if (!data.individualAddressCity) ctx.addIssue({ path: ['individualAddressCity'], message: "Kota wajib diisi", code: "custom" });
        if (!data.individualAddressProvince) ctx.addIssue({ path: ['individualAddressProvince'], message: "Provinsi wajib diisi", code: "custom" });
        if (!data.individualAddressCountry) ctx.addIssue({ path: ['individualAddressCountry'], message: "Negara wajib diisi", code: "custom" });
        if (!data.individualEmail) ctx.addIssue({ path: ['individualEmail'], message: "Email wajib diisi", code: "custom" });
        if (!data.individualPhone) ctx.addIssue({ path: ['individualPhone'], message: "Nomor telepon wajib diisi", code: "custom" });
    }

    // 2. Conditional Validation for "Lain Lain" specialization
    if (data.specializations?.includes("Lain Lain") && !data.specializationOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spesialisasi lain wajib diisi", path: ["specializationOther"] });
    }

    // 3. Conditional Validation for "Bank Lain"
    if (data.bankName === "Bank Lain" && !data.bankNameOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama bank lain wajib diisi", path: ["bankNameOther"] });
    }
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
