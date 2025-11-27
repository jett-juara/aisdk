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
import { Button } from "@/components/ui/button";
import { VendorFormValues } from "./form-schema";
import { FileUpload } from "./file-upload";
import { Download, FileText } from "lucide-react";

export function Step5NDA() {
    const { control } = useFormContext<VendorFormValues>();

    const handleDownloadNDA = () => {
        // In a real app, this would be a link to a file in storage or public folder
        // For now, we simulate a download or link to a placeholder
        const link = document.createElement("a");
        link.href = "/documents/Juara_Vendor_NDA_Template.pdf"; // Placeholder path
        link.download = "Juara_Vendor_NDA_Template.pdf";
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        window.open("/documents/Juara_Vendor_NDA_Template.pdf", "_blank");
    };

    return (
        <div className="space-y-6">
            <div className="text-start mb-8">
                <h2 className="font-subheading font-medium text-2xl md:text-4xl lg:text-4xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Non-Disclosure <br className="md:hidden" />Agreement
                </h2>
                <p className="text-text-200 text-xl">
                    To protect our mutual interests, please sign the NDA.
                </p>
            </div>

            <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Download Template</h3>
                    <div className="flex flex-col items-center text-center space-y-4 py-4">
                        <div className="h-16 w-16 bg-background-700 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-50" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-text-50">
                                Download NDA Template
                            </h3>
                            <p className="text-text-200 text-sm mt-1 max-w-md mx-auto">
                                Please download, read, and sign the Non-Disclosure Agreement.
                                This document ensures confidentiality for all future projects.
                            </p>
                        </div>
                        <Button
                            onClick={handleDownloadNDA}
                            variant="outline"
                            className="min-w-[180px] font-button font-medium text-md bg-transparent border border-border-700 text-text-50 hover:bg-white/5 active:bg-white/10 tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 shadow-lg"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    </div>
                </div>

                <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-6">
                    <h3 className="text-lg border-b border-border-800 pb-2 mb-4">Upload Signed NDA</h3>

                    <FormField
                        control={control}
                        name="ndaDocument"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="lg:mb-4">Signed Document (PDF/JPG)</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folderPath="legal"
                                        label="Upload Signed NDA"
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
