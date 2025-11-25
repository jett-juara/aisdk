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
    const { data: snapshot } = await supabase
      .from("dashboard_latest_snapshot")
      .select(
        "snapshot_date, snapshot_hour, system_health, uptime_24h, error_rate_24h",
      )
      .maybeSingle();

    if (!snapshot || !snapshot.system_health) {
      return NextResponse.json({
        systemStatus: null,
      });
    }

    const grade = snapshot.system_health as string;

    const lastChecked =
      snapshot.snapshot_date && typeof snapshot.snapshot_hour === "number"
        ? new Date(
            `${snapshot.snapshot_date}T${String(snapshot.snapshot_hour).padStart(
              2,
              "0",
            )}:00:00Z`,
          ).toISOString()
        : new Date().toISOString();

    return NextResponse.json({
      systemStatus: {
        status: grade,
        uptime: snapshot.uptime_24h,
        errorRate: snapshot.error_rate_24h,
        responseTime: null,
        lastChecked,
      },
    });
  } catch (error) {
    console.error("Dashboard system-status error:", error);
    return NextResponse.json(
      { error: { message: "Gagal mengambil system status." } },
      { status: 500 },
    );
  }
}
