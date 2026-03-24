import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar } from "@/components/ui/Calendar";

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

  // 내가 참가 중인 스케줄 ID
  const { data: participations } = await supabase
    .from("schedule_participants")
    .select("schedule_id")
    .eq("user_id", user?.id ?? "")
    .eq("status", "accepted");

  const scheduleIds = participations?.map((p) => p.schedule_id) ?? [];
  const scheduleCount = scheduleIds.length;

  // 내 스케줄 전체 (달력용)
  let allSchedules: {
    id: string;
    title: string;
    game_name: string;
    game_image: string | null;
    start_time: string;
    schedule_type: string;
    recurring_days: number[] | null;
  }[] = [];

  // 다가오는 스케줄 (상단 표시용)
  let upcomingSchedules: {
    id: string;
    title: string;
    game_name: string;
    start_time: string;
  }[] = [];

  if (scheduleIds.length > 0) {
    const { data } = await supabase
      .from("schedules")
      .select("id, title, game_name, game_image, start_time, schedule_type, recurring_days")
      .in("id", scheduleIds);
    allSchedules = data ?? [];

    const { data: upcoming } = await supabase
      .from("schedules")
      .select("id, title, game_name, start_time")
      .in("id", scheduleIds)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5);
    upcomingSchedules = upcoming ?? [];
  }

  const nextSchedule = upcomingSchedules[0];
  const moreCount = upcomingSchedules.length - 1;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          안녕하세요, {profile?.username ?? "사용자"}님
        </h1>
        <p className="mt-1 text-muted">오늘의 게임 일정을 확인하세요</p>
      </div>

      {/* 상단 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 좌측: 내 스케줄 수 */}
        <div className="flex items-center gap-4 rounded-2xl border border-card-border bg-card p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-dark-card">
            <TwEmoji emoji="📅" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{scheduleCount}</p>
            <p className="text-sm text-muted">참가 중인 스케줄</p>
          </div>
        </div>

        {/* 우측: 가장 빨리 다가오는 스케줄 */}
        <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card p-5">
          {nextSchedule ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-dark-card">
                  <TwEmoji emoji="🔜" size={24} />
                </div>
                <div>
                  <Link
                    href={`/schedules/${nextSchedule.id}`}
                    className="font-semibold transition-colors hover:text-accent"
                  >
                    {nextSchedule.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {new Date(nextSchedule.start_time).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {moreCount > 0 && (
                <Link
                  href="/schedules"
                  className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-dark transition-colors hover:bg-accent-hover"
                >
                  +{moreCount}
                </Link>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-dark-card">
                <TwEmoji emoji="📭" size={24} />
              </div>
              <div>
                <p className="font-medium text-muted">다가오는 스케줄 없음</p>
                <Link
                  href="/schedules/board"
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  스케줄 보드 보기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 달력 */}
      <Calendar schedules={allSchedules} />
    </div>
  );
}
