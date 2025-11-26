import * as z from "zod";

export const vendorFormSchema = z.object({
    // Step 1: Role & Basic Info
    role: z.enum(["company", "individual"], {
        required_error: "Please select a role.",
    }),
    picName: z.string().min(2, "Name must be at least 2 characters."),
    picEmail: z.string().email("Invalid email address."),
    picPhone: z.string().min(10, "Phone number must be at least 10 digits."),
    picPosition: z.string().optional(), // Required only if role is company

    // Step 2A: Company Details
    companyName: z.string().optional(),
    companyAddressStreet: z.string().optional(),
    companyAddressCity: z.string().optional(),
    companyAddressProvince: z.string().optional(),
    companyAddressCountry: z.string().optional(),
    companyEmail: z.string().email("Invalid email address.").optional(),
    companyPhone: z.string().optional(),
    nibNumber: z.string().optional(),

    // Step 2B: Individual Details
    individualName: z.string().optional(),
    individualAddressStreet: z.string().optional(),
    individualAddressCity: z.string().optional(),
    individualAddressProvince: z.string().optional(),
    individualAddressCountry: z.string().optional(),
    individualEmail: z.string().email("Invalid email address.").optional(),
    individualEmailAlt: z.string().email("Invalid email address.").optional().or(z.literal("")),
    individualPhone: z.string().optional(),

    // Step 3: Specialization & Docs
    specializations: z.array(z.string()).min(1, "Select at least one specialization."),
    specializationOther: z.string().optional(),

    // File URLs (strings returned from upload)
    nibDocument: z.string().optional(),
    companyProfileDocument: z.string().optional(),
    portfolioDocument: z.string().optional(),
    invoiceDocument: z.string().optional(),

    // Step 4: Finance
    bankName: z.string().min(1, "Bank name is required."),
    bankNameOther: z.string().optional(),
    bankAccountNumber: z.string().min(1, "Account number is required."),
    bankAccountHolder: z.string().min(1, "Account holder name is required."),
    npwpNumber: z.string().min(1, "NPWP is required."),
    pkpStatus: z.enum(["pkp", "non_pkp"]).optional(),

    // File URLs
    npwpDocument: z.string().min(1, "NPWP document is required."),
    ktpDocument: z.string().min(1, "KTP document is required."),
    pkpDocument: z.string().optional(),

    // Step 5: NDA
    ndaDocument: z.string().min(1, "Signed NDA is required."),
}).superRefine((data, ctx) => {
    // Conditional Validation for Company
    if (data.role === "company") {
        if (!data.picPosition) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Position is required for company representative.",
                path: ["picPosition"],
            });
        }
        if (!data.companyName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Company name is required.",
                path: ["companyName"],
            });
        }
        if (!data.companyAddressStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street address is required.", path: ["companyAddressStreet"] });
        if (!data.companyAddressCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required.", path: ["companyAddressCity"] });
        if (!data.companyAddressProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province is required.", path: ["companyAddressProvince"] });
        if (!data.companyAddressCountry) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Country is required.", path: ["companyAddressCountry"] });
        if (!data.companyEmail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company email is required.", path: ["companyEmail"] });
        if (!data.companyPhone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company phone is required.", path: ["companyPhone"] });
        if (!data.nibNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIB number is required.", path: ["nibNumber"] });
        if (!data.nibDocument) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIB document is required.", path: ["nibDocument"] });
        if (!data.companyProfileDocument) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company profile is required.", path: ["companyProfileDocument"] });
        if (!data.pkpStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PKP status is required.", path: ["pkpStatus"] });
        if (data.pkpStatus === "pkp" && !data.pkpDocument) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PKP document is required.", path: ["pkpDocument"] });
        } else if (data.pkpStatus === "non_pkp" && !data.pkpDocument) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Non-PKP letter is required.", path: ["pkpDocument"] });
        }
    }

    // Conditional Validation for Individual
    if (data.role === "individual") {
        if (!data.individualName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Full name is required.", path: ["individualName"] });
        if (!data.individualAddressStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street address is required.", path: ["individualAddressStreet"] });
        if (!data.individualAddressCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required.", path: ["individualAddressCity"] });
        if (!data.individualAddressProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province is required.", path: ["individualAddressProvince"] });
        if (!data.individualAddressCountry) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Country is required.", path: ["individualAddressCountry"] });
        if (!data.individualEmail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is required.", path: ["individualEmail"] });
        if (!data.individualPhone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required.", path: ["individualPhone"] });
        if (!data.portfolioDocument) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Portfolio is required.", path: ["portfolioDocument"] });
    }

    // Common Conditional
    if (data.specializations.includes("Lain Lain") && !data.specializationOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify other specialization.", path: ["specializationOther"] });
    }
    if (data.bankName === "Bank Lain" && !data.bankNameOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify other bank name.", path: ["bankNameOther"] });
    }
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
