-- Create system_health_snapshots table
CREATE TABLE IF NOT EXISTS system_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  uptime_percentage FLOAT NOT NULL,
  error_rate FLOAT NOT NULL,
  active_users_24h INTEGER NOT NULL,
  total_requests_24h INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_system_health_snapshots_created_at ON system_health_snapshots(created_at DESC);

-- Drop existing view if it exists (to ensure we replace it with our dynamic view)
DROP VIEW IF EXISTS dashboard_latest_snapshot;

-- Create view for backward compatibility and easy access to latest snapshot
CREATE OR REPLACE VIEW dashboard_latest_snapshot AS
SELECT
  created_at::date as snapshot_date,
  EXTRACT(HOUR FROM created_at) as snapshot_hour,
  status as system_health,
  uptime_percentage as uptime_24h,
  error_rate as error_rate_24h,
  total_requests_24h as total_metrics,
  0 as active_alerts
FROM system_health_snapshots
ORDER BY created_at DESC
LIMIT 1;

-- Grant access to authenticated users (if needed for the view)
GRANT SELECT ON system_health_snapshots TO authenticated;
GRANT SELECT ON system_health_snapshots TO service_role;
GRANT SELECT ON dashboard_latest_snapshot TO authenticated;
GRANT SELECT ON dashboard_latest_snapshot TO service_role;
