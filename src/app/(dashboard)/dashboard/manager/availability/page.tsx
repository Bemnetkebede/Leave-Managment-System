"use client";

import { useMemo } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useTeamRequests, useTeamMembers } from "@/hooks/queries/leaveQueries";
import { redirect } from "next/navigation";
import {
    Users,
    AlertTriangle,
    TrendingDown,
    CheckCircle2,
    CalendarDays,
    ArrowRight,
    Activity,
    Map
} from "lucide-react";
import { startOfToday, addDays, isWithinInterval, format, isAfter, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TeamPulseCalendar } from "@/components/manager/TeamPulseCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamAvailabilityPage() {
    const { profile, loading: profileLoading } = useProfile();
    const { data: teamRequests, isLoading: requestsLoading } = useTeamRequests();
    const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();

    const today = startOfToday();
    const next14Days = useMemo(() => addDays(today, 14), [today]);

    // Role Protection
    if (!profileLoading && profile && profile.role !== 'manager' && profile.role !== 'admin') {
        redirect("/dashboard");
    }

    const analysis = useMemo(() => {
        if (!teamRequests || !teamMembers) return null;

        const approved = teamRequests.filter(r => r.status === 'approved');
        const teamSize = teamMembers.length || 1;

        // 1. Currently On Leave
        const currentlyOnLeave = approved.filter(req => 
            isWithinInterval(today, { 
                start: new Date(req.start_date), 
                end: new Date(req.end_date) 
            })
        ).map(req => ({
            ...req,
            member: teamMembers.find(m => m.id === req.user_id)
        }));

        // 2. Upcoming Leaves (Next 14 Days, starting tomorrow)
        const upcomingLeaves = approved.filter(req => {
            const start = new Date(req.start_date);
            return isAfter(start, today) && isBefore(start, next14Days);
        }).map(req => ({
            ...req,
            member: teamMembers.find(m => m.id === req.user_id)
        }));

        // 3. Capacity
        const capacity = Math.round(((teamSize - currentlyOnLeave.length) / teamSize) * 100);

        // 4. Quick Risk Alerts
        const alerts = [];
        if (capacity < 70) alerts.push({ type: 'critical', msg: "Team capacity below 70% threshold." });
        
        // Check for "Overloaded" days in the next 7 days
        for (let i = 1; i <= 7; i++) {
            const day = addDays(today, i);
            const onLeaveThatDay = approved.filter(req => 
                isWithinInterval(day, { start: new Date(req.start_date), end: new Date(req.end_date) })
            ).length;
            if (onLeaveThatDay / teamSize > 0.4) {
                 alerts.push({ 
                     type: 'warning', 
                     msg: `${format(day, 'EEEE')} (${format(day, 'MMM d')}) is overloaded. ${Math.round((onLeaveThatDay/teamSize)*100)}% off.` 
                 });
            }
        }

        return { currentlyOnLeave, upcomingLeaves, capacity, alerts, teamSize };
    }, [teamRequests, teamMembers, today, next14Days]);

    const loading = profileLoading || requestsLoading || membersLoading;

    if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading availability...</div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* <div className="flex items-center gap-2 mb-1">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Operational Awareness</span>
                    </div> */}
                    <h1 className="text-3xl font-bold tracking-tight text-[#0D1A2C]">Team Availability</h1>
                    {/* <p className="text-slate-500 mt-1 max-w-2xl">
                        Real-time operational status and long-term planning heatmaps. Keep your department running smoothly with data-driven presence tracking.
                    </p> */}
                </div>
            </div>

            <Tabs defaultValue="pulse" className="w-full space-y-6">
                
                {/* ONE ROW HEADER: Capacity | Alerts | Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Column 1: Capacity Card */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(13,26,44,0.15)] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1e3a8a] via-[#0D1A2C] to-[#0D1A2C] text-white overflow-hidden relative flex flex-col justify-center min-h-[220px] rounded-[2rem]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                        <div className="absolute top-5 right-5 z-20">
                            <Badge className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-black shadow-lg shadow-black/10 px-3 py-1 cursor-pointer text-[9px] uppercase tracking-[0.2em] transition-all">
                                Current Team Capacity
                            </Badge>
                        </div>
                        <div className="absolute left-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none">
                            <TrendingDown className="w-64 h-64 text-white" />
                        </div>
                        <CardContent className="p-6 md:p-8 relative z-10 pt-12 flex flex-col">
                            <div className="flex items-end gap-3 drop-shadow-md">
                                <h2 className="text-7xl font-black tracking-tighter leading-none">{analysis?.capacity}<span className="text-3xl text-indigo-300 ml-1 opacity-80">%</span></h2>
                                <p className="mb-2 text-indigo-200 font-bold uppercase tracking-widest text-[9px] leading-tight">Available <br/>for work</p>
                            </div>
                            <div className="mt-8 space-y-3">
                                <Progress value={analysis?.capacity} className="h-1.5 bg-slate-800/50 overflow-hidden backdrop-blur-sm border border-white/5" indicatorClassName="bg-gradient-to-r from-indigo-400 to-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                <p className="text-[10px] font-bold text-slate-400 flex justify-between uppercase tracking-widest px-1">
                                    <span>On Leave: <span className="text-white ml-1.5">{analysis?.currentlyOnLeave.length}</span></span>
                                    <span>Total Size: <span className="text-white ml-1.5">{analysis?.teamSize}</span></span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 2: Alerts */}
                    <div className={cn(
                        "rounded-[2rem] flex flex-col p-5 min-h-[220px] relative overflow-hidden transition-all dropdown-shadow",
                        analysis?.alerts.some(a => a.type === 'critical') 
                            ? "bg-red-50/80 backdrop-blur-3xl border border-red-200 text-red-900 shadow-[0_15px_40px_rgba(220,38,38,0.15)] justify-between" 
                            : "bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group"
                    )}>
                        {analysis?.alerts.some(a => a.type === 'critical') ? (
                            <>
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-red-400" />
                                <div className="flex flex-col gap-4 relative z-10 pl-2">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0 drop-shadow-sm text-red-600" />
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest leading-none drop-shadow-sm text-red-700/80">
                                                Critical Alert
                                            </p>
                                            <p className="text-base mt-2 font-bold leading-snug drop-shadow-sm text-red-950 pr-2">
                                                {analysis.alerts.find(a => a.type === 'critical')?.msg}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors relative z-10">
                                    Resolve Capacity
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4 mt-2">
                                    <p className="text-[10px] font-black tracking-widest text-[#0D1A2C] uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-emerald-500" /> 
                                        Advisories
                                    </p>
                                </div>

                                {analysis?.alerts.length === 0 ? (
                                    <div className="flex-1 rounded-[1.25rem] border border-emerald-100/50 bg-gradient-to-b from-emerald-50/50 to-emerald-50/20 flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-emerald-100">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-emerald-900 font-black text-sm tracking-wide">No Resource Risks</p>
                                        <p className="text-[11px] text-emerald-600/80 font-bold mt-1 max-w-[150px]">Availability is optimal for the current cycle.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 flex flex-col justify-start overflow-y-auto pr-1 custom-scrollbar">
                                        {analysis?.alerts.map((alert, i) => (
                                            <Card key={i} className="border-none bg-amber-400 text-amber-950 shadow-amber-400/20 shadow-lg rounded-[1.25rem] flex-shrink-0 relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1 h-full bg-white/40" />
                                                <CardContent className="p-4 pl-5 flex flex-col gap-3 relative z-10">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-900" />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-amber-900/80">
                                                                Risk Warning
                                                            </p>
                                                            <p className="text-xs mt-1.5 font-bold leading-snug text-amber-950">
                                                                {alert.msg}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Column 3: The Tabs Controls */}
                    <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-[2rem] border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center p-6 min-h-[220px] relative overflow-hidden group border-[#0D1A2C] ">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.02] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <Activity className="w-48 h-48" />
                        </div>
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#0D1A2C] uppercase mb-6 flex items-center gap-2 font-bold ">
                             <TrendingDown className="w-3.5 h-3.5 " /> Dashboard Views
                        </p>
                        <TabsList className="bg-slate-50/50 border border-slate-100 p-2 rounded-[1.5rem] h-auto flex flex-col w-full gap-2 shadow-inner relative z-10">
                            <TabsTrigger value="pulse" className="rounded-xl w-full px-6 py-3.5 font-black uppercase tracking-wider text-[10px] data-[state=active]:border-l-4 data-[state=active]:border-[#0D1A2C] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0D1A2C] flex items-center justify-start pl-6 gap-3 transition-all text-slate-500 hover:bg-white hover:shadow-sm">
                                <Activity className="w-3.5 h-3.5" /> Operational Pulse
                            </TabsTrigger>
                            <TabsTrigger value="heatmap" className="rounded-xl w-full px-6 py-3.5 font-black uppercase tracking-wider text-[10px] data-[state=active]:border-l-4 data-[state=active]:border-[#0D1A2C] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0D1A2C] flex items-center justify-start pl-6 gap-3 transition-all text-slate-500 hover:bg-white hover:shadow-sm">
                                <Map className="w-3.5 h-3.5" /> Planning Heatmap
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* THE REST (AT BOTTOM): The content of the selected tab */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                    <TabsContent value="pulse" className="p-6 md:p-8 animate-in fade-in duration-500 m-0">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                            {/* Currently On Leave Panel */}
                            <div className="space-y-4 flex flex-col h-full">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
                                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                                    Currently On Leave
                                </h3>
                                <div className="space-y-3 flex-1">
                                    {analysis?.currentlyOnLeave.length === 0 && (
                                        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed text-slate-400 text-sm font-medium">
                                            Everyone is currently in the office.
                                        </div>
                                    )}
                                    {analysis?.currentlyOnLeave.map((req, i) => (
                                        <Card key={i} className="border-slate-100 shadow-sm group hover:border-blue-200 transition-colors bg-slate-50/50">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-slate-600 border border-slate-200 shadow-sm">
                                                        {req.member?.full_name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 leading-tight">{req.member?.full_name}</p>
                                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{req.leave_type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Returns On</p>
                                                    <p className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">{format(new Date(req.end_date), 'MMM d, yyyy')}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Timeline Panel */}
                            <div className="space-y-4 flex flex-col h-full">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
                                    <div className="w-2 h-6 bg-[#0D1A2C] rounded-full" />
                                    Upcoming (Next 14 Days)
                                </h3>
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                    {analysis?.upcomingLeaves.length === 0 && (
                                        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed text-slate-400 text-sm font-medium">
                                            No upcoming leaves scheduled.
                                        </div>
                                    )}
                                    {analysis?.upcomingLeaves.map((req, i) => (
                                        <Card key={i} className="border-slate-100 shadow-sm border-l-4 border-l-[#0D1A2C]">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-bold text-slate-800 leading-tight">{req.member?.full_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[9px] py-0 font-bold uppercase tracking-widest text-slate-500">{req.leave_type}</Badge>
                                                            <span className="text-[10px] font-bold text-slate-400">{req.days} Days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 hidden sm:flex">
                                                    <div className="text-xs text-center border-r border-slate-200 pr-3">
                                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">Starts</p>
                                                        <p className="font-black text-slate-700">{format(new Date(req.start_date), 'MMM d')}</p>
                                                    </div>
                                                    <ArrowRight className="w-3 h-3 text-slate-300" />
                                                    <div className="text-xs text-center">
                                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">Ends</p>
                                                        <p className="font-black text-slate-700">{format(new Date(req.end_date), 'MMM d')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="heatmap" className="p-6 md:p-8 animate-in fade-in duration-500 m-0">
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2 text-xl">30-Day Presence Heatmap</h3>
                                <p className="text-sm font-medium text-slate-500">The deeper the color, the higher the leave concentration. Use this to find safe windows for team events or large releases.</p>
                            </div>
                            <TeamPulseCalendar />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
