import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const customSession = request.cookies.get("custom_session");

    if (!customSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let email = "";
    try {
      const session = JSON.parse(customSession.value);
      if (session?.user?.email) {
        email = String(session.user.email).toLowerCase();
      }
    } catch (error) {
      console.error("[vps] parse session error", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("vps_instances")
      .select("*")
      .ilike("user_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[vps] fetch error", error);
      return NextResponse.json(
        { error: "Failed to load VPS instances" },
        { status: 500 }
      );
    }

    return NextResponse.json({ vps: data || [] });
  } catch (error: any) {
    console.error("[vps] GET error", error);
    return NextResponse.json({ error: "Failed to load VPS" }, { status: 500 });
  }
}
