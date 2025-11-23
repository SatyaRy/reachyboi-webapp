import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("role")
      .eq("email", user.email)
      .single();

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const activeThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: activeUsers, error } = await supabaseAdmin
      .from("user_activity")
      .select("*")
      .gte("last_seen_at", activeThreshold)
      .order("last_seen_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      totalActive: activeUsers?.length || 0,
      activeUsers: activeUsers || [],
      windowMinutes: 15,
    });
  } catch (error: any) {
    console.error("[admin/users/active] error", error);
    return NextResponse.json(
      { error: "Failed to load active users" },
      { status: 500 }
    );
  }
}
