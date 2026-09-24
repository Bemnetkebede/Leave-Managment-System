import { useMemo } from "react";
import { format } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

interface AnalyticsChartsProps {
  requests: any[];
}

export function AnalyticsCharts({ requests }: AnalyticsChartsProps) {
  const today = new Date();

  // 1. Process Data for Area Chart (Requests per month for last 6 months)
  const areaData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      return {
        name: format(d, 'MMM'),
        month: d.getMonth(),
        year: d.getFullYear(),
        volume: 0
      };
    });

    requests.forEach(req => {
      const reqDate = new Date(req.created_at);
      const monthIndex = months.findIndex(m => m.month === reqDate.getMonth() && m.year === reqDate.getFullYear());
      if (monthIndex > -1) {
        months[monthIndex].volume++;
      }
    });

    return months;
  }, [requests]);

  // 2. Process Data for Donut Chart (Approval Rate Visualization)
  const distributionData = useMemo(() => {
    const approved = requests.filter(r => r.status === 'approved').length;
    const others = requests.length - approved;
    
    return [
      { name: 'Approved', value: approved },
      { name: 'Other', value: others },
    ].filter(t => t.value > 0);
  }, [requests]);

  // 3. Process Data for Bar Chart (Status Overview - Percentages)
  const barData = useMemo(() => {
    const total = requests.length || 1;
    const approved = requests.filter(r => r.status === 'approved').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return [
      { name: 'Approved', percentage: Math.round((approved / total) * 100) },
      { name: 'Pending', percentage: Math.round((pending / total) * 100) },
      { name: 'Rejected', percentage: Math.round((rejected / total) * 100) },
    ];
  }, [requests]);

  const totalUtilization = useMemo(() => {
    const approved = requests.filter(r => r.status === 'approved').length;
    return requests.length > 0 ? Math.round((approved / requests.length) * 100) : 0;
  }, [requests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart: Visitors & Buyers / Leave Volume */}
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-bold text-slate-500 flex justify-between">
            Operational Trend
            <span className="text-indigo-600 font-bold uppercase text-[10px]">6-Month Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donut Chart: Conversion / Leave Distribution */}
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-bold text-slate-500">Approval Rate</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[300px] flex items-center justify-center relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-2">
            <span className="text-3xl font-black text-slate-800">{totalUtilization}%</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Approval Rate</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart: Profit Performance / Request Success */}
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-500">Department Status Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: any) => [`${value}%`, 'Percentage']}
              />
              <Bar 
                dataKey="percentage" 
                fill="#0ea5e9" 
                radius={[10, 10, 0, 0]} 
                barSize={40}
                unit="%"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
