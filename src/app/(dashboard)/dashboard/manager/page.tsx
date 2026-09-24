"use client";

import { useProfile } from "@/hooks/use-profile";
import { useTeamRequests, useTeamMembers, useTeamStats, useInitializeDepartment } from "@/hooks/queries/leaveQueries";
import { TeamStatsOverview } from "@/components/manager/TeamStatsOverview";
import { AnalyticsCharts } from "@/components/manager/AnalyticsCharts";
import { PriorityTasks } from "@/components/manager/PriorityTasks";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import { isWithinInterval, startOfToday, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ManagerDashboardOverview() {
  const { profile, loading: profileLoading } = useProfile();
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();

  const {
    pending: pendingCount,
    accepted: acceptedCount,
    rejected: rejectedCount,
    availability,
    isLoading: statsLoading
  } = useTeamStats();

  const { mutateAsync: initializeDepartment, isPending: isInitializing } = useInitializeDepartment();

  // Redirect if not a manager
  if (!profileLoading && profile && profile.role !== 'manager' && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  const loading = profileLoading || requestsLoading || membersLoading || statsLoading;

  const today = startOfToday();
  const activeLeaves = useMemo(() => {
    return teamRequests?.filter(r =>
      r.status === 'approved' &&
      isWithinInterval(today, {
        start: new Date(r.start_date),
        end: new Date(r.end_date)
      })
    ) || [];
  }, [teamRequests, today]);

  const pendingApprovals = useMemo(() => {
    return teamRequests?.filter(r => r.status === 'pending') || [];
  }, [teamRequests]);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <TeamStatsOverview
          pendingCount={0}
          acceptedCount={0}
          rejectedCount={0}
          availability={0}
          loading={true}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-slate-100 rounded-[2rem] animate-pulse" />
          <div className="h-[400px] bg-slate-100 rounded-[2rem] animate-pulse" />
        </div>
      </div>
    );
  }

  const handleInitialize = async () => {
    try {
      await initializeDepartment();
      window.location.reload();
    } catch (e) {
      console.error("Failed to initialize data:", e);
    }
  };

  // Pure Data View - No more Onboarding Hub
  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with real-time status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#0D1A2C]">Department Overview</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            Managing <span className="text-indigo-600 font-bold">{teamMembers?.length || 0} employees</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {teamRequests?.length === 0 && (
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-sm text-sm font-bold tracking-wide transition-all"
            >
              {isInitializing ? "Generating Data..." : "Generate Sample Data"}
            </button>
          )}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              {format(today, 'MMM dd, yyyy')} 
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <TeamStatsOverview
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        availability={availability}
        loading={false}
      />

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <AnalyticsCharts requests={teamRequests || []} />

          {/* Real-time Status Alert */}
          <Card className="border-none shadow-sm rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50">
            <CardContent className="p-8 flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Team Status: {availability === 100 ? 'Healthy' : 'Active Management'}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {activeLeaves.length > 0
                    ? `${activeLeaves.length} members are currently out of office. Capacity is at ${availability}%.`
                    : "Resource allocation is optimal for the current team size."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <PriorityTasks pendingRequests={pendingApprovals} />
        </div>
      </div>
    </div>
  );
}

