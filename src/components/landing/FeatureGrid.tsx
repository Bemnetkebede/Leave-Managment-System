"use client";

import React, { useState } from 'react';
import { Calendar, CheckSquare, LineChart, MessageSquare, Layers, FileCode2, Video, Send, MoreHorizontal, UserCheck, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'requests', label: 'Leave Requests', icon: Calendar },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
  { id: 'team', label: 'Team Calendar', icon: UserCheck },
  { id: 'analytics', label: 'Reports', icon: LineChart },
];

export function FeatureGrid() {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                isActive 
                  ? "bg-[#0f1b2d] text-white border-[#0f1b2d] shadow-md" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-2 md:p-8 min-h-[400px] flex items-center justify-center">
        
        {activeTab === 'requests' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-[#0f1b2d]">Frictionless Time-Off Requests</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Employees can submit leave requests in seconds. The system automatically checks available balances, overlaps, and company holidays before submission, ensuring compliance without the manual back-and-forth.
              </p>
            </div>
            <div className="flex-1 w-full border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium flex-1">Annual Leave</span>
                <span className="text-xs font-bold text-[#685cf5]">12 Days Left</span>
              </div>
              <div className="flex items-center gap-3 p-3 ml-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 flex-1">Aug 12 - Aug 15 (4 days)</span>
              </div>
              <div className="flex items-center gap-3 p-3 ml-6 bg-white border-l-2 border-l-[#685cf5] border border-slate-200 rounded-lg shadow-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 flex-1">Note: Family vacation</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-[#0f1b2d]">One-Click Manager Approvals</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Managers receive instant notifications with full context. See team overlapping absences instantly and approve or deny requests directly from the dashboard without navigating complex menus.
              </p>
            </div>
            <div className="flex-1 w-full border border-slate-200 rounded-xl p-5 bg-slate-50">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                 <span className="font-semibold text-sm">Pending Actions</span>
                 <span className="text-xs bg-[#0f1b2d] text-white px-2 py-1 rounded">2 Requests</span>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div>
                      <p className="text-sm font-medium">Sick Leave</p>
                      <p className="text-xs text-slate-500 mt-0.5">Requested by Jane Doe</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs font-semibold px-3 py-1.5 bg-[#685cf5] text-white rounded-md">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-[#0f1b2d]">Interactive Team Pulse Calendar</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Visualize who is out of the office and when. Our responsive calendar highlights high-absence periods and prevents understaffing before it happens.
              </p>
            </div>
            <div className="flex-1 w-full border border-slate-200 rounded-xl p-5 bg-slate-50">
               <div className="w-full bg-white p-4 rounded-lg border border-slate-200">
                 <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
                   <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                 </div>
                 <div className="grid grid-cols-7 gap-2">
                   {Array.from({length: 14}).map((_, i) => (
                     <div key={i} className={cn(
                       "h-8 rounded flex items-center justify-center text-xs",
                       i === 5 || i === 6 ? "bg-red-50 text-red-600 font-bold" : "bg-slate-50 text-slate-600"
                     )}>
                       {i + 1}
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-[#0f1b2d]">Comprehensive Absence Reports</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Generate instant reports on leave balances, absence trends, and departmental time-off. Export data to payroll effortlessly with complete accuracy.
              </p>
            </div>
            <div className="flex-1 w-full border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col h-64">
               <div className="flex gap-4 mb-6">
                 <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <p className="text-xs text-slate-500 mb-1">Total Leave Taken</p>
                   <p className="text-2xl font-bold text-[#0f1b2d]">248 Days</p>
                 </div>
                 <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <p className="text-xs text-slate-500 mb-1">Pending Approval</p>
                   <p className="text-2xl font-bold text-[#0f1b2d]">12</p>
                 </div>
               </div>
               {/* Mock Chart */}
               <div className="w-full flex-1 flex items-end justify-between gap-2 px-2">
                 {[40, 65, 45, 80, 55, 90, 70, 100].map((h, i) => (
                   <div key={i} className="w-full bg-[#685cf5] rounded-t-sm transition-all" style={{ height: `${h}%`, opacity: (h/100) }}></div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
