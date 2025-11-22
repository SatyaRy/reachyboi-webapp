import CategoryGrid from "@/components/CategoryGrid";
import DailyNewsSection from "@/components/DailyNewsSection";
import LatestPosts from "@/components/LatestPosts";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <section className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/70 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Learn with focus
        </div>
      </section>

      <div className="space-y-10 mb-10">
        <DailyNewsSection />
        <LatestPosts />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Browse Categories</h2>
          <span className="text-xs text-slate-400">Filter videos by what you need</span>
        </div>
        <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading categories...</div>}>
          <CategoryGrid />
        </Suspense>
      </section>
    </div>
  );
}
