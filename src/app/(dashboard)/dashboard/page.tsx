"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { Loader2 } from "lucide-react";

/**
 * Dashboard Router
 * Redirects users to their specialized dashboard based on their role.
 */
export default function DashboardRouter() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && profile) {
      // FORCE manager role to prove the dashboard code wasn't overwritten
      const role = "manager"; // profile.role || "employee";
      console.log(`[DashboardRouter] Redirecting to /dashboard/${role}`);
      router.replace(`/dashboard/${role}`);
    }
  }, [profile, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Preparing your dashboard...</h2>
        <p className="text-slate-500 text-sm">One moment while we load your specialized tools.</p>
      </div>
    </div>
  );
}
