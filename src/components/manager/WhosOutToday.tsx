"use client";

import { useMemo } from "react";
import { useTeamRequests, useTeamMembers } from "@/hooks/queries/leaveQueries";
import { startOfToday, isWithinInterval, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plane, CalendarClock } from "lucide-react";

/**
 * WhosOutToday
 * Horizontal avatar list of currently away team members.
 */
export function WhosOutToday() {
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();

  const today = startOfToday();

  const outToday = useMemo(() => {
    if (!teamRequests || !teamMembers) return [];
    
    return teamRequests
      .filter(req => 
        req.status === 'approved' && 
        isWithinInterval(today, { 
          start: new Date(req.start_date), 
          end: new Date(req.end_date) 
        })
      )
      .map(req => ({
        ...req,
        member: teamMembers.find(m => m.id === req.user_id)
      }));
  }, [teamRequests, teamMembers, today]);

  if (requestsLoading || membersLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-48 h-20 bg-slate-100 animate-pulse rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (outToday.length === 0) {
    return (
      <div className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <Plane className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <h4 className="font-bold text-slate-500">Perfect Attendance Today</h4>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">All department members are operational</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-indigo-500" /> Currently Out of Office
        </h3>
        <Badge variant="outline" className="rounded-full bg-white text-[10px] py-1 border-slate-100 text-indigo-600 font-black">
          {outToday.length} PERSONNEL
        </Badge>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {outToday.map((req, i) => (
          <Card key={i} className="flex-shrink-0 w-64 border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow group overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
             <CardContent className="p-4 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100 shadow-inner text-lg">
                 {req.member?.full_name?.charAt(0) || "U"}
               </div>
               <div className="min-w-0">
                 <p className="font-bold text-slate-900 truncate leading-tight">{req.member?.full_name}</p>
                 <div className="flex items-center gap-1.5 mt-1">
                   {/* <Badge variant="secondary" className="text-[9px] py-0 px-1 font-bold bg-indigo-50 text-indigo-600 border-none shrink-0 capitalize">{req.leave_type}</Badge> */}
                   <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Returns: {format(new Date(req.end_date), 'MMM d')}</span>
                 </div>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
