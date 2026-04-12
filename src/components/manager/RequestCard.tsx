"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Clock // Assuming we want some icons in the dialog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/services/decision-engine";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequestCardProps {
  request: any; // LeaveRequestWithProfile
  riskLevel: RiskLevel;
  capacityImpact: number;
  overlapCount: number;
  fairnessAlert?: string;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, reason: string) => void;
  isProcessing?: boolean;
}

export function RequestCard({
  request,
  riskLevel,
  capacityImpact,
  overlapCount,
  fairnessAlert,
  onApprove,
  onReject,
  isProcessing
}: RequestCardProps) {
  const [note, setNote] = useState("");
  const [showNoteField, setShowNoteField] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // We maintain a state for whether the dialog is open to manage interaction.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const riskColors = {
    'Safe': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-100',
    'High Risk': 'text-red-600 bg-red-50 border-red-100',
  };

  const riskIcons = {
    'Safe': CheckCircle2,
    'Medium': HelpCircle,
    'High Risk': AlertCircle,
  };

  const RiskIcon = riskIcons[riskLevel];

  const handleAction = () => {
    if (actionType === 'approve') onApprove(request.id, note);
    if (actionType === 'reject') onReject(request.id, note);
  };

  // Shared Action Buttons component that can render in the card footer OR the modal
  const ActionButtons = () => (
    <div className="w-full flex gap-3">
      {!showNoteField ? (
        <>
          <Button 
            variant="outline" 
            className="flex-1 border-red-200 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl font-bold h-10 text-[12px] shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              setActionType('reject');
              setShowNoteField(true);
            }}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl font-bold h-10 text-[12px] shadow-sm shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              setActionType('approve');
              setShowNoteField(true);
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </Button>
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
             onClick={(e) => e.stopPropagation()}
             disabled={isProcessing}
           />
           <div className="flex gap-2">
             <Button 
               variant="ghost" 
               className="flex-1 text-slate-500 font-bold hover:bg-slate-200 rounded-xl"
               onClick={(e) => {
                 e.stopPropagation();
                 setShowNoteField(false);
                 setActionType(null);
                 setNote("");
               }}
               disabled={isProcessing}
             >
               Cancel
             </Button>
             <Button 
               className={cn(
                 "flex-1 font-bold rounded-xl text-white shadow-md",
                 actionType === 'approve' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
               )}
               onClick={(e) => {
                 e.stopPropagation();
                 handleAction();
               }}
               disabled={isProcessing || (actionType === 'reject' && !note.trim())}
             >
               {isProcessing ? "Processing..." : "Confirm"}
             </Button>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="border-2 border-[#0D1A2C] shadow-sm overflow-hidden flex flex-col h-full bg-white group hover:shadow-lg transition-all rounded-[2rem]">
        
        {/* The entire top section of the card acts as the dialog trigger */}
        <DialogTrigger asChild>
          <div className="flex-1 cursor-pointer flex flex-col">
            <CardHeader className="p-5 md:p-6 pb-0">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 shadow-sm text-lg shrink-0">
                    {request.profiles?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{request.profiles?.full_name || "User"}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{request.profiles?.email}</p>
                  </div>
                </div>
                
                {/* Visual Risk Badge at Top Right */}
                <Badge variant="outline" className={cn("px-3 py-1.5 font-black uppercase tracking-wider border rounded-xl shadow-sm text-[10px]", riskColors[riskLevel])}>
                  <RiskIcon className="w-3.5 h-3.5 mr-1.5" />
                  {riskLevel}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 md:p-6 space-y-6 flex flex-col">
              {/* Reason Block without flex-1 to prevent stretching */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reason</p>
                <p className="text-lg font-bold text-slate-800 leading-snug">
                  {request.reason ? `"${request.reason}"` : <span className="text-slate-400 italic">No reason provided</span>}
                </p>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Leave Type</p>
                  <p className="text-sm font-black text-slate-900">{request.leave_type}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-black text-slate-900">{request.days} Days</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">From</p>
                  <p className="text-sm font-black text-slate-900">{format(new Date(request.start_date), 'MMM dd')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">To Date</p>
                  <p className="text-sm font-black text-slate-900">{format(new Date(request.end_date), 'MMM dd')}</p>
                </div>
              </div>
            </CardContent>
          </div>
        </DialogTrigger>

        {/* Buttons pinned to the bottom of the card, outside the DialogTrigger so they don't open the modal when clicked */}
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-4 border-t border-slate-50 bg-slate-50/50">
           <ActionButtons />
        </div>
      </Card>

      {/* Modular Full Details Dialog */}
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 border-none shadow-2xl bg-white overflow-hidden">
        
        {/* Profile Header mapped inside Modal */}
        <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
          <DialogTitle className="sr-only">Request Details</DialogTitle>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm text-xl">
               {request.profiles?.full_name?.charAt(0) || "U"}
             </div>
             <div>
               <h4 className="font-black text-slate-900 text-xl">{request.profiles?.full_name || "User"}</h4>
               <p className="text-sm font-medium text-slate-500">{request.profiles?.email}</p>
             </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
           {/* Detailed Request Info */}
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dates</p>
                 <p className="text-sm font-bold text-slate-800">
                    {format(new Date(request.start_date), 'MMM dd, yyyy')} — {format(new Date(request.end_date), 'MMM dd, yyyy')}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration & Type</p>
                 <p className="text-sm font-bold text-slate-800">
                    {request.days} Days • {request.leave_type}
                 </p>
              </div>
           </div>

           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detailed Reason</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed">
                 {request.reason ? `"${request.reason}"` : <span className="text-slate-400 italic">No reason provided</span>}
              </div>
           </div>

           {/* AI Smart Insights section */}
           <div className="pt-6 border-t border-slate-100 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-lg">System Analysis</h3>
               </div>

               {/* Risk Badge */}
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-sm font-bold text-slate-500">Calculated Risk Level</span>
                 <Badge variant="outline" className={cn("px-3 py-1 font-bold border rounded-lg", riskColors[riskLevel])}>
                   <RiskIcon className="w-3 h-3 mr-1" /> {riskLevel}
                 </Badge>
               </div>

               {/* Capacity Impact */}
               <div className={cn(
                 "p-4 rounded-2xl border flex items-start gap-4",
                 capacityImpact < 70 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
               )}>
                 <div>
                   <p className={cn("text-[10px] font-black uppercase tracking-wider", capacityImpact < 70 ? "text-red-700" : "text-emerald-700")}>
                     Capacity Impact
                   </p>
                   <p className={cn("mt-1 text-sm font-medium", capacityImpact < 70 ? "text-red-600" : "text-emerald-600")}>
                     {capacityImpact < 70 
                       ? `Approving this reduces team capacity to ${capacityImpact}%, which is below the safe threshold.` 
                       : `Team capacity remains stable at ${capacityImpact}%.`}
                   </p>
                 </div>
               </div>

               {/* Overlap Info */}
               <div className={cn(
                 "p-4 rounded-2xl border flex items-start gap-4",
                 overlapCount > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
               )}>
                 <div>
                   <p className={cn("text-[10px] font-black uppercase tracking-wider", overlapCount > 0 ? "text-amber-700" : "text-emerald-700")}>
                     Overlapping Leaves
                   </p>
                   <p className={cn("mt-1 text-sm font-medium", overlapCount > 0 ? "text-amber-600" : "text-emerald-600")}>
                     {overlapCount > 0
                       ? `This request directly overlaps with ${overlapCount} other team member(s) who are already approved for leave.`
                       : "No overlapping leaves detected in your team for these dates."}
                   </p>
                 </div>
               </div>
               
               {fairnessAlert && (
                 <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mt-2">
                   <p className="text-xs text-red-600 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> <span className="font-bold">Fairness Alert:</span> {fairnessAlert}
                   </p>
                 </div>
               )}
           </div>

           {/* Actions duplicated in Modal footer for convenience */}
           <div className="pt-6 border-t border-slate-100">
               <ActionButtons />
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
