import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createClient();
  const supabaseAdmin = createServiceRoleClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: { status: 401, message: "Unauthorized" } };
  }

  const { data: admin } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("email", user.email)
    .single();

  if (!admin || admin.role !== "admin") {
    return { error: { status: 403, message: "Admin access required" } };
  }

  return { supabaseAdmin };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminContext = await requireAdmin();
    if ("error" in adminContext && adminContext.error) {
      return NextResponse.json(
        { error: adminContext.error.message },
        { status: adminContext.error.status }
      );
    }

    const { supabaseAdmin } = adminContext;

    const { error } = await supabaseAdmin
      .from("daily_news")
      .delete()
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[daily-news] DELETE error", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
