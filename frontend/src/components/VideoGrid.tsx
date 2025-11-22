"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchVideosByCategory } from "@/lib/api";
import type { Video } from "@/types";

interface VideoGridProps {
  categorySlug: string;
}

export default function VideoGrid({ categorySlug }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await fetchVideosByCategory(categorySlug);
        setVideos(data);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="h-48 bg-slate-800"></div>
            <div className="p-4 space-y-2">
              <div className="h-6 bg-slate-800 rounded"></div>
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p className="text-lg">No videos found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="card overflow-hidden group border border-slate-800/60 hover:border-primary-400/70 transition"
        >
          <div className="relative h-48 bg-slate-800">
            <Image
              src={video.thumbnail_url || "/placeholder.jpg"}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {video.title}
            </h3>
            <p className="text-sm text-slate-300 line-clamp-2">
              {video.description}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-500/10 text-primary-200 border border-primary-500/30">
                {video.categories?.name || "Education Video"}
              </span>
              <span>{new Date(video.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
