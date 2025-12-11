"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { Vendor } from "@/lib/collaboration/types";
import { updateVendorProfile } from "@/lib/collaboration/actions";
import { toast } from "sonner";

// Define a simple schema for Contact Info update
const contactSchema = z.object({
    email: z.string().email(),
    phone: z.string().min(10),
    // Address fields could be added but let's keep it simple for MVP
});

interface EditContactDialogProps {
    vendor: Vendor;
}

export function EditContactDialog({ vendor }: EditContactDialogProps) {
    const [open, setOpen] = useState(false);
    const isCompany = vendor.type === 'company';

    const form = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            email: isCompany ? vendor.company_email : vendor.individual_email,
            phone: isCompany ? vendor.company_phone : vendor.individual_phone,
        }
    });

    const onSubmit = async (values: any) => {
        try {
            const updates: Partial<Vendor> = {};
            if (isCompany) {
                updates.company_email = values.email;
                updates.company_phone = values.phone;
            } else {
                updates.individual_email = values.email;
                updates.individual_phone = values.phone;
            }

            const result = await updateVendorProfile(vendor.id, updates);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Contact info updated successfully");
                setOpen(false);
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Contact Information</DialogTitle>
                    <DialogDescription>
                        Update your email and phone number.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
