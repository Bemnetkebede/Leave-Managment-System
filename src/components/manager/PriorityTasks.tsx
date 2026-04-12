"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PriorityTasksProps {
  pendingRequests: any[];
}

export function PriorityTasks({ pendingRequests }: PriorityTasksProps) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Priority Approvals</CardTitle>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Action Queue</p>
        </div>
        <div className="p-2 bg-indigo-50 rounded-xl">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {pendingRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm italic">
            All caught up! No pending tasks.
          </div>
        ) : (
          pendingRequests.slice(0, 5).map((req, i) => (
            <div key={req.id} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-indigo-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {req.profiles?.full_name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Request: {req.leave_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="w-3 h-3 text-slate-300" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{req.days}d</span>
                </div>
              </div>
              
              {/* Real Balance Impact Progress Bar */}
              <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span>Balance Impact</span>
                      <span>{Math.round((req.days / (req.profiles?.leave_balances?.[0]?.total || 21)) * 100)}%</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          req.status === 'pending' ? "bg-indigo-500" : "bg-slate-300"
                        )} 
                        style={{ width: `${Math.round((req.days / (req.profiles?.leave_balances?.[0]?.total || 21)) * 100)}%` }}
                      />
                      <div className="flex-1 h-full bg-slate-100 rounded-full" />
                  </div>
              </div>
            </div>
          ))
        )}

        <div className="pt-4">
            <Button asChild className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl h-12 shadow-none border-none">
                <Link href="/dashboard/manager/approvals">
                    View Complete Queue <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
