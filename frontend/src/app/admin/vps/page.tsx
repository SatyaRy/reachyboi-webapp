"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVps, createVps, updateVps } from "@/lib/api";
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
    region: "",
    cpu: "",
    memory_gb: "",
    storage_gb: "",
    notes: "",
  });

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
        region: form.region,
        cpu: form.cpu,
        memory_gb: form.memory_gb ? Number(form.memory_gb) : null,
        storage_gb: form.storage_gb ? Number(form.storage_gb) : null,
        notes: form.notes,
      };

      const created = await createVps(payload as any);
      setVpsList((prev) => [created, ...prev]);
      setSuccess("VPS created and subscription started");
      setForm({
        user_email: "",
        region: "",
        cpu: "",
        memory_gb: "",
        storage_gb: "",
        notes: "",
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateVps(id, { status });
      setVpsList((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAction = async (id: string, action: string, extras?: Record<string, any>) => {
    try {
      const updated = await updateVps(id, { action, ...(extras || {}) } as any);
      setVpsList((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err: any) {
      alert(err.message || "Failed to update VPS");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">VPS</p>
          <h1 className="text-3xl font-bold text-white">Manage VPS</h1>
          <p className="mt-1 text-slate-300">
            Create VPS subscriptions for clients, track usage, and uptime.
          </p>
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
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Create VPS</h2>
            <p className="text-sm text-slate-400">
              Standard plan at $12/month. You can add notes and specs per client.
            </p>
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
                  Region
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g., NYC-1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  CPU
                </label>
                <input
                  type="text"
                  value={form.cpu}
                  onChange={(e) => setForm((prev) => ({ ...prev, cpu: e.target.value }))}
                  placeholder="2 vCPU"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Memory (GB)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.memory_gb}
                  onChange={(e) => setForm((prev) => ({ ...prev, memory_gb: e.target.value }))}
                  placeholder="4"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Storage (GB)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.storage_gb}
                  onChange={(e) => setForm((prev) => ({ ...prev, storage_gb: e.target.value }))}
                  placeholder="80"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Credentials, provisioning details, etc."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create VPS ($12/mo)"}
            </button>
          </form>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Monitoring</h3>
              <p className="text-sm text-slate-400">
                Track status, usage, billing, and perform controls per instance.
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
              {vpsList.map((vps) => (
                <div
                  key={vps.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
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
                      <p className="text-xs text-slate-500">
                        {vps.cpu || "CPU N/A"} · {vps.memory_gb ?? "RAM N/A"} GB ·{" "}
                        {vps.storage_gb ?? "Storage N/A"} GB {vps.region ? `· ${vps.region}` : ""}{" "}
                        {vps.plan_template ? `· Template: ${vps.plan_template}` : ""}
                      </p>
                      {vps.credentials?.username && (
                        <p className="text-xs text-slate-400">
                          Creds: {vps.credentials.username} / {vps.credentials.password || "••••"}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p>
                        Next bill:{" "}
                        {vps.next_billing_at
                          ? new Date(vps.next_billing_at).toLocaleDateString()
                          : "—"}
                      </p>
                      <p>Sub: {vps.subscription_status}</p>
                      <p>MT5: {vps.mt5_status || "unknown"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-300">
                    <div className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2">
                      CPU: {vps.cpu_usage ?? 0}%
                    </div>
                    <div className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2">
                      Memory: {vps.memory_usage ?? 0}%
                    </div>
                    <div className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2">
                      Storage: {vps.storage_usage ?? 0}%
                    </div>
                    <div className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2">
                      Last heartbeat:{" "}
                      {vps.last_heartbeat_at
                        ? new Date(vps.last_heartbeat_at).toLocaleString()
                        : "—"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <label className="text-slate-400">Status:</label>
                      <select
                        value={vps.status}
                        onChange={(e) => handleStatusChange(vps.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                      </select>
                      <button
                        onClick={() => handleAction(vps.id, "start")}
                        className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-200"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "stop")}
                        className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-200"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "reboot")}
                        className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/40 text-blue-200"
                      >
                        Reboot
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "rebuild")}
                        className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/40 text-purple-200"
                      >
                        Rebuild
                      </button>
                      <button
                        onClick={() =>
                          handleAction(vps.id, "suspend", {
                            suspend_reason: "Auto/manual suspend",
                            subscription_status: "suspended",
                          })
                        }
                        className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/40 text-rose-200"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "terminate")}
                        className="px-2 py-1 rounded-md bg-red-500/20 border border-red-500/60 text-red-100"
                      >
                        Terminate
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "reset_credentials")}
                        className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
                      >
                        Reset creds
                      </button>
                      <button
                        onClick={() => handleAction(vps.id, "restart_mt5")}
                        className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-200"
                      >
                        Restart MT5
                      </button>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      Created: {new Date(vps.created_at).toLocaleDateString()}
                    </div>
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
