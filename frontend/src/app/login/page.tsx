"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new signin page
    router.replace("/auth/signin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
      <p>Redirecting...</p>
    </div>
  );
}
