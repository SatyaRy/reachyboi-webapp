"use client";

import { useEffect, useState } from "react";
import {
  createSubscription,
  fetchSubscriptions,
  deleteSubscription,
} from "@/lib/api";
import type { Subscription } from "@/types";

const PLAN_PRICE = 11;
const SUPPORT = "t.me/frost_4x";
const PLANS = [
  { name: "1 month", price: 11 },
  { name: "6 months", price: 10 },
  { name: "1 year", price: 9 },
];

export default function SubscribePage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptions();
      setSubs(data);
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
      setError(
        "Unable to load subscriptions. Contact support at " + SUPPORT
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (plan: { name: string; price: number }) => {
    setError("");
    setSuccess("");
    setCreating(true);
    try {
      const { subscription, checkout_url } = await createSubscription({
        plan_name: plan.name,
        price: plan.price,
      });
      setSubs((prev) => [subscription, ...prev]);
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        setSuccess("Subscription started. Awaiting payment confirmation.");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(
        (err.message || "Failed to start subscription") +
          `. If this continues, contact support at ${SUPPORT}`
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase text-slate-400">Subscription</p>
        <h1 className="text-4xl font-bold text-white">Choose your plan</h1>
      </div>

      <div className="card p-6 space-y-4">
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
            {PLANS.map((plan) => (
              <button
                key={plan.name}
                onClick={() => handleCreate(plan)}
                disabled={creating}
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-left hover:border-primary-400/60 hover:text-white transition disabled:opacity-60"
              >
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="text-2xl font-bold text-white mt-1">${plan.price}/mo</p>
                <p className="text-xs text-slate-500 mt-1">
                  Powered by ABA PayWay. Need help?{" "}
                  <a
                    href={`https://${SUPPORT}`}
                    className="text-primary-200 hover:text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{SUPPORT.split("/").pop()}
                  </a>
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Subscription history</h2>
            <button
              onClick={load}
              className="text-xs text-primary-200 hover:text-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading subscriptions...</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-slate-400">No subscriptions yet.</p>
        ) : (
          <div className="space-y-2">
            {subs.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-700 text-slate-300">
                      {sub.status}
                    </span>
                    <span className="text-sm text-white">
                      {sub.plan_name} (${sub.price}/{sub.currency?.toUpperCase?.() || "USD"})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Started: {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {sub.payway_checkout_url && sub.status === "pending" && (
                    <a
                      href={sub.payway_checkout_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-200 hover:text-white"
                    >
                      Continue payment
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this subscription history?")) return;
                      setDeletingId(sub.id);
                      try {
                        await deleteSubscription(sub.id);
                        setSubs((prev) => prev.filter((s) => s.id !== sub.id));
                      } catch (err: any) {
                        alert(err.message || "Failed to delete subscription");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === sub.id}
                    className="text-xs text-rose-200 hover:text-white disabled:opacity-60"
                  >
                    {deletingId === sub.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
