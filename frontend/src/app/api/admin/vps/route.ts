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
    const { data, error } = await supabaseAdmin
      .from("vps_instances")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ vps: data || [] });
  } catch (error: any) {
    console.error("[admin/vps] GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch VPS instances" },
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

    const { supabaseAdmin } = adminContext;
    const body = await request.json();

    const user_email = String(body.user_email || "").trim().toLowerCase();
    const plan_name = body.plan_name || "Standard VPS";
    const plan_price = Number(body.plan_price || 12);
    const region = body.region || "";
    const cpu = body.cpu || "";
    const memory_gb = body.memory_gb ? Number(body.memory_gb) : null;
    const storage_gb = body.storage_gb ? Number(body.storage_gb) : null;
    const notes = body.notes || "";

    if (!user_email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("vps_instances")
      .insert({
        user_email,
        plan_name,
        plan_price,
        plan_template: body.plan_template || null,
        region,
        cpu,
        memory_gb,
        storage_gb,
        notes,
        status: "online",
        subscription_status: "active",
        credentials: body.credentials || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[admin/vps] insert error", error);
      return NextResponse.json(
        { error: "Failed to create VPS" },
        { status: 500 }
      );
    }

    return NextResponse.json({ vps: data }, { status: 201 });
  } catch (error: any) {
    console.error("[admin/vps] POST error", error);
    return NextResponse.json(
      { error: "Failed to create VPS" },
      { status: 500 }
    );
  }
}
