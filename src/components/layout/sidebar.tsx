"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Briefcase,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "My Leaves",
    icon: CalendarDays,
    href: "/leaves",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
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

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-white",
      !mobile && "hidden md:flex w-64 border-r fixed inset-y-0 z-40"
    )}>
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">LMS</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1.5">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <route.icon className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Static snapshot widget */}
      <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-300">Annual Balance</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="w-full bg-slate-700 rounded-full h-2 mr-3">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <span className="text-xs text-white font-medium whitespace-nowrap">14 / 21</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-[#0D1A2C] px-3 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1a2b42] hover:shadow-lg active:scale-[0.98] group"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </div>
  );
}
