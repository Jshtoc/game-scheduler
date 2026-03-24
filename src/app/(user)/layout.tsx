import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { MobileNav } from "@/components/ui/MobileNav";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import type { UserRole } from "@/lib/auth";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-56 flex-col bg-dark-card dark:bg-dark md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 border-b border-white/10 px-5 py-4"
        >
          <TwEmoji emoji="🎮" size={22} />
          <span className="text-sm font-bold text-white">Game Scheduler</span>
        </Link>

        <SidebarNav />

        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-accent"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username ?? "프로필"}
                className="h-6 w-6 shrink-0 rounded-full"
              />
            ) : (
              <TwEmoji emoji="👤" size={18} />
            )}
            <span className="truncate">{profile?.username ?? "사용자"}</span>
            <RoleBadge role={(profile?.role as UserRole) ?? "member"} />
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* 모바일 헤더 */}
      <header className="flex items-center justify-between border-b border-card-border bg-dark-card px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TwEmoji emoji="🎮" size={20} />
          <span className="text-sm font-bold text-white">Game Scheduler</span>
        </Link>
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username ?? "프로필"}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <TwEmoji emoji="👤" size={18} />
          )}
          <RoleBadge role={(profile?.role as UserRole) ?? "member"} />
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* 모바일 하단 탭 */}
      <MobileNav />
    </div>
  );
}
