import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

const navItems = [
  { href: "/admin", label: "대시보드", emoji: "📊" },
  { href: "/admin/users", label: "회원 관리", emoji: "👤" },
  { href: "/admin/schedules", label: "스케줄 관리", emoji: "📅" },
  { href: "/admin/groups", label: "그룹 관리", emoji: "👥" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800"
        >
          <TwEmoji emoji="🎮" size={22} />
          <span className="text-sm font-bold">Game Scheduler</span>
        </Link>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <TwEmoji emoji={item.emoji} size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-zinc-200 p-3 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <TwEmoji emoji="🏠" size={18} />
            홈으로
          </Link>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
