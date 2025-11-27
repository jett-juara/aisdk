"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { VendorFormValues } from "./form-schema";
import { FileUpload } from "./file-upload";
import { AnimatedInput } from "@/components/ui/animated-input";

export function Step2Company() {
    const { control } = useFormContext<VendorFormValues>();

    return (
        <div className="space-y-6">
            <div className="text-start mb-8">
                <h2 className="font-subheading font-medium text-2xl md:text-4xl lg:text-4xl tracking-tighter text-premium-gradient leading-1 pb-3">

                    Company Details
                </h2>
                <p className="text-text-200 text-xl mt-0">
                    Please provide your official company information.
                </p>
            </div>

            <div className="space-y-8">
                <FormField
                    control={control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <AnimatedInput
                                    label="Company Name"
                                    placeholder="Your Company Name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Company Address</h3>

                    <FormField
                        control={control}
                        name="companyAddressStreet"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Street Address"
                                        placeholder="Company Street Address"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="companyAddressCity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="City / Regency"
                                            placeholder="City / Regency"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="companyAddressProvince"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Province / State"
                                            placeholder="Province / State"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="companyAddressCountry"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Country"
                                        placeholder="Country"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="companyEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Official Email"
                                        placeholder="company@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="companyPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Company Phone"
                                        defaultCountry="ID"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Legal Documents</h3>

                    <FormField
                        control={control}
                        name="nibNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="NIB (Nomor Induk Berusaha)"
                                        placeholder="1234567890"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="nibDocument"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload NIB Document</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folderPath="nib"
                                        label="Upload NIB"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
