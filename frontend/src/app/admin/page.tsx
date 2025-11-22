"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalVideos: number;
  totalCategories: number;
  totalUsers: number;
  totalPosts: number;
  totalNews: number;
  activeUsers: number;
  recentVideos: any[];
  recentPosts: any[];
  latestNews: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalNews: 0,
    activeUsers: 0,
    recentVideos: [],
    recentPosts: [],
    latestNews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [videosRes, categoriesRes, usersRes, postsRes, newsRes, activeRes] =
        await Promise.all([
          fetch("/api/videos"),
          fetch("/api/categories"),
          fetch("/api/admin/users/stats"),
          fetch("/api/posts?limit=6"),
          fetch("/api/daily-news?limit=6"),
          fetch("/api/admin/users/active"),
        ]);

      const videos = await videosRes.json();
      const categories = await categoriesRes.json();
      const usersData = await usersRes.json();
      const postsData = await postsRes.json();
      const newsData = await newsRes.json();
      const activeData = await activeRes.json();

      setStats({
        totalVideos: videos.length || 0,
        totalCategories: categories.length || 0,
        totalUsers: usersData.total || 0,
        recentVideos: videos.slice(0, 5) || [],
        totalPosts: postsData.total || postsData.posts?.length || 0,
        totalNews: newsData.total || newsData.news?.length || 0,
        activeUsers: activeData.totalActive || 0,
        recentPosts: postsData.posts?.slice(0, 4) || [],
        latestNews: newsData.news?.slice(0, 4) || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Videos",
      value: stats.totalVideos,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      tone: "from-primary-500 to-cyan-400",
      link: "/admin/videos",
    },
    {
      name: "Categories",
      value: stats.totalCategories,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      tone: "from-emerald-400 to-teal-400",
      link: "/admin/videos",
    },
    {
      name: "Authorized Users",
      value: stats.totalUsers,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      tone: "from-purple-400 to-fuchsia-400",
      link: "/admin/users",
    },
    {
      name: "Active Users",
      value: stats.activeUsers,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      tone: "from-amber-400 to-rose-400",
      link: "/admin/users",
    },
    {
      name: "Posts",
      value: stats.totalPosts,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h6" />
        </svg>
      ),
      tone: "from-cyan-400 to-blue-500",
      link: "/admin/posts",
    },
    {
      name: "Daily News",
      value: stats.totalNews,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 4H5m14-8H5m14 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
        </svg>
      ),
      tone: "from-indigo-400 to-sky-400",
      link: "/admin/posts",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-400">Overview</p>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="card p-6 hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.tone} text-slate-950 shadow-lg shadow-black/30`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Upload Video", href: "/admin/upload", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) },
            { label: "Add Users", href: "/admin/users", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            ) },
            { label: "Manage Videos", href: "/admin/videos", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) },
            { label: "Manage VPS", href: "/admin/vps", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10m-4 4h4" />
              </svg>
            ) },
            { label: "Share Post / News", href: "/admin/posts", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-8 4h5m-5-8h8m2-3H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm-2-3H9a2 2 0 00-2 2v1h10V5a2 2 0 00-2-2z" />
              </svg>
            ) },
            { label: "View Site", href: "/", icon: (
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            ) },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800 hover:border-primary-400/70 bg-slate-900/60 transition"
            >
              {action.icon}
              <span className="mt-3 text-sm font-semibold text-white">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {stats.recentVideos.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Videos</h2>
            <Link href="/admin/videos" className="text-sm text-primary-200 hover:text-white">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-primary-400/70 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{video.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link href={`/video/${video.id}`} className="text-sm text-primary-200 hover:text-white">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.recentPosts.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Latest Posts</h2>
            <Link href="/admin/posts" className="text-sm text-primary-200 hover:text-white">
              See posts →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-primary-400/70 transition"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{post.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {post.body}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.latestNews.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Daily News</h2>
            <Link href="/admin/daily-news" className="text-sm text-primary-200 hover:text-white">
              Manage news →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.latestNews.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-primary-400/70 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white line-clamp-2">{news.title}</p>
                    {news.summary ? (
                      <p className="text-xs text-slate-400 line-clamp-2">{news.summary}</p>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-2">{news.body}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(news.published_at || news.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
