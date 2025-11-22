import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin status
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("role")
      .eq("email", user.email)
      .single();

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get total authorized users count
    const { count, error: countError } = await supabaseAdmin
      .from("authorized_users")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      total: count || 0,
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
