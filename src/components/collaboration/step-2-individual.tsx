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
import { PhoneInput } from "@/components/ui/phone-input";
import { VendorFormValues } from "./form-schema";
import { AnimatedInput } from "@/components/ui/animated-input";

export function Step2Individual() {
    const { control } = useFormContext<VendorFormValues>();

    return (
        <div className="space-y-6">
            <div className="text-start mb-8">
                <h2 className="font-heading font-bold text-2xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Individual Details
                </h2>
                <p className="text-text-200 text-xl">
                    Please provide your personal details as per your ID card (KTP).
                </p>
            </div>

            <div className="space-y-8">


                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Address</h3>

                    <FormField
                        control={control}
                        name="individualAddressStreet"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Street Address"
                                        placeholder="Jl. Sudirman No. 1, RT/RW 01/02"
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
                            name="individualAddressCity"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="City / Regency"
                                            placeholder="Jakarta Selatan"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="individualAddressProvince"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Province / State"
                                            placeholder="DKI Jakarta"
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
                        name="individualAddressCountry"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Country"
                                        placeholder="Indonesia"
                                        {...field}
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
