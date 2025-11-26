"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorFormSchema, VendorFormValues } from "./form-schema";
import { Button } from "@/components/ui/button";
import { Step1Role } from "./step-1-role";
import { Step2Company } from "./step-2-company";
import { Step2Individual } from "./step-2-individual";
import { Step3Specialization } from "./step-3-specialization";
import { Step4Finance } from "./step-4-finance";
import { Step5NDA } from "./step-5-nda";
import { Step6Review } from "./step-6-review";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { User } from "@/lib/setting/types";

interface CollaborationWizardProps {
    user: User;
}

const STEPS = [
    { id: 1, title: "Role & PIC" },
    { id: 2, title: "Details" },
    { id: 3, title: "Expertise" },
    { id: 4, title: "Finance" },
    { id: 5, title: "NDA" },
    { id: 6, title: "Review" },
];

export function CollaborationWizard({ user }: CollaborationWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorFormSchema),
        defaultValues: {
            role: undefined,
            picName: ((user as any).firstName || (user as any).first_name || "") +
                ((user as any).lastName || (user as any).last_name ? ` ${(user as any).lastName || (user as any).last_name}` : ""),
            picEmail: user.email,
            specializations: [],
        },
        mode: "onChange",
    });

    const { watch, trigger, handleSubmit } = form;
    const role = watch("role");

    const handleNext = async () => {
        let isValid = false;

        // Validate fields for current step
        switch (currentStep) {
            case 1:
                isValid = await trigger(["role", "picName", "picEmail", "picPhone", "picPosition"]);
                break;
            case 2:
                if (role === "company") {
                    isValid = await trigger([
                        "companyName",
                        "companyAddressStreet",
                        "companyAddressCity",
                        "companyAddressProvince",
                        "companyAddressCountry",
                        "companyEmail",
                        "companyPhone",
                        "nibNumber",
                        "nibDocument",
                    ]);
                } else {
                    isValid = await trigger([
                        "individualAddressStreet",
                        "individualAddressCity",
                        "individualAddressProvince",
                        "individualAddressCountry",
                    ]);
                }
                break;
            case 3:
                isValid = await trigger([
                    "specializations",
                    "specializationOther",
                    "companyProfileDocument",
                    "portfolioDocument",
                    "invoiceDocument",
                ]);
                break;
            case 4:
                isValid = await trigger([
                    "bankName",
                    "bankNameOther",
                    "bankAccountNumber",
                    "bankAccountHolder",
                    "npwpNumber",
                    "npwpDocument",
                    "ktpDocument",
                    "pkpStatus",
                    "pkpDocument",
                ]);
                break;
            case 5:
                isValid = await trigger(["ndaDocument"]);
                break;
            case 6:
                isValid = true;
                break;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: VendorFormValues) => {
        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // 1. Insert into vendors table
            const { error: vendorError } = await supabase.from("vendors").insert({
                id: user.id,
                type: data.role,
                company_name: data.companyName,
                company_address: data.role === "company" ? {
                    street: data.companyAddressStreet,
                    city: data.companyAddressCity,
                    province: data.companyAddressProvince,
                    country: data.companyAddressCountry,
                } : null,
                company_email: data.companyEmail,
                company_phone: data.companyPhone,
                nib_number: data.nibNumber,
                individual_name: data.individualName || data.picName,
                individual_address: data.role === "individual" ? {
                    street: data.individualAddressStreet,
                    city: data.individualAddressCity,
                    province: data.individualAddressProvince,
                    country: data.individualAddressCountry,
                } : null,
                individual_email: data.individualEmail || data.picEmail,
                individual_phone: data.individualPhone || data.picPhone,
                specializations: data.specializations?.includes("Lain Lain")
                    ? [...(data.specializations?.filter(s => s !== "Lain Lain") || []), data.specializationOther || "Other"]
                    : data.specializations || [],
                bank_name: data.bankName === "Bank Lain" ? data.bankNameOther : data.bankName,
                bank_account_number: data.bankAccountNumber,
                bank_account_holder: data.bankAccountHolder,
                npwp_number: data.npwpNumber,
                pkp_status: data.pkpStatus,
                documents: {
                    nib: data.nibDocument,
                    company_profile: data.companyProfileDocument,
                    portfolio: data.portfolioDocument,
                    invoice: data.invoiceDocument,
                    npwp: data.npwpDocument,
                    ktp: data.ktpDocument,
                    pkp: data.pkpDocument,
                    nda: data.ndaDocument,
                },
                status: "pending",
            });

            if (vendorError) throw vendorError;

            // 2. Update user vendor_status
            const { error: userError } = await supabase
                .from("users")
                .update({ vendor_status: "pending" })
                .eq("id", user.id);

            if (userError) throw userError;

            toast({
                title: "Application Submitted",
                description: "Your vendor application is under review.",
            });

            router.push("/collaboration/success");
        } catch (error: any) {
            console.error("Submission error:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="relative bg-background-800 border border-white/10 shadow-2xl rounded-xl overflow-hidden p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Diagonal Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-0" />

                {/* Step Indicator Badge - Top Right */}
                <div className="absolute top-6 right-6 md:top-10 md:right-10 lg:top-12 lg:right-12 z-20">
                    <span className="text-text-200 text-sm md:text-base lg:text-sm font-medium px-3 py-1 rounded-full bg-glass-bg border border-glass-border backdrop-blur-md whitespace-nowrap">
                        Phase: {currentStep}/6
                    </span>
                </div>

                <div className="relative z-10">
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="min-h-[400px]">
                                {currentStep === 1 && <Step1Role />}
                                {currentStep === 2 && (role === "company" ? <Step2Company /> : <Step2Individual />)}
                                {currentStep === 3 && <Step3Specialization />}
                                {currentStep === 4 && <Step4Finance />}
                                {currentStep === 5 && <Step5NDA />}
                                {currentStep === 6 && <Step6Review />}
                            </div>

                            <div className="flex justify-between mt-8">
                                {currentStep > 1 ? (
                                    <Button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={isSubmitting}
                                        className="min-w-[140px] font-button font-medium text-md bg-transparent border border-border-700 text-text-50 hover:bg-white/5 active:bg-white/10 tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 shadow-lg"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="min-w-[140px] font-button font-medium text-md bg-transparent border border-border-700 text-text-50 hover:bg-white/5 active:bg-white/10 tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 shadow-lg"
                                    >
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[160px] font-button font-medium text-md bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 shadow-lg shadow-brand-900/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                            </>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}
