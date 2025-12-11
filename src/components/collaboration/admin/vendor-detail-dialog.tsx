"use client";

import { Vendor } from "@/lib/collaboration/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Building, User as UserIcon, Calendar, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getVendorChangeLogs } from "@/lib/collaboration/queries";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorDetailDialogProps {
    vendor: Vendor | null; // Joined with user data in parent
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VendorDetailDialog({ vendor, open, onOpenChange }: VendorDetailDialogProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (open && vendor?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingLogs(true);
            getVendorChangeLogs(supabase, vendor.id).then((data) => {
                setLogs(data);
                setLoadingLogs(false);
            });
        }
    }, [open, vendor?.id, supabase]);

    if (!vendor) return null;

    // Type casting because we fetch joined data in vendors-tab
    const user = (vendor as any).user || {};

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background-900 border-border-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {vendor.type === 'company' ? (
                            <Building className="h-5 w-5 text-brand-500" />
                        ) : (
                            <UserIcon className="h-5 w-5 text-brand-500" />
                        )}
                        {vendor.type === 'company' ? vendor.company_name : vendor.individual_name}
                    </DialogTitle>
                    <DialogDescription>
                        Joined on {format(new Date(vendor.created_at!), "MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-background-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="history">History & Audit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-background-800/50 border border-border-700/50">
                            <span className="text-text-200 text-sm">Current Status</span>
                            <Badge
                                variant="outline"
                                className={
                                    vendor.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        vendor.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                }
                            >
                                {vendor.status.toUpperCase()}
                            </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-text-50">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-text-400">Email</span>
                                    <span className="text-text-100">{vendor.company_email || vendor.individual_email}</span>
                                </div>
                                <div>
                                    <span className="block text-text-400">Phone</span>
                                    <span className="text-text-100">{vendor.company_phone || vendor.individual_phone || "-"}</span>
                                </div>
                                {user.first_name && (
                                    <div className="col-span-2">
                                        <span className="block text-text-400">PIC Name</span>
                                        <span className="text-text-100">{user.first_name} {user.last_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-text-50">Specializations</h3>
                            <div className="flex flex-wrap gap-2">
                                {vendor.specializations?.map((spec: string) => (
                                    <Badge key={spec} variant="secondary" className="bg-brand-500/10 text-brand-400 hover:bg-brand-500/20">
                                        {spec}
                                    </Badge>
                                )) || <span className="text-text-400">-</span>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-text-50">Address</h3>
                            <p className="text-sm text-text-200">
                                {vendor.company_address?.street || vendor.individual_address?.street || "-"}<br />
                                {vendor.company_address?.city || vendor.individual_address?.city}, {vendor.company_address?.province || vendor.individual_address?.province}<br />
                                {vendor.company_address?.country || vendor.individual_address?.country}
                            </p>
                        </div>

                        {/* Documents */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-text-50">Documents</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(vendor.documents || {}).map(([key, url]) => (
                                    url ? (
                                        <a
                                            key={key}
                                            href={(url as string).startsWith('http') ? url as string : '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-2 rounded bg-background-800 hover:bg-background-700 transition cursor-pointer"
                                        >
                                            <FileText className="h-4 w-4 text-brand-500" />
                                            <span className="text-xs text-text-200 capitalize">{key.replace(/_/g, " ")}</span>
                                        </a>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                        {loadingLogs ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full bg-background-800" />
                                <Skeleton className="h-12 w-full bg-background-800" />
                                <Skeleton className="h-12 w-full bg-background-800" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8 text-text-400 text-sm">No history found.</div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-background-800/50 border border-border-700/50">
                                        <div className="mt-1">
                                            {log.field_name === 'status' ? (
                                                log.new_value === 'approved' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                                                    log.new_value === 'rejected' ? <XCircle className="h-4 w-4 text-red-500" /> :
                                                        <Clock className="h-4 w-4 text-yellow-500" />
                                            ) : (
                                                <FileText className="h-4 w-4 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium text-text-50">
                                                    {log.field_name === 'status' ? (
                                                        <>Status changed to <span className="capitalize">{log.new_value}</span></>
                                                    ) : (
                                                        <>Updated <span className="font-mono text-xs bg-background-900 px-1 py-0.5 rounded">{log.field_name}</span></>
                                                    )}
                                                </p>
                                                <span className="text-xs text-text-400">
                                                    {format(new Date(log.created_at), "MMM d, HH:mm")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-400">
                                                Changed by: <span className="text-text-200 font-medium">
                                                    {log.changed_by_user ? `${log.changed_by_user.first_name} ${log.changed_by_user.last_name || ''}` : log.changed_by}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
