import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const updates: Record<string, any> = {};
    if (body.status) updates.status = body.status;
    if (body.next_billing_at) updates.next_billing_at = body.next_billing_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update(updates)
      .eq("id", params.id)
      .eq("user_email", user.email)
      .select("*")
      .single();

    if (error) {
      console.error("[subscriptions/:id] update error", error);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscription: data });
  } catch (error: any) {
    console.error("[subscriptions/:id] PATCH error", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("id", params.id)
      .eq("user_email", user.email);

    if (error) {
      console.error("[subscriptions/:id] delete error", error);
      return NextResponse.json(
        { error: "Failed to delete subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[subscriptions/:id] DELETE error", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
