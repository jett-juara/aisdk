import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/setting/types";

/**
 * Helper untuk mengambil user setting dengan proteksi auth.
 * Kalau gagal / tidak ada user, akan redirect ke /auth.
 */
export async function getSettingUserOrRedirect(): Promise<User> {
  const supabase = await createClient();

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

    if (profileError || !profile) {
      redirect("/auth");
    }

    return profile as User;
  } catch {
    redirect("/auth");
  }
}

