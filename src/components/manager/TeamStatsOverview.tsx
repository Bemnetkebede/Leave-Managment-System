"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  ClipboardList, 
  AlertCircle, 
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStatsOverviewProps {
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  availability: number;
  loading?: boolean;
}

export function TeamStatsOverview({
  pendingCount = 0,
  acceptedCount = 0,
  rejectedCount = 0,
  availability = 0,
  loading = false
}: TeamStatsOverviewProps) {
  // Safeguard against undefined/null values
  const safePending = pendingCount ?? 0;
  const safeAccepted = acceptedCount ?? 0;
  const safeRejected = rejectedCount ?? 0;
  const safeAvailability = availability ?? 0;

  const stats = [
    {
      label: "Decision Pending",
      value: safePending,
      icon: ClipboardList,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: safePending > 0 ? "Needs action" : "Clear",
    },
    {
      label: "Accepted",
      value: safeAccepted,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "Total approved",
    },
    {
      label: "Rejected",
      value: safeRejected,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      trend: "Total declined",
    },
    {
      label: "Team Capacity",
      value: `${safeAvailability}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "Bandwidth",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 w-full rounded-[2rem] bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.02] transition-transform cursor-default border border-slate-50"
        >
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-4xl font-black text-[#0D1A2C]">
                  {stat.value}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    stat.bg,
                    stat.color
                  )}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}