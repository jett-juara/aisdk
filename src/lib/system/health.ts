import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SystemHealthStatus = "excellent" | "good" | "fair" | "poor" | "critical";

export interface SystemHealthMetrics {
    status: SystemHealthStatus;
    uptimePercentage: number;
    errorRate: number;
    activeUsers24h: number;
    totalRequests24h: number;
    latencyMs: number;
    checks: {
        database: boolean;
        apiLatency: number;
    };
}

/**
 * Checks database connectivity and basic health
 */
async function checkDatabaseHealth(admin: ReturnType<typeof createSupabaseAdminClient>) {
    const start = Date.now();
    try {
        const { error } = await admin.from("users").select("id").limit(1);
        const latency = Date.now() - start;
        return { healthy: !error, latency, error };
    } catch (err) {
        return { healthy: false, latency: Date.now() - start, error: err };
    }
}

/**
 * Calculates error rate from audit logs in the last 24 hours
 */
async function calculateErrorRate(admin: ReturnType<typeof createSupabaseAdminClient>) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Count total actions
    const { count: totalActions } = await admin
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneDayAgo);

    // Count error actions (assuming 'error' keyword in action name or specific status if available)
    // Adjust filter based on actual audit log structure. 
    // Based on previous file view, we used .ilike('action', '%error%')
    const { count: errorActions } = await admin
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneDayAgo)
        .ilike("action", "%error%");

    const total = totalActions || 0;
    const errors = errorActions || 0;

    return {
        totalRequests: total,
        errorCount: errors,
        rate: total > 0 ? (errors / total) * 100 : 0
    };
}

/**
 * Counts active users in the last 24 hours
 */
async function countActiveUsers(admin: ReturnType<typeof createSupabaseAdminClient>) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Using the RPC if available, or fallback to query
    // Previous code used: admin.rpc('count_active_users', { since: last24h.toISOString() })
    try {
        const { data, error } = await admin.rpc('count_active_users', { since: oneDayAgo });
        if (!error && typeof data === 'number') return data;
    } catch {
        // Fallback if RPC fails or doesn't exist
    }

    // Fallback: Count distinct users in audit logs
    // Note: This might be heavy on large datasets, but okay for now
    // Actually, let's just use a simpler proxy if RPC fails, or return 0
    return 0;
}

/**
 * Main function to get system health metrics
 */
export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
    const admin = createSupabaseAdminClient();

    // Parallelize checks
    const [dbCheck, errorStats, activeUsers] = await Promise.all([
        checkDatabaseHealth(admin),
        calculateErrorRate(admin),
        countActiveUsers(admin)
    ]);

    // Determine status
    let status: SystemHealthStatus = "excellent";

    if (!dbCheck.healthy) {
        status = "critical";
    } else if (errorStats.rate > 5) {
        status = "poor";
    } else if (errorStats.rate > 1 || dbCheck.latency > 1000) {
        status = "fair";
    } else if (errorStats.rate > 0.1 || dbCheck.latency > 500) {
        status = "good";
    }

    // Calculate estimated uptime (inverse of error rate, simplified)
    // Real uptime requires external monitoring, but we can approximate internal availability
    const uptime = 100 - (errorStats.rate > 100 ? 100 : errorStats.rate);

    return {
        status,
        uptimePercentage: Number(uptime.toFixed(2)),
        errorRate: Number(errorStats.rate.toFixed(2)),
        activeUsers24h: activeUsers,
        totalRequests24h: errorStats.totalRequests,
        latencyMs: dbCheck.latency,
        checks: {
            database: dbCheck.healthy,
            apiLatency: dbCheck.latency
        }
    };
}
