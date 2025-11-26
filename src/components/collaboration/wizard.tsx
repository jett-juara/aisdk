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
                        "individualName",
                        "individualAddressStreet",
                        "individualAddressCity",
                        "individualAddressProvince",
                        "individualAddressCountry",
                        "individualEmail",
                        "individualEmailAlt",
                        "individualPhone",
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
                individual_name: data.individualName,
                individual_address: data.role === "individual" ? {
                    street: data.individualAddressStreet,
                    city: data.individualAddressCity,
                    province: data.individualAddressProvince,
                    country: data.individualAddressCountry,
                } : null,
                individual_email: data.individualEmail,
                individual_phone: data.individualPhone,
                specializations: data.specializations.includes("Lain Lain")
                    ? [...data.specializations.filter(s => s !== "Lain Lain"), data.specializationOther || "Other"]
                    : data.specializations,
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
            {/* Progress Bar */}
            <div className="mb-12 relative px-4">
                <div className="flex justify-between items-center relative z-10">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 -z-10 rounded-full transition-all duration-500 ease-premium shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center group">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 relative ${step.id <= currentStep
                                    ? "bg-brand-600 border-brand-500 text-white shadow-[0_0_15px_rgba(255,107,0,0.6)] scale-110"
                                    : "bg-background-900/80 border-white/10 text-text-400 backdrop-blur-sm"
                                    }`}
                            >
                                {step.id < currentStep ? (
                                    <Check className="h-5 w-5 drop-shadow-md" />
                                ) : (
                                    <span className="drop-shadow-md">{step.id}</span>
                                )}
                                {step.id === currentStep && (
                                    <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                                )}
                            </div>
                            <span
                                className={`text-xs mt-3 font-medium hidden sm:block tracking-wide uppercase transition-colors duration-300 ${step.id <= currentStep ? "text-brand-400 drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]" : "text-text-500"
                                    }`}
                            >
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

                        <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                disabled={currentStep === 1 || isSubmitting}
                                className="text-text-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="btn-glass-premium min-w-[140px]"
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-glass-premium min-w-[160px]"
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
    );
}
