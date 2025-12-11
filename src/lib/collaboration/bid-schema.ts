import { z } from "zod";

export const bidSchema = z.object({
    amount: z.coerce.number().min(1, "Bid amount must be greater than 0"),
    currency: z.string().min(1, "Currency is required").default("IDR"),
    proposal_document: z.any().optional(), // We'll handle file upload separately or as a specific object
    notes: z.string().optional(),
});

export type BidFormValues = z.infer<typeof bidSchema>;
