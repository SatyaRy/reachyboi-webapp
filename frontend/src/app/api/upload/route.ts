import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.info("[upload] Incoming upload request");
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[upload] Unauthorized upload attempt", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'video' or 'thumbnail'

    if (!file) {
      console.warn("[upload] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure bucket exists (handles fresh environments)
    const bucketName = "videos";
    try {
      const { data: bucketInfo, error: bucketError } =
        await supabaseAdmin.storage.getBucket(bucketName);

      if (bucketError || !bucketInfo) {
        console.warn("[upload] Bucket missing, creating", { bucketName });
        const { error: createBucketError } =
          await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
          });
        if (createBucketError) {
          console.error("[upload] Failed to create bucket", createBucketError);
          return NextResponse.json(
            { error: "Video bucket is not available" },
            { status: 500 }
          );
        }
      }
    } catch (bucketCheckError) {
      console.error("[upload] Bucket check error", bucketCheckError);
      return NextResponse.json(
        { error: "Video bucket is not available" },
        { status: 500 }
      );
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    console.info("[upload] Uploading file", {
      user: user.email,
      type,
      name: file.name,
      size: file.size,
      path: filePath,
    });

    // Upload to Supabase Storage with service role to bypass RLS on storage.objects
    const { data, error } = await supabaseAdmin.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[upload] Supabase upload error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(filePath);

    console.info("[upload] Upload successful", { path: filePath });

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (error) {
    console.error("[upload] Unexpected error", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
