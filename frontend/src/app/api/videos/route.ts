import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  console.info("[videos] GET list");
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category");
    const searchQuery = searchParams.get("q");

    let query = supabase
      .from("videos")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filter by category if provided
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    // Search by title or description if query provided
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error("[videos] GET error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("[videos] GET unexpected error", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.info("[videos] POST create");
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[videos] Unauthorized create", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category_id,
      category_name,
      category_description,
      video_url,
      thumbnail_url,
    } = body;
    console.info("[videos] Payload received", {
      title,
      category_id,
      video_url: video_url ? "[provided]" : "[missing]",
      thumbnail_url: thumbnail_url ? "[provided]" : "[missing]",
    });

    let finalCategoryId = category_id;

    if (!finalCategoryId && category_name) {
      const normalizedName = String(category_name).trim();
      const normalizedDescription =
        String(category_description || category_name).trim() || normalizedName;

      if (normalizedName) {
        const { data: existingCategories, error: categoryLookupError } =
          await supabase
            .from("categories")
            .select("id")
            .ilike("name", normalizedName)
            .limit(1);

        if (categoryLookupError) {
          console.error("[videos] Category lookup error", categoryLookupError);
          return NextResponse.json(
            { error: "Failed to resolve category" },
            { status: 500 }
          );
        }

        if (existingCategories && existingCategories.length > 0) {
          finalCategoryId = existingCategories[0].id;
        } else {
          const { data: newCategory, error: insertCategoryError } =
            await supabase
              .from("categories")
              .insert({
                name: normalizedName,
                description: normalizedDescription || normalizedName,
              })
              .select("id")
              .single();

          if (insertCategoryError || !newCategory) {
            console.error("[videos] Category insert error", insertCategoryError);
            return NextResponse.json(
              { error: "Failed to create category" },
              { status: 500 }
            );
          }

          finalCategoryId = newCategory.id;
        }
      }
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !finalCategoryId ||
      !video_url ||
      !thumbnail_url
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: video, error } = await supabase
      .from("videos")
      .insert([
        {
          title,
          description,
          category_id: finalCategoryId,
          video_url,
          thumbnail_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[videos] Insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("[videos] POST unexpected error", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
