"use client";

import { useEffect, useState } from "react";
import {
  createSubscription,
  fetchSubscriptions,
  deleteSubscription,
} from "@/lib/api";
import type { Subscription } from "@/types";

const PLAN_PRICE = 12;
const SUPPORT = "t.me/frost_4x";

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

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    setCreating(true);
    try {
      const { subscription, checkout_url } = await createSubscription({
        plan_name: "Standard",
        price: PLAN_PRICE,
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
        <h1 className="text-4xl font-bold text-white">Standard Plan</h1>
        <p className="text-slate-300">
          $12/month via ABA PayWay to rent your dedicated VPS and unlock all learning content.
        </p>
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
          <div>
            <p className="text-sm text-slate-300">Standard monthly access</p>
            <p className="text-3xl font-bold text-white mt-1">${PLAN_PRICE}/mo</p>
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
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {creating ? "Redirecting..." : "Pay with ABA PayWay"}
          </button>
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
