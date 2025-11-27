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
import { MultiSelect } from "@/components/ui/multi-select";
import { FileUpload } from "./file-upload";
import { AnimatedInput } from "@/components/ui/animated-input";

const SPECIALIZATIONS = [
    { label: "Security & Crowd Control", value: "Security & Crowd Control" },
    { label: "Floor Team", value: "Floor Team" },
    { label: "Logistic Team", value: "Logistic Team" },
    { label: "Talent Management Service", value: "Talent Management Service" },
    { label: "Stage Show Management System", value: "Stage Show Management System" },
    { label: "Stage, Rigging, & Booth", value: "Stage, Rigging, & Booth" },
    { label: "Advertising", value: "Advertising" },
    { label: "Catering", value: "Catering" },
    { label: "General Affair", value: "General Affair" },
    { label: "Cleaning & Waste Management", value: "Cleaning & Waste Management" },
    { label: "Communication Services", value: "Communication Services" },
    { label: "Ground Transportation & Show", value: "Ground Transportation & Show" },
    { label: "Photographer & Videographer", value: "Photographer & Videographer" },
    { label: "Designer 2D", value: "Designer 2D" },
    { label: "Dancer & Choreographers", value: "Dancer & Choreographers" },
    { label: "Designer 3D Motion Graphic", value: "Designer 3D Motion Graphic" },
    { label: "Legal Services", value: "Legal Services" },
    { label: "Lain Lain", value: "Lain Lain" },
];

export function Step3Specialization() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const role = watch("role");
    const specializations = watch("specializations") || [];



    return (
        <div className="space-y-8">
            <div className="text-start mb-8">
                <h2 className="font-heading font-bold text-2xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Expertise & Portfolio
                </h2>
                <p className="text-text-200 text-xl">
                    Tell us what you do best and show us your work.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <FormField
                        control={control}
                        name="specializations"
                        render={({ field }) => (
                            <FormItem>
                                <div className="mb-6">
                                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Specializations</h3>
                                    <FormDescription className="text-base">
                                        Select all that apply to your services.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <MultiSelect
                                        options={SPECIALIZATIONS}
                                        onValueChange={field.onChange}
                                        value={field.value || []}
                                        placeholder="Select specializations..."
                                        variant="default"
                                        animation={2}
                                        maxCount={5}
                                    />
                                </FormControl>
                                <FormMessage />

                                {/* Show 'Other' input when 'Lain Lain' is selected */}
                                {(() => {
                                    const shouldShow = field.value?.includes("Lain Lain");

                                    return shouldShow ? (
                                        <div className="mt-6 px-4 pb-4 pt-8 bg-background-900/50 rounded-lg border border-border-700">
                                            <FormField
                                                control={control}
                                                name="specializationOther"
                                                render={({ field: otherField }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <AnimatedInput
                                                                label="Please specify 'Lain Lain'"
                                                                placeholder="Specify your specialization..."
                                                                {...otherField}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : null;
                                })()}

                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Documents</h3>

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
