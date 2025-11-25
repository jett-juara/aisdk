/**
 * setting secondary sections for each menu
 * Implementasi ringan dan konsisten dengan Overview
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SettingContentProps } from "@/lib/setting/types";
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

export function SettingProfile({ user }: SettingContentProps) {
  const initialFirstName =
    (user as any).firstName ?? (user as any).first_name ?? "";
  const initialLastName =
    (user as any).lastName ?? (user as any).last_name ?? "";

  const [editMode, setEditMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedFirstName, setSavedFirstName] =
    React.useState(initialFirstName);
  const [savedLastName, setSavedLastName] = React.useState(initialLastName);
  const [savedEmail, setSavedEmail] = React.useState(user.email);

  const [firstName, setFirstName] = React.useState(initialFirstName);
  const [lastName, setLastName] = React.useState(initialLastName);
  const [email, setEmail] = React.useState(user.email);
  const [username, setUsername] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Ambil username canonical sekali saat mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const payload = await res.json();
        const apiFirst = payload?.firstName ?? initialFirstName;
        const apiLast = payload?.lastName ?? initialLastName;
        const apiEmail = payload?.email ?? user.email;

        setUsername(payload?.username ?? null);
        setSavedFirstName(apiFirst);
        setSavedLastName(apiLast);
        setSavedEmail(apiEmail);
        setFirstName(apiFirst);
        setLastName(apiLast);
        setEmail(apiEmail);
      } catch {
        // diam saja; profile tetap pakai data dari server setting
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = () => {
    // Reset field ke nilai terakhir yang tersimpan
    setFirstName(savedFirstName);
    setLastName(savedLastName);
    setEmail(savedEmail);
    setEditMode(true);
    setMessage(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
    setMessage(null);
    setFirstName(savedFirstName);
    setLastName(savedLastName);
    setEmail(savedEmail);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const fallbackUsername =
        username ??
        (user as any).username ??
        (user.email ? user.email.split("@")[0] : "user");

      const body = {
        firstName,
        lastName,
        email,
        username: fallbackUsername,
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          payload?.error?.message ??
          "Gagal menyimpan profil. Pastikan data lo valid dan coba lagi.";
        setError(msg);
        setSaving(false);
        return;
      }

      // Sinkronkan state dengan data terbaru dari API
      const newFirst = payload?.firstName ?? firstName;
      const newLast = payload?.lastName ?? lastName;
      const newEmail = payload?.email ?? email;

      setFirstName(newFirst);
      setLastName(newLast);
      setEmail(newEmail);

      setSavedFirstName(newFirst);
      setSavedLastName(newLast);
      setSavedEmail(newEmail);

      setUsername(payload?.username ?? fallbackUsername);
      setMessage("Profil berhasil disimpan.");
      setEditMode(false);
    } catch {
      setError("Gagal menyimpan profil. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedEmail = email.trim();
  const isFirstNameValid = trimmedFirstName.length >= 2;
  const isEmailValid =
    trimmedEmail.length > 0 && trimmedEmail.includes("@");
  const hasChanges =
    trimmedFirstName !== savedFirstName.trim() ||
    trimmedLastName !== savedLastName.trim() ||
    trimmedEmail !== savedEmail.trim();
  const canSave =
    editMode && !saving && isFirstNameValid && isEmailValid && hasChanges;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">My Profile</h1>
        <p className="text-text-400 mt-2">
          Ringkasan informasi akun yang digunakan di JETT Setting.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-text-50">
              <UserIcon className="h-5 w-5 text-text-50" />
              Profil User
            </CardTitle>
          </div>
          {!editMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditClick}
              className="text-xs"
            >
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="text-xs"
              >
                Batalkan
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!canSave}
                className="text-xs"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-text-400">Nama Lengkap</div>
              {editMode ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nama depan"
                    className="text-sm"
                  />
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nama belakang"
                    className="text-sm"
                  />
                </div>
              ) : (
                <div className="text-sm font-medium text-text-50">
                  {firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : "Belum diisi"}
                </div>
              )}
              {editMode && !isFirstNameValid && (
                <p className="text-[11px] text-button-destructive mt-1">
                  Nama depan minimal 2 karakter.
                </p>
              )}
            </div>
            <div>
              <div className="text-xs text-text-400">Email</div>
              {editMode ? (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="mt-1 text-sm"
                />
              ) : (
                <div className="text-sm font-medium text-text-50">
                  {email}
                </div>
              )}
              {editMode && !isEmailValid && (
                <p className="text-[11px] text-button-destructive mt-1">
                  Format email tampak tidak valid.
                </p>
              )}
            </div>
            {/* Username sengaja disembunyikan dari UI, tetap dikelola via API */}
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
                className="text-xs px-2 py-0.5 rounded-full"
              >
                {user.status}
              </Badge>
            </div>
          </div>

          {error && (
            <p className="text-xs text-button-destructive mt-2">{error}</p>
          )}
          {message && !error && (
            <p className="text-xs text-text-50 mt-2">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingUsers({ user }: SettingContentProps) {
  const isAllowed = user.role === "admin" || user.role === "superadmin";
  interface AdminUserRow {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    status: string;
    deletedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }

  const [users, setUsers] = React.useState<AdminUserRow[]>([]);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);
  const [promotingId, setPromotingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat daftar pengguna.");
          } else {
            setError("Gagal mengambil daftar user.");
          }
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setUsers(payload?.users ?? []);
        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil daftar user.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAllowed]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">User Management</h1>
        <p className="text-text-400 mt-2">
          Kelola akun user yang punya akses ke JETT Setting.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Users className="h-5 w-5 text-text-50" />
            Daftar User
          </CardTitle>
          <CardDescription className="text-text-400">
            Tabel read-only user yang terdaftar di JETT Setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-2">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-8 bg-background-700/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && (
                <>
                  {users.length === 0 ? (
                    <p className="text-sm text-text-400">
                      Belum ada user lain yang terdaftar di sistem.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="border-b border-border-700 text-text-400">
                          <tr>
                            <th className="py-2 pr-4">Nama</th>
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Role</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4 hidden md:table-cell">
                              Dibuat
                            </th>
                            {user.role === "superadmin" && (
                              <th className="py-2 pr-4">Aksi</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => {
                            const name =
                              [u.firstName, u.lastName]
                                .filter(Boolean)
                                .join(" ")
                                .trim() || "–";
                            return (
                              <tr
                                key={u.id}
                                className="border-b border-border-800 last:border-0"
                              >
                                <td className="py-2 pr-4 text-text-50">
                                  {name}
                                </td>
                                <td className="py-2 pr-4 text-text-200">
                                  {u.email}
                                </td>
                                <td className="py-2 pr-4 text-text-200 capitalize">
                                  {u.role}
                                </td>
                                <td className="py-2 pr-4">
                                  <Badge
                                    variant={
                                      u.status === "active"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="text-xs px-2 py-0.5 capitalize rounded-full"
                                  >
                                    {u.status}
                                  </Badge>
                                </td>
                                <td className="py-2 pr-4 hidden md:table-cell text-text-500">
                                  {u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString()
                                    : "–"}
                                </td>
                                {user.role === "superadmin" && (
                                  <td className="py-2 pr-4">
                                    {u.role === "user" && u.status === "active" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={promotingId === u.id}
                                        className="h-7 text-xs px-3 rounded-full"
                                        onClick={async () => {
                                          try {
                                            const confirmed = window.confirm(
                                              `Yakin ingin mempromosikan ${name} menjadi admin?`,
                                            );
                                            if (!confirmed) {
                                              return;
                                            }
                                            setPromotingId(u.id);
                                            setError(null);
                                            const res = await fetch(
                                              `/api/admin/users/${u.id}/promote`,
                                              { method: "POST" },
                                            );
                                            const payload = await res
                                              .json()
                                              .catch(() => ({}));
                                            if (!res.ok) {
                                              setError(
                                                payload?.error?.message ??
                                                "Gagal mempromosikan pengguna.",
                                              );
                                              setPromotingId(null);
                                              return;
                                            }
                                            setUsers((prev) =>
                                              prev.map((row) =>
                                                row.id === u.id
                                                  ? { ...row, role: "admin" }
                                                  : row,
                                              ),
                                            );
                                            setPromotingId(null);
                                          } catch {
                                            setError(
                                              "Gagal mempromosikan pengguna.",
                                            );
                                            setPromotingId(null);
                                          }
                                        }}
                                      >
                                        Promote
                                      </Button>
                                    ) : (
                                      <span className="text-[11px] text-text-500">
                                        –
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-text-400">
              Anda tidak memiliki akses ke halaman ini. Hanya admin dan superadmin yang dapat melihat dan
              mengelola pengguna lain.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingPermissions({ user }: SettingContentProps) {
  const isAllowed = user.role === "admin" || user.role === "superadmin";
  const [roles, setRoles] = React.useState<
    { role: string; permissions: string[] }[]
  >([]);
  const [userOverrides, setUserOverrides] = React.useState<
    {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      overrides: { pageKey: string; featureKey: string; accessGranted: boolean }[];
    }[]
  >([]);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/permissions");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat konfigurasi permissions.");
          } else {
            setError("Gagal mengambil data permissions.");
          }
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setRoles(payload?.roles ?? []);
        setUserOverrides(payload?.userOverrides ?? []);
        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil data permissions.");
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [isAllowed]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Permissions</h1>
        <p className="text-text-400 mt-2">
          Kontrol permission per role untuk fitur utama JETT Setting.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Shield className="h-5 w-5 text-text-50" />
            Matrix Permissions
          </CardTitle>
          <CardDescription className="text-text-400">
            Ringkasan permissions per role dan override per user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-7 bg-background-700/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && (
                <div className="space-y-6">
                  {/* Role matrix */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-50 mb-2">
                      Role Permissions
                    </h2>
                    {roles.length === 0 ? (
                      <p className="text-xs text-text-500">
                        Belum ada role_permissions yang tercatat di database.
                      </p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        {roles.map((r) => (
                          <div
                            key={r.role}
                            className="border border-border-700 rounded-md p-3"
                          >
                            <div className="text-xs uppercase tracking-wide text-text-400 mb-1">
                              {r.role}
                            </div>
                            <div className="text-xs text-text-200">
                              Total permissions:{" "}
                              <span className="font-semibold">
                                {r.permissions.length}
                              </span>
                            </div>
                            {r.permissions.length > 0 && (
                              <ul className="mt-2 text-[11px] text-text-400 space-y-1 max-h-32 overflow-auto">
                                {r.permissions.map((p) => (
                                  <li key={p} className="truncate">
                                    • {p}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User overrides */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-50 mb-2">
                      User Overrides
                    </h2>
                    {userOverrides.length === 0 ? (
                      <p className="text-xs text-text-500">
                        Belum ada override user_permissions spesifik user. Sistem mengikuti role_permissions saja.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userOverrides.slice(0, 5).map((u) => (
                          <div
                            key={u.userId}
                            className="border border-border-700 rounded-md p-3"
                          >
                            <div className="flex justify-between items-center text-xs text-text-200 mb-1">
                              <span className="truncate max-w-[12rem]">
                                {u.firstName || u.lastName
                                  ? `${u.firstName} ${u.lastName}`.trim()
                                  : u.email}
                              </span>
                              <span className="text-text-500">
                                {u.overrides.length} override
                              </span>
                            </div>
                            <ul className="text-[11px] text-text-400 space-y-1 max-h-24 overflow-auto">
                              {u.overrides.map((o, idx) => (
                                <li key={idx} className="truncate">
                                  {o.pageKey} / {o.featureKey} →{" "}
                                  {o.accessGranted ? "allow" : "deny"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
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

export function SettingSystem({ user }: SettingContentProps) {
  const isAllowed = user.role === "superadmin";
  const [health, setHealth] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);
  const [snapshot, setSnapshot] = React.useState<{
    status: string | null;
    uptime: number | null;
    errorRate: number | null;
  } | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError(null);

        const [healthRes, snapshotRes] = await Promise.all([
          fetch("/api/admin/system/health"),
          fetch("/api/setting/system-status"),
        ]);

        if (!healthRes.ok) {
          if (healthRes.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat status sistem.");
          } else {
            setError("Gagal mengambil data system health.");
          }
          setLoading(false);
          return;
        }

        const healthPayload = await healthRes.json();
        setHealth(healthPayload);

        if (snapshotRes.ok) {
          const snapPayload = await snapshotRes.json();
          const snap = snapPayload?.systemStatus;
          if (snap) {
            setSnapshot({
              status: snap.status ?? null,
              uptime: snap.uptime ?? null,
              errorRate: snap.errorRate ?? null,
            });
          }
        }

        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil data system health.");
        setLoading(false);
      }
    };

    fetchHealth();
  }, [isAllowed]);

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
            <Activity className="h-5 w-5 text-text-50" />
            Ringkasan System Health
          </CardTitle>
          <CardDescription className="text-text-400">
            Ringkasan kondisi sistem JETT berdasarkan data 24 jam terakhir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-3">
                  <div className="h-6 bg-background-700/50 rounded-md animate-pulse" />
                  <div className="h-24 bg-background-700/40 rounded-md animate-pulse" />
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && health && (
                <div className="space-y-6">
                  {/* Overall status */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs uppercase tracking-wide text-text-400">
                      Overall Status
                    </div>
                    <span
                      className={
                        health.status === "healthy"
                          ? "text-text-50 font-semibold text-lg capitalize"
                          : health.status === "degraded"
                            ? "text-text-50 font-semibold text-lg capitalize"
                            : "text-button-destructive font-semibold text-lg capitalize"
                      }
                    >
                      {health.status}
                    </span>
                    <div className="text-sm text-text-200">
                      Terakhir dicek:{" "}
                      <span className="font-mono">
                        {health.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Snapshot uptime/errorRate dari setting_latest_snapshot */}
                  {snapshot && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-text-400 mb-1">
                          Uptime 24h (snapshot)
                        </div>
                        <div className="text-sm text-text-200">
                          {snapshot.uptime != null ? (
                            <span className="font-semibold">
                              {snapshot.uptime.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-text-500">Belum ada data</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-400 mb-1">
                          Error Rate 24h (snapshot)
                        </div>
                        <div className="text-sm text-text-200">
                          {snapshot.errorRate != null ? (
                            <span className="font-semibold">
                              {snapshot.errorRate.toFixed(3)}%
                            </span>
                          ) : (
                            <span className="text-text-500">Belum ada data</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Users & invitations */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-text-400 mb-1">Users</div>
                      <div className="text-sm text-text-200">
                        Total:{" "}
                        <span className="font-semibold">
                          {health.system?.users?.total ?? 0}
                        </span>
                      </div>
                      <div className="text-xs text-text-400">
                        Active 24h:{" "}
                        <span className="font-semibold">
                          {health.system?.users?.active24h ?? 0}
                        </span>
                      </div>
                      <div className="text-xs text-text-400">
                        New 24h:{" "}
                        <span className="font-semibold">
                          {health.system?.users?.new24h ?? 0}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-text-400 mb-1">Invitations</div>
                      <div className="text-sm text-text-200">
                        Total:{" "}
                        <span className="font-semibold">
                          {health.system?.invitations?.total ?? 0}
                        </span>
                      </div>
                      <div className="text-xs text-text-400">
                        Pending:{" "}
                        <span className="font-semibold">
                          {health.system?.invitations?.pending ?? 0}
                        </span>
                      </div>
                      <div className="text-xs text-text-400">
                        Accepted 24h:{" "}
                        <span className="font-semibold">
                          {health.system?.invitations?.accepted24h ?? 0}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-text-400 mb-1">Activity</div>
                      <div className="text-sm text-text-200">
                        Actions 24h:{" "}
                        <span className="font-semibold">
                          {health.system?.activity?.totalActions24h ?? 0}
                        </span>
                      </div>
                      <div className="text-xs text-text-400">
                        DB Errors 1h:{" "}
                        <span className="font-semibold">
                          {health.database?.recentErrors ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent actions & invitations (max 5) */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-text-400 mb-2">
                        Recent Actions (±1 jam)
                      </div>
                      <div className="space-y-2">
                        {(health.activity?.recentActions ?? []).slice(0, 5).map(
                          (item: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-xs text-text-200 flex justify-between gap-4"
                            >
                              <span className="truncate max-w-[12rem]">
                                {item.action ?? "Activity"}
                              </span>
                              <span className="text-text-500 whitespace-nowrap">
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleTimeString()
                                  : ""}
                              </span>
                            </div>
                          ),
                        )}
                        {(health.activity?.recentActions ?? []).length === 0 && (
                          <p className="text-xs text-text-500">
                            Belum ada aktivitas signifikan di 1 jam terakhir.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-text-400 mb-2">
                        Recent Invitations (±1 jam)
                      </div>
                      <div className="space-y-2">
                        {(health.activity?.recentInvitations ?? [])
                          .slice(0, 5)
                          .map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-xs text-text-200 flex justify-between gap-4"
                            >
                              <span className="truncate max-w-[12rem]">
                                {item.email ?? "unknown"}
                              </span>
                              <span className="text-text-500 whitespace-nowrap">
                                {item.status ?? ""}
                              </span>
                            </div>
                          ))}
                        {(health.activity?.recentInvitations ?? []).length === 0 && (
                          <p className="text-xs text-text-500">
                            Belum ada undangan baru di 1 jam terakhir.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang dapat melihat status internal sistem. Peran Anda saat ini:{" "}
              <span className="font-semibold capitalize">{user.role}</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingInvitations({ user }: SettingContentProps) {
  const isAllowed = user.role === "superadmin";
  interface InvitationRow {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    inviterId: string | null;
    invitedUserId: string | null;
    expiresAt: string | null;
    sentAt: string | null;
    lastSentAt: string | null;
    respondedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }

  const [invitations, setInvitations] = React.useState<InvitationRow[]>([]);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/invitations");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat daftar undangan.");
          } else {
            setError("Gagal mengambil daftar undangan.");
          }
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setInvitations(payload?.invitations ?? []);
        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil daftar undangan.");
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [isAllowed]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Invitations</h1>
        <p className="text-text-400 mt-2">
          Kelola undangan user baru untuk JETT Setting.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Mail className="h-5 w-5 text-text-50" />
            Undangan User
          </CardTitle>
          <CardDescription className="text-text-400">
            Daftar undangan user yang dikirim melalui sistem admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-2">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-8 bg-background-700/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && (
                <>
                  {invitations.length === 0 ? (
                    <p className="text-sm text-text-400">
                      Belum ada undangan yang tercatat di sistem.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="border-b border-border-700 text-text-400">
                          <tr>
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Nama</th>
                            <th className="py-2 pr-4">Role</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4 hidden md:table-cell">
                              Kadaluarsa
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitations.map((inv) => {
                            const name =
                              [inv.firstName, inv.lastName]
                                .filter(Boolean)
                                .join(" ")
                                .trim() || "–";
                            return (
                              <tr
                                key={inv.id}
                                className="border-b border-border-800 last:border-0"
                              >
                                <td className="py-2 pr-4 text-text-200">
                                  {inv.email}
                                </td>
                                <td className="py-2 pr-4 text-text-50">
                                  {name}
                                </td>
                                <td className="py-2 pr-4 text-text-200 capitalize">
                                  {inv.role}
                                </td>
                                <td className="py-2 pr-4">
                                  <Badge
                                    variant={
                                      inv.status === "pending" ||
                                        inv.status === "sent"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="text-xs px-2 py-0.5 capitalize rounded-full"
                                  >
                                    {inv.status}
                                  </Badge>
                                </td>
                                <td className="py-2 pr-4 hidden md:table-cell text-text-500">
                                  {inv.expiresAt
                                    ? new Date(
                                      inv.expiresAt,
                                    ).toLocaleDateString()
                                    : "–"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang dapat mengirim undangan pengguna baru. Jika Anda membutuhkan akses,
              minta superadmin untuk mendaftarkan akun Anda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingAudit({ user }: SettingContentProps) {
  const isAllowed = user.role === "superadmin";
  interface AuditRow {
    id: string;
    userId: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    createdAt: string | null;
    user: {
      id: string | null;
      email: string;
      firstName: string;
      lastName: string;
    };
  }

  const [logs, setLogs] = React.useState<AuditRow[]>([]);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchAudit = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/audit?limit=50");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat audit log.");
          } else {
            setError("Gagal mengambil audit logs.");
          }
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setLogs(payload?.logs ?? []);
        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil audit logs.");
        setLoading(false);
      }
    };

    fetchAudit();
  }, [isAllowed]);

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
            <FileText className="h-5 w-5 text-text-50" />
            Log Aktivitas
          </CardTitle>
          <CardDescription className="text-text-400">
            Tabel ringkas aktivitas penting (siapa melakukan apa, di resource mana, dan kapan).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-2">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-8 bg-background-700/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && (
                <>
                  {logs.length === 0 ? (
                    <p className="text-sm text-text-400">
                      Belum ada audit logs yang tercatat.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="border-b border-border-700 text-text-400">
                          <tr>
                            <th className="py-2 pr-4">Waktu</th>
                            <th className="py-2 pr-4">User</th>
                            <th className="py-2 pr-4">Aksi</th>
                            <th className="py-2 pr-4 hidden md:table-cell">
                              Resource
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => {
                            const name =
                              [log.user.firstName, log.user.lastName]
                                .filter(Boolean)
                                .join(" ")
                                .trim() || log.user.email;
                            return (
                              <tr
                                key={log.id}
                                className="border-b border-border-800 last:border-0"
                              >
                                <td className="py-2 pr-4 text-text-500 whitespace-nowrap">
                                  {log.createdAt
                                    ? new Date(log.createdAt).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })
                                    : "–"}
                                </td>
                                <td className="py-2 pr-4 text-text-200">
                                  {name}
                                </td>
                                <td className="py-2 pr-4 text-text-50">
                                  {log.action}
                                </td>
                                <td className="py-2 pr-4 hidden md:table-cell text-text-200">
                                  {log.resourceType || "–"}
                                  {log.resourceId ? ` (${log.resourceId})` : ""}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-text-400">
              Audit log hanya dapat diakses oleh superadmin untuk menjaga keamanan dan privasi data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingSecurity({ user }: SettingContentProps) {
  const isAllowed = user.role === "superadmin";
  const [settings, setSettings] = React.useState<any | null>(null);
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(isAllowed);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    const fetchSecurity = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/security");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Anda tidak memiliki akses untuk melihat pengaturan keamanan.");
          } else {
            setError("Gagal mengambil data keamanan.");
          }
          setLoading(false);
          return;
        }
        const payload = await res.json();
        setSettings(payload?.settings ?? null);
        setEvents(payload?.events ?? []);
        setLoading(false);
      } catch (_e) {
        setError("Gagal mengambil data keamanan.");
        setLoading(false);
      }
    };

    fetchSecurity();
  }, [isAllowed]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-50 font-heading">Security</h1>
        <p className="text-text-400 mt-2">
          Area untuk mengatur kebijakan keamanan tingkat lanjut JETT Setting.
        </p>
      </div>

      <Card className="bg-background-800 border-border-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-50">
            <Lock className="h-5 w-5 text-text-50" />
            Keamanan Sistem
          </CardTitle>
          <CardDescription className="text-text-400">
            Ringkasan pengaturan keamanan dan aktivitas security terbaru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAllowed ? (
            <>
              {loading && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-7 bg-background-700/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-sm text-text-400">{error}</p>
              )}

              {!loading && !error && (
                <div className="space-y-6">
                  {/* Settings summary */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-50 mb-2">
                      Security Settings (global)
                    </h2>
                    {settings ? (
                      <div className="grid gap-4 md:grid-cols-3 text-xs text-text-200">
                        <div>
                          <div className="text-text-400 mb-1">MFA Diperlukan</div>
                          <div className="font-semibold">
                            {settings.requiremfa ? "Ya" : "Tidak"}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-400 mb-1">Session Timeout (menit)</div>
                          <div className="font-semibold">
                            {settings.sessiontimeout ?? "Default"}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-400 mb-1">Max Sessions</div>
                          <div className="font-semibold">
                            {settings.maxsessions ?? "Default"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-text-500">
                        Belum ada konfigurasi di tabel security_settings. Sistem memakai pengaturan default.
                      </p>
                    )}
                  </div>

                  {/* Recent security events */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-50 mb-2">
                      Security Events Terbaru
                    </h2>
                    {events.length === 0 ? (
                      <p className="text-xs text-text-500">
                        Belum ada security_events yang tercatat.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-auto">
                        {events.map((e) => (
                          <div
                            key={e.id}
                            className="flex justify-between items-center text-xs text-text-200 border border-border-700 rounded-md px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {e.type ?? "event"}
                              </div>
                              <div className="text-[11px] text-text-500 truncate">
                                {e.activity ?? ""}
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <div className="text-[11px] text-text-500">
                                {e.timestamp
                                  ? new Date(e.timestamp).toLocaleDateString()
                                  : ""}
                              </div>
                              <div className="text-[11px]">
                                <span
                                  className={
                                    e.severity === "high"
                                      ? "text-button-destructive"
                                      : e.severity === "medium"
                                        ? "text-text-50"
                                        : "text-text-400"
                                  }
                                >
                                  {e.severity ?? "info"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-text-400">
              Hanya superadmin yang dapat mengubah pengaturan keamanan sistem. Peran Anda saat ini:{" "}
              <span className="font-semibold capitalize">{user.role}</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
