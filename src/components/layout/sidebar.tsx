"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Settings,
  Briefcase,
  LogOut,
  ClipboardList
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLeaveBalance } from "@/hooks/queries/leaveQueries";
import { useRouter } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Requests",
    icon: ClipboardList,
    href: "/request",
  },
  {
    label: "History",
    icon: History,
    href: "/history",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },

];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: balances, isLoading } = useLeaveBalance();
  
  // No frontend calculations — read directly from DB columns
  const firstBalance = balances?.[0] as any;
  const used = firstBalance?.used_days ?? 0;
  const total = firstBalance?.total_days ?? 21;
  const available = firstBalance?.Balance ?? firstBalance?.balance ?? total;
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#0D1A2C] text-white",
      !mobile && "hidden md:flex w-64 border-r fixed inset-y-0 z-40"
    )}>
      <div className="flex h-16 items-center px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">LMS</span>
        </Link>
      </div>


<div className="flex-1 overflow-y-auto py-6 pl-4 pr-0"> 
  <nav className="space-y-1">
    {routes.map((route) => {
      const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
      
      return (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 py-3 px-3 text-sm font-medium transition-all group relative",
            isActive
              ? "bg-white text-black rounded-l-full rounded-r-none" 
              : "text-slate-300 hover:bg-slate-800 hover:text-white rounded-full pr-2" 
          )}
        >
          {isActive && (
            <div className="absolute -top-[20px] right-0 h-[20px] w-[20px] bg-white">
              <div className="h-full w-full rounded-br-[20px] bg-[#0D1A2C]" /> 
            </div>
          )}

          <route.icon className={cn(
            "h-5 w-5 transition-colors z-10", 
            isActive ? "text-black" : "text-slate-400 group-hover:text-white"
          )} />
          
          <span className="z-10">{route.label}</span>

          {/* Bottom Inverted Curve */}
          {isActive && (
            <div className="absolute -bottom-[20px] right-0 h-[20px] w-[20px] bg-white">
              <div className="h-full w-full rounded-tr-[20px] bg-[#0D1A2C]" />
              {/* ^ CHANGE bg-[#020617] to your Sidebar color */}
            </div>
          )}
        </Link>
      );
    })}
  </nav>
</div>
      
      {/* Static snapshot widget */}
      <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Annual Balance</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-white font-bold whitespace-nowrap tabular-nums">
              {available} / {total} days
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-slate-800/50 px-3 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] group border border-slate-700/50"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </div>
  );
}
