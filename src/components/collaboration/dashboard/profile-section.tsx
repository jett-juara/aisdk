"use client";

import { Vendor, User } from "@/lib/collaboration/types";
import { CheckCircle2, FileText, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
    vendor: Vendor;
}

const Section = ({ title, children, action }: { title: string; children: React.ReactNode, action?: React.ReactNode }) => (
    <div className="bg-card p-6 rounded-xl border border-border space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {action && <div>{action}</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const Item = ({ label, value, fullWidth = false }: { label: string; value?: string | null; fullWidth?: boolean }) => (
    <div className={`${fullWidth ? "col-span-1 md:col-span-2" : ""}`}>
        <span className="block text-muted-foreground text-sm mb-1">{label}</span>
        <span className="block text-foreground font-medium text-base break-words">{value || "-"}</span>
    </div>
);

const DocItem = ({ label, url }: { label: string; url?: string }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
        <div className="flex items-center space-x-3">
            {url ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Ban className="h-5 w-5 text-muted-foreground" />}
            <span className={`text-sm font-medium ${url ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
        </div>
        {url && (
            <Button variant="ghost" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">View</a>
            </Button>
        )}
    </div>
);

import { EditContactDialog } from "./edit-contact-dialog";

export function VendorProfileSection({ vendor }: ProfileSectionProps) {
    const isCompany = vendor.type === 'company';

    // Address Formatting
    const addressObj = isCompany ? vendor.company_address : vendor.individual_address;
    const addressStr = addressObj
        ? `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.province || ''}, ${addressObj.country || ''}`
        : '-';

    return (
        <div className="space-y-6">
            <Section
                title={isCompany ? "Company Details" : "Individual Details"}
                action={<EditContactDialog vendor={vendor} />}
            >
                <Item label={isCompany ? "Company Name" : "Full Name"} value={isCompany ? vendor.company_name : vendor.individual_name} />
                <Item label="Email" value={isCompany ? vendor.company_email : vendor.individual_email} />
                <Item label="Phone" value={isCompany ? vendor.company_phone : vendor.individual_phone} />
                <Item label="Address" value={addressStr} fullWidth />
                {isCompany && <Item label="NIB" value={vendor.nib_number} />}
            </Section>

            <Section title="Expertise">
                <div className="col-span-1 md:col-span-2">
                    <span className="block text-muted-foreground text-sm mb-2">Specializations</span>
                    <div className="flex flex-wrap gap-2">
                        {vendor.specializations?.map((spec) => (
                            <span key={spec} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            </Section>

            <Section title="Finance & Tax">
                <Item label="Bank Name" value={vendor.bank_name} />
                <Item label="Account Number" value={vendor.bank_account_number} />
                <Item label="Account Holder" value={vendor.bank_account_holder} />
                <Item label="NPWP Number" value={vendor.npwp_number} />
                {isCompany && <Item label="PKP Status" value={vendor.pkp_status === 'pkp' ? 'PKP' : 'Non-PKP'} />}
            </Section>

            <Section title="Documents">
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocItem label="NIB Document" url={vendor.documents?.nib} />
                    <DocItem label="NPWP Document" url={vendor.documents?.npwp} />
                    <DocItem label="KTP (PIC)" url={vendor.documents?.ktp} />
                    <DocItem label="Invoice Sample" url={vendor.documents?.invoice} />
                    <DocItem label="Company Profile" url={vendor.documents?.company_profile} />
                    <DocItem label="Portfolio" url={vendor.documents?.portfolio} />
                    <DocItem label="NDA Signed" url={vendor.documents?.nda} />
                    <DocItem label="PKP Document" url={vendor.documents?.pkp} />
                </div>
            </Section>
        </div>
    );
}
