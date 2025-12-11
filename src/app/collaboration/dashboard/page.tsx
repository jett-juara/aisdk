import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { getDashboardViewData } from "@/lib/collaboration/queries";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CollaborationAdminConsole } from "@/components/collaboration/admin/admin-console";
import { CollaborationShell } from "@/components/collaboration/collaboration-shell";

// VendorDashboard imported from components
import { VendorDashboard } from "@/components/collaboration/dashboard/vendor-dashboard";

function VendorPendingView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center">
            <h1 className="text-3xl font-bold font-heading text-foreground">Registration Pending</h1>
            <p className="max-w-md text-muted-foreground">
                Your vendor registration is currently being reviewed by our team.
                We will notify you once it is approved.
            </p>
            <Button asChild variant="outline">
                <a href="/collaboration">Back to Home</a>
            </Button>
        </div>
    );
}

function VendorRejectedView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center">
            <h1 className="text-3xl font-bold font-heading text-destructive">Registration Rejected</h1>
            <p className="max-w-md text-muted-foreground">
                Unfortunately, your vendor application did not meet our current requirements.
            </p>
            <Button asChild variant="default">
                <a href="/collaboration/contact">Contact Support</a>
            </Button>
        </div>
    );
}

export default async function DashboardPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const view = typeof searchParams.view === 'string' ? searchParams.view : undefined;

    const supabase = await createSupabaseRSCClient();

    // 1. Auth check
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        redirect("/collaboration/login");
    }

    // 2. Fetch Data & Determine View State
    const { user, vendor, bids, messages, allVendors, allProjects, viewState } = await getDashboardViewData(supabase, authUser.id);

    // 3. Render based on View State
    switch (viewState) {
        case 'admin_console':
            if (!user) return <div className="p-8 text-center text-destructive">User profile missing.</div>;
            return (
                <CollaborationShell user={user}>
                    <CollaborationAdminConsole
                        user={user}
                        vendors={allVendors}
                        projects={allProjects}
                        currentView={view}
                    />
                </CollaborationShell>
            );

        case 'vendor_portal':
            if (!user || !vendor) return <div className="p-8 text-center text-destructive">User profile incomplete.</div>;
            return (
                <CollaborationShell user={user}>
                    <VendorDashboard user={user} vendor={vendor} bids={bids} messages={messages} />
                </CollaborationShell>
            );

        case 'vendor_pending':
            if (!user) return <VendorPendingView />;
            return (
                <CollaborationShell user={user}>
                    <VendorPendingView />
                </CollaborationShell>
            );

        case 'vendor_rejected':
            if (!user) return <VendorRejectedView />;
            return (
                <CollaborationShell user={user}>
                    <VendorRejectedView />
                </CollaborationShell>
            );

        case 'vendor_none':
            // Authenticated but no vendor data -> Redirect to registration
            redirect("/collaboration/register");

        case 'error':
        default:
            return (
                <div className="p-8 text-center text-destructive">
                    <h2>Something went wrong loading your dashboard.</h2>
                </div>
            );
    }
}
