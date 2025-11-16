import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  // Hanya superadmin yang boleh lihat audit logs lengkap
  const { data: actorProfile, error: actorError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!actorProfile || actorError || actorProfile.role !== "superadmin") {
    return NextResponse.json(
      { error: { message: "Anda tidak memiliki akses untuk melihat audit log." } },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const fromParam = url.searchParams.get("from");

  const limit = Math.min(
    Number.isFinite(Number(limitParam)) && Number(limitParam) > 0
      ? Number(limitParam)
      : 50,
    200,
  );

  // Default filter: hanya log sejak awal hari ini (UTC)
  let fromIso: string | null = null;
  if (fromParam) {
    fromIso = fromParam;
  } else {
    const now = new Date();
    const startOfDayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    fromIso = startOfDayUtc.toISOString();
  }

  let query = supabase
    .from("audit_logs")
    .select(
      "id, user_id, action, resource_type, resource_id, created_at, users:users!inner(id, email, first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (fromIso) {
    query = query.gte("created_at", fromIso);
  }

  const { data: logs, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    logs: (logs ?? []).map((row) => {
      const u = (row as any).users;
      return {
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        createdAt: row.created_at,
        user: {
          id: u?.id ?? null,
          email: u?.email ?? "",
          firstName: u?.first_name ?? "",
          lastName: u?.last_name ?? "",
        },
      };
    }),
  });
}
