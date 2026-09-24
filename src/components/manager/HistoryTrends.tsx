"use client";

import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns";

interface HistoryTrendsProps {
  decisions: any[];
}

export function HistoryTrends({ decisions }: HistoryTrendsProps) {
  const chartData = useMemo(() => {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map(month => {
      const monthStr = format(month, 'MMM');
      const monthRequests = decisions.filter(req => {
        const reqDate = new Date(req.start_date);
        return reqDate >= startOfMonth(month) && reqDate <= endOfMonth(month) && req.status === 'approved';
      });

      return {
        name: monthStr,
        days: monthRequests.reduce((acc, curr) => acc + curr.days, 0)
      };
    });
  }, [decisions]);

  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-[#0D1A2C] text-white overflow-hidden h-full">
      <CardHeader className="p-8 pb-0">
        <CardTitle className="text-xl font-bold">Annual Presence Trend</CardTitle>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total approved days per month</p>
      </CardHeader>
      <CardContent className="p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a0aec0', fontSize: 10, fontWeight: 'bold' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a0aec0', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Tooltip 
              cursor={{ fill: '#2d3748', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#1a202c', border: 'none', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
            />
            <Bar dataKey="days" radius={[4, 4, 0, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.days > 20 ? '#ef4444' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
