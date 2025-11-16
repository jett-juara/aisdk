import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: { id: string };
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = params;
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

  // Hanya superadmin yang boleh mempromosikan pengguna
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
      {
        error: {
          message:
            "Anda tidak memiliki akses untuk mempromosikan pengguna menjadi admin.",
        },
      },
      { status: 403 },
    );
  }

  try {
    const { data, error } = await supabase.rpc("promote_user_to_admin", {
      target_user: id,
    });

    if (error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 400 },
      );
    }

    const promoted = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json({
      success: true,
      userId: promoted?.id ?? id,
      role: promoted?.role ?? "admin",
      updatedAt: promoted?.updated_at ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: {
          message:
            e instanceof Error
              ? e.message
              : "Terjadi kesalahan saat mempromosikan pengguna.",
        },
      },
      { status: 500 },
    );
  }
}

