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

export function Step2Company() {
    const { control } = useFormContext<VendorFormValues>();

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Company Details
                </h2>
                <p className="text-text-200 mt-2">
                    Please provide your official company information.
                </p>
            </div>

            <div className="space-y-4">
                <FormField
                    control={control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="PT. Juara Abadi"
                                    {...field}
                                    className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Company Address</h3>

                    <FormField
                        control={control}
                        name="companyAddressStreet"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Jl. Sudirman No. 1, RT/RW 01/02"
                                        {...field}
                                        className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="companyAddressCity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City / Regency</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Jakarta Selatan"
                                            {...field}
                                            className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                    <FormLabel>Province / State</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="DKI Jakarta"
                                            {...field}
                                            className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="PT. Example Indonesia"
                                        {...field}
                                        className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="companyEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Official Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="company@example.com"
                                        {...field}
                                        className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                <FormLabel>Company Phone</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Enter phone number"
                                        defaultCountry="ID"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Legal Documents</h3>

                    <FormField
                        control={control}
                        name="nibNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIB (Nomor Induk Berusaha)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="1234567890"
                                        {...field}
                                        className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
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
