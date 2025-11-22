import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const supabaseAdmin = createServiceRoleClient();

  let userEmail: string | null = null;
  let exnessAccountId: string | null = null;
  let role: "admin" | "user" = "user";

  // Try custom session (regular users)
  const customSessionCookie = request.cookies.get("custom_session");
  if (customSessionCookie) {
    try {
      const session = JSON.parse(customSessionCookie.value);
      if (session?.user && session.expires_at > Date.now()) {
        userEmail = session.user.email;
        exnessAccountId = session.user.exness_account_id || null;
        role = "user";
      }
    } catch (error) {
      console.error("[heartbeat] custom_session parse error", error);
    }
  }

  // Fallback to Supabase auth (admins)
  if (!userEmail) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      userEmail = user.email;
      role = "admin";
    }
  }

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const userAgent = request.headers.get("user-agent") || undefined;

  const { error } = await supabaseAdmin
    .from("user_activity")
    .upsert(
      [
        {
          user_email: userEmail,
          exness_account_id: exnessAccountId,
          role,
          user_agent: userAgent,
          status: "online",
          last_seen_at: now,
        },
      ],
      { onConflict: "user_email", ignoreDuplicates: false }
    );

  if (error) {
    console.error("[heartbeat] upsert error", error);
    return NextResponse.json(
      { error: "Failed to record activity" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, last_seen_at: now });
}
