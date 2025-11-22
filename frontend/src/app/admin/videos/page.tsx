"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  description: string;
  category_id: string;
  categories?: {
    id: string;
    name: string;
  };
  video_url: string;
  thumbnail_url: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, categoriesRes] = await Promise.all([
        fetch("/api/videos"),
        fetch("/api/categories"),
      ]);

      const videosData = await videosRes.json();
      const categoriesData = await categoriesRes.json();

      setVideos(videosData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== id));
        setDeleteConfirm(null);
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video");
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === "all" || video.category_id === selectedCategory;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (video: Video) => {
    if (video.categories?.name) return video.categories.name;
    const category = categories.find((c) => c.id === video.category_id);
    return category?.name || "Education Video";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-300">
        Loading videos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">Content</p>
          <h1 className="text-3xl font-bold text-white">Manage Videos</h1>
          <p className="mt-1 text-slate-300">View, edit, and delete your video content</p>
        </div>
        <Link href="/admin/upload" className="btn-primary text-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New Video
        </Link>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-lg font-semibold text-white">Videos ({filteredVideos.length})</h2>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No videos found. Upload your first video to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredVideos.map((video) => (
              <div key={video.id} className="p-6 hover:bg-slate-900/60 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-48 sm:w-40 sm:h-28 object-cover rounded-lg"
                  />

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-slate-300 line-clamp-3">
                        {video.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/15 text-primary-200 border border-primary-500/30">
                          {getCategoryName(video)}
                        </span>
                        <span className="text-xs">
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/video/${video.id}`}
                        target="_blank"
                        className="btn-secondary text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      <Link
                        href={`/admin/videos/${video.id}`}
                        className="btn-secondary text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition ${
                          deleteConfirm === video.id
                            ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-600"
                            : "border-rose-400/40 bg-rose-500/10 text-rose-200 hover:border-rose-400"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleteConfirm === video.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
