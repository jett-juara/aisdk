import * as z from "zod";

export const projectSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    client_name: z.string().optional(),
    budget: z.coerce.number().min(0, "Budget cannot be negative").optional(),
    currency: z.string().default("IDR"),
    status: z.enum(["draft", "open", "closed", "awarded", "cancelled"]).default("open"),
    requirements: z.array(z.string()).default([]),
    deadline: z.string().optional(), // ISO date string
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
