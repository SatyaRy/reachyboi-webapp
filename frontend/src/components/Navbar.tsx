"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const detailUser = customEvent.detail;
        setUser(detailUser);
        setIsAdmin(detailUser.is_admin || detailUser.role === "admin");
        pingHeartbeat(detailUser);
      } else {
        checkAuth();
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    pingHeartbeat(user);
    const interval = setInterval(() => pingHeartbeat(user), 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setIsAdmin(data.user.is_admin || false);
          pingHeartbeat(data.user);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const pingHeartbeat = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      await fetch("/api/activity/heartbeat", { method: "POST" });
    } catch (error) {
      console.error("Heartbeat error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      setIsAdmin(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const links = [
    { label: "Subscription", href: "/subscribe" },
    { label: "My VPS", href: "/vps" },
    { label: "Education", href: "/videos" },
    { label: "Posts & News", href: "/posts-news" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-slate-950 font-extrabold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold text-slate-100 tracking-tight">
                ReachyBoiEdu
              </span>
            </Link>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-slate-200 hover:text-primary-200 transition"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <>
                  <span className="hidden sm:inline text-slate-400">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-primary-100 hover:text-white transition font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/signin" className="btn-primary text-xs sm:text-sm px-3 py-2">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition whitespace-nowrap"
              >
                <span className="h-2 w-2 rounded-full bg-primary-400" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
