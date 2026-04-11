"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ScrollText,
  CalendarCheck,
  XOctagon,
  TrendingUp,
  ChevronDown,
  XCircle,
  Ban,
  CheckCircle2,
} from "lucide-react";

import { useLeaveRequests, useLeaveStats } from "@/hooks/queries/leaveQueries";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export default function HistoryArchivePage() {
  const { joinYear } = useProfile();
  const currentYear = new Date().getFullYear();
  const startYear = parseInt(joinYear || currentYear.toString());
  
  // Generate list of years from now down to join year
  const availableYears = Array.from(
    { length: currentYear - startYear + 1 }, 
    (_, i) => currentYear - i
  );

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data: allRequests, isLoading: requestsLoading } = useLeaveRequests();
  const { data: stats, isLoading: statsLoading } = useLeaveStats(selectedYear);

  const isLoading = requestsLoading || statsLoading;

  const filteredLeaves = allRequests?.filter((l) => {
    const year = new Date(l.start_date).getFullYear();
    return year === selectedYear;
  }) || [];

  const completedLeaves = filteredLeaves.filter((l) => l.status === "approved");
  const rejectedLeaves = filteredLeaves.filter((l) => l.status !== "approved");

  // Use pre-calculated total from the database
  const totalDaysTaken = stats?.used ?? 0;
  
  // Find top category from distribution if available
  const topCategory = stats?.distribution && stats.distribution.length > 0 
    ? [...stats.distribution].sort((a, b) => b.value - a.value)[0].name
    : "N/A";

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0D1A2C] px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-8 -left-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-20 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Left: Icon + Text */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
            <ScrollText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">History Archive</h2>
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {selectedYear}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {completedLeaves.length} completed · {rejectedLeaves.length} denied or cancelled
            </p>
          </div>
        </div>

        {/* Right: Year Dropdown */}
        <div className="relative z-10 shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none bg-white/10 border border-white/20 text-white font-semibold text-sm rounded-xl pl-4 pr-10 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 hover:bg-white/15 transition-colors backdrop-blur-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year} className="text-[#0D1A2C] bg-white">
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        </div>
      </div>

      {/* Usage Summary and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-200/50 rounded-2xl">
              <History className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Usage Summary</h3>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                In{" "}
                <span className="font-bold text-indigo-600">{selectedYear}</span>, you took{" "}
                <span className="font-bold text-slate-900">{totalDaysTaken} days</span> of leave
                across{" "}
                <span className="font-bold text-slate-900">
                  {completedLeaves.length} successful requests
                </span>
                . You also had {rejectedLeaves.length} requests that did not happen.
              </p>
            </div>
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-[#0D1A2C] text-white p-6 rounded-3xl shadow-md border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Top Category
            </h3>
            <p className="text-xl font-bold mt-1">
              {topCategory}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-2">

        {/* Completed Leaves — Card Rows */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-emerald-50/30 flex items-center gap-3">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Completed Leaves</h3>
            {completedLeaves.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                {completedLeaves.length}
              </span>
            )}
          </div>
          <div className="p-4 flex flex-col gap-3">
            {completedLeaves.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No completed leaves found for {selectedYear}.
              </div>
            ) : (
              completedLeaves.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  className="w-full flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 px-4 py-3.5 text-left transition-all cursor-default"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-100 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-emerald-800 truncate">
                        <span className="capitalize">{req.leave_type}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {new Date(req.start_date).toLocaleDateString()} → {new Date(req.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Right: Days + Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-medium">
                      {req.days}d
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold border-emerald-200 text-emerald-700 bg-emerald-50 capitalize"
                    >
                      {req.status}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Rejected & Cancelled — Card Rows (Graveyard) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-red-50/30 flex items-center gap-3">
            <XOctagon className="h-5 w-5 text-red-400" />
            <h3 className="font-bold text-slate-800">Rejected & Cancelled</h3>
            <span className="text-xs text-slate-400 font-medium">(Graveyard)</span>
            {rejectedLeaves.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full">
                {rejectedLeaves.length}
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col gap-3">
            {rejectedLeaves.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No denied or cancelled requests for {selectedYear}.
              </div>
            ) : (
              rejectedLeaves.map((req) => {
                const isRejected = req.status === "rejected";
                return (
                  <button
                    key={req.id}
                    type="button"
                    className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all group cursor-default ${
                      isRejected
                        ? "border-red-100 bg-red-50/50 hover:bg-red-50"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isRejected ? "bg-red-100" : "bg-slate-200/60"
                        }`}
                      >
                        {isRejected ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Ban className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate line-through decoration-1 ${
                            isRejected
                              ? "text-red-700 decoration-red-300"
                              : "text-slate-500 decoration-slate-300"
                          }`}
                        >
                          <span className="capitalize">{req.leave_type}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {new Date(req.start_date).toLocaleDateString()} → {new Date(req.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Right: Days + Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">
                        {req.days}d
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize font-semibold ${
                          isRejected
                            ? "border-red-200 text-red-600 bg-red-50"
                            : "border-slate-300 text-slate-500 bg-white"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
