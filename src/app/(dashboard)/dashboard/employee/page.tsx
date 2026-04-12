"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle, CalendarDays } from "lucide-react";
import { StatCircular } from "@/components/dashboard/StatCircular";
import { LeavePieChart } from "@/components/dashboard/LeavePieChart";
import { UpcomingHolidays } from "@/components/dashboard/UpcomingHolidays";
import { useProfile } from "@/hooks/use-profile";
import { useLeaveBalance, useLeaveRequests, useLeaveStats } from "@/hooks/queries/leaveQueries";
import { cn } from "@/lib/utils";

import Holidays from 'date-holidays';

export default function DashboardOverviewPage() {
  const { profile, displayName } = useProfile();
  const { data: allRequests, isLoading: requestsLoading } = useLeaveRequests();
  const { data: pendingData, isLoading: pendingLoading } = useLeaveStats();
  const { data: stats, isLoading: statsLoading } = useLeaveBalance();

  const loading = requestsLoading || pendingLoading || statsLoading;

  // Debugging to console
  if (!loading) {
    console.log("Stats Data:", stats);
  }

  // Use values from both the balance table and the stats function
  const metrics = {
    available: stats?.[0]?.Balance ?? stats?.[0]?.balance ?? 0,
    taken: stats?.[0]?.used_days ?? 0,
    pending: allRequests?.filter(r => r.status === 'pending').length ?? 0
  };

  // Use the fixed budget from DB instead of Available + Taken
  const dynamicTotal = stats?.[0]?.total_days ?? 23;

  // Manually calculate leave distribution since we are reading from tables directly
  const leaveDistribution = allRequests
    ?.filter(r => r.status === 'approved')
    .reduce((acc: any[], current) => {
      const existing = acc.find(item => item.name === current.leave_type);
      if (existing) {
        existing.value += current.days || 0;
      } else {
        acc.push({ name: current.leave_type, value: current.days || 0 });
      }
      return acc;
    }, []) || [];

  // Top 5 recent requests
  const recentRequests = allRequests?.slice(0, 5) || [];
  // Fetch real Ethiopian public holidays
  const hd = new Holidays('ET');
  const upcomingHolidays = hd.getHolidays(new Date().getFullYear())
    .filter(h => new Date(h.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .slice(0, 4) // Show next 4 holidays
    .map(h => ({
      id: h.date,
      name: h.name,
      date: h.date.split(' ')[0]
    }));

  // If we run out of holidays this year, we could fetch next year's, 
  // but keeping it simple for the current scope.
  if (upcomingHolidays.length < 4) {
    const nextYearHols = hd.getHolidays(new Date().getFullYear() + 1);
    upcomingHolidays.push(...nextYearHols.slice(0, 4 - upcomingHolidays.length).map(h => ({
      id: h.date,
      name: h.name,
      date: h.date.split(' ')[0]
    })));
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Header */}
      {/* <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#0D1A2C]">
          Welcome back, {displayName?.split(' ')[0]}
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Here's what's happening with your leave status today.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Metric Gauges */}
          <div className={cn("bg-slate-50/50 rounded-3xl border border-slate-50/50 flex flex-col gap-2 transition-opacity", loading && "opacity-50")}>
            <div className="grid grid-cols-3 gap-4 w-full ">
              <StatCircular
                value={metrics.available}
                max={dynamicTotal || 21}
                title="Available"
                subtitle={`Total ${dynamicTotal || 21}`}
                color="#3b82f6"
                className="w-full h-full p-2 sm:p-4 border-none bg-white/50 backdrop-blur-sm py-4"
                icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />}
              />
              <StatCircular
                value={metrics.pending}
                max={allRequests?.length || 1}
                title="Pending"
                subtitle="Action req"
                color="#f59e0b"
                className="w-full h-full p-4 sm:p-4 border-none bg-white/50 backdrop-blur-sm py-4"
                icon={<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />}
              />
              <StatCircular
                value={metrics.taken}
                max={dynamicTotal || 21}
                title="Taken"
                subtitle="All combined"
                color="#234a3dff"
                className="w-full h-full p-4 sm:p-4 border-none bg-white/50 backdrop-blur-sm py-4"
                icon={<CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#234a3dff]" />}
              />
            </div>
          </div>

          {/* Recent Leave History */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Recent Leave History</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your last 5 leave requests</p>
              </div>
            </div>
            <div className="p-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-transparent border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Leave Type</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Start Date</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">End Date</TableHead>
                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        No recent leave requests found.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentRequests.map((req, i) => (
                    <TableRow key={req.id} className="border-slate-50 transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700 py-4 pl-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                          <span className="capitalize">{req.leave_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">
                        {new Date(req.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">
                        {new Date(req.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant={
                            req.status === 'approved' ? 'default' :
                              req.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            req.status === 'approved' ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200 border-emerald-200/50 px-3 py-1 shadow-sm' :
                              req.status === 'pending' ? 'bg-amber-100/80 text-amber-700 hover:bg-amber-200 border-amber-200/50 px-3 py-1 shadow-sm' :
                                'bg-red-100/80 text-red-700 hover:bg-red-200 border-red-200/50 px-3 py-1 shadow-sm'
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Leave Distribution Pie Chart */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col justify-center min-h-[300px]">
            <p className="text-[#0D1A2C] font-bold text-center py-4 ">TYPE OF LEAVE</p>
            <LeavePieChart data={leaveDistribution} />
          </div>

          {/* Upcoming Holidays */}
          <div>
            <UpcomingHolidays holidays={upcomingHolidays} />
          </div>

        </div>

      </div>
    </div>
  );
}




