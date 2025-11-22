import SearchResults from "@/components/SearchResults";
import { Suspense } from "react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = "" } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Search Results</h1>
        {query && (
          <p className="text-slate-300">
            Results for: <span className="font-semibold text-white">{query}</span>
          </p>
        )}
      </div>

      <Suspense
        fallback={<div className="text-center py-12 text-slate-400">Searching...</div>}
      >
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
