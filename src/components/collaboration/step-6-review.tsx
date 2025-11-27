"use client";

import React from "react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { VendorFormValues } from "./form-schema";
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-4">
        <h3 className="text-lg font-semibold text-text-50 border-b border-border-800 pb-2 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const Item = ({ label, value, fullWidth = false }: { label: string; value?: string | null; fullWidth?: boolean }) => (
    <div className={`${fullWidth ? "col-span-1 md:col-span-2" : ""}`}>
        <span className="block text-text-400 text-sm mb-1">{label}</span>
        <span className="block text-text-50 font-medium text-base break-words">{value || "-"}</span>
    </div>
);

export function Step6Review() {
    const { getValues, control } = useFormContext<VendorFormValues>();
    const values = getValues();

    return (
        <div className="space-y-8">
            <div className="text-start mb-8">
                <h2 className="font-heading font-bold text-2xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Review Application
                </h2>
                <p className="text-text-200 text-xl">
                    Please review your information before submitting.
                </p>
            </div>

            <div className="space-y-6">
                <Section title="Role & PIC">
                    <Item label="Role" value={values.role === "company" ? "Company" : "Individual"} />
                    <Item label="PIC Name" value={values.picName} />
                    <Item label="PIC Email" value={values.picEmail} />
                    <Item label="PIC Phone" value={values.picPhone} />
                    {values.role === "company" && <Item label="Position" value={values.picPosition} />}
                </Section>

                {values.role === "company" ? (
                    <Section title="Company Details">
                        <Item label="Company Name" value={values.companyName} />
                        <Item label="Email" value={values.companyEmail} />
                        <Item label="Phone" value={values.companyPhone} />
                        <Item label="Address" value={`${values.companyAddressStreet}, ${values.companyAddressCity}, ${values.companyAddressProvince}, ${values.companyAddressCountry}`} fullWidth />
                        <Item label="NIB" value={values.nibNumber} />
                    </Section>
                ) : (
                    <Section title="Individual Details">
                        <Item label="Full Name" value={values.individualName} />
                        <Item label="Email" value={values.individualEmail} />
                        <Item label="Phone" value={values.individualPhone} />
                        <Item label="Address" value={`${values.individualAddressStreet}, ${values.individualAddressCity}, ${values.individualAddressProvince}, ${values.individualAddressCountry}`} fullWidth />
                    </Section>
                )}

                <Section title="Expertise">
                    <div className="col-span-1 md:col-span-2">
                        <span className="block text-text-400 text-sm mb-2">Specializations</span>
                        <div className="flex flex-wrap gap-2">
                            {values.specializations?.map((spec) => (
                                <span key={spec} className="px-3 py-1.5 bg-brand-500/10 text-brand-300 rounded-lg text-sm border border-brand-500/20">
                                    {spec === "Lain Lain" ? values.specializationOther : spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Finance & Tax">
                    <Item label="Bank" value={values.bankName === "Bank Lain" ? values.bankNameOther : values.bankName} />
                    <Item label="Account Number" value={values.bankAccountNumber} />
                    <Item label="Account Holder" value={values.bankAccountHolder} />
                    <Item label="NPWP" value={values.npwpNumber} />
                    {values.role === "company" && <Item label="PKP Status" value={values.pkpStatus === "pkp" ? "PKP" : "Non-PKP"} />}
                </Section>

                <Section title="Documents">
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {values.nibDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>NIB Uploaded</span>
                            </div>
                        )}
                        {values.companyProfileDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>Company Profile Uploaded</span>
                            </div>
                        )}
                        {values.portfolioDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>Portfolio Uploaded</span>
                            </div>
                        )}
                        {values.invoiceDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>Invoice Uploaded</span>
                            </div>
                        )}
                        {values.npwpDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>NPWP Uploaded</span>
                            </div>
                        )}
                        {values.ktpDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>KTP Uploaded</span>
                            </div>
                        )}
                        {values.pkpDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>PKP/Non-PKP Uploaded</span>
                            </div>
                        )}
                        {values.ndaDocument && (
                            <div className="flex items-center space-x-2 text-text-50">
                                <CheckCircle2 className="h-5 w-5 text-brand-500" />
                                <span>NDA Uploaded</span>
                            </div>
                        )}
                    </div>
                </Section>

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800">
                    <FormField
                        control={control}
                        name="termsAccepted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-1"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <div className="text-sm font-medium text-text-50 leading-relaxed">
                                        I confirm that all the information provided is accurate and true. I understand that Juara guarantees the confidentiality of my data and documents in accordance with the Non-Disclosure Agreement (NDA) and <Link href="/about/privacy-policy" target="_blank" className="text-text-info-500 hover:underline hover:decoration-dotted underline-offset-4 transition-colors">Privacy Policy</Link>.
                                    </div>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
