import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check for custom session cookie (regular users)
    const customSession = request.cookies.get("custom_session");

    if (customSession) {
      try {
        const session = JSON.parse(customSession.value);

        // Check if session is expired
        if (session.expires_at < Date.now()) {
          return NextResponse.json({ user: null });
        }

        return NextResponse.json({
          user: session.user,
        });
      } catch (error) {
        console.error("Custom session parse error:", error);
      }
    }

    // Check for Supabase Auth session (admin users)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    // Verify admin status
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", user.email)
      .single();

    if (admin) {
      return NextResponse.json({
        user: {
          email: user.email,
          is_admin: true,
          role: "admin" as const,
        },
      });
    }

    return NextResponse.json({ user: null });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}
