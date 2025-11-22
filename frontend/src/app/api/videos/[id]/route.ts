import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: {
    category_id?: string;
    category_name?: string;
    category_description?: string;
  }
) {
  const { category_id, category_name, category_description } = payload;
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
        throw new Error("Failed to resolve category");
      }

      if (existingCategories && existingCategories.length > 0) {
        finalCategoryId = existingCategories[0].id;
      } else {
        const { data: newCategory, error: insertCategoryError } = await supabase
          .from("categories")
          .insert({
            name: normalizedName,
            description: normalizedDescription || normalizedName,
          })
          .select("id")
          .single();

        if (insertCategoryError || !newCategory) {
          throw new Error("Failed to create category");
        }

        finalCategoryId = newCategory.id;
      }
    }
  }

  return finalCategoryId;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: video, error } = await supabase
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
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const updates: Record<string, string> = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (video_url) updates.video_url = video_url;
    if (thumbnail_url) updates.thumbnail_url = thumbnail_url;

    let resolvedCategoryId: string | undefined;

    try {
      resolvedCategoryId = await resolveCategoryId(supabase, {
        category_id,
        category_name,
        category_description,
      });
    } catch (categoryError: any) {
      return NextResponse.json(
        { error: categoryError.message || "Failed to resolve category" },
        { status: 400 }
      );
    }

    if (resolvedCategoryId) {
      updates.category_id = resolvedCategoryId;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data: updatedVideo, error } = await supabase
      .from("videos")
      .update(updates)
      .eq("id", id)
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
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedVideo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
