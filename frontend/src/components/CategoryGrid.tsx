"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories } from "@/lib/api";
import type { Category } from "@/types";

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories({ withVideosOnly: true });
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse border border-slate-800">
            <div className="h-8 bg-slate-800 rounded mb-4"></div>
            <div className="h-4 bg-slate-800 rounded mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="card p-6 hover:-translate-y-1 transition-transform border border-slate-800/60 hover:border-primary-400/70"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/15 text-primary-200 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-slate-300">{category.description}</p>
        </Link>
      ))}
    </div>
  );
}
