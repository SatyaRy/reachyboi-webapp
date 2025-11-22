import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";
import crypto from "crypto";

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

async function logAudit(
  supabaseAdmin: ReturnType<typeof createServiceRoleClient>,
  vps_id: string,
  action: string,
  actor_email?: string,
  details?: Record<string, any>
) {
  await supabaseAdmin.from("vps_audit_logs").insert({
    vps_id,
    action,
    actor_email,
    details: details || {},
  });
}

export async function PATCH(
  request: NextRequest,
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

    const { supabaseAdmin, user } = adminContext;
    const { id } = params;
    const body = await request.json();

    const action = body.action as
      | "start"
      | "stop"
      | "reboot"
      | "rebuild"
      | "suspend"
      | "terminate"
      | "resume"
      | "reset_credentials"
      | "restart_mt5"
      | undefined;

    const updates: Record<string, any> = {};

    if (body.region) updates.region = body.region;
    if (body.plan_template) updates.plan_template = body.plan_template;
    if (body.plan_name) updates.plan_name = body.plan_name;
    if (body.plan_price !== undefined) updates.plan_price = Number(body.plan_price);
    if (body.subscription_status)
      updates.subscription_status = body.subscription_status;
    if (body.next_billing_at) updates.next_billing_at = body.next_billing_at;
    if (body.cpu_usage !== undefined) updates.cpu_usage = Number(body.cpu_usage);
    if (body.memory_usage !== undefined)
      updates.memory_usage = Number(body.memory_usage);
    if (body.storage_usage !== undefined)
      updates.storage_usage = Number(body.storage_usage);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.mt5_status) updates.mt5_status = body.mt5_status;
    if (body.last_heartbeat_at) updates.last_heartbeat_at = body.last_heartbeat_at;
    if (body.auto_suspend_at) updates.auto_suspend_at = body.auto_suspend_at;
    if (body.suspend_reason) updates.suspend_reason = body.suspend_reason;

    if (action) {
      const now = new Date().toISOString();
      switch (action) {
        case "start":
          updates.status = "online";
          updates.suspend_reason = null;
          break;
        case "stop":
          updates.status = "offline";
          break;
        case "reboot":
          updates.status = "maintenance";
          break;
        case "rebuild":
          updates.status = "maintenance";
          break;
        case "suspend":
          updates.status = "suspended";
          updates.subscription_status = "suspended";
          updates.suspend_reason = body.suspend_reason || "Auto-suspended";
          break;
        case "resume":
          updates.status = "online";
          updates.subscription_status = "active";
          updates.suspend_reason = null;
          break;
        case "terminate":
          updates.status = "terminated";
          updates.subscription_status = "cancelled";
          updates.auto_suspend_at = now;
          break;
        case "restart_mt5":
          updates.mt5_status = "restarting";
          break;
      }
    }

    if (body.reset_credentials) {
      const newPass = crypto.randomBytes(6).toString("base64url");
      updates.credentials = {
        username: body.credentials?.username || "admin",
        password: newPass,
        rdp_package: body.credentials?.rdp_package || null,
      };
    } else if (body.credentials) {
      updates.credentials = body.credentials;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("vps_instances")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[admin/vps/:id] update error", error);
      return NextResponse.json(
        { error: "Failed to update VPS" },
        { status: 500 }
      );
    }

    await logAudit(supabaseAdmin, id, action || "update", user.email, updates);

    return NextResponse.json({ vps: data });
  } catch (error: any) {
    console.error("[admin/vps/:id] PATCH error", error);
    return NextResponse.json(
      { error: "Failed to update VPS" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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
    const { id } = params;

    const { error } = await supabaseAdmin
      .from("vps_instances")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/vps/:id] delete error", error);
      return NextResponse.json(
        { error: "Failed to delete VPS" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/vps/:id] DELETE error", error);
    return NextResponse.json(
      { error: "Failed to delete VPS" },
      { status: 500 }
    );
  }
}
