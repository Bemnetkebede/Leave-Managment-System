"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useNotifications, useUnreadCount, useMarkAllRead } from "@/hooks/queries/notificationQueries";
import { formatDistanceToNow } from "date-fns";

/** Safely extracts up to 2 initials from any value */
const getInitials = (name: unknown): string => {
  const str = typeof name === "string" && name.trim().length > 0 ? name.trim() : "U";
  return str
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";
};

export function Header() {
  const { profile, displayName } = useProfile();
  const { data: notifications } = useNotifications();
  const unreadCount = useUnreadCount();
  const { mutate: markAllRead } = useMarkAllRead();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  // Extract first name for the greeting
  const firstName = typeof displayName === "string"
    ? displayName.split(" ")[0]
    : "there";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">

      {/* Left: Mobile hamburger + Welcome greeting */}
      <div className="flex items-center gap-4">
        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-none">
            <Sidebar mobile />
          </SheetContent>
        </Sheet>

        {/* Welcome text — hidden on very small screens */}
        <div className="hidden sm:block">
          <span className="text-[#0D1A2C] font-bold text-[17px] tracking-tight">
            Welcome {firstName} !
          </span>
        </div>
      </div>

      {/* Right: Search, Notification + Profile */}
      <div className="flex items-center gap-2 ml-auto">
        
        {/* Search bar - Moved closer to the tools */}
        <div className="relative mr-2 hidden md:block w-64">
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-9 pl-4 pr-10 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:bg-white transition-all"
          />
          {searchValue ? (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          )}
        </div>

        {/* Notification Bell with Dropdown */}
        <DropdownMenu onOpenChange={(open) => open && unreadCount > 0 && markAllRead()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {/* Real Unread dot */}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto" align="end">
            <DropdownMenuLabel className="font-bold border-b pb-2 mb-1">
              Notifications
            </DropdownMenuLabel>
            {notifications?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications?.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex justify-between w-full">
                    <span className={cn("text-xs font-bold", !notif.read ? "text-indigo-600" : "text-slate-700")}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notif.message}
                  </p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1 border border-slate-200 hover:bg-slate-100 p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-sm">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-slate-500">
                  {profile?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Profile Setup</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer font-medium hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
