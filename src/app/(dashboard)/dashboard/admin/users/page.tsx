"use client";

import { UserManagement } from "@/components/admin/UserManagement";
import { useProfile } from "@/hooks/use-profile";
import { redirect } from "next/navigation";

export default function AdminUsersPage() {
  const { profile, loading } = useProfile();

  // Role Protection
  if (!loading && profile && profile.role !== 'admin') {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-6xl mx-auto">
        <UserManagement />
      </div>
    </div>
  );
}
