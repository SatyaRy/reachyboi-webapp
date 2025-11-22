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

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-slate-950 font-extrabold text-lg">R</span>
            </div>
            <span className="text-lg font-semibold text-slate-100 tracking-tight">
              ReachyBoiEdu
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/subscribe"
              className="text-sm font-medium text-slate-200 hover:text-primary-200 transition hidden sm:inline"
            >
              Subscribe
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-slate-200 hover:text-primary-200 transition"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-primary-100 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
