"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

export default function MyLeavesPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Leaves</h2>
          <p className="text-slate-500 mt-1.5 text-lg">Securely submit new time-off requests and track your history.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl ring-1 ring-slate-100/50">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
              <CardTitle className="text-xl">Request Time Off</CardTitle>
              <CardDescription className="text-sm mt-1">Submit your desired dates for managerial approval.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="type" className="font-semibold text-slate-700">Leave Category</Label>
                  <Select>
                    <SelectTrigger id="type" className="h-11">
                      <SelectValue placeholder="Select leave classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="start" className="font-semibold text-slate-700">Start Date</Label>
                    <Input id="start" type="date" className="h-11 cursor-pointer" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="end" className="font-semibold text-slate-700">End Date</Label>
                    <Input id="end" type="date" className="h-11 cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="reason" className="font-semibold text-slate-700">Reason / Notes (Optional)</Label>
                  <Input id="reason" placeholder="Brief explanation..." className="h-11" />
                </div>

                <Button className="w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                  Submit Formal Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Empty State/History Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/30 p-12 text-center min-h-[400px]">
          <div className="bg-white p-5 rounded-full shadow-sm ring-1 ring-slate-100 mb-5 relative">
            <CalendarDays className="h-10 w-10 text-indigo-500" />
            <div className="absolute top-0 right-0 h-4 w-4 bg-emerald-400 rounded-full ring-4 ring-white"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Historical Leaves Found</h3>
          <p className="text-slate-500 mt-2.5 max-w-sm leading-relaxed">
            When you successfully request a leave period, the extensive status history will actively map here allowing easy cancellation or follow-up.
          </p>
          <Button variant="outline" className="mt-8 h-10 px-6 font-medium text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            Review Company Policy
          </Button>
        </div>
      </div>
    </div>
  );
}
