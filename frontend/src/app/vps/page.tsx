"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyVps } from "@/lib/api";
import type { VpsInstance } from "@/types";

export default function UserVpsPage() {
  const [items, setItems] = useState<VpsInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchMyVps();
      setItems(data);
    } catch (err: any) {
      console.error("Fetch my VPS error:", err);
      setError(err.message || "Failed to load your VPS");
    } finally {
      setLoading(false);
    }
  };

  const computePeriod = (vps: VpsInstance) => {
    const start = vps.start_date || vps.created_at;
    const end = vps.expires_at || vps.next_billing_at;
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;

    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const remaining = endDate.getTime() - now.getTime();
    const percent = total <= 0 ? 100 : Math.min(100, Math.max(0, (elapsed / total) * 100));

    return {
      startDate,
      endDate,
      percent,
      expired: remaining <= 0,
      daysLeft: Math.max(0, Math.ceil(remaining / 86_400_000)),
    };
  };

  const totals = useMemo(() => {
    const active = items.filter((v) => v.subscription_status === "active").length;
    return { count: items.length, active };
  }, [items]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">VPS</p>
          <h1 className="text-3xl font-bold text-white">Your VPS</h1>
          <p className="text-slate-300">Access your VPS credentials and billing timeline.</p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>
            Total: <span className="text-white font-semibold">{totals.count}</span>
          </p>
          <p>
            Active: <span className="text-white font-semibold">{totals.active}</span>
          </p>
          <button onClick={load} className="mt-2 text-xs text-primary-200 hover:text-white">
            Refresh
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading your VPS...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400">
            You do not have any VPS yet. Please contact{" "}
            <a
              href="https://t.me/frost_4x"
              target="_blank"
              rel="noreferrer"
              className="text-primary-200 hover:text-white font-semibold"
            >
              @frost_4x
            </a>{" "}
            to get yours provisioned.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((vps) => {
              const period = computePeriod(vps);
              return (
                <div
                  key={vps.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${
                            vps.status === "online"
                              ? "border-emerald-500/40 text-emerald-200 bg-emerald-500/10"
                              : "border-amber-500/40 text-amber-200 bg-amber-500/10"
                          }`}
                        >
                          {vps.status}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {vps.plan_name} (${vps.plan_price}/mo)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{vps.user_email}</p>
                      <p className="text-xs text-slate-500">
                        Region: {vps.region || "—"} · Template: {vps.plan_template || "—"}
                      </p>
                      {vps.credentials?.username && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                          <span className="font-semibold text-white">Credentials:</span>
                          <code className="rounded border border-slate-700 bg-slate-800 px-2 py-1">
                            {vps.credentials.username}
                          </code>
                          <code className="rounded border border-slate-700 bg-slate-800 px-2 py-1">
                            {vps.credentials.password || "••••••"}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-slate-400 space-y-1">
                      <p>MT5: {vps.mt5_status || "unknown"}</p>
                      <p>Subscription: {vps.subscription_status}</p>
                      <p>Created: {new Date(vps.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {period && (
                    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{period.startDate.toLocaleDateString()}</span>
                        <span className={`text-slate-200 font-semibold ${period.expired ? "text-rose-200" : ""}`}>
                          {period.expired ? "Expired" : `${period.daysLeft} days left`}
                        </span>
                        <span>{period.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${
                            period.expired
                              ? "bg-rose-500"
                              : "bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400 animate-pulse"
                          }`}
                          style={{ width: `${period.percent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Expired date: {period.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
