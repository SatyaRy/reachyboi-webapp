"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchCategories } from "@/lib/api";
import { uploadFile, createVideo } from "@/lib/api";
import type { Category } from "@/types";

export default function AdminUploadPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    newCategoryName: "",
    newCategoryDescription: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      const cats = await fetchCategories();
      setCategories(cats);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const useNewCategory = formData.newCategoryName.trim().length > 0;

    if (!useNewCategory && !formData.category_id) {
      alert("Please choose a category or create a new one");
      return;
    }

    if (!videoFile || !thumbnailFile) {
      alert("Please select both video and thumbnail files");
      return;
    }

    setUploading(true);

    try {
      const videoUpload = await uploadFile(videoFile, "video");
      const thumbnailUpload = await uploadFile(thumbnailFile, "thumbnail");

      await createVideo({
        ...formData,
        ...(useNewCategory
          ? {
              category_id: undefined,
              category_name: formData.newCategoryName.trim(),
              category_description:
                formData.newCategoryDescription.trim() ||
                formData.newCategoryName.trim(),
            }
          : { category_id: formData.category_id }),
        video_url: videoUpload.url,
        thumbnail_url: thumbnailUpload.url,
      });

      alert("Video uploaded successfully!");

      setFormData({
        title: "",
        description: "",
        category_id: "",
        newCategoryName: "",
        newCategoryDescription: "",
      });
      setVideoFile(null);
      setThumbnailFile(null);

      router.push("/");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload video: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">Upload New Video</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
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
            You can pick an existing category or create a new one below.
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
              Video File
            </label>
            <input
              id="video"
              type="file"
              accept="video/*"
              required
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-300 mb-2">
              Thumbnail Image
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full btn-primary py-3 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}
