/**
 * Dashboard secondary sections for each menu
 * Implementasi ringan dan konsisten dengan Overview
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardContentProps } from "@/lib/dashboard/types";
import {
  User as UserIcon,
  Users,
  Shield,
  Activity,
  Mail,
  FileText,
  Lock,
  Settings,
} from "lucide-react";

export function DashboardProfile({ user }: DashboardContentProps) {
  const firstName = (user as any).firstName ?? (user as any).first_name ?? "";
  const lastName = (user as any).lastName ?? (user as any).last_name ?? "";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">My Profile</h1>
        <p className="text-text-400 mt-2">
          Ringkasan informasi akun lo yang dipakai di JETT Dashboard.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <UserIcon className="h-5 w-5 text-brand-500" />
            Profil User
          </CardTitle>
          <CardDescription className="text-text-400">
            Data ini berasal dari tabel <code className="font-mono text-xs">users</code> di Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-text-400">Nama Lengkap</div>
              <div className="text-sm font-medium text-text-50">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Belum diisi"}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-400">Email</div>
              <div className="text-sm font-medium text-text-50">{user.email}</div>
            </div>
            <div>
              <div className="text-xs text-text-400">Role</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-50 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-400">Status</div>
              <Badge
                variant={user.status === "active" ? "default" : "destructive"}
                className="text-xs px-2 py-0.5"
              >
                {user.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardUsers({ user }: DashboardContentProps) {
  const isAllowed = user.role === "admin" || user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">User Management</h1>
        <p className="text-text-400 mt-2">
          Kelola akun user yang punya akses ke JETT Dashboard.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Users className="h-5 w-5 text-brand-500" />
            Daftar User
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder untuk tabel manajemen user (akan diisi dengan data Supabase).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Area ini nanti berisi tabel user lengkap (nama, email, role, status) dengan aksi seperti edit
              role, suspend, dan reset password. Saat ini belum ada backend final, jadi hanya placeholder
              yang aman.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Role lo tidak punya akses ke halaman ini. Hanya admin dan superadmin yang bisa melihat dan
              mengelola user lain.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardPermissions({ user }: DashboardContentProps) {
  const isAllowed = user.role === "admin" || user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Permissions</h1>
        <p className="text-text-400 mt-2">
          Kontrol permission per role untuk fitur utama JETT Dashboard.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Shield className="h-5 w-5 text-brand-500" />
            Matrix Permissions
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder untuk matrix permission (role × capability).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Di sini nanti akan ada matrix permission yang sinkron dengan sistem RLS dan permission engine
              di backend. Untuk sekarang, halaman ini hanya dokumentasi visual bahwa modul permissions sudah
              disiapkan.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Hanya admin dan superadmin yang bisa melihat dan mengubah permissions. Hubungi admin kalau lo
              butuh akses tambahan.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSystem({ user }: DashboardContentProps) {
  const isAllowed = user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">System Health</h1>
        <p className="text-text-400 mt-2">
          Monitoring singkat kondisi sistem JETT (hanya untuk superadmin).
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Activity className="h-5 w-5 text-brand-500" />
            Ringkasan System Health
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder yang akan diisi oleh data dari endpoint health-check.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Panel ini nantinya menampilkan uptime, response time rata-rata, error rate, dan status service
              kritikal (database, storage, auth). Saat ini belum terhubung ke backend sehingga aman untuk
              produksi.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang bisa melihat status internal sistem. Role lo saat ini:{" "}
              <span className="font-semibold capitalize">{user.role}</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardInvitations({ user }: DashboardContentProps) {
  const isAllowed = user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Invitations</h1>
        <p className="text-text-400 mt-2">
          Kelola undangan user baru untuk JETT Dashboard.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Mail className="h-5 w-5 text-brand-500" />
            Undangan User
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder untuk form kirim undangan dan daftar undangan yang masih aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Nantinya di sini ada form untuk mengirim undangan via email dan tabel undangan yang statusnya
              masih pending/expired. Untuk sekarang, halaman ini hanya memberi konteks bahwa modul
              invitations sudah dialokasikan.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang bisa mengirim undangan user baru. Kalau lo butuh akses, minta superadmin
              untuk mendaftarkan akun lo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardAudit({ user }: DashboardContentProps) {
  const isAllowed = user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Audit Logs</h1>
        <p className="text-text-400 mt-2">
          Rekaman aktivitas penting di sistem, untuk kebutuhan audit dan debugging.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <FileText className="h-5 w-5 text-brand-500" />
            Log Aktivitas
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder untuk tabel audit (siapa melakukan apa, di mana, dan kapan).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Di sini nanti ada tabel audit yang bisa difilter berdasarkan user, aksi, dan rentang waktu.
              Implementasi backend belum diaktifkan supaya nggak mengganggu performa development.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Audit logs hanya dapat diakses oleh superadmin untuk menjaga keamanan dan privasi data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSecurity({ user }: DashboardContentProps) {
  const isAllowed = user.role === "superadmin";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Security</h1>
        <p className="text-text-400 mt-2">
          Area untuk mengatur kebijakan keamanan tingkat lanjut JETT Dashboard.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Lock className="h-5 w-5 text-brand-500" />
            Keamanan Sistem
          </CardTitle>
          <CardDescription className="text-text-400">
            Placeholder untuk pengaturan keamanan (rate limiting, IP allowlist, dsb).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <p className="text-sm text-text-400">
              Rencananya di sini ada panel konfigurasi keamanan global: rate limiting, IP allowlist, audit
              rule, dan integrasi alerting. Sekarang masih berupa placeholder supaya layout dashboard sudah
              siap tanpa mengunci implementasi backend.
            </p>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang bisa mengubah pengaturan keamanan sistem. Role lo saat ini:{" "}
              <span className="font-semibold capitalize">{user.role}</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

