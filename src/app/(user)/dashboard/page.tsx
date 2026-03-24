import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id ?? "")
    .single();

  const { count: scheduleCount } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user?.id ?? "");

  const { count: groupCount } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "");

  const { count: friendCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`);

  const { data: upcomingSchedules } = await supabase
    .from("schedules")
    .select("id, title, game_name, start_time")
    .or(`owner_id.eq.${user?.id},group_id.in.(select group_id from group_members where user_id = '${user?.id}')`)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  const stats = [
    { label: "내 스케줄", value: scheduleCount ?? 0, emoji: "📅" },
    { label: "소속 그룹", value: groupCount ?? 0, emoji: "👥" },
    { label: "친구", value: friendCount ?? 0, emoji: "🤝" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          안녕하세요, {profile?.username ?? "사용자"}님
        </h1>
        <p className="mt-1 text-zinc-500">오늘의 게임 일정을 확인하세요</p>
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">다가오는 스케줄</h2>
          <Link
            href="/schedules"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
          >
            전체 보기
          </Link>
        </div>

        {upcomingSchedules && upcomingSchedules.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcomingSchedules.map((schedule) => (
              <Link
                key={schedule.id}
                href={`/schedules/${schedule.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <TwEmoji emoji="🎮" size={20} />
                  <div>
                    <p className="font-medium">{schedule.title}</p>
                    <p className="text-sm text-zinc-500">{schedule.game_name}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-500">
                  {new Date(schedule.start_time).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-12 dark:border-zinc-700">
            <TwEmoji emoji="📭" size={32} />
            <p className="text-sm text-zinc-500">다가오는 스케줄이 없습니다</p>
            <Link
              href="/schedules"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              스케줄 만들기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
