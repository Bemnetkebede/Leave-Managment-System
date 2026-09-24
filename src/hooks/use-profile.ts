"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Safely extracts a plain string from full_name, which can be a string or an array */
function extractName(fullName: string | string[] | null | undefined): string | null {
  if (!fullName) return null;
  if (Array.isArray(fullName)) return fullName[0] ?? null;
  return fullName;
}

/** Derives a display name from a profile row + auth user email as fallback */
function resolveDisplayName(
  fullName: string | string[] | null | undefined,
  email: string | null | undefined
): string {
  const name = extractName(fullName);
  if (typeof name === "string" && name.trim().length > 0) {
    return name.trim();
  }

  if (typeof email === "string" && email.includes("@")) {
    const localPart = email.split("@")[0];
    return localPart
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return "User";
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("User");
  const [firstName, setFirstName] = useState("User");
  const [joinYear, setJoinYear] = useState<string>("2024");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile from Supabase:", error);
        }

        // Even if profile fetch fails, we have auth user data (email)
        // full_name in DB can be a string OR array — handle both
        const rawName = data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name;
        const fullName = Array.isArray(rawName) ? rawName[0] : rawName;
        const resolved = resolveDisplayName(fullName, user.email);


        // Calculate First Name for banner
        if (typeof fullName === "string" && fullName.trim().length > 0) {
          setFirstName(fullName.trim().split(" ")[0]);
        } else {
          setFirstName(resolved.split(" ")[0]);
        }

        // Calculate join year from created_at
        const createdAt = data?.created_at || user.created_at;
        if (createdAt) {
          setJoinYear(new Date(createdAt).getFullYear().toString());
        }

        // Check for phone number in metadata or user profile
        const phone = user.user_metadata?.phone || user.phone || "";
        setPhoneNumber(phone);

        setProfile(data || null);
        setDisplayName(resolved);


        console.log("Profile Sync Check:", {
          db_full_name: data?.full_name,
          auth_metadata_name: user.user_metadata?.full_name,
          resolved_firstName: firstName,
          joinYear
        });

      } catch (err) {
        console.error("useProfile unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, loading, displayName, firstName, joinYear, phoneNumber };
}
