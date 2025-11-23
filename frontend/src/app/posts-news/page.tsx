"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

type NewsItem = {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  published_at: string;
};

export default function PostsNewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const res = await fetch("/api/posts?limit=50", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load posts");
        setPosts(data.posts || []);
      } catch (err: any) {
        console.error("Posts load error:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoadingPosts(false);
      }
    };

    const loadNews = async () => {
      try {
        setLoadingNews(true);
        const res = await fetch("/api/daily-news?limit=50", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load news");
        setNews(data.news || []);
      } catch (err: any) {
        console.error("News load error:", err);
        setError(err.message || "Failed to load news");
      } finally {
        setLoadingNews(false);
      }
    };

    loadPosts();
    loadNews();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase text-slate-400">Updates</p>
        <h1 className="text-3xl font-bold text-white">Posts & News</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 space-y-3 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Posts</h2>
          </div>
          {loadingPosts ? (
            <p className="text-sm text-slate-400">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-400">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{post.body}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5 space-y-3 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">News</h2>
          </div>
          {loadingNews ? (
            <p className="text-sm text-slate-400">Loading news...</p>
          ) : news.length === 0 ? (
            <p className="text-sm text-slate-400">No news yet.</p>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  {item.summary && <p className="text-xs text-slate-300">{item.summary}</p>}
                  <p className="text-sm text-slate-300 whitespace-pre-line">{item.body}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
