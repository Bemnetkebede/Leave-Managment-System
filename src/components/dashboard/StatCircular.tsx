import React from 'react';
import { cn } from '@/lib/utils';

interface StatCircularProps {
  value: number;
  max: number;
  title: string;
  subtitle: string;
  color?: string; // hex color or tailwind text class
  className?: string;
  icon?: React.ReactNode;
}

export function StatCircular({ 
  value, 
  max, 
  title, 
  subtitle, 
  color = "#4f46e5", // default indigo-600
  className,
  icon
}: StatCircularProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  // Ensure we don't divide by zero and handle values over max
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center justify-center p-4 pt-5 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md", className)}>
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-800" style={{ color: color }}>{value}</span>
        </div>
      </div>
      <div className="pt-3 text-center w-full">
        <h3 className="font-semibold text-slate-700 flex justify-center items-center gap-1.5 text-sm">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 min-h-[16px]">{subtitle}</p>
      </div>
    </div>
  );
}
