import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import type { UserRole } from "@/lib/auth";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, role")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 flex-col bg-dark-card dark:bg-dark">
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
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
