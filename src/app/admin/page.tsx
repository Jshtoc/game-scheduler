import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

const stats = [
  { label: "전체 회원", value: "0", emoji: "👤" },
  { label: "활성 스케줄", value: "0", emoji: "📅" },
  { label: "전체 그룹", value: "0", emoji: "👥" },
];

const menuItems = [
  {
    emoji: "👤",
    title: "회원 관리",
    description: "회원 목록 조회, 정보 수정, 계정 관리",
    href: "/admin/users",
  },
  {
    emoji: "📅",
    title: "스케줄 관리",
    description: "게임 스케줄 조회, 생성, 수정, 삭제",
    href: "/admin/schedules",
  },
  {
    emoji: "👥",
    title: "그룹 관리",
    description: "그룹 목록 조회, 멤버 관리",
    href: "/admin/groups",
  },
];

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="⚙️" size={36} />
          <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          홈으로
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <TwEmoji emoji={stat.emoji} size={28} />
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">관리 메뉴</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <TwEmoji emoji={item.emoji} size={32} />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
