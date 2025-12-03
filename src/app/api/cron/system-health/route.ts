import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSystemHealthMetrics } from "@/lib/system/health";

export const dynamic = 'force-dynamic'; // Ensure this is not cached

export async function GET(request: Request) {
    // Security check: Verify CRON_SECRET if present in env
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const metrics = await getSystemHealthMetrics();
        const admin = createSupabaseAdminClient();

        const { error } = await admin.from("system_health_snapshots").insert({
            status: metrics.status,
            uptime_percentage: metrics.uptimePercentage,
            error_rate: metrics.errorRate,
            active_users_24h: metrics.activeUsers24h,
            total_requests_24h: metrics.totalRequests24h,
            latency_ms: metrics.latencyMs
        });

        if (error) {
            console.error("Failed to insert system health snapshot:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error("Cron system-health error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
