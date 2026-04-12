"use client";

import { useTeamRequests, useTeamMembers } from "@/hooks/queries/leaveQueries";
import { useUpdateLeaveStatus } from "@/hooks/queries/leaveMutations";
import { RequestCard } from "./RequestCard";
import { evaluateRequest, DecisionContext } from "@/lib/services/decision-engine";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ApprovalQueue() {
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();
  const { mutate: updateStatus, isPending, variables } = useUpdateLeaveStatus();

  if (requestsLoading || membersLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] w-full rounded-2xl bg-white animate-pulse border border-[#0D1A2C]" />
        ))}
      </div>
    );
  }

  const pendingRequests = teamRequests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = teamRequests?.filter(r => r.status === 'approved') || [];

  const handleApprove = (requestId: string, note: string) => {
    updateStatus({ requestId, status: 'approved', note }, {
      onSuccess: () => toast.success("Leave request approved successfully"),
      onError: (error: any) => toast.error(error.message)
    });
  };

  const handleReject = (requestId: string, reason: string) => {
    updateStatus({ requestId, status: 'rejected', note: reason }, {
      onSuccess: () => toast.success("Leave request rejected"),
      onError: (error: any) => toast.error(error.message)
    });
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-1">There are no pending leave requests in your queue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {pendingRequests.map((request) => {
        // Prepare context for decision engine
        const context: DecisionContext = {
          teamSize: teamMembers?.length || 0,
          overlappingLeaves: approvedRequests.filter(ar => {
            const arStart = new Date(ar.start_date);
            const arEnd = new Date(ar.end_date);
            const reqStart = new Date(request.start_date);
            const reqEnd = new Date(request.end_date);
            return (arStart <= reqEnd && arEnd >= reqStart);
          }),
          userRecentLeaves: teamRequests?.filter(r => 
            r.user_id === request.user_id && 
            r.status === 'approved' &&
            new Date(r.start_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ) || [],
          departmentLimit: 2 // Default limit
        };

        const evaluation = evaluateRequest(request, context);

        return (
          <RequestCard
            key={request.id}
            request={request}
            riskLevel={evaluation.riskLevel}
            capacityImpact={evaluation.capacityImpact}
            overlapCount={evaluation.overlapCount}
            fairnessAlert={evaluation.fairnessAlert}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isPending && (variables as any)?.requestId === request.id}
          />
        );
      })}
    </div>
  );
}
