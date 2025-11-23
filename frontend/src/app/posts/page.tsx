"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/posts?limit=50", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load posts");
        setPosts(data.posts || []);
      } catch (err: any) {
        console.error("Posts load error:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase text-slate-400">Posts</p>
        <h1 className="text-3xl font-bold text-white">Updates & articles</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-400">No posts yet. Check back soon.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">{post.title}</h2>
                <p className="text-[11px] text-slate-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-line">{post.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
