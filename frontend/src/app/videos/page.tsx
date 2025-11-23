"use client";

import CategoryGrid from "@/components/CategoryGrid";

export default function EducationPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase text-slate-400">Education</p>
        <h1 className="text-4xl font-bold text-white">Learn with curated videos</h1>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Categories</h2>
          <span className="text-xs text-slate-400">Click a category to explore its videos</span>
        </div>
        <CategoryGrid />
      </div>
    </div>
  );
}
