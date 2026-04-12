import React from 'react';
import { cn } from '@/lib/utils';

interface CalendarCardProps {
  className?: string;
}

export function CalendarCard({ className }: CalendarCardProps) {
  // Calendar data for September
  const daysHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const calendarDays = [
    { day: 1, type: 'cross' },
    { day: 2, type: 'cross' },
    { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 },
    { day: 8 }, { day: 9 },
    { day: 10, type: 'circle' },
    { day: 11, type: 'circle' },
    { day: 12, type: 'circle' },
    { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 },
    { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 },
    { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }
  ];

  return (
    <div className={cn("relative group perspective-1000", className)}>
      {/* The "Board" background */}
      <div className="absolute inset-0 bg-[#3D3A36] rounded-xl transform rotate-1 shadow-2xl -z-10 translate-x-2 translate-y-2"></div>
      
      {/* The main calendar paper */}
      <div className="relative bg-[#F8F5F0] rounded-lg shadow-xl p-8 pt-12 min-w-[320px] transform -rotate-1 transition-transform group-hover:rotate-0 duration-500 overflow-hidden">
        {/* Top Clips */}
        <div className="absolute top-4 left-1/4 w-3 h-8 bg-[#1A1A1A] rounded-full shadow-md z-20"></div>
        <div className="absolute top-4 right-1/4 w-3 h-8 bg-[#1A1A1A] rounded-full shadow-md z-20"></div>
        
        {/* Month Header */}
        <div className="text-center mb-10">
          <h2 className="text-[#3D3A36] text-4xl tracking-[0.2em] font-serif uppercase">
            September
          </h2>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {daysHeader.map((day, i) => (
            <span key={i} className="text-[#8B8884] text-sm font-medium tracking-widest">{day}</span>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {calendarDays.map((date, i) => (
            <div key={i} className="relative flex items-center justify-center p-2">
              <span className={cn(
                "relative z-10 text-lg font-medium text-[#3D3A36]",
                (date.day === 1 || date.day === 2) && "text-[#FF6B35]/70"
              )}>
                {date.day}
              </span>
              
              {/* Cross Marker */}
              {date.type === 'cross' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                  <div className="absolute h-[1px] w-6 bg-[#FF6B35] rotate-45"></div>
                  <div className="absolute h-[1px] w-6 bg-[#FF6B35] -rotate-45"></div>
                </div>
              )}

              {/* Circle Marker */}
              {date.type === 'circle' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 border-2 border-[#FF6B35] rounded-full opacity-60"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtle Paper Texture/Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>
      </div>
    </div>
  );
}
