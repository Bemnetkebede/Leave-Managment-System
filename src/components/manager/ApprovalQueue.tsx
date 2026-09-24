"use client";

import { useTeamRequests } from "@/hooks/queries/leaveQueries";
import { useUpdateLeaveStatus } from "@/hooks/queries/leaveMutations";
import { RequestCard } from "./RequestCard";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ApprovalQueue() {
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const { mutate: updateStatus, isPending, variables } = useUpdateLeaveStatus();

  if (requestsLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] w-full rounded-3xl bg-white animate-pulse border-2 border-slate-100" />
        ))}
      </div>
    );
  }

  const pendingRequests = teamRequests?.filter(r => r.status === 'pending') || [];

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
      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center h-[500px] flex flex-col items-center justify-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">There are no pending leave requests in your queue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {pendingRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isPending && (variables as any)?.requestId === request.id}
        />
      ))}
    </div>
  );
}
