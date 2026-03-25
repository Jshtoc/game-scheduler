"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TwEmoji from "@/components/ui/TwEmoji";

const navItems = [
  { href: "/dashboard", label: "사용자", emoji: "🏠" },
  { href: "/admin", label: "대시보드", emoji: "📊", exact: true },
  { href: "/admin/users", label: "회원", emoji: "👤" },
  { href: "/admin/schedules", label: "스케줄", emoji: "📅" },
  { href: "/admin/groups", label: "그룹", emoji: "👥" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-dark-card md:hidden">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${
              active ? "text-accent" : "text-white/40"
            }`}
          >
            <TwEmoji emoji={item.emoji} size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
