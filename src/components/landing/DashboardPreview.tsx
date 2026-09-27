"use client";

import React from 'react';
import { Calendar, FileText, CheckCircle2, Clock, CalendarDays } from 'lucide-react';

export function DashboardPreview() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden text-left flex flex-col">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#f7f8fb]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0f1b2d] flex items-center justify-center font-bold text-sm text-white">
            JS
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f1b2d]">John Smith</p>
            <p className="text-xs text-slate-500 font-medium">Engineering Department</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
          Active
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Balances & Next Leave */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Balance Card */}
          <div className="p-5 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Leave Balance</h3>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-xl font-black text-[#0f1b2d]">Annual Leave</h4>
                <p className="text-sm font-medium text-slate-500 mt-1">12 days remaining out of 21</p>
              </div>
              <span className="text-3xl font-black text-[#685cf5]">12</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4 overflow-hidden">
              <div className="bg-[#685cf5] h-full rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>

          {/* Next Leave */}
          <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Upcoming Leave</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-[#685cf5]">
                <CalendarDays className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-[#0f1b2d]">Summer Vacation</h4>
                <div className="flex gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Starts in 14 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Quick Actions</h3>
          
          <button className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-[#0f1b2d] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f1b2d]">Request Leave</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Submit new time-off</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#0f1b2d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f1b2d]">My History</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">View past requests</p>
            </div>
          </button>

          <div className="mt-auto p-4 bg-[#f7f8fb] rounded-xl border border-slate-100">
             <p className="text-xs font-bold text-[#0f1b2d] mb-1">Company Holiday</p>
             <p className="text-xs font-medium text-slate-500">Labor Day is coming up on Sept 7th.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
