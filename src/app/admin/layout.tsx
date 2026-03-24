import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { AdminSidebarNav } from "@/components/ui/AdminSidebarNav";
import { AdminMobileNav } from "@/components/ui/AdminMobileNav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-56 flex-col bg-dark-card dark:bg-dark md:flex">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b border-white/10 px-5 py-4"
        >
          <TwEmoji emoji="⚙️" size={22} />
          <span className="text-sm font-bold text-white">Admin</span>
        </Link>
        <AdminSidebarNav />
        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/10 hover:text-accent"
          >
            <TwEmoji emoji="🏠" size={18} />
            홈으로
          </Link>
        </div>
      </aside>

      {/* 모바일 헤더 */}
      <header className="flex items-center justify-between border-b border-card-border bg-dark-card px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <TwEmoji emoji="⚙️" size={20} />
          <span className="text-sm font-bold text-white">Admin</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-white/40 transition-colors hover:text-accent"
        >
          사용자 페이지
        </Link>
      </header>

      <main className="flex flex-1 flex-col overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* 모바일 하단 탭 */}
      <AdminMobileNav />
    </div>
  );
}
