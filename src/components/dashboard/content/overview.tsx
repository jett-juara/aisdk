/**
 * Dashboard Overview Component
 * Role-based content untuk superadmin, admin, dan user
 * Data fetching dan state management
 */

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardContentProps, User, DashboardStats, SystemHealth } from "@/lib/dashboard/types";
import {
  Users,
  UserCheck,
  Mail,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  Eye,
  UserPlus,
  Lock,
  FileText,
} from "lucide-react";

/**
 * Stats Card Component untuk Overview
 */
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "warning" | "error" | "success";
}) {
  const variantStyles = {
    default: "bg-background-800 border-border-700",
    warning: "bg-background-800 border-button-orange",
    error: "bg-background-800 border-button-destructive",
    success: "bg-background-800 border-button-green",
  };

  const iconColors = {
    default: "text-brand-500",
    warning: "text-button-orange",
    error: "text-button-destructive",
    success: "text-button-green",
  };

  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-200">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconColors[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-50">{value}</div>
        <div className="flex items-center justify-between text-xs text-text-400">
          <span>{description}</span>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1",
                trend.isPositive ? "text-button-green" : "text-button-destructive"
              )}
            >
              <TrendingUp className="h-3 w-3" />
              {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Actions Component
 */
function QuickActions({ userRole }: { userRole: string }) {
  const actions = {
    superadmin: [
      { label: "Invite User", icon: UserPlus, href: "/dashboard/invitations", description: "Send invitation to new user" },
      { label: "System Health", icon: Activity, href: "/dashboard/system", description: "View system performance" },
      { label: "Audit Logs", icon: FileText, href: "/dashboard/audit", description: "Review system activity" },
      { label: "Security", icon: Shield, href: "/dashboard/security", description: "Manage security settings" },
    ],
    admin: [
      { label: "Manage Users", icon: Users, href: "/dashboard/users", description: "View and edit user accounts" },
      { label: "Permissions", icon: Lock, href: "/dashboard/permissions", description: "Configure user permissions" },
      { label: "System Health", icon: Activity, href: "/dashboard/system", description: "View system performance" },
    ],
    user: [
      { label: "My Profile", icon: Eye, href: "/dashboard/profile", description: "View my profile information" },
      { label: "Settings", icon: Settings, href: "/dashboard/settings", description: "Manage account settings" },
    ],
  };

  const userActions = actions[userRole as keyof typeof actions] || actions.user;

  return (
    <Card className="bg-background-800 border-border-700">
      <CardHeader>
        <CardTitle className="text-text-50">Quick Actions</CardTitle>
        <CardDescription className="text-text-400">
          Common tasks and navigation
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {userActions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="ghost"
            className="w-full justify-start h-auto p-4 hover:bg-hover-overlay-700 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <action.icon className="h-5 w-5 text-brand-500 mt-0.5" />
              <div className="text-left">
                <div className="font-medium text-text-50">{action.label}</div>
                <div className="text-sm text-text-400">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Recent Activity Component
 */
function RecentActivity({ userRole }: { userRole: string }) {
  const [activities, setActivities] = useState<
    { action: string; user: string; time: string | null; type: "success" | "warning" | "info" }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/recent-activity");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setActivities(payload?.activities ?? []);
        setLoading(false);
      } catch (_error) {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <Card className="bg-background-800 border-border-700">
      <CardHeader>
        <CardTitle className="text-text-50">Recent Activity</CardTitle>
        <CardDescription className="text-text-400">
          Latest system and user activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-10 bg-background-700/50 rounded-md animate-pulse" />
              ))}
            </div>
          )}
          {!loading &&
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2",
                    activity.type === "success" && "bg-button-green",
                    activity.type === "warning" && "bg-button-orange",
                    activity.type === "info" && "bg-brand-500",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-50">{activity.action}</div>
                  <div className="flex items-center gap-2 text-xs text-text-400">
                    <span>{activity.user}</span>
                    {activity.time && (
                      <>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {!loading && activities.length === 0 && (
            <p className="text-xs text-text-500">Belum ada aktivitas yang terekam untuk akun lo.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * System Status Component untuk Admins
 */
function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/system-status");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const payload = await res.json();
        const api = payload?.systemStatus;
        if (!api) {
          setLoading(false);
          return;
        }
        setSystemHealth({
          status: api.status ?? "good",
          uptime: api.uptime ?? 0,
          responseTime: api.responseTime ?? 0,
          errorRate: api.errorRate ?? 0,
          lastChecked: api.lastChecked ?? new Date().toISOString(),
        });
        setLoading(false);
      } catch (_error) {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading || !systemHealth) {
    return (
      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="text-text-50">System Health</CardTitle>
          <CardDescription className="text-text-400">
            Sedang mengambil data kesehatan sistem…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-background-700/50 rounded-md animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    excellent: "text-button-green",
    good: "text-brand-500",
    fair: "text-button-orange",
    poor: "text-button-destructive",
    critical: "text-button-destructive",
  };

  return (
    <Card className="bg-background-800 border-border-700">
      <CardHeader>
        <CardTitle className="text-text-50">System Health</CardTitle>
        <CardDescription className="text-text-400">
          Current system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-200">Overall Status</span>
            <Badge
              variant="default"
              className={cn(
                "capitalize",
                systemHealth.status === 'excellent' && "bg-button-green/20 text-button-green border-button-green",
                systemHealth.status === 'good' && "bg-brand-500/20 text-brand-500 border-brand-500",
                systemHealth.status === 'fair' && "bg-button-orange/20 text-button-orange border-button-orange",
                systemHealth.status === 'poor' && "bg-button-destructive/20 text-button-destructive border-button-destructive"
              )}
            >
              {systemHealth.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-200">Uptime</span>
            <span className="text-sm font-medium text-text-50">{systemHealth.uptime}%</span>
          </div>
          {/* Response time belum tersedia dari metrics faktual, jadi disembunyikan */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-200">Error Rate</span>
            <span className="text-sm font-medium text-text-50">{systemHealth.errorRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Dashboard Overview Component
 */
export function DashboardOverview({ user }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const payload = await res.json();
        const apiStats = payload?.stats;
        setStats({
          totalUsers: apiStats?.totalUsers ?? 0,
          activeUsers: apiStats?.activeUsers ?? 0,
          pendingInvitations: apiStats?.pendingInvitations ?? 0,
          systemHealth: apiStats?.systemHealth ?? "good",
        });
        setLoading(false);
      } catch (_error) {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-background-800 border-border-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-background-700 rounded w-1/2" />
                  <div className="h-8 bg-background-700 rounded w-3/4" />
                  <div className="h-3 bg-background-700 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">
          Welcome back, {user.firstName || 'User'}!
        </h1>
        <p className="text-text-400 mt-2">
          Here's what's happening with your event management system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          description="Registered users"
          icon={Users}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          description="Users active in last 30 days"
          icon={UserCheck}
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatsCard
          title="Pending Invitations"
          value={stats?.pendingInvitations || 0}
          description="Awaiting response"
          icon={Mail}
          variant={stats?.pendingInvitations && stats.pendingInvitations > 5 ? "warning" : "default"}
        />
        <StatsCard
          title="System Health"
          value={stats?.systemHealth || "Unknown"}
          description="Overall system status"
          icon={Activity}
          variant={
            stats?.systemHealth === "excellent" ? "success" :
            stats?.systemHealth === "good" ? "default" :
            stats?.systemHealth === "fair" ? "warning" : "error"
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions userRole={user.role} />
        </div>

        {/* Recent Activity & System Status */}
        <div className="space-y-6 lg:col-span-2">
          <RecentActivity userRole={user.role} />

          {/* System Status untuk Admins */}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <SystemStatus />
          )}
        </div>
      </div>
    </div>
  );
}
