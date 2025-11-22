"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDailyNewsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/posts?type=news");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-300">
      Redirecting to posts & news...
    </div>
  );
}
