"use client";

import { useState } from "react";
import { useTeamMembers } from "@/hooks/queries/leaveQueries";
import { useCreateLeave } from "@/hooks/queries/leaveMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarIcon, UserPlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/**
 * SubmitForEmployee
 * Allows managers to submit leave requests on behalf of team members.
 */
export function SubmitForEmployee() {
  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { mutate: createLeave, isPending } = useCreateLeave();

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [leaveType, setLeaveType] = useState<string>("Annual");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !startDate || !endDate || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In a real app, we'd use a specialized API endpoint for managers submitting for others
    // For this demo, we'll simulate it by calling a new (to be created) api or specialized hook
    // For now, let's assume useCreateLeave is updated or we use a custom fetch
    
    try {
      const response = await fetch('/api/leave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedMemberId, // The manager-specific addition
          leave_type: leaveType,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason: `[Submitted by Manager] ${reason}`,
          status: 'approved' // Managers submitting for others are usually pre-approved
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit");

      toast.success("Leave recorded successfully");
      // Reset form
      setReason("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedMemberId("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900">Record Leave for Employee</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Manually enter leave requests for your team members.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Employee</label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 transition-all font-bold text-slate-700">
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {members?.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="rounded-lg font-medium">
                      {member.full_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Leave Type</label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 transition-all font-bold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="Annual" className="font-medium">Annual Leave</SelectItem>
                  <SelectItem value="Sick" className="font-medium">Sick Leave</SelectItem>
                  <SelectItem value="Maternity" className="font-medium">Maternity</SelectItem>
                  <SelectItem value="Paternity" className="font-medium">Paternity</SelectItem>
                  <SelectItem value="Other" className="font-medium">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-bold rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-all",
                      !startDate && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-bold rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-all",
                      !endDate && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adjustment Reason / Notes</label>
            <Textarea 
              placeholder="Provide a reason for this manual entry..."
              className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:ring-indigo-500 transition-all p-4 font-medium text-slate-700"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 bg-[#0D1A2C] hover:bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Record Team Leave
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
