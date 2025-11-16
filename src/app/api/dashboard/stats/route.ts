import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Pastikan user sudah login
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
    // Ambil snapshot terbaru dari view dashboard_latest_snapshot (bisa null kalau belum ada data)
    const { data: snapshot } = await supabase
      .from("dashboard_latest_snapshot")
      .select(
        "snapshot_date, snapshot_hour, system_health, uptime_24h, error_rate_24h, total_metrics, active_alerts",
      )
      .maybeSingle();

    // Hitung stats user & invitations (24 jam terakhir, faktual)
    const { count: totalUsers } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);

    const { count: activeUsers } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null);

    const { count: pendingInvitations } = await supabase
      .from("admin_invitations")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "sent"]);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers ?? 0,
        activeUsers: activeUsers ?? 0,
        pendingInvitations: pendingInvitations ?? 0,
        systemHealth: snapshot?.system_health ?? null,
        uptime: snapshot?.uptime_24h ?? null,
        errorRate: snapshot?.error_rate_24h ?? null,
        meta: {
          snapshotDate: snapshot?.snapshot_date ?? null,
          snapshotHour: snapshot?.snapshot_hour ?? null,
          totalMetrics: snapshot?.total_metrics ?? null,
          activeAlerts: snapshot?.active_alerts ?? null,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: { message: "Gagal mengambil dashboard stats." } },
      { status: 500 },
    );
  }
}
