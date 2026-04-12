"use client";

import { useProfile } from "@/hooks/use-profile";
import { ApprovalQueue } from "@/components/manager/ApprovalQueue";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ApprovalQueuePage() {
  const { profile, loading: profileLoading } = useProfile();

  // Role Protection
  if (!profileLoading && profile && profile.role !== 'manager' && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0D1A2C]">Approval Queue</h1>
        </div>
      </div>

      <div className="bg-white/50 rounded-3xl p-1 min-h-[600px]">
        <ApprovalQueue />
      </div>
    </div>
  );
}
