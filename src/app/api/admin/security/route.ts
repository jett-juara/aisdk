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

  // Hanya superadmin yang boleh lihat konfigurasi keamanan global
  const { data: actorProfile, error: actorError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!actorProfile || actorError || actorProfile.role !== "superadmin") {
    return NextResponse.json(
      { error: { message: "Anda tidak memiliki akses untuk melihat pengaturan keamanan." } },
      { status: 403 },
    );
  }

  // Ambil satu row security_settings global (kalau ada)
  const { data: securitySettings } = await supabase
    .from("security_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Ambil beberapa security_events terbaru
  const { data: events } = await supabase
    .from("security_events")
    .select("id, type, activity, severity, timestamp, resolved")
    .order("timestamp", { ascending: false })
    .limit(10);

  return NextResponse.json({
    settings: securitySettings ?? null,
    events: events ?? [],
  });
}
