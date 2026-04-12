"use client";

import { useMemo } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useTeamRequests, useTeamMembers } from "@/hooks/queries/leaveQueries";
import { redirect } from "next/navigation";
import { 
  History, 
  TrendingUp, 
  BarChart2, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ManagerHistoryPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();

  // Role Protection
  if (!profileLoading && profile && profile.role !== 'manager' && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  const analysis = useMemo(() => {
    if (!teamRequests || !teamMembers) return null;

    const decisions = teamRequests.filter(r => r.status !== 'pending');
    const approved = decisions.filter(r => r.status === 'approved');
    
    // Fairness Analytics: Leaves per member
    const memberStats = teamMembers.map(member => {
        const memberLeaves = approved.filter(r => r.user_id === member.id);
        const totalDays = memberLeaves.reduce((acc, curr) => acc + curr.days, 0);
        return {
            id: member.id,
            name: member.full_name,
            count: memberLeaves.length,
            totalDays
        };
    });

    const avgDays = memberStats.reduce((acc, curr) => acc + curr.totalDays, 0) / (teamMembers.length || 1);
    
    // Flag fairness outliers
    const outliers = memberStats.filter(s => s.totalDays > avgDays * 1.5 || (avgDays > 10 && s.totalDays < avgDays * 0.3));

    return { decisions, totalApproved: approved.length, avgDays, outliers, memberStats };
  }, [teamRequests, teamMembers]);

  const loading = profileLoading || requestsLoading || membersLoading;

  if (loading) return <div className="p-8 text-slate-400">Loading history...</div>;

  return (
    <div className="space-y-8 pb-10">

      {/* Fairness & Context Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-[-5px]">
         <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-indigo-50/50">
            <CardHeader className="pt-4 px-6 pb-2">
                <h3 className="text-2xl font-bold tracking-tight text-[#0D1A2C]">History & Accountability</h3>
                <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4" /> Fairness Context
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {analysis?.outliers && analysis.outliers.length > 0 ? (
                    analysis.outliers.map((outlier, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-left-2">
                            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">{outlier.name}</p>
                                <p className="text-xs text-slate-600">
                                    {outlier.totalDays > analysis.avgDays 
                                        ? `Has taken ${outlier.totalDays} days, which is ${Math.round(outlier.totalDays / (analysis.avgDays || 1) * 100)}% above the team average.` 
                                        : `Has taken only ${outlier.totalDays} days, falling significantly below the team average.`}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-indigo-400 flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-bold">Leave distribution is currently balanced across the team.</p>
                    </div>
                )}
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-slate-900 text-white flex flex-col justify-center text-center p-6 relative overflow-hidden">
            <BarChart2 className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Team Average</p>
            <h2 className="text-6xl font-black">{Math.round(analysis?.avgDays || 0)}</h2>
            <p className="text-sm text-slate-400 mt-2">Days per employee / Year</p>
         </Card>
      </div>

      {/* Decision Audit Log */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-xl px-2">Decision Audit Log</h3>
        <div className="space-y-4">
            {analysis?.decisions && analysis.decisions.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 border-y border-transparent">
                    {analysis.decisions.map((req) => (
                        <div key={req.id} className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-[#0D1A2C]/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                        
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                            {/* Date */}
                            <div className="w-24 shrink-0">
                                <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Date</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {format(new Date(req.updated_at || req.created_at), 'MMM d, yy')}
                                </p>
                            </div>

                            {/* Employee */}
                            <div className="flex items-center gap-3 w-48 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-black text-slate-500 shadow-sm">
                                    {req.profiles?.full_name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Employee</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{req.profiles?.full_name}</p>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="hidden lg:block min-w-0 flex-1">
                                <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Details</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900 text-sm">{req.leave_type}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 text-sm font-medium">{req.days} days ({format(new Date(req.start_date), 'MMM d')} - {format(new Date(req.end_date), 'MMM d')})</span>
                                </div>
                            </div>
                        </div>

                        {/* Status and Action block at right */}
                        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                            {req.manager_note ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-bold hover:text-indigo-600 transition-colors bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
                                                <Info className="w-3.5 h-3.5" /> Note
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-slate-900 text-white border-none p-3 max-w-xs rounded-xl shadow-xl">
                                            <p className="text-xs font-medium italic">"{req.manager_note}"</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <span className="text-slate-300 italic font-medium text-[10px] hidden md:block">No note</span>
                            )}

                            <Badge className={cn(
                                "font-black py-1.5 px-4 rounded-xl border text-xs tracking-wide shadow-sm",
                                req.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                            )}>
                                {req.status === 'approved' ? (
                                    <FileCheck className="w-4 h-4 mr-2" />
                                ) : (
                                    <XCircle className="w-4 h-4 mr-2" />
                                )}
                                {req.status === 'approved' ? 'Approved' : 'Rejected'}
                            </Badge>
                        </div>
                    </div>
                 ))}
               </div>
            ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center">
                    <History className="w-10 h-10 text-slate-300 mb-3" />
                    <h4 className="text-slate-800 font-bold">No past decisions recorded.</h4>
                    <p className="text-slate-400 text-sm mt-1">Your decision history will appear here once you process requests.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
