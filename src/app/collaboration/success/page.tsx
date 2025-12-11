import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { CollaborationShell } from "@/components/collaboration/collaboration-shell";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/collaboration/queries";
import { redirect } from "next/navigation";

export default async function VendorRegistrationSuccessPage() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/auth");
    }

    const user = await getUserProfile(supabase, authUser.id);

    if (!user) {
        redirect("/auth");
    }

    return (
        <CollaborationShell user={user}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-green-500/20 p-6 ring-1 ring-green-500/50">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>

                <div className="space-y-4">
                    <h1 className="font-heading font-bold text-3xl md:text-4xl text-text-50">
                        Application Submitted!
                    </h1>
                    <p className="text-xl text-text-300">
                        Thank you for registering as a vendor. Your application has been received and is currently under review.
                    </p>
                    <p className="text-text-400">
                        We will notify you via email once your application has been processed. In the meantime, you can return to the dashboard to check your status.
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full h-12 px-8 font-button font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20"
                    >
                        <Link href="/collaboration/dashboard">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </CollaborationShell>
    );
}
