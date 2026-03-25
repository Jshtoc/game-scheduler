"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TwEmoji from "@/components/ui/TwEmoji";

const navItems = [
  { href: "/admin", label: "대시보드", emoji: "📊", exact: true },
  { href: "/admin/users", label: "회원 관리", emoji: "👤" },
  { href: "/admin/schedules", label: "스케줄 관리", emoji: "📅" },
  { href: "/admin/groups", label: "그룹 관리", emoji: "👥" },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-accent"
      >
        <TwEmoji emoji="🏠" size={18} />
        사용자 페이지
      </Link>
      <div className="my-1 border-t border-white/10" />
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-accent font-bold text-dark"
                : "text-white/60 hover:bg-white/10 hover:text-accent"
            }`}
          >
            <TwEmoji emoji={item.emoji} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
