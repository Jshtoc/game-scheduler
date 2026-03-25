import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "master" | "admin" | "member";

// 프로필 생성 시도한 유저 캐시 (서버 요청 단위)
const checkedUsers = new Set<string>();

/** 로그인 필수 페이지에서 호출. 미로그인 시 /login으로 리다이렉트 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 프로필 자동 생성 (첫 요청만)
  if (!checkedUsers.has(user.id)) {
    checkedUsers.add(user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        discord_id:
          user.user_metadata?.provider_id ??
          user.user_metadata?.sub ??
          user.id,
        username:
          user.user_metadata?.custom_claims?.global_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          "User",
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: "member",
        noshow_count: 0,
        late_count: 0,
        warning_count: 0,
      }, { onConflict: "id" });
    }
  }

  return user;
}

/** 관리자 페이지에서 호출. 권한 없으면 /dashboard로 리다이렉트 */
export async function requireAdmin() {
  const user = await requireAuth();
  const { role } = await getCurrentUserRole();

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
