"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [exnessAccountId, setExnessAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const SUPPORT = "@frost_4x";
  const [error, setError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const roleParam = searchParams.get("role");

    if (errorParam === "unauthorized") {
      setError("You do not have permission to access that page");
    }

    if (roleParam === "admin") {
      setIsAdmin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: isAdmin ? password : undefined,
          exness_account_id: isAdmin ? undefined : exnessAccountId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.error || "Sign-in failed";
        throw new Error(
          `${detail}. Need help? Contact ${SUPPORT} on Telegram.`
        );
      }

      const redirect = searchParams.get("redirect");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-changed", { detail: data.user }));
      }

      const destination =
        redirect ||
        (data.user?.is_admin || data.user?.role === "admin" ? "/admin" : "/");

      router.push(destination);

      router.refresh();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.9)]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Home
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setPassword("");
              setError("");
            }}
            className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              !isAdmin
                ? "border-primary-400 bg-primary-500/20 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setExnessAccountId("");
              setError("");
            }}
            className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              isAdmin
                ? "border-primary-400 bg-primary-500/20 text-white"
                : "border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            Admin
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              placeholder="you@example.com"
            />
          </div>

          {!isAdmin && (
            <div className="space-y-2">
              <label
                htmlFor="exness-account-id"
                className="text-xs uppercase tracking-wide text-slate-400"
              >
                Exness Account ID
              </label>
              <input
                id="exness-account-id"
                name="exness-account-id"
                type="text"
                required
                value={exnessAccountId}
                onChange={(e) => setExnessAccountId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                placeholder="EXN123456"
              />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-wide text-slate-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-900/40 transition hover:from-blue-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing you in..." : isAdmin ? "Sign in as admin" : "Access dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="text-slate-300">Loading...</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
