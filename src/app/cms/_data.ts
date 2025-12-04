import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import type { User } from "@/lib/setting/types";

const allowedRoles = new Set(["admin", "superadmin"]);

export async function getCmsUserOrRedirect(): Promise<User> {
  const supabase = await createSupabaseRSCClient();

  try {
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

    if (profileError || !profile || !allowedRoles.has(profile.role)) {
      redirect("/setting");
    }

    return profile as User;
  } catch {
    redirect("/auth");
  }
}
