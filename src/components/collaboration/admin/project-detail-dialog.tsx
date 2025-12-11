"use client";

import { Project, Bid } from "@/lib/collaboration/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, FileText, Briefcase, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProjectDetailDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loadingBids, setLoadingBids] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (open && project?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingBids(true);
            const fetchBids = async () => {
                // Fetch bids for this project, joined with vendor info if possible
                // Since our queries are usually vendor-centric, we might need a new query or just simple fetch here
                const { data, error } = await supabase
                    .from('bids')
                    .select(`
                        *,
                        vendor:vendors(
                            company_name,
                            individual_name,
                            type
                        )
                    `)
                    .eq('project_id', project.id)
                    .order('amount', { ascending: true }); // Lowest bid first

                if (!error && data) {
                    setBids(data as any);
                }
                setLoadingBids(false);
            };
            fetchBids();
        }
    }, [open, project?.id, supabase]);

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background-900 border-border-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-brand-500" />
                        {project.title}
                    </DialogTitle>
                    <DialogDescription>
                        Created on {format(new Date(project.created_at!), "MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-background-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-4">
                        {/* Status & Quick Stats */}
                        <div className="flex flex-wrap gap-4">
                            <Badge
                                variant="outline"
                                className={
                                    project.status === 'open' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        project.status === 'closed' ? "bg-background-800 text-text-400 border-border-700" :
                                            "bg-brand-500/10 text-brand-500 border-brand-500/20"
                                }
                            >
                                {project.status.toUpperCase()}
                            </Badge>
                            <div className="flex items-center text-sm text-text-300">
                                <DollarSign className="h-4 w-4 mr-1 text-text-400" />
                                {project.currency} {project.budget?.toLocaleString() || "Not specified"}
                            </div>
                            <div className="flex items-center text-sm text-text-300">
                                <Calendar className="h-4 w-4 mr-1 text-text-400" />
                                Deadline: {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "None"}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-50">Description</h3>
                            <p className="text-sm text-text-200 whitespace-pre-wrap leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-50">Requirements</h3>
                            {project.requirements && project.requirements.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-text-200 space-y-1">
                                    {project.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-400 italic">No specific requirements listed.</p>
                            )}
                        </div>

                        {/* Client Info */}
                        {project.client_name && (
                            <div className="space-y-1 p-3 bg-background-800/30 rounded border border-border-700/50">
                                <h3 className="text-xs font-semibold text-text-400 uppercase tracking-wider">Client</h3>
                                <p className="text-sm text-text-100">{project.client_name}</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="bids" className="mt-4">
                        {loadingBids ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full bg-background-800" />
                                <Skeleton className="h-10 w-full bg-background-800" />
                                <Skeleton className="h-10 w-full bg-background-800" />
                            </div>
                        ) : bids.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border-700 rounded-lg">
                                <Users className="h-8 w-8 text-text-400 mx-auto mb-2 opacity-50" />
                                <p className="text-text-200 font-medium">No bids yet</p>
                                <p className="text-text-400 text-sm">Once vendors submit proposals, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border-700 bg-background-900 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border-700 hover:bg-background-800/50">
                                            <TableHead className="text-text-300">Vendor</TableHead>
                                            <TableHead className="text-text-300">Amount</TableHead>
                                            <TableHead className="text-text-300">Submitted</TableHead>
                                            <TableHead className="text-text-300">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bids.map((bid: any) => (
                                            <TableRow key={bid.id} className="border-border-700 hover:bg-background-800/50">
                                                <TableCell className="font-medium text-text-50">
                                                    {bid.vendor?.company_name || bid.vendor?.individual_name || "Unknown Vendor"}
                                                    <div className="text-xs text-text-400 font-normal capitalize">
                                                        {bid.vendor?.type}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-text-100 font-mono">
                                                    {project.currency} {bid.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-text-300 text-sm">
                                                    {format(new Date(bid.created_at), "MMM d")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-background-800 text-text-300">
                                                        {bid.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
