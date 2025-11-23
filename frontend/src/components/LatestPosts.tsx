"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function LatestPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/posts?limit=3");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Posts load error:", error);
      }
    };
    load();
  }, []);

  if (posts.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Latest Posts</h2>
          <Link
            href="/admin/posts"
            className="text-sm text-primary-200 hover:text-white"
          >
            Admin: share more →
          </Link>
        </div>
        <p className="text-sm text-slate-400">No posts yet. Stay tuned.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Latest Posts</h2>
        <Link
          href="/admin/posts"
          className="text-sm text-primary-200 hover:text-white"
        >
          Admin: share more →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="card p-4 space-y-2 border border-slate-800 bg-slate-900/60"
          >
            <p className="text-sm font-semibold text-white line-clamp-2">
              {post.title}
            </p>
            <p className="text-xs text-slate-400 line-clamp-3">{post.body}</p>
            <p className="text-[11px] text-slate-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
