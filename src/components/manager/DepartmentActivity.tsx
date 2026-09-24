"use client";

import { useMemo } from "react";
import { useTeamRequests } from "@/hooks/queries/leaveQueries";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FilePlus,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * DepartmentActivity
 * Feed of recent leave related actions in the department.
 */
export function DepartmentActivity() {
  const { data: teamRequests, isLoading } = useTeamRequests();

  const activities = useMemo(() => {
    if (!teamRequests) return [];
    
    // Sort all requests by updated_at or created_at
    return [...teamRequests]
      .sort((a, b) => 
        new Date(b.updated_at || b.created_at).getTime() - 
        new Date(a.updated_at || a.created_at).getTime()
      )
      .slice(0, 10); // Show top 10 recent activities
  }, [teamRequests]);

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-[2rem] bg-white h-full animate-pulse">
        <div className="h-64 bg-slate-50 m-6 rounded-2xl" />
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white h-full flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Recent Activity</CardTitle>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-[0.15em]">Department Logs</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <Activity className="w-5 h-5 text-indigo-600" />
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-4 flex-1 overflow-hidden">
        <div className="space-y-8 relative">
          {/* Vertical line connector */}
          <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-slate-100 hidden sm:block" />
          
          {activities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm italic">
              No recent activity recorded.
            </div>
          ) : (
            activities.map((activity, i) => {
              const Icon = activity.status === 'approved' ? CheckCircle2 : 
                          activity.status === 'pending' ? FilePlus : XCircle;
              const colorClass = activity.status === 'approved' ? 'text-emerald-500 bg-emerald-50' : 
                                activity.status === 'pending' ? 'text-indigo-500 bg-indigo-50' : 'text-red-500 bg-red-50';
              
              const dateObj = new Date(activity.updated_at || activity.created_at);

              return (
                <div key={activity.id} className="flex gap-4 relative z-10 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-transform hover:scale-110", colorClass)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          <span className="text-indigo-600">{activity.profiles?.full_name}</span>
                          {' '}
                          {activity.status === 'pending' ? 'requested' : activity.status}
                          {' '}
                          {activity.leave_type} leave
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-2">
                           {formatDistanceToNow(dateObj, { addSuffix: true })}
                           <span className="w-1 h-1 bg-slate-200 rounded-full" />
                           {activity.days} Days
                        </p>
                      </div>
                      
                      {/* Mini Status Indicator */}
                      <Badge variant="outline" className={cn(
                        "text-[9px] py-0 px-2 font-black uppercase tracking-widest border-none shrink-0",
                        colorClass
                      )}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-10">
            <Link 
              href="/dashboard/manager/history" 
              className="group flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl text-xs font-black text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all uppercase tracking-widest"
            >
              Access Audit Log
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
