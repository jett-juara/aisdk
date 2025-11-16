import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request) {
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

  // Admin & superadmin boleh lihat matrix permissions
  const { data: actorProfile, error: actorError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (
    actorError ||
    !actorProfile ||
    (actorProfile.role !== "admin" && actorProfile.role !== "superadmin")
  ) {
    return NextResponse.json(
      { error: { message: "Anda tidak memiliki akses untuk melihat konfigurasi permissions." } },
      { status: 403 },
    );
  }

  // Role-based permissions
  const { data: rolePerms, error: roleError } = await supabase
    .from("role_permissions")
    .select("role, permission, enabled")
    .order("role", { ascending: true });

  if (roleError) {
    return NextResponse.json(
      { error: { message: roleError.message } },
      { status: 400 },
    );
  }

  // User overrides (join ke users untuk info dasar)
  const { data: userPerms, error: userError } = await supabase
    .from("user_permissions")
    .select(
      "id, user_id, page_key, feature_key, access_granted, users:users!inner(id, email, first_name, last_name)",
    )
    .order("created_at", { ascending: false });

  if (userError) {
    return NextResponse.json(
      { error: { message: userError.message } },
      { status: 400 },
    );
  }

  const roles = Object.values(
    (rolePerms ?? []).reduce((acc, row) => {
      const role = row.role as string;
      if (!acc[role]) {
        acc[role] = {
          role,
          permissions: [] as string[],
        };
      }
      if (row.enabled) {
        acc[role].permissions.push(row.permission as string);
      }
      return acc;
    }, {} as Record<string, { role: string; permissions: string[] }>),
  );

  const userOverridesMap: Record<
    string,
    {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      overrides: { pageKey: string; featureKey: string; accessGranted: boolean }[];
    }
  > = {};

  for (const row of userPerms ?? []) {
    const u = (row as any).users;
    if (!u) continue;
    if (!userOverridesMap[row.user_id]) {
      userOverridesMap[row.user_id] = {
        userId: row.user_id,
        email: u.email ?? "",
        firstName: u.first_name ?? "",
        lastName: u.last_name ?? "",
        overrides: [],
      };
    }
    userOverridesMap[row.user_id].overrides.push({
      pageKey: row.page_key,
      featureKey: row.feature_key,
      accessGranted: row.access_granted,
    });
  }

  const userOverrides = Object.values(userOverridesMap);

  return NextResponse.json({
    roles,
    userOverrides,
  });
}
