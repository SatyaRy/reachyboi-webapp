"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVps, createVps, updateVps, deleteVps } from "@/lib/api";
import type { VpsInstance } from "@/types";

const PLAN_PRICE = 12;

export default function AdminVpsPage() {
  const [vpsList, setVpsList] = useState<VpsInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    user_email: "",
    username: "",
    password: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const generatePassword = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%^&*()";
    const array = crypto.getRandomValues(new Uint32Array(16));
    return Array.from(array, (num) => charset[num % charset.length]).join("");
  };

  const computePeriodProgress = (vps: VpsInstance) => {
    const start = vps.start_date || vps.created_at;
    const end = vps.expires_at || vps.next_billing_at;
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;

    const now = new Date();
    const totalMs = endDate.getTime() - startDate.getTime();
    if (totalMs <= 0) {
      return { percent: 100, expired: true, daysLeft: 0, startDate, endDate };
    }

    const elapsedMs = now.getTime() - startDate.getTime();
    const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    const remainingMs = endDate.getTime() - now.getTime();
    return {
      percent,
      expired: remainingMs <= 0,
      daysLeft: Math.max(0, Math.ceil(remainingMs / 86_400_000)),
      startDate,
      endDate,
    };
  };

  useEffect(() => {
    loadVps();
  }, []);

  const loadVps = async () => {
    try {
      setLoading(true);
      const data = await fetchVps();
      setVpsList(data);
    } catch (err) {
      console.error("Fetch VPS error:", err);
      setError("Failed to load VPS instances");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.user_email) {
      setError("User email is required");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        user_email: form.user_email,
        plan_name: "Standard VPS",
        plan_price: PLAN_PRICE,
        credentials:
          form.username || form.password
            ? {
                username: form.username || undefined,
                password: form.password || generatePassword(),
              }
            : undefined,
      };

      const created = await createVps(payload as any);
      setVpsList((prev) => [created, ...prev]);
      setSuccess("VPS created and subscription started");
      setForm({
        user_email: "",
        username: "",
        password: "",
      });
    } catch (err: any) {
      console.error("Create VPS error:", err);
      setError(err.message || "Failed to create VPS");
    } finally {
      setSubmitting(false);
    }
  };

  const totals = useMemo(() => {
    const active = vpsList.filter((v) => v.subscription_status === "active");
    const monthlyMr = active.length * PLAN_PRICE;
    return { activeCount: active.length, monthlyMr };
  }, [vpsList]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteVps(deleteTarget.id);
      setVpsList((prev) => prev.filter((vps) => vps.id !== deleteTarget.id));
      setSuccess("VPS deleted");
    } catch (err: any) {
      console.error("Delete VPS error:", err);
      setError(err.message || "Failed to delete VPS");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">VPS</p>
            <h1 className="text-3xl font-bold text-white">Manage VPS</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              Active VPS: <span className="text-white font-semibold">{totals.activeCount}</span>
            </p>
            <p className="text-sm text-slate-400">
              Monthly recurring:{" "}
              <span className="text-white font-semibold">${totals.monthlyMr.toFixed(2)}</span>
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-1">Create VPS</h2>

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
                Client email
              </label>
              <input
                type="email"
                value={form.user_email}
                onChange={(e) => setForm((prev) => ({ ...prev, user_email: e.target.value }))}
                placeholder="client@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  VPS username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  VPS password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Generate secure password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, password: generatePassword() }))}
                    className="shrink-0 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-primary-400 hover:text-white"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Monitoring</h3>
              <p className="text-sm text-slate-400">
                Manage VPS customers and credentials.
              </p>
            </div>
            <button
              onClick={loadVps}
              className="text-xs text-primary-200 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading VPS...</p>
          ) : vpsList.length === 0 ? (
            <p className="text-sm text-slate-400">No VPS instances yet.</p>
          ) : (
            <div className="space-y-3">
              {vpsList.map((vps) => {
                const period = computePeriodProgress(vps);

                return (
                  <div
                    key={vps.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${
                              vps.status === "online"
                                ? "border-emerald-500/40 text-emerald-200 bg-emerald-500/10"
                                : "border-rose-500/40 text-rose-200 bg-rose-500/10"
                            }`}
                          >
                            {vps.status}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {vps.plan_name} (${vps.plan_price}/mo)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{vps.user_email}</p>
                        <p className="text-xs text-slate-500">Plan: {vps.plan_name} (${vps.plan_price}/mo)</p>
                        {vps.credentials?.username && (
                          <p className="text-xs text-slate-400">
                            Creds: {vps.credentials.username} / {vps.credentials.password || "••••"}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-[11px] text-slate-400 space-y-1">
                        <p>
                          Start: {vps.start_date ? new Date(vps.start_date).toLocaleDateString() : "—"}
                        </p>
                        <p>
                          End: {vps.expires_at ? new Date(vps.expires_at).toLocaleDateString() : "—"}
                        </p>
                        <p>MT5: {vps.mt5_status || "unknown"}</p>
                        <p>Sub: {vps.subscription_status}</p>
                      </div>
                    </div>

                    {period && (
                      <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{period.startDate.toLocaleDateString()}</span>
                          <span className="text-slate-300 font-semibold">
                            {period.expired ? "Expired" : `${period.daysLeft} days left`}
                          </span>
                          <span>{period.endDate.toLocaleDateString()}</span>
                        </div>
                        <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                              period.expired ? "bg-rose-500" : "bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400"
                            } animate-pulse`}
                            style={{ width: `${period.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <p>Created: {new Date(vps.created_at).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <span>Status: {vps.status}</span>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: vps.id, email: vps.user_email })}
                          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-100 hover:border-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete VPS?</h3>
            <p className="mt-2 text-sm text-slate-300">
              This will permanently remove the VPS record for{" "}
              <span className="font-semibold text-white">{deleteTarget.email}</span>. You cannot undo this action.
            </p>
            {error && (
              <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                {error}
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg border border-rose-500/60 bg-rose-600/80 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
