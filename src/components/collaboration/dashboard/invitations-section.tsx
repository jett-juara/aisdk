"use client";

import { Bid } from "@/lib/collaboration/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { BidSubmissionDialog } from "./bid-submission-dialog";


interface InvitationsSectionProps {
    bids: Bid[];
}

// Helper for status styling
const getStatusColor = (status: string) => {
    switch (status) {
        case 'invited': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case 'submitted': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        case 'shortlisted': return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        case 'winner': return "bg-green-500/10 text-green-500 border-green-500/20";
        case 'rejected': return "bg-red-500/10 text-red-500 border-red-500/20";
        default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
};

export function VendorInvitationsSection({ bids }: InvitationsSectionProps) {
    const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (bids.length === 0) {
        // ... no changes
        return (
            <div className="p-12 border border-dashed border-border rounded-xl text-center bg-card/30">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Projects Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    You haven&apos;t been invited to any projects yet. Ensure your profile and specializations are up to date!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bids.map((bid) => {
                const project = bid.project;
                if (!project) return null;

                return (
                    <Card key={bid.id} className="bg-card border-border overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`capitalize border ${getStatusColor(bid.status)}`} variant="outline">
                                            {bid.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Project ID: {project.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-foreground">
                                        {project.title}
                                    </h3>
                                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                                        {project.description}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                        {project.deadline && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>Deadline: {format(new Date(project.deadline), 'dd MMM yyyy')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-foreground">
                                                {project.currency} {project.budget ? project.budget.toLocaleString() : 'Negotiable'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center self-start md:self-center mt-4 md:mt-0">
                                    {bid.status === 'invited' ? (
                                        <Button
                                            onClick={() => {
                                                setSelectedBid(bid);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            Submit Proposal <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="outline" asChild>
                                            <Link href={`/collaboration/dashboard?action=view_bid&id=${bid.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {selectedBid && (
                <BidSubmissionDialog
                    bid={selectedBid}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            )}
        </div>
    );
}
