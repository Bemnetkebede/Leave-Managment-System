"use client";

import { useMemo, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useTeamRequests } from "@/hooks/queries/leaveQueries";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ManagerRequestsBrowser() {
  const { profile, loading: profileLoading } = useProfile();
  const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Role Protection
  if (!profileLoading && profile && profile.role !== 'manager' && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  const filteredRequests = useMemo(() => {
    if (!teamRequests) return [];
    let reqs = teamRequests;

    // Filter by tab
    if (activeTab !== 'all') {
      reqs = reqs.filter(r => r.status === activeTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      reqs = reqs.filter(req => {
        const nameMatch = req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const typeMatch = req.leave_type?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || typeMatch;
      });
    }

    return reqs;
  }, [teamRequests, searchQuery, activeTab]);

  const stats = useMemo(() => {
    if (!teamRequests) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      all: teamRequests.length,
      pending: teamRequests.filter(r => r.status === 'pending').length,
      approved: teamRequests.filter(r => r.status === 'approved').length,
      rejected: teamRequests.filter(r => r.status === 'rejected').length,
    };
  }, [teamRequests]);

  return (
    <div className="w-full bg-[#f1f3fb] min-h-screen -m-6 p-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header matching screenshot exactly */}
        <div className="mb-6">
          <h1 className="text-[#0D1A2C] text-xl font-bold tracking-tight mb-1">Team Requests Management</h1>
          <p className="text-[#0D1A2C]/70 text-xs">Department capacity, pending operational reviews and management.</p>
        </div>

        {/* The Main Container */}
        <div className="w-full">
          
          {/* Folded Tabs Row */}
          <div className="flex items-end space-x-1 pl-4 relative z-10 w-full mb-0 overflow-x-auto select-none pt-4">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => {
              const labels: Record<string, string> = {
                all: 'All Requests',
                pending: 'Pending Work',
                approved: 'Approved Leaves',
                rejected: 'Cancelled/Rejected'
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-8 pt-3.5 pb-3 font-bold text-[13px] rounded-t-[14px] transition-all whitespace-nowrap",
                    isActive 
                      ? "bg-white text-[#30344d] z-20 relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-white" 
                      : "bg-[#e5e8f3] text-[#8389a1] hover:bg-[#dde1ee] border border-transparent z-0 inset-shadow-sm"
                  )}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* White Work Area Box */}
          <div className="bg-white min-h-[600px] rounded-[24px] rounded-tl-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaedf5] w-full p-8 relative z-10">
            
            {/* Search/Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <label className="text-[#3b3f5c] text-xs font-bold whitespace-nowrap">Employee Name</label>
                  <input 
                    type="text" 
                    placeholder="Please enter here" 
                    className="h-9 px-4 text-xs bg-[#f8f9fc] border border-[#eaedf5] rounded-md min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#5b73e8] focus:bg-white transition-all text-[#3b3f5c] placeholder:text-[#b4bbd2]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[#3b3f5c] text-xs font-bold whitespace-nowrap">Leave Type</label>
                  <select className="h-9 px-4 text-xs bg-[#f8f9fc] border border-[#eaedf5] rounded-md min-w-[180px] focus:outline-none focus:ring-1 focus:ring-[#5b73e8] focus:bg-white transition-all text-[#b4bbd2] appearance-none" defaultValue="">
                    <option value="" disabled>Please choose</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                  </select>
                </div>
                <button className="h-9 px-6 rounded-md border border-[#5b73e8] text-[#5b73e8] hover:bg-[#5b73e8]/5 font-bold text-xs transition-colors flex items-center justify-center">
                  Search
                </button>
              </div>
              <Button className="h-9 px-6 rounded-md bg-[#4c6bf4] hover:bg-[#3b55ce] text-white font-bold text-xs shadow-md shadow-[#4c6bf4]/20 flex items-center shrink-0">
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Export
              </Button>
            </div>

            {/* Table Area */}
            <div className="w-full">
              <Table>
                <TableHeader className="bg-[#f8f9fc] rounded-lg overflow-hidden">
                  <TableRow className="border-none hover:bg-[#f8f9fc]">
                    <TableHead className="font-bold text-[#8a92b2] text-[11px] h-12 rounded-l-lg pl-6">Employee</TableHead>
                    <TableHead className="font-bold text-[#8a92b2] text-[11px] h-12 text-center">Leave Type</TableHead>
                    <TableHead className="font-bold text-[#8a92b2] text-[11px] h-12 text-center">Update Time</TableHead>
                    <TableHead className="font-bold text-[#8a92b2] text-[11px] h-12 text-center">Duration</TableHead>
                    <TableHead className="font-bold text-[#8a92b2] text-[11px] h-12 text-center rounded-r-lg">Operate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="before:block before:h-2 before:content-['']">
                  {filteredRequests.length === 0 ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={5} className="text-center py-24 text-[#8a92b2] text-sm">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => (
                      <TableRow key={req.id} className="border-b border-slate-50 hover:bg-[#fcfdff] transition-none">
                        <TableCell className="pl-6 py-4">
                          <p className="font-bold text-[#3d425f] text-xs">
                            {req.profiles?.full_name || "Unknown"}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <p className="font-bold text-[#3d425f] text-xs">
                            {req.leave_type}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <p className="font-bold text-[#3d425f] text-[11px]">
                            {format(new Date(req.created_at || req.start_date), 'yyyy.MM.dd HH:mm')}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <p className="font-bold text-[#3d425f] text-[11px]">
                            {req.days} <span className="opacity-50">/ Days</span>
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button className="h-7 px-3 rounded-[4px] border border-[#a2b5f5] text-[#5b73e8] bg-transparent hover:bg-[#f1f4ff] font-bold text-[10px] transition-colors leading-none">
                                Approve
                              </button>
                              <button className="h-7 px-3 rounded-[4px] border border-[#a2b5f5] text-[#5b73e8] bg-transparent hover:bg-[#f1f4ff] font-bold text-[10px] transition-colors leading-none">
                                Reject
                              </button>
                              <button className="h-7 px-3 rounded-[4px] border border-[#a2b5f5] text-[#5b73e8] bg-transparent hover:bg-[#f1f4ff] font-bold text-[10px] transition-colors leading-none">
                                Details
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Badge className={cn(
                                "border-none px-3 h-7 rounded-[4px] shadow-sm font-bold text-[10px]",
                                req.status === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                              )}>
                                {req.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Mock (matching screenshot layout) */}
            <div className="flex justify-end mt-8 items-center text-xs">
              <div className="flex gap-1.5 items-center font-bold text-[#838aa5]">
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] text-[#bac1d6] hover:border-[#5b73e8] hover:text-[#5b73e8] transition-colors">{"<"}</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#5b73e8] text-[#5b73e8] bg-[#f1f4ff]">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] hover:border-[#5b73e8] hover:text-[#5b73e8] transition-colors">2</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] hover:border-[#5b73e8] hover:text-[#5b73e8] transition-colors">3</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] hover:border-[#5b73e8] hover:text-[#5b73e8] transition-colors">4</button>
                <span className="px-1 text-[#bac1d6]">...</span>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] hover:border-[#5b73e8] hover:text-[#5b73e8] transition-colors">17</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#eaedf5] text-[#5b73e8] hover:bg-[#f1f4ff] transition-colors">{">"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
