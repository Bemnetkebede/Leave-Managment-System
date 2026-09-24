"use client";

import { useProfile } from "@/hooks/use-profile";
import { useTeamRequests, useTeamMembers, useTeamStats } from "@/hooks/queries/leaveQueries";
import { TeamStatsOverview } from "@/components/manager/TeamStatsOverview";
import { AnalyticsCharts } from "@/components/manager/AnalyticsCharts";
import { PriorityTasks } from "@/components/manager/PriorityTasks";
import { UserManagement } from "@/components/admin/UserManagement";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import { startOfToday, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Info, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { data: allRequests, isLoading: requestsLoading } = useTeamRequests();
  const { data: allMembers, isLoading: membersLoading } = useTeamMembers();

  const {
    pending: pendingCount,
    accepted: acceptedCount,
    rejected: rejectedCount,
    availability,
    isLoading: statsLoading
  } = useTeamStats();

  // Role Protection
  if (!profileLoading && profile && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  const loading = profileLoading || requestsLoading || membersLoading || statsLoading;
  const today = startOfToday();

  const pendingApprovals = useMemo(() => {
    return allRequests?.filter(r => r.status === 'pending') || [];
  }, [allRequests]);

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

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Admin Mastery Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#0D1A2C]">Admin Control Center</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            Overseeing <span className="text-indigo-600 font-bold">{allMembers?.length || 0} organizational users</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            System Level Access • {format(today, 'MMM dd')}
          </span>
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
          <AnalyticsCharts requests={allRequests || []} />

          {/* Real-time Status Alert */}
          <Card className="border-none shadow-sm rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50">
            <CardContent className="p-8 flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Organizational Status: {availability === 100 ? 'Healthy' : 'Active Management'}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {availability < 100 
                    ? `${allRequests.filter(r => r.status === 'approved' && today >= new Date(r.start_date) && today <= new Date(r.end_date)).length} members are currently out of office. Capacity is at ${availability}%.`
                    : "Resource allocation is optimal for the current organizational size."}
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
