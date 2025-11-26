"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorFormValues } from "./form-schema";
import { FileUpload } from "./file-upload";

const SPECIALIZATIONS = [
    "Security & Crowd Control",
    "Floor Team",
    "Logistic Team",
    "Talent Management Service",
    "Stage Show Management System",
    "Stage, Rigging, & Booth",
    "Advertising",
    "Catering",
    "General Affair",
    "Cleaning & Waste Management",
    "Communication Services",
    "Ground Transportation & Show",
    "Photographer & Videographer",
    "Designer 2D",
    "Dancer & Choreographers",
    "Designer 3D Motion Graphic",
    "Legal Services",
    "Lain Lain",
];

export function Step3Specialization() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const role = watch("role");
    const specializations = watch("specializations") || [];

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Expertise & Portfolio
                </h2>
                <p className="text-text-200 mt-2">
                    Tell us what you do best and show us your work.
                </p>
            </div>

            <div className="space-y-6">
                <FormField
                    control={control}
                    name="specializations"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Specializations</FormLabel>
                                <FormDescription>
                                    Select all that apply to your services.
                                </FormDescription>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SPECIALIZATIONS.map((item) => (
                                    <FormField
                                        key={item}
                                        control={control}
                                        name="specializations"
                                        render={({ field }: { field: any }) => (
                                            <FormItem
                                                key={item}
                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border-800 p-4 hover:bg-background-800 transition-colors"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item])
                                                                : field.onChange(
                                                                    (field.value || []).filter(
                                                                        (value: string) => value !== item
                                                                    )
                                                                );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                    {item}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {specializations.includes("Lain Lain") && (
                    <FormField
                        control={control}
                        name="specializationOther"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Please specify &quot;Lain Lain&quot;</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Specify your specialization..."
                                        {...field}
                                        className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30 mt-8">
                    <h3 className="font-semibold text-text-100">Documents</h3>

                    {role === "company" ? (
                        <FormField
                            control={control}
                            name="companyProfileDocument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Profile / Pricelist / Catalog</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="company_profiles"
                                            label="Upload Company Profile"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        PDF, PPTX, DOCX, or Spreadsheet (Max 5MB)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <FormField
                            control={control}
                            name="portfolioDocument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Portfolio / Pricelist / Catalog</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="portfolios"
                                            label="Upload Portfolio"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        PDF, PPTX, DOCX, or Spreadsheet (Max 5MB)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={control}
                        name="invoiceDocument"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sample Invoice (Optional)</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folderPath="invoices"
                                        label="Upload Invoice"
                                    />
                                </FormControl>
                                <FormDescription>
                                    If you have worked with other EOs before.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
