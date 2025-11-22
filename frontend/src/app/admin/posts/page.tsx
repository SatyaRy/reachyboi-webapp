"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ContentType = "post" | "news";

interface Post {
  id: string;
  title: string;
  body: string;
  cover_image_url?: string | null;
  created_at: string;
}

interface DailyNews {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  source_url?: string | null;
  published_at?: string;
  created_at?: string;
}

export default function AdminPostsPage() {
  const searchParams = useSearchParams();
  const [contentType, setContentType] = useState<ContentType>("post");
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<DailyNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    body: "",
    cover_image_url: "",
    summary: "",
    source_url: "",
    published_at: "",
  });

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "news") {
      setContentType("news");
    }
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContent = async () => {
    try {
      const [postsRes, newsRes] = await Promise.all([
        fetch("/api/posts?limit=50"),
        fetch("/api/daily-news?limit=50"),
      ]);

      const postsData = await postsRes.json();
      const newsData = await newsRes.json();
      setPosts(postsData.posts || []);
      setNews(newsData.news || []);
    } catch (err) {
      console.error("Fetch posts/news error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.body) {
      setError("Title and body are required");
      return;
    }

    try {
      const endpoint = contentType === "news" ? "/api/daily-news" : "/api/posts";
      const payload =
        contentType === "news"
          ? {
              title: form.title,
              summary: form.summary || undefined,
              body: form.body,
              source_url: form.source_url || undefined,
              published_at: form.published_at || undefined,
            }
          : {
              title: form.title,
              body: form.body,
              cover_image_url: form.cover_image_url || undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSuccess(contentType === "news" ? "News published" : "Post published");
      setForm({
        title: "",
        body: "",
        cover_image_url: "",
        summary: "",
        source_url: "",
        published_at: "",
      });
      fetchContent();
    } catch (err: any) {
      console.error("Create content error:", err);
      setError(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string, type: ContentType) => {
    if (!confirm("Delete this entry?")) return;
    try {
      const res = await fetch(
        `${type === "news" ? "/api/daily-news" : "/api/posts"}/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      if (type === "news") {
        setNews((prev) => prev.filter((n) => n.id !== id));
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const combined = [...posts.map((p) => ({ ...p, type: "post" as const })), ...news.map((n) => ({ ...n, type: "news" as const }))].sort(
    (a, b) =>
      new Date(
        (b as any).published_at || (b as any).created_at || b.created_at
      ).getTime() -
      new Date(
        (a as any).published_at || (a as any).created_at || a.created_at
      ).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-400">Posts</p>
        <h1 className="text-3xl font-bold text-white">Share Updates</h1>
        <p className="mt-1 text-slate-300">
          Publish written posts or market headlines from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Create post</h2>
            <p className="text-sm text-slate-400">
              Add context, announcements, written guides, or quick headlines.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Content type:</span>
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/70">
              {(["post", "news"] as ContentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  className={`px-3 py-2 rounded-md text-xs font-semibold ${
                    contentType === type
                      ? "bg-primary-500/20 text-white border border-primary-400/40"
                      : "text-slate-300"
                  }`}
                >
                  {type === "post" ? "Post" : "News"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Weekly market breakdown"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Body
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                rows={6}
                placeholder="Write your update..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            {contentType === "post" ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Cover image URL (optional)
                </label>
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, cover_image_url: e.target.value }))
                  }
                  placeholder="https://images.example.com/post-cover.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Summary (optional)
                  </label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="USD strong as yields rise"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Source URL (optional)
                    </label>
                    <input
                      type="url"
                      value={form.source_url}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, source_url: e.target.value }))
                      }
                      placeholder="https://news.example.com/story"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Publish date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.published_at}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          published_at: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary w-full py-3">
              {contentType === "news" ? "Publish news" : "Publish post"}
            </button>
          </form>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent updates</h3>
              <p className="text-sm text-slate-400">
                Showing the most recent {combined.length} items
              </p>
            </div>
            <button
              onClick={fetchContent}
              className="text-xs text-primary-200 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading content...</p>
          ) : combined.length === 0 ? (
            <p className="text-sm text-slate-400">No posts or news yet.</p>
          ) : (
            <div className="space-y-3">
              {combined.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border border-slate-700 text-slate-300">
                          {item.type === "news" ? "News" : "Post"}
                        </span>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                      </div>
                      {item.type === "news" && item.summary ? (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {item.summary}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {item.body}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(
                        item.type === "news"
                          ? item.published_at || item.created_at || ""
                          : item.created_at || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {item.type === "post" && item.cover_image_url && (
                      <a
                        href={item.cover_image_url}
                        target="_blank"
                        className="text-xs text-primary-200 hover:text-white"
                      >
                        View image
                      </a>
                    )}
                    {item.type === "news" && item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        className="text-xs text-primary-200 hover:text-white"
                      >
                        Source
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id, item.type)}
                      className="text-xs text-rose-200 hover:text-white ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
