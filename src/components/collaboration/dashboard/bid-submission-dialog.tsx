"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitBid } from "@/lib/collaboration/actions";
import { BidFormValues, bidSchema } from "@/lib/collaboration/bid-schema";
import { FileUpload } from "../file-upload";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Bid } from "@/lib/collaboration/types";

interface BidSubmissionDialogProps {
    bid: Bid;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BidSubmissionDialog({ bid, open, onOpenChange }: BidSubmissionDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string, name: string } | null>(
        bid.proposal_document ? { url: bid.proposal_document.url, name: bid.proposal_document.name } : null
    );

    const form = useForm<BidFormValues>({
        resolver: zodResolver(bidSchema),
        defaultValues: {
            amount: bid.amount || 0,
            currency: bid.currency || "IDR",
            notes: bid.notes || "",
        }
    });

    const onSubmit = async (data: BidFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await submitBid(bid.project_id, {
                ...data,
                proposal_url: uploadedFile?.url,
                proposal_name: uploadedFile?.name
            });

            if (result.success) {
                toast({
                    title: "Bid Submitted",
                    description: "Your proposal has been successfully submitted.",
                });
                onOpenChange(false);
                router.refresh(); // Refresh to update status in UI
            } else {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: result.error,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadComplete = (url: string, name: string) => {
        setUploadedFile({ url, name });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Submit Proposal</DialogTitle>
                    <DialogDescription>
                        Submit your bid for project: <span className="font-semibold text-foreground">{bid.project?.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bid Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <Input placeholder="IDR" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Proposal Document</FormLabel>
                            <FileUpload
                                bucketName="vendor_documents"
                                folderPath={`proposals/${bid.project_id}`}
                                onChange={(url) => { /* handled via onUploadSuccess */ }}
                                onUploadSuccess={handleUploadComplete}
                                label="Upload Proposal PDF"
                            />
                            {uploadedFile && (
                                <p className="text-sm text-green-600 mt-1">
                                    File attached: {uploadedFile.name}
                                </p>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes / Cover Letter</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any additional notes or cover letter here..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Proposal
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
