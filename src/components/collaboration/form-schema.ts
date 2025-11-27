import * as z from "zod";

export const vendorFormSchema = z.object({
    // Step 1: Role & Basic Info
    role: z.enum(["company", "individual"]).optional(),
    picName: z.string().optional(),
    picEmail: z.string().optional(),
    picPhone: z.string().optional(),
    picEmailAlt: z.string().optional(),
    picPosition: z.string().optional(),

    // Step 2A: Company Details
    companyName: z.string().optional(),
    companyAddressStreet: z.string().optional(),
    companyAddressCity: z.string().optional(),
    companyAddressProvince: z.string().optional(),
    companyAddressCountry: z.string().optional(),
    companyEmail: z.string().optional(),
    companyPhone: z.string().optional(),
    nibNumber: z.string().optional(),

    // Step 2B: Individual Details
    individualName: z.string().optional(),
    individualAddressStreet: z.string().optional(),
    individualAddressCity: z.string().optional(),
    individualAddressProvince: z.string().optional(),
    individualAddressCountry: z.string().optional(),
    individualEmail: z.string().optional(),
    individualEmailAlt: z.string().optional(),
    individualPhone: z.string().optional(),

    // Step 3: Specialization & Docs
    specializations: z.array(z.string()).optional(),
    specializationOther: z.string().optional(),

    // File URLs (strings returned from upload)
    nibDocument: z.string().optional(),
    companyProfileDocument: z.string().optional(),
    portfolioDocument: z.string().optional(),
    invoiceDocument: z.string().optional(),

    // Step 4: Finance
    bankName: z.string().min(1, "Bank name is required"),
    bankNameOther: z.string().optional(),
    bankAccountNumber: z.string().min(1, "Account number is required"),
    bankAccountHolder: z.string().min(1, "Account holder name is required"),
    npwpNumber: z.string().min(1, "NPWP number is required"),
    pkpStatus: z.enum(["pkp", "non_pkp"]).optional(),

    // File URLs
    npwpDocument: z.string().optional(),
    ktpDocument: z.string().optional(),
    pkpDocument: z.string().optional(),

    // Step 5: NDA
    ndaDocument: z.string().optional(),
}).superRefine((data, ctx) => {
    // Conditional Validation for "Lain Lain" specialization
    if (data.specializations?.includes("Lain Lain") && !data.specializationOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify other specialization.", path: ["specializationOther"] });
    }

    // Conditional Validation for "Bank Lain"
    if (data.bankName === "Bank Lain" && !data.bankNameOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify other bank name.", path: ["bankNameOther"] });
    }
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
