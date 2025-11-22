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
      .from("posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts: data || [], total: count || 0 });
  } catch (error: any) {
    console.error("[posts] GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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
    const content = (body.body || "").trim();
    const cover_image_url = (body.cover_image_url || "").trim() || null;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert([
        {
          title,
          body: content,
          cover_image_url,
          author_email: user.email,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ post: data });
  } catch (error: any) {
    console.error("[posts] POST error", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
