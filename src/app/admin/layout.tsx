import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { AdminSidebarNav } from "@/components/ui/AdminSidebarNav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 flex-col bg-dark-card dark:bg-dark">
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
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
