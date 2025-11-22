"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchVideos } from "@/lib/api";
import type { Video } from "@/types";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setVideos([]);
        setLoading(false);
        return;
      }

      try {
        const data = await searchVideos(query);
        setVideos(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 flex gap-4 animate-pulse">
            <div className="w-48 h-32 bg-slate-800 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-800 rounded"></div>
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p>Enter a search query to find videos.</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p className="text-lg">No videos found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="card p-4 flex flex-col gap-4 sm:flex-row hover:border-primary-400/70 border border-slate-800/60 transition"
        >
          <div className="relative w-full h-48 sm:w-48 sm:h-32 bg-slate-800 rounded overflow-hidden">
            <Image
              src={video.thumbnail_url || "/placeholder.jpg"}
              alt={video.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold text-white">{video.title}</h3>
            <p className="text-slate-300 line-clamp-2">{video.description}</p>
            <div className="flex items-center justify-between text-sm text-slate-500 flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-500/10 text-primary-200 border border-primary-500/30 text-xs">
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
