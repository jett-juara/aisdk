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

  // Cek role actor (harus superadmin untuk lihat semua undangan)
  const { data: actorProfile, error: actorError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (
    actorError ||
    !actorProfile ||
    actorProfile.role !== "superadmin"
  ) {
    return NextResponse.json(
      { error: { message: "Anda tidak memiliki akses untuk melihat daftar undangan." } },
      { status: 403 },
    );
  }

  const { data: invitations, error } = await supabase
    .from("admin_invitations")
    .select(
      "id, email, first_name, last_name, role, status, inviter_id, invited_user_id, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    invitations: (invitations ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      role: row.role,
      status: row.status,
      inviterId: row.inviter_id ?? null,
      invitedUserId: row.invited_user_id ?? null,
      expiresAt: row.expires_at ?? null,
      sentAt: row.sent_at ?? null,
      lastSentAt: row.last_sent_at ?? null,
      respondedAt: row.responded_at ?? null,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    })),
  });
}
