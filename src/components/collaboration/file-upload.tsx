"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/hooks/use-toast";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    bucketName?: string;
    folderPath?: string;
    accept?: string;
    label?: string;
    maxSizeMB?: number;
}

export function FileUpload({
    value,
    onChange,
    bucketName = "vendor_documents",
    folderPath = "uploads",
    accept = ".pdf,.jpg,.jpeg,.png,.docx,.pptx,.xlsx",
    label = "Upload File",
    maxSizeMB = 5,
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(
        value ? value.split("/").pop() || "Uploaded File" : null
    );

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast({
                title: "File too large",
                description: `Max file size is ${maxSizeMB}MB`,
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const fileExt = file.name.split(".").pop();
            const uniqueId = Math.random().toString(36).substring(2, 15);
            const filePath = `${user.id}/${folderPath}/${uniqueId}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // We store the path, not the full URL, because it's a private bucket
            // or we can store the full path if we want.
            // For now, let's store the filePath which is enough to retrieve it later.
            // Actually, let's store the full path including bucket for clarity if needed,
            // but usually just the path inside the bucket is fine if we know the bucket.
            // Let's stick to the path.

            onChange(filePath);
            setFileName(file.name);
            toast({
                title: "Upload successful",
                description: `${file.name} has been uploaded.`,
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        onChange("");
        setFileName(null);
    };

    return (
        <div className="w-full">
            {value ? (
                <div className="flex items-center justify-between p-3 border border-brand-500/30 bg-brand-500/5 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-brand-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-text-50">
                                {fileName}
                            </span>
                            <span className="text-xs text-brand-400 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Uploaded
                            </span>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="text-text-400 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="relative">
                    <Input
                        type="file"
                        accept={accept}
                        onChange={handleUpload}
                        disabled={isUploading}
                        className="hidden"
                        id={`file-upload-${label.replace(/\s+/g, "-")}`}
                    />
                    <label
                        htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            "border-border-700 bg-background-800 hover:bg-background-700 hover:border-brand-500/50",
                            isUploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-2" />
                            ) : (
                                <Upload className="h-8 w-8 text-text-400 mb-2" />
                            )}
                            <p className="mb-2 text-sm text-text-200">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-text-400 p-2">
                                {accept.replace(/\./g, "").toUpperCase()} (MAX. {maxSizeMB}MB)
                            </p>
                        </div>
                    </label>
                </div>
            )}
        </div>
    );
}
