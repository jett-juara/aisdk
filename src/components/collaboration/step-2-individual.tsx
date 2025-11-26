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
import { VendorFormValues } from "./form-schema";

export function Step2Individual() {
    const { control } = useFormContext<VendorFormValues>();

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Individual Details
                </h2>
                <p className="text-text-200 mt-2">
                    Please provide your personal details as per your ID card (KTP).
                </p>
            </div>

            <div className="space-y-4">
                <FormField
                    control={control}
                    name="individualName"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Full Name (as per KTP)</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Address</h3>

                    <FormField
                        control={control}
                        name="individualAddressStreet"
                        render={({ field }: { field: any }) => (
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
                            name="individualAddressCity"
                            render={({ field }: { field: any }) => (
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
                            name="individualAddressProvince"
                            render={({ field }: { field: any }) => (
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
                        name="individualAddressCountry"
                        render={({ field }: { field: any }) => (
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
                        name="individualEmail"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Primary Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="individualEmailAlt"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Alternative Email (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="john.alt@example.com" {...field} />
                                </FormControl>
                                <FormDescription>For backup or forwarding.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="individualPhone"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Mobile Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="+62..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
