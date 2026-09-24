"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface RequestCardProps {
  request: any; // LeaveRequestWithProfile
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, reason: string) => void;
  isProcessing?: boolean;
}

export function RequestCard({
  request,
  onApprove,
  onReject,
  isProcessing
}: RequestCardProps) {
  const [note, setNote] = useState("");
  const [showNoteField, setShowNoteField] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (actionType === 'approve') onApprove(request.id, note);
    if (actionType === 'reject') onReject(request.id, note);
  };

  return (
    <Card className="border-2 border-[#0D1A2C] shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-6 md:p-8 flex flex-col gap-8">
        
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 text-xl shrink-0">
            {request.profiles?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h4 className="font-black text-[#0D1A2C] text-xl tracking-tight">{request.profiles?.full_name || "User"}</h4>
            <p className="text-sm font-medium text-slate-500 mt-1">{request.profiles?.email}</p>
          </div>
        </div>

        {/* Reason block */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Reason</p>
          <p className="text-xl font-bold text-[#0D1A2C]">
            {request.reason ? `"${request.reason}"` : <span className="text-slate-400 italic">No reason provided</span>}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-4 gap-4 pt-2">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Leave Type</p>
            <p className="text-sm font-bold text-[#0D1A2C]">{request.leave_type}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration</p>
            <p className="text-sm font-bold text-[#0D1A2C]">{request.days} Days</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">From</p>
            <p className="text-sm font-bold text-[#0D1A2C]">{format(new Date(request.start_date), 'MMM dd')}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">To Date</p>
            <p className="text-sm font-bold text-[#0D1A2C]">{format(new Date(request.end_date), 'MMM dd')}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 md:p-8 pt-0 flex gap-4">
        {!showNoteField ? (
          <>
            <button 
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold h-14 text-sm transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                setActionType('reject');
                setShowNoteField(true);
              }}
              disabled={isProcessing}
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
            <button 
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl font-bold h-14 text-sm transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                setActionType('approve');
                setShowNoteField(true);
              }}
              disabled={isProcessing}
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve
            </button>
          </>
        ) : (
          <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
             <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">
               {actionType === 'approve' ? 'Optional Approval Note' : 'Required Rejection Reason'}
             </p>
             <Textarea 
               placeholder="Type your notes here..." 
               className="text-sm min-h-[80px] bg-white border-slate-200 rounded-xl mb-3 focus:ring-[#0D1A2C]"
               value={note}
               onChange={(e) => setNote(e.target.value)}
               disabled={isProcessing}
             />
             <div className="flex gap-2">
               <button 
                 className="flex-1 text-slate-500 font-bold hover:bg-slate-200 rounded-xl h-10 text-sm"
                 onClick={() => {
                   setShowNoteField(false);
                   setActionType(null);
                   setNote("");
                 }}
                 disabled={isProcessing}
               >
                 Cancel
               </button>
               <button 
                 className={`flex-1 font-bold rounded-xl text-white shadow-md h-10 text-sm ${actionType === 'approve' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
                 onClick={handleAction}
                 disabled={isProcessing || (actionType === 'reject' && !note.trim())}
               >
                 {isProcessing ? "Processing..." : "Confirm"}
               </button>
             </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
