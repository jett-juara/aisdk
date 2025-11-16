import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { message: "Anda harus login terlebih dahulu." } },
      { status: 401 },
    );
  }

  try {
    // Ambil aktivitas terbaru user dari audit_logs (dibatasi 10)
    const { data: logs } = await supabase
      .from("audit_logs")
      .select("action, resource_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const activities =
      logs?.map((row) => {
        const rawAction = (row.action as string) || "";
        const resource = (row.resource_type as string) || "";
        const createdAt = row.created_at as string | null;

        // Heuristik sederhana untuk type indicator
        let type: "success" | "warning" | "info" = "info";
        const lower = rawAction.toLowerCase();
        if (lower.includes("error") || lower.includes("failed")) {
          type = "warning";
        } else if (
          lower.includes("create") ||
          lower.includes("update") ||
          lower.includes("login")
        ) {
          type = "success";
        }

        const label =
          rawAction ||
          (resource ? `Activity on ${resource}` : "Aktivitas terbaru");

        return {
          action: label,
          user: "You",
          time: createdAt,
          type,
        };
      }) ?? [];

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Dashboard recent-activity error:", error);
    return NextResponse.json(
      { error: { message: "Gagal mengambil recent activity." } },
      { status: 500 },
    );
  }
}
