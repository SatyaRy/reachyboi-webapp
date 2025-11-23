"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  published_at: string;
  source_url?: string | null;
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/daily-news?limit=50", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load news");
        setNews(data.news || []);
      } catch (err: any) {
        console.error("News load error:", err);
        setError(err.message || "Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase text-slate-400">News</p>
        <h1 className="text-3xl font-bold text-white">Latest announcements</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading news...</p>
      ) : news.length === 0 ? (
        <p className="text-sm text-slate-400">No news yet. Check back soon.</p>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  {item.summary && (
                    <p className="text-xs text-slate-300">{item.summary}</p>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {new Date(item.published_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-line">{item.body}</p>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-200 hover:text-white inline-flex items-center gap-1"
                >
                  Source
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
