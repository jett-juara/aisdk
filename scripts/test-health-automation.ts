import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { getSystemHealthMetrics } from "../src/lib/system/health";

// Load env vars (Node 20.6+)
process.loadEnvFile(".env.local");
process.loadEnvFile(".env");

async function main() {
    console.log("🚀 Starting System Health Automation Test...");

    try {
        // 1. Calculate Metrics
        console.log("\n📊 Calculating metrics...");
        const metrics = await getSystemHealthMetrics();
        console.log("Metrics calculated:", JSON.stringify(metrics, null, 2));

        // 2. Insert Snapshot (Mimic Cron)
        console.log("\n💾 Inserting snapshot into DB...");
        const admin = createSupabaseAdminClient();
        const { error: insertError } = await admin.from("system_health_snapshots").insert({
            status: metrics.status,
            uptime_percentage: metrics.uptimePercentage,
            error_rate: metrics.errorRate,
            active_users_24h: metrics.activeUsers24h,
            total_requests_24h: metrics.totalRequests24h,
            latency_ms: metrics.latencyMs
        });

        if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
        }
        console.log("✅ Snapshot inserted successfully.");

        // 3. Verify View
        console.log("\n🔍 Verifying dashboard_latest_snapshot view...");
        const { data: viewData, error: viewError } = await admin
            .from("dashboard_latest_snapshot")
            .select("*")
            .limit(1)
            .single();

        if (viewError) {
            throw new Error(`View query failed: ${viewError.message}`);
        }

        console.log("View Data:", JSON.stringify(viewData, null, 2));

        // Validation
        if (viewData.system_health === metrics.status) {
            console.log("\n✅ SUCCESS: View reflects the inserted snapshot!");
        } else {
            console.error("\n❌ FAILURE: View data mismatch.");
            console.error(`Expected status: ${metrics.status}, Got: ${viewData.system_health}`);
        }

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
        process.exit(1);
    }
}

main();
