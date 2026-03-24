import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="🎮" size={48} />
        <h1 className="text-4xl font-bold tracking-tight">Game Scheduler</h1>
      </div>
      <p className="text-lg text-zinc-500">게임 일정을 친구들과 함께 관리하세요</p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          시작하기
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          관리자
        </Link>
      </div>
    </div>
  );
}
