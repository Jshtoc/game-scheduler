import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-dark p-8">
      <div className="flex items-center gap-4">
        <TwEmoji emoji="🎮" size={56} />
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Game Scheduler
        </h1>
      </div>
      <p className="text-lg text-muted">
        게임 일정을 친구들과 함께 관리하세요
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-accent px-8 py-3 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
        >
          시작하기
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-white/20 px-8 py-3 text-sm font-medium text-white transition-colors hover:border-accent hover:text-accent"
        >
          관리자
        </Link>
      </div>
    </div>
  );
}
