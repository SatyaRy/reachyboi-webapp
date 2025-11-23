"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DailyNews {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  published_at: string;
  source_url?: string | null;
}

export default function DailyNewsSection() {
  const [news, setNews] = useState<DailyNews[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/daily-news?limit=4");
        const data = await res.json();
        setNews(data.news || []);
      } catch (error) {
        console.error("Daily news load error:", error);
      }
    };
    load();
  }, []);

  if (news.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Daily News</h2>
          <Link
            href="/admin/daily-news"
            className="text-sm text-primary-200 hover:text-white"
          >
            Admin: add update →
          </Link>
        </div>
        <p className="text-sm text-slate-400">No news yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Daily News</h2>
        <Link
          href="/admin/daily-news"
          className="text-sm text-primary-200 hover:text-white"
        >
          Admin: add update →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {news.map((item) => (
          <article
            key={item.id}
            className="card p-4 space-y-2 border border-slate-800 bg-slate-900/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white line-clamp-2">
                  {item.title}
                </p>
                {item.summary && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item.summary}
                  </p>
                )}
                <p className="text-xs text-slate-500 line-clamp-3">{item.body}</p>
              </div>
              <p className="text-[11px] text-slate-400">
                {new Date(item.published_at).toLocaleDateString()}
              </p>
            </div>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                className="text-xs text-primary-200 hover:text-white inline-flex items-center space-x-1"
              >
                <span>Source</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
