"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarDays, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  PlaneTakeoff,
  X,
  Edit2
} from "lucide-react";

// Mock Data
const activeBalances = [
  { type: "Annual Leave", available: 14, total: 21, color: "bg-blue-500", text: "text-blue-700", bgLight: "bg-blue-50" },
  { type: "Sick Leave", available: 5, total: 10, color: "bg-emerald-500", text: "text-emerald-700", bgLight: "bg-emerald-50" },
  { type: "Exam (EAM)", available: 2, total: 5, color: "bg-purple-500", text: "text-purple-700", bgLight: "bg-purple-50" },
];

const pendingRequests = [
  { id: "p1", type: "Personal", start: "Dec 10, 2026", end: "Dec 12, 2026", reason: "Family Event" },
];

const upcomingLeaves = [
  { id: "u1", type: "Annual Leave", start: "Nov 01, 2026", end: "Nov 15, 2026", status: "approved" },
];

const isCurrentlyOut = false; // Toggle this to test banner

export default function MyLeavesPage() {
  return (
    <div className="space-y-6 pb-10">

      {/* Currently Out Banner */}
      {isCurrentlyOut && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
           <div className="bg-emerald-100 p-2 rounded-full">
             <PlaneTakeoff className="h-6 w-6 text-emerald-600" />
           </div>
           <div>
             <h3 className="font-bold text-emerald-800">You are currently Out of Office</h3>
             <p className="text-sm text-emerald-600">Enjoy your Annual Leave! Returning on Oct 25, 2026.</p>
           </div>
        </div>
      )}

      {/* Wallet / Active Balances */}
      <h3 className="font-bold text-slate-800 pt-2">Active Balances (Wallet)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeBalances.map((balance, i) => (
          <div key={i} className={`${balance.bgLight} border border-white/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group`}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${balance.color} transform transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="flex items-center gap-2">
                 <Wallet className={`h-5 w-5 ${balance.text}`} />
                 <h3 className={`font-semibold ${balance.text}`}>{balance.type}</h3>
               </div>
            </div>
            <div className="relative z-10">
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-slate-800">{balance.available}</span>
                 <span className="text-sm font-medium text-slate-500">/ {balance.total} days</span>
               </div>
               <p className="text-xs text-slate-500 mt-2">Available Balance</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        
        {/* Pending Requests */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-amber-100 bg-amber-50/30 flex items-center gap-3">
             <Clock className="h-5 w-5 text-amber-500" />
             <h3 className="font-bold text-slate-800">Pending Approvals</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase h-10 pl-5">Details</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase h-10">Period</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase h-10 pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center py-8 text-slate-400">No pending requests.</TableCell>
                  </TableRow>
                ) : pendingRequests.map((req) => (
                  <TableRow key={req.id} className="border-slate-50 hover:bg-amber-50/10 transition-colors">
                    <TableCell className="font-medium text-slate-700 py-3 pl-5">
                      <span className="block">{req.type}</span>
                      <span className="text-xs font-normal text-slate-400">{req.reason}</span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <span className="block">{req.start}</span>
                      <span className="text-xs text-slate-400">to {req.end}</span>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2.5">
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 px-2.5">
                           <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Approved Upcoming Leaves */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
             <CalendarDays className="h-5 w-5 text-emerald-600" />
             <h3 className="font-bold text-slate-800">Approved Upcoming Vacations</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase h-10 pl-5">Leave Info</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs uppercase h-10">Period</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase h-10 pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingLeaves.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center py-8 text-slate-400">No upcoming leaves scheduled.</TableCell>
                  </TableRow>
                ) : upcomingLeaves.map((req) => (
                  <TableRow key={req.id} className="border-slate-50">
                    <TableCell className="font-medium text-slate-700 py-3 pl-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {req.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <span className="block">{req.start}</span>
                      <span className="text-xs text-slate-400">to {req.end}</span>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
