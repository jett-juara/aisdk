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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VendorFormValues } from "./form-schema";
import { FileUpload } from "./file-upload";
import { AnimatedInput } from "@/components/ui/animated-input";

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "Bank Lain"];

export function Step4Finance() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const bankName = watch("bankName");
    const role = watch("role");
    const pkpStatus = watch("pkpStatus");

    return (
        <div className="space-y-6">
            <div className="text-start mb-8">
                <h2 className="font-subheading font-medium text-2xl md:text-4xl lg:text-4xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Finance <br className="md:hidden" />& Administration
                </h2>
                <p className="text-text-200 text-xl">
                    Setup your payment and tax information.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Bank Account</h3>

                    <FormField
                        control={control}
                        name="bankName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a bank" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {BANKS.map((bank) => (
                                            <SelectItem key={bank} value={bank}>
                                                {bank}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {bankName === "Bank Lain" && (
                        <FormField
                            control={control}
                            name="bankNameOther"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Specify Bank Name"
                                            placeholder="e.g. BCA, Mandiri"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="bankAccountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Account Number"
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
                            name="bankAccountHolder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Account Holder Name"
                                            placeholder="Name as in bank account"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Tax Information</h3>

                    <FormField
                        control={control}
                        name="npwpNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="NPWP Number"
                                        placeholder="00.000.000.0-000.000"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="npwpDocument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scan NPWP</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="tax"
                                            label="Upload NPWP"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="ktpDocument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scan KTP Owner/PIC</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="identity"
                                            label="Upload KTP"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {role === "company" && (
                        <>
                            <FormField
                                control={control}
                                name="pkpStatus"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>PKP Status</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="pkp" className="border-border-50 text-text-50" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        PKP (Pengusaha Kena Pajak)
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="non_pkp" className="border-border-50 text-text-50" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Non-PKP
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="pkpDocument"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {pkpStatus === "pkp"
                                                ? "Upload Surat Pengukuhan PKP"
                                                : "Upload Surat Keterangan Non-PKP"}
                                        </FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                folderPath="tax"
                                                label={pkpStatus === "pkp" ? "Upload SPPKP" : "Upload Non-PKP Letter"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
