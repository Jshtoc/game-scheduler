import { createClient } from "@/lib/supabase/server";

export type UserRole = "master" | "admin" | "member";

export async function getCurrentUserRole(): Promise<{
  userId: string | null;
  role: UserRole;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, role: "member" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    role: (profile?.role as UserRole) ?? "member",
  };
}

export function canAccessAdmin(role: UserRole) {
  return role === "master" || role === "admin";
}

export function canManageRoles(role: UserRole) {
  return role === "master";
}

export function canKickMembers(role: UserRole) {
  return role === "master";
}

export function canEditSchedule(role: UserRole) {
  return role === "master" || role === "admin";
}
