import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "master" | "admin" | "member";

/** 로그인 필수 페이지에서 호출. 미로그인 시 /login으로 리다이렉트 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return user;
}

/** 프로필이 없으면 자동 생성 (레이아웃에서 1번만 호출) */
export async function ensureProfile(userId: string, metadata: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, role")
    .eq("id", userId)
    .single();

  if (profile) return profile;

  const customClaims = metadata?.custom_claims as Record<string, string> | undefined;

  await supabase.from("profiles").upsert({
    id: userId,
    discord_id:
      (metadata?.provider_id as string) ??
      (metadata?.sub as string) ??
      userId,
    username:
      customClaims?.global_name ??
      (metadata?.full_name as string) ??
      (metadata?.name as string) ??
      "User",
    avatar_url: (metadata?.avatar_url as string) ?? null,
    role: "member",
    noshow_count: 0,
    late_count: 0,
    warning_count: 0,
  }, { onConflict: "id" });

  const { data: newProfile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, role")
    .eq("id", userId)
    .single();

  return newProfile;
}

/** 관리자 페이지에서 호출. 권한 없으면 /dashboard로 리다이렉트 */
export async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) ?? "member";
  if (!canAccessAdmin(role)) redirect("/dashboard");
  return { user, role };
}

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
