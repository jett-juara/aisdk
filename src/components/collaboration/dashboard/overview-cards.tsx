import { Vendor, User } from "@/lib/collaboration/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, MapPin, Briefcase, Activity, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";


interface OverviewCardsProps {
    vendor: Vendor;
    user: User;
    unreadMessagesCount: number;
    scrollToProfile: () => void;
}

export function VendorOverviewCards({ vendor, user, unreadMessagesCount, scrollToProfile }: OverviewCardsProps) {
    // 1. Calculate Document Completeness
    const requiredDocs = ['nib', 'npwp', 'invoice', 'nda']; // Basic set
    // Check if keys exist in documents object and have values
    const docsCount = Object.keys(vendor.documents || {}).filter(k => vendor.documents[k]).length;
    // Just a simple metric for now

    // 2. Identity info
    const name = vendor.type === 'company' ? vendor.company_name : vendor.individual_name;
    const email = vendor.type === 'company' ? vendor.company_email : vendor.individual_email;

    // Address extraction (assuming simple structure or fallback)
    const addressObj = vendor.type === 'company' ? vendor.company_address : vendor.individual_address;
    const location = addressObj ? `${addressObj.city || ''}, ${addressObj.province || ''}` : 'Location n/a';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Application Status */}
            <Card className="bg-card text-card-foreground border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendor Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{vendor.status}</div>
                    <p className="text-xs text-muted-foreground">
                        {vendor.status === 'approved' ? 'Active & Verified' : 'Under Review'}
                    </p>
                </CardContent>
            </Card>

            {/* Card 2: Inbox / Messages */}
            <Card className="bg-card text-card-foreground border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inbox</CardTitle>
                    <div className="relative">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {unreadMessagesCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{unreadMessagesCount} Unread</div>
                    <p className="text-xs text-muted-foreground">
                        {unreadMessagesCount > 0 ? "Action required" : "All caught up"}
                    </p>
                </CardContent>
            </Card>

            {/* Card 3: Document Health */}
            <Card className="bg-card text-card-foreground border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{docsCount} Files</div>
                    <p className="text-xs text-muted-foreground">
                        Uploaded in system
                    </p>
                </CardContent>
            </Card>

            {/* Card 3: Identity Snapshot */}
            <Card className="bg-card text-card-foreground border-border md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Profile</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                        <div>
                            <div className="text-lg font-bold truncate">{name}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {location}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {vendor.specializations?.slice(0, 3).map(spec => (
                                    <Badge key={spec} variant="secondary" className="text-[10px] px-1 py-0">{spec}</Badge>
                                ))}
                                {(vendor.specializations?.length || 0) > 3 && (
                                    <span className="text-[10px] text-muted-foreground self-center">+{vendor.specializations.length - 3}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={scrollToProfile}>View Full Profile</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
