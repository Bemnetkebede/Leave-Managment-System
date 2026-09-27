"use client";

import React from 'react';
import { CalendarPlus, CheckSquare, RefreshCcw, ArrowRight } from 'lucide-react';

export function WorkflowBreakdown() {
  const steps = [
    {
      icon: CalendarPlus,
      title: "1. Submit Request",
      desc: "Employees select dates, leave type, and submit. System auto-checks for overlaps and holidays."
    },
    {
      icon: CheckSquare,
      title: "2. Manager Approval",
      desc: "Managers receive instant alerts with team calendar context to confidently approve or deny."
    },
    {
      icon: RefreshCcw,
      title: "3. Auto-Sync",
      desc: "Balances update instantly. The approved leave is synced to the team calendar and payroll reports."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connection Line (Hidden on Mobile) */}
        <div className="hidden md:block absolute top-8 left-16 right-16 h-px bg-slate-200 -z-10"></div>
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 relative z-10">
                <Icon className="w-6 h-6 text-[#0f1b2d]" />
              </div>
              <h3 className="text-lg font-bold text-[#0f1b2d] mb-3">{step.title}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="md:hidden mt-6 text-slate-300">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
