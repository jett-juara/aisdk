import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { CollaborationWizard } from "@/components/collaboration/wizard";
import { User } from "@/lib/setting/types";

export const metadata = {
    title: "Vendor Registration | JETT",
    description: "Register as a vendor partner with Juara.",
};

export default async function CollaborationPage() {
    const supabase = await createSupabaseRSCClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth");
    }

    const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        redirect("/auth");
    }

    // Check if already a vendor
    if (profile.vendor_status === "approved") {
        redirect("/collaboration/dashboard");
    }

    return (
        <div className="max-w-7xl mx-auto ">
            <CollaborationWizard user={profile as User} />
        </div>
    );
}
