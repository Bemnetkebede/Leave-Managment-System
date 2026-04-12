"use client";

import { useMemo } from "react";
import { format, addDays, startOfToday, isWithinInterval, isSameDay } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTeamMembers, useTeamRequests } from "@/hooks/queries/leaveQueries";

/**
 * TeamPulseCalendar
 * Rows: Team Members
 * Columns: Days (Next 30 days)
 * Bars: Leave periods
 * Heatmap Background: Leave density
 */
export function TeamPulseCalendar() {
  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();

  const today = startOfToday();
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(today, i)), [today]);

  // Calculate density for each day
  const heatmapData = useMemo(() => {
    if (!teamRequests) return {};
    const densityMap: Record<string, number> = {};
    
    days.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const onLeaveCount = teamRequests.filter(req => 
        req.status === 'approved' && 
        isWithinInterval(day, { 
          start: new Date(req.start_date), 
          end: new Date(req.end_date) 
        })
      ).length;
      
      densityMap[dayStr] = onLeaveCount;
    });
    
    return densityMap;
  }, [days, teamRequests]);

  if (membersLoading || requestsLoading) {
    return <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />;
  }

  const teamSize = members?.length || 1;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Team Pulse Calendar</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time team presence and leave density (Next 30 days)</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-sm bg-indigo-500/10" /> Low Density
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-sm bg-indigo-500/60" /> Medium
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-sm bg-indigo-700" /> High Density
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header Row: Dates */}
          <div className="flex border-b border-slate-100">
            <div className="w-48 flex-shrink-0 p-4 font-bold text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 bg-slate-50/30">
              Team Member
            </div>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const density = heatmapData[dateStr] || 0;
              const densityPercentage = (density / teamSize) * 100;
              
              // Heatmap logic
              let heatmapColor = "bg-white";
              if (densityPercentage > 50) heatmapColor = "bg-red-50";
              else if (densityPercentage > 0) heatmapColor = "bg-indigo-50/30";

              return (
                <div 
                  key={dateStr} 
                  className={cn(
                    "flex-1 min-w-[40px] p-2 text-center border-r border-slate-100 last:border-r-0 transition-colors",
                    heatmapColor
                  )}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{format(day, 'EEE')}</p>
                  <p className="text-xs font-bold text-slate-700">{format(day, 'd')}</p>
                </div>
              );
            })}
          </div>

          {/* Member Rows */}
          {members?.map((member) => (
            <div key={member.id} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30 transition-colors group">
              <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 bg-slate-50/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                  {member.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-bold text-slate-700 truncate">{member.full_name}</span>
              </div>
              
              <div className="flex flex-1 relative">
                {days.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const onLeave = teamRequests?.find(req => 
                    req.user_id === member.id && 
                    req.status === 'approved' && 
                    isWithinInterval(day, { 
                      start: new Date(req.start_date), 
                      end: new Date(req.end_date) 
                    })
                  );

                  return (
                    <div 
                      key={dayStr} 
                      className="flex-1 min-w-[40px] border-r border-slate-100/50 last:border-r-0 h-14 flex items-center justify-center relative"
                    >
                      {onLeave && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "absolute inset-y-2 inset-x-0.5 rounded-md shadow-sm z-10 transition-transform group-hover:scale-y-110",
                                onLeave.leave_type === 'Annual' ? "bg-indigo-500" : 
                                onLeave.leave_type === 'Sick' ? "bg-rose-500" : "bg-emerald-500"
                              )} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{onLeave.leave_type} Leave</p>
                              <p className="text-xs opacity-80">{format(new Date(onLeave.start_date), 'MMM d')} - {format(new Date(onLeave.end_date), 'MMM d')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Heatmap Density Indicator (Footer) */}
          <div className="flex bg-slate-50/50">
             <div className="w-48 flex-shrink-0 p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-100">
              Leave Density
            </div>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const density = heatmapData[dateStr] || 0;
              const densityPercentage = (density / teamSize) * 100;
              
              let bgColor = "bg-transparent";
              if (densityPercentage > 50) bgColor = "bg-red-500";
              else if (densityPercentage > 25) bgColor = "bg-indigo-500/60";
              else if (densityPercentage > 0) bgColor = "bg-indigo-500/20";

              return (
                <div key={dateStr} className="flex-1 min-w-[40px] p-2 flex flex-col items-center justify-center gap-1">
               <div 
                className={cn(
                  "w-[85%] h-2 rounded-full transition-all duration-700 shadow-inner", 
                  bgColor,
                  densityPercentage > 0 ? "opacity-100" : "opacity-0"
                )}
               />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend Block */}
      <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex gap-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sick</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Other</span>
        </div>
      </div>
    </div>
  );
}
