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
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Non-Disclosure Agreement
                </h2>
                <p className="text-text-200 mt-2">
                    To protect our mutual interests, please sign the NDA.
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-6 text-center space-y-4">
                    <div className="h-16 w-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="h-8 w-8 text-brand-500" />
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
                        className="border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                <div className="space-y-4 border border-border-800 rounded-xl p-4 bg-background-800/30">
                    <h3 className="font-semibold text-text-100">Upload Signed NDA</h3>

                    <FormField
                        control={control}
                        name="ndaDocument"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Signed Document (PDF/JPG)</FormLabel>
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
