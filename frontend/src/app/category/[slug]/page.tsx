"use client";

import { useEffect, useState } from "react";
import VideoGrid from "@/components/VideoGrid";
import { fetchCategoryById } from "@/lib/api";

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [categoryName, setCategoryName] = useState(
    slug.replace(/-/g, " ").toUpperCase()
  );

  useEffect(() => {
    let isMounted = true;
    const loadCategory = async () => {
      try {
        const category = await fetchCategoryById(slug);
        if (isMounted && category?.name) {
          setCategoryName(category.name);
        }
      } catch (error) {
        // keep fallback name
      }
    };
    loadCategory();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="mb-4">
        <p className="text-xs uppercase text-slate-400">Category</p>
        <h1 className="text-4xl font-bold text-white">{categoryName}</h1>
        <p className="text-slate-300 mt-2">Explore videos in this category</p>
      </div>

      <VideoGrid categorySlug={slug} />
    </div>
  );
}
