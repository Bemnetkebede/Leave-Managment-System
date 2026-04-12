"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Lock,
  Palette,
  Camera,
  Mail,
  Smartphone,
  ShieldCheck,
  Languages,
  Clock,
  Check,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

// Custom Toggle Switch
const Toggle = ({
  active,
  onToggle,
  label,
  description,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-center justify-between py-4 group">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner",
        active ? "bg-[#0D1A2C]" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300",
          active ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </div>
);

export default function SettingsPage() {
  const { profile, displayName, firstName, joinYear, phoneNumber, loading } = useProfile();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "account" | "preferences">("profile");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [leaveAlert, setLeaveAlert] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "auto">("light");

  const tabs = [
    { id: "profile", label: "Profile", icon: User, desc: "Personal info & avatar" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & reports" },
    { id: "account", label: "Security", icon: Lock, desc: "Password & access" },
    { id: "preferences", label: "Preferences", icon: Palette, desc: "Theme & language" },
  ];

  const themes = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
      preview: (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <div className="h-2 bg-white border-b border-slate-100 flex items-center px-1.5 gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="flex h-[calc(100%-8px)]">
            <div className="w-5 bg-slate-100 h-full" />
            <div className="flex-1 bg-white p-1 space-y-1">
              <div className="h-1 bg-slate-200 rounded w-3/4" />
              <div className="h-1 bg-slate-100 rounded w-1/2" />
              <div className="h-2 bg-indigo-100 rounded mt-1" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      preview: (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-sm">
          <div className="h-2 bg-slate-900 border-b border-slate-800 flex items-center px-1.5 gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <div className="w-1 h-1 rounded-full bg-slate-600" />
          </div>
          <div className="flex h-[calc(100%-8px)]">
            <div className="w-5 bg-[#0D1A2C] h-full" />
            <div className="flex-1 bg-slate-900 p-1 space-y-1">
              <div className="h-1 bg-slate-700 rounded w-3/4" />
              <div className="h-1 bg-slate-800 rounded w-1/2" />
              <div className="h-2 bg-indigo-900/60 rounded mt-1" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "auto",
      label: "System",
      icon: Monitor,
      preview: (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <div className="h-2 border-b flex items-center px-1.5 gap-1" style={{ background: "linear-gradient(to right, white 50%, rgb(15,23,42) 50%)" }}>
            <div className="w-1 h-1 rounded-full bg-slate-400" />
            <div className="w-1 h-1 rounded-full bg-slate-400" />
          </div>
          <div className="flex h-[calc(100%-8px)] bg-gradient-to-r from-slate-50 to-slate-900">
            <div className="w-5 bg-gradient-to-b from-slate-100 to-slate-800 h-full opacity-80" />
            <div className="flex-1 p-1 space-y-1">
              <div className="h-1 bg-white/30 rounded w-3/4" />
              <div className="h-1 bg-white/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-10">
      {/* Page Header */}
      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#0D1A2C]">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your profile, security, and notification preferences.</p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tab Navigation */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 text-left transition-all group border-b border-slate-50 last:border-0",
                    isActive
                      ? "bg-[#0D1A2C] text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <div className={cn("p-2 rounded-xl transition-all", isActive ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-200")}>
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700")} />
                  </div>
                  <div className="text-left">
                    <p className={cn("text-sm font-semibold leading-none mb-0.5", isActive ? "text-white" : "text-slate-700")}>{tab.label}</p>
                    <p className={cn("text-xs leading-none", isActive ? "text-white/60" : "text-slate-400")}>{tab.desc}</p>
                  </div>
                  {isActive && <div className="ml-auto w-1.5 h-6 bg-white/30 rounded-full" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-9">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className={cn("space-y-6 transition-opacity duration-300", loading ? "opacity-50" : "opacity-100")}>
              {/* Profile Banner Card */}
              <div className="bg-gradient-to-br from-[#0D1A2C] to-slate-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-400/30 blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-white/10 text-white text-2xl font-bold backdrop-blur-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-indigo-500 text-white rounded-full shadow-lg border-2 border-white/30 hover:bg-indigo-400 transition-all">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold">{profile?.full_name || firstName}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {profile?.role?.toUpperCase() || "EMPLOYEE"} • {profile?.user_dpt || "GENERAL"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">Active Employee</span>
                      <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-medium rounded-full backdrop-blur-sm">Since {joinYear}</span>
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-xs font-medium rounded-full backdrop-blur-sm">14 days balance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Personal Information</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Update your name, email, and contact details.</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={profile?.full_name || ""} 
                        placeholder={loading ? "Loading..." : displayName}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-slate-800 font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                        <Input 
                          id="email" 
                          defaultValue={profile?.email || ""} 
                          className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-slate-800 font-medium" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                        <Input 
                          id="phone" 
                          defaultValue={phoneNumber} 
                          placeholder="+251 9XX XXX XXX"
                          className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-slate-800 font-medium" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="bg-[#0D1A2C] hover:bg-slate-700 rounded-xl px-8 h-12 font-semibold shadow-lg shadow-slate-900/10 transition-all">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Notification Channels</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Control how you receive updates from the system.</p>
                </div>
                <div className="px-8 divide-y divide-slate-50">
                  <Toggle label="Email Notifications" description="Receive updates via your registered email address." active={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
                  <Toggle label="Push Notifications" description="Browser alerts for real-time status changes." active={pushNotif} onToggle={() => setPushNotif(!pushNotif)} />
                  <Toggle label="Weekly Leave Reports" description="A summary email every Monday with your leave overview." active={weeklyReport} onToggle={() => setWeeklyReport(!weeklyReport)} />
                  <Toggle label="Leave Approval Alerts" description="Instant alert when a request is approved or rejected." active={leaveAlert} onToggle={() => setLeaveAlert(!leaveAlert)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Status Alerts</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">Get instantly notified every time your leave request changes status.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-amber-500 rounded-xl shrink-0">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Holiday Reminders</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">Be reminded 24 hours before any public holiday on the company calendar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SECURITY */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-[#0D1A2C] rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Password Management</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Update your credentials to keep your account secure.</p>
                  </div>
                </div>
                <div className="p-8 space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Password</Label>
                    <Input id="currentPass" type="password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPass" className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</Label>
                    <Input id="newPass" type="password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</Label>
                    <Input id="confirmPass" type="password" placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-800" />
                  </div>
                  <Button className="bg-[#0D1A2C] hover:bg-slate-700 rounded-xl px-8 h-12 font-semibold w-full shadow-lg shadow-slate-900/10">
                    Update Password
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-bold text-red-800">Danger Zone</h3>
                </div>
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">Deactivate Account</h4>
                      <p className="text-sm text-slate-500 mt-1">This is permanent. All historical leave records will be purged.</p>
                    </div>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl shrink-0 font-semibold">
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Theme Selector */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Appearance</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Choose how the LMS looks on your device.</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-3 gap-4">
                    {themes.map((theme) => {
                      const Icon = theme.icon;
                      const isSelected = selectedTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id as any)}
                          className={cn(
                            "relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all duration-200 group",
                            isSelected
                              ? "border-[#0D1A2C] bg-[#0D1A2C]/5 shadow-md"
                              : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-[#0D1A2C] rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {theme.preview}
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", isSelected ? "text-[#0D1A2C]" : "text-slate-400")} />
                            <span className={cn("text-sm font-semibold", isSelected ? "text-[#0D1A2C]" : "text-slate-500")}>{theme.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Language and Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Languages className="h-4 w-4 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Language</h3>
                  </div>
                  <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🇺🇸</span>
                      <span className="text-sm font-semibold text-slate-700">English (US)</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 rounded-lg">Change</Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Timezone</h3>
                  </div>
                  <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🇪🇹</span>
                      <span className="text-sm font-semibold text-slate-700">East Africa Time (EAT)</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 rounded-lg">Update</Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 pl-1">UTC +3:00 — Addis Ababa</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
