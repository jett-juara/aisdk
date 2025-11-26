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

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "Bank Lain"];

export function Step4Finance() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const bankName = watch("bankName");
    const role = watch("role");
    const pkpStatus = watch("pkpStatus");

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Finance & Administration
                </h2>
                <p className="text-text-200 mt-2">
                    Setup your payment and tax information.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Bank Account</h3>

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
                                    <FormLabel>Specify Bank Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. BCA, Mandiri"
                                            {...field}
                                            className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="bankAccountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number</FormLabel>
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
                            name="bankAccountHolder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Name as in bank account"
                                            {...field}
                                            className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Tax Information</h3>

                    <FormField
                        control={control}
                        name="npwpNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NPWP Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="00.000.000.0-000.000"
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
                                                        <RadioGroupItem value="pkp" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        PKP (Pengusaha Kena Pajak)
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="non_pkp" />
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
