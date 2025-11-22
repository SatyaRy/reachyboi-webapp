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

  return { supabaseAdmin, user };
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 20;

    const { data, error, count } = await supabaseAdmin
      .from("daily_news")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ news: data || [], total: count || 0 });
  } catch (error: any) {
    console.error("[daily-news] GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch daily news" },
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

    const { supabaseAdmin, user } = adminContext;
    const body = await request.json();
    const title = (body.title || "").trim();
    const summary = (body.summary || "").trim() || null;
    const content = (body.body || "").trim();
    const source_url = (body.source_url || "").trim() || null;
    const published_at = body.published_at
      ? new Date(body.published_at).toISOString()
      : new Date().toISOString();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("daily_news")
      .insert([
        {
          title,
          summary,
          body: content,
          source_url,
          author_email: user.email,
          published_at,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ news: data });
  } catch (error: any) {
    console.error("[daily-news] POST error", error);
    return NextResponse.json(
      { error: "Failed to publish daily news" },
      { status: 500 }
    );
  }
}
