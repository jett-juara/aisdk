"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { VendorFormValues } from "./form-schema";
import { CheckCircle2 } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3 border-b border-border-800 pb-4 last:border-0">
        <h3 className="font-semibold text-brand-400 text-sm uppercase tracking-wider">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {children}
        </div>
    </div>
);

const Item = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
        <span className="block text-text-400 text-xs">{label}</span>
        <span className="block text-text-50 font-medium">{value || "-"}</span>
    </div>
);

export function Step6Review() {
    const { getValues } = useFormContext<VendorFormValues>();
    const values = getValues();

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="h-16 w-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-brand-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Review Application
                </h2>
                <p className="text-text-200 mt-2">
                    Please review your information before submitting.
                </p>
            </div>

            <div className="bg-background-800/50 border border-border-800 rounded-xl p-6 space-y-6">
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
                        <Item label="Address" value={`${values.companyAddressStreet}, ${values.companyAddressCity}, ${values.companyAddressProvince}, ${values.companyAddressCountry}`} />
                        <Item label="NIB" value={values.nibNumber} />
                    </Section>
                ) : (
                    <Section title="Individual Details">
                        <Item label="Full Name" value={values.individualName} />
                        <Item label="Email" value={values.individualEmail} />
                        <Item label="Phone" value={values.individualPhone} />
                        <Item label="Address" value={`${values.individualAddressStreet}, ${values.individualAddressCity}, ${values.individualAddressProvince}, ${values.individualAddressCountry}`} />
                    </Section>
                )}

                <Section title="Expertise">
                    <div className="col-span-2">
                        <span className="block text-text-400 text-xs">Specializations</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {values.specializations?.map((spec) => (
                                <span key={spec} className="px-2 py-1 bg-brand-500/10 text-brand-300 rounded text-xs border border-brand-500/20">
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
                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {values.nibDocument && <Item label="NIB" value="Uploaded" />}
                        {values.companyProfileDocument && <Item label="Company Profile" value="Uploaded" />}
                        {values.portfolioDocument && <Item label="Portfolio" value="Uploaded" />}
                        {values.invoiceDocument && <Item label="Invoice" value="Uploaded" />}
                        {values.npwpDocument && <Item label="NPWP" value="Uploaded" />}
                        {values.ktpDocument && <Item label="KTP" value="Uploaded" />}
                        {values.pkpDocument && <Item label="PKP/Non-PKP" value="Uploaded" />}
                        {values.ndaDocument && <Item label="NDA" value="Uploaded" />}
                    </div>
                </Section>
            </div>
        </div>
    );
}
