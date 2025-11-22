import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const withVideosOnly = searchParams.get("withVideosOnly") === "true";

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (withVideosOnly) {
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("category_id");

      if (videosError) {
        return NextResponse.json({ error: videosError.message }, { status: 500 });
      }

      const categoriesWithVideos = new Set(
        (videos || []).map((video) => video.category_id)
      );

      const filtered = (categories || []).filter((category) =>
        categoriesWithVideos.has(category.id)
      );

      return NextResponse.json(filtered);
    }

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
