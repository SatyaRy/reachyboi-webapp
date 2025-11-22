import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Sign out from Supabase (for admin users)
    await supabase.auth.signOut();

    // Clear custom session cookie
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    response.cookies.delete("custom_session");

    return response;
  } catch (error: any) {
    console.error("Sign-out error:", error);
    return NextResponse.json({ error: "Sign-out failed" }, { status: 500 });
  }
}
