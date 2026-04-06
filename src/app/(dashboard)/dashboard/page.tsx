"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";

// Placeholder data representing real database snapshots
const recentRequests = [
  { id: "1", type: "Annual Leave", start: "Oct 12, 2026", end: "Oct 15, 2026", status: "approved" },
  { id: "2", type: "Sick Leave", start: "Sep 01, 2026", end: "Sep 02, 2026", status: "approved" },
  { id: "3", type: "Personal", start: "Nov 20, 2026", end: "Nov 21, 2026", status: "pending" },
  { id: "4", type: "Annual Leave", start: "Dec 24, 2026", end: "Jan 02, 2027", status: "rejected" },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1.5 text-lg">Your quick glance at allocations and recent activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1 */}
        <Card className="border-none shadow-md ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Available Balance</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-full">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">14 <span className="text-xl font-medium text-slate-400">Days</span></div>
            <p className="text-sm font-medium text-slate-500 mt-2">Total annual allowance: 21 days</p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-none shadow-md ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</CardTitle>
            <div className="p-2 bg-amber-50 rounded-full">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">1</div>
            <p className="text-sm font-medium text-slate-500 mt-2">Awaiting manager action</p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-none shadow-md ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Leaves Taken</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
               <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">7 <span className="text-xl font-medium text-slate-400">Days</span></div>
            <p className="text-sm font-medium text-slate-500 mt-2">Across all leave categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-5">Recent Leave History</h3>
        <Card className="border-none shadow-md ring-1 ring-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 h-11">Leave Type</TableHead>
                <TableHead className="font-semibold text-slate-600 h-11">Start Date</TableHead>
                <TableHead className="font-semibold text-slate-600 h-11">End Date</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 h-11">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((req) => (
                <TableRow key={req.id} className="border-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-700 py-4">{req.type}</TableCell>
                  <TableCell className="text-slate-600">{req.start}</TableCell>
                  <TableCell className="text-slate-600">{req.end}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={
                        req.status === 'approved' ? 'default' : 
                        req.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1 text-xs' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-3 py-1 text-xs' : 'bg-red-100 text-red-800 hover:bg-red-200 border-none px-3 py-1 text-xs'
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
