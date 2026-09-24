"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Info,
  Calendar,
  Users,
  History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluateRequest, DecisionContext } from "@/lib/services/decision-engine";
import { useTeamRequests, useTeamMembers } from "@/hooks/queries/leaveQueries";

interface RequestDetailsModalProps {
  request: any;
  trigger?: React.ReactNode;
}

export function RequestDetailsModal({ request, trigger }: RequestDetailsModalProps) {
  const { data: teamRequests } = useTeamRequests();
  const { data: teamMembers } = useTeamMembers();

  const evaluation = useMemo(() => {
    if (!teamRequests || !teamMembers) return null;

    const approvedRequests = teamRequests.filter(r => r.status === 'approved');
    
    const context: DecisionContext = {
      teamSize: teamMembers.length || 1,
      overlappingLeaves: approvedRequests.filter(ar => {
        const arStart = new Date(ar.start_date);
        const arEnd = new Date(ar.end_date);
        const reqStart = new Date(request.start_date);
        const reqEnd = new Date(request.end_date);
        return (arStart <= reqEnd && arEnd >= reqStart) && ar.user_id !== request.user_id;
      }),
      userRecentLeaves: teamRequests.filter(r => 
        r.user_id === request.user_id && 
        r.status === 'approved' &&
        new Date(r.start_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ),
      departmentLimit: 2
    };

    return evaluateRequest(request, context);
  }, [request, teamRequests, teamMembers]);

  if (!evaluation) return null;

  const riskColors = {
    'Safe': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-100',
    'High Risk': 'text-red-600 bg-red-50 border-red-100',
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="h-7 px-3 rounded-[4px] border border-[#a2b5f5] text-[#5b73e8] bg-transparent hover:bg-[#f1f4ff] font-bold text-[10px] transition-colors leading-none">
            Details
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 border-none shadow-2xl bg-white overflow-hidden">
        <DialogHeader className="bg-slate-50 p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm text-xl lg:text-2xl">
              {request.profiles?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900">{request.profiles?.full_name}</DialogTitle>
              <p className="text-sm font-medium text-slate-500">{request.profiles?.email}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Top Section: Basic Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-slate-50">
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
               <p className="text-sm font-bold text-slate-800">{request.leave_type}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
               <p className="text-sm font-bold text-slate-800">{request.days} Days</p>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Starts</p>
               <p className="text-sm font-bold text-slate-800">{format(new Date(request.start_date), 'MMM dd, yyyy')}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ends</p>
               <p className="text-sm font-bold text-slate-800">{format(new Date(request.end_date), 'MMM dd, yyyy')}</p>
             </div>
          </div>

          {/* Reason Block */}
          <div className="space-y-3">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Info className="w-3.5 h-3.5 text-indigo-500" /> Employee Reason
             </h4>
             <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 text-sm font-medium text-slate-700 leading-relaxed italic">
               "{request.reason || "No reason provided."}"
             </div>
          </div>

          {/* Decision Pillars */}
          <div className="space-y-6">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
               <AlertCircle className="w-3.5 h-3.5 text-indigo-500" /> Operational Insights
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Pillar */}
                <div className={cn("p-4 rounded-2xl border flex flex-col justify-between h-full", riskColors[evaluation.riskLevel])}>
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Risk Level</span>
                      {evaluation.riskLevel === 'Safe' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                   </div>
                   <p className="text-lg font-black">{evaluation.riskLevel}</p>
                </div>

                {/* Overlap Pillar */}
                <div className={cn("p-4 rounded-2xl border flex flex-col h-full bg-slate-50 border-slate-100")}>
                   <div className="flex items-center justify-between mb-2 text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-widest">Conflicts</span>
                      <Users className="w-4 h-4" />
                   </div>
                   <p className="text-lg font-black text-slate-800">{evaluation.overlapCount} Overlaps</p>
                </div>
             </div>

             {/* Detail Explanation */}
             <div className="p-5 bg-slate-900 rounded-[1.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                   <Users className="w-12 h-12" />
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Capacity Impact</h5>
                <p className="text-sm font-medium text-slate-200">
                   If approved, team capacity will be at <span className="text-indigo-400 font-black">{evaluation.capacityImpact}%</span>.
                   {evaluation.overlapCount > 0 ? ` There are existing approvals for these dates.` : ` No other approved leaves coincide with this slot.`}
                </p>
                {evaluation.fairnessAlert && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                       <HistoryIcon className="w-3 h-3" /> Fairness Alert
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      {evaluation.fairnessAlert}
                    </p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
