"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { adminApproveVendor, adminRejectVendor } from "@/lib/collaboration/actions";
import { toast } from "@/components/hooks/use-toast";
import { VendorDetailDialog } from "./vendor-detail-dialog";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VendorsTabProps {
    vendors: any[];
}

export function VendorsTab({ vendors }: VendorsTabProps) {
    const [viewVendor, setViewVendor] = useState<any | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleView = (vendor: any) => {
        setViewVendor(vendor);
        setDetailOpen(true);
    };

    const handleApprove = async (vendorId: string) => {
        const result = await adminApproveVendor(vendorId);
        if (result.success) {
            toast({ title: "Vendor Approved", description: "Status updated successfully." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const handleReject = async (vendorId: string) => {
        const result = await adminRejectVendor(vendorId);
        if (result.success) {
            toast({ title: "Vendor Rejected", description: "Status updated successfully." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Header removed as it is now in main console view */}
            </div>

            <div className="rounded-xl border border-border-700 bg-background-900 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border-700 hover:bg-background-800/50">
                            <TableHead className="text-text-300">Name / Company</TableHead>
                            <TableHead className="text-text-300">Type</TableHead>
                            <TableHead className="text-text-300">Status</TableHead>
                            <TableHead className="text-text-300">Joined</TableHead>
                            <TableHead className="text-text-300 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vendors.map((vendor) => (
                            <TableRow key={vendor.id} className="border-border-700 hover:bg-background-800/50">
                                <TableCell className="font-medium text-text-50">
                                    {vendor.type === 'company' ? vendor.company_name : vendor.individual_name}
                                    <div className="text-xs text-text-400 font-normal">
                                        {vendor.type === 'company' ? vendor.company_email : vendor.individual_email}
                                    </div>
                                </TableCell>
                                <TableCell className="text-text-200 capitalize">{vendor.type}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            vendor.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                vendor.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                        }
                                    >
                                        {vendor.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-text-300">
                                    {format(new Date(vendor.created_at!), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-400 hover:text-text-50">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-background-900 border-border-700">
                                            <DropdownMenuItem onClick={() => handleView(vendor)} className="text-text-200 focus:text-text-50 focus:bg-background-800 cursor-pointer">
                                                View Details
                                            </DropdownMenuItem>
                                            {vendor.status === 'pending' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleApprove(vendor.id)} className="text-green-500 focus:text-green-400 focus:bg-green-500/10 cursor-pointer">
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleReject(vendor.id)} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                                                        Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <VendorDetailDialog
                vendor={viewVendor}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
