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

  const { data: admin, error: adminError } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("email", user.email)
    .single();

  if (adminError || !admin || admin.role !== "admin") {
    return { error: { status: 403, message: "Admin access required" } };
  }

  return { supabaseAdmin, user };
}

export async function GET() {
  try {
    const adminContext = await requireAdmin();
    if ("error" in adminContext && adminContext.error) {
      return NextResponse.json(
        { error: adminContext.error.message },
        { status: adminContext.error.status }
      );
    }

    const { supabaseAdmin } = adminContext;

    const { data: users, error } = await supabaseAdmin
      .from("authorized_users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    console.error("[admin/users] GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminContext = await requireAdmin();
    if ("error" in adminContext && adminContext.error) {
      return NextResponse.json(
        { error: adminContext.error.message },
        { status: adminContext.error.status }
      );
    }

    const { supabaseAdmin, user: adminUser } = adminContext;
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const exness_account_id = (body.exness_account_id || "").trim();

    if (!email || !exness_account_id) {
      return NextResponse.json(
        { error: "Email and Exness Account ID are required" },
        { status: 400 }
      );
    }

    // Basic server-side email shape validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("authorized_users")
      .upsert(
        [
          {
            email,
            exness_account_id,
            role: "user",
          },
        ],
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error("[admin/users] insert error", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User saved",
      user: data,
      created_by: adminUser.email,
    });
  } catch (error: any) {
    console.error("[admin/users] POST error", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
