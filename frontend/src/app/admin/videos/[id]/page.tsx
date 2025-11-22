"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchCategories,
  fetchVideoById,
  updateVideo,
  uploadFile,
} from "@/lib/api";
import type { Category, Video } from "@/types";

export default function AdminEditVideoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoId = params?.id;

  const [video, setVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    newCategoryName: "",
    newCategoryDescription: "",
  });

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const [cats, videoData] = await Promise.all([
          fetchCategories(),
          fetchVideoById(videoId),
        ]);

        setCategories(cats);
        setVideo(videoData);
        setFormData({
          title: videoData.title,
          description: videoData.description,
          category_id: videoData.category_id,
          newCategoryName: "",
          newCategoryDescription: "",
        });
      } catch (loadError: any) {
        console.error("Failed to load video", loadError);
        setError(loadError.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadVideo();
    }
  }, [router, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const useNewCategory = formData.newCategoryName.trim().length > 0;

    if (!useNewCategory && !formData.category_id) {
      setError("Please choose a category or create a new one.");
      return;
    }

    setSaving(true);

    try {
      let nextVideoUrl = video?.video_url;
      let nextThumbnailUrl = video?.thumbnail_url;

      if (videoFile) {
        const upload = await uploadFile(videoFile, "video");
        nextVideoUrl = upload.url;
      }

      if (thumbnailFile) {
        const upload = await uploadFile(thumbnailFile, "thumbnail");
        nextThumbnailUrl = upload.url;
      }

      const updated = await updateVideo(videoId, {
        title: formData.title,
        description: formData.description,
        ...(useNewCategory
          ? {
              category_id: undefined,
              category_name: formData.newCategoryName.trim(),
              category_description:
                formData.newCategoryDescription.trim() ||
                formData.newCategoryName.trim(),
            }
          : { category_id: formData.category_id }),
        ...(videoFile && nextVideoUrl ? { video_url: nextVideoUrl } : {}),
        ...(thumbnailFile && nextThumbnailUrl
          ? { thumbnail_url: nextThumbnailUrl }
          : {}),
      });

      setVideo(updated);
      setMessage("Video updated successfully");
      setVideoFile(null);
      setThumbnailFile(null);
      setFormData((prev) => ({
        ...prev,
        category_id: updated.category_id || prev.category_id,
        newCategoryName: "",
        newCategoryDescription: "",
      }));
    } catch (updateError: any) {
      console.error("Failed to update video", updateError);
      setError(updateError.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Loading...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Unable to find that video.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-400 mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Edit Video</h1>
          <p className="text-slate-400">Update metadata or replace files for this video.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/videos" className="btn-secondary text-sm">
            Back to videos
          </Link>
          <Link href={`/video/${videoId}`} target="_blank" className="btn-primary text-sm">
            View live
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-100">
            {error}
          </div>
        )}
        {message && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-100">
            {message}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Video Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            placeholder="Enter video description"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-2">
            Pick an existing category or create a new one below to reassign the video.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="newCategoryName"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              New Category Name
            </label>
            <input
              id="newCategoryName"
              type="text"
              value={formData.newCategoryName}
              onChange={(e) =>
                setFormData({ ...formData, newCategoryName: e.target.value })
              }
              placeholder="Optional: create a category"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div>
            <label
              htmlFor="newCategoryDescription"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              New Category Description
            </label>
            <input
              id="newCategoryDescription"
              type="text"
              value={formData.newCategoryDescription}
              onChange={(e) =>
                setFormData({ ...formData, newCategoryDescription: e.target.value })
              }
              placeholder="Optional description for new category"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-slate-300 mb-2">
              Replace Video File
            </label>
            <input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
            <p className="text-xs text-slate-400 mt-2">
              Current:{" "}
              <a
                href={video.video_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary-200 hover:text-white"
              >
                View video
              </a>
            </p>
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Replace Thumbnail Image
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
            <p className="text-xs text-slate-400 mt-2">
              Current:{" "}
              <a
                href={video.thumbnail_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary-200 hover:text-white"
              >
                View thumbnail
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 disabled:opacity-60"
          >
            {saving ? "Saving changes..." : "Save changes"}
          </button>
          <p className="text-xs text-slate-400">
            Leave file inputs empty to keep the current video and thumbnail.
          </p>
        </div>
      </form>
    </div>
  );
}
