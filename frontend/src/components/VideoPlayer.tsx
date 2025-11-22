"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchVideoById } from "@/lib/api";
import type { Video } from "@/types";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideoById(videoId);
        setVideo(data);
      } catch (error) {
        console.error("Failed to load video:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="w-full aspect-video bg-slate-800 rounded-2xl mb-6"></div>
        <div className="h-8 bg-slate-800 rounded mb-3"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p className="text-lg">Video not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card overflow-hidden">
        <div className="w-full aspect-video bg-black">
          <ReactPlayer
            url={video.video_url}
            controls
            width="100%"
            height="100%"
            playing
          />
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <h1 className="text-3xl font-bold text-white">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/15 text-primary-200 border border-primary-500/30">
            {video.categories?.name || "Education Video"}
          </span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-slate-200 leading-relaxed">{video.description}</p>
      </div>
    </div>
  );
}
