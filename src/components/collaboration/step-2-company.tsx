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
                                <Input placeholder="PT. Juara Abadi" {...field} />
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
                                    <Input placeholder="Jl. Sudirman No. 1, RT/RW 01/02" {...field} />
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
                                        <Input placeholder="Jakarta Selatan" {...field} />
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
                                        <Input placeholder="DKI Jakarta" {...field} />
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
                                    <Input placeholder="Indonesia" {...field} />
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
                                    <Input placeholder="contact@company.com" {...field} />
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
                                    <Input placeholder="+6221..." {...field} />
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
                                    <Input placeholder="812000..." {...field} />
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
