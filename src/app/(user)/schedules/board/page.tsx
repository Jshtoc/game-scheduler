import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScheduleGrid } from "@/components/ui/ScheduleGrid";
import { ScheduleCard } from "@/components/ui/ScheduleCard";
import type { ScheduleCardData } from "@/components/ui/ScheduleCard";

export default async function ScheduleBoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 지난 단발성 스케줄만 자동 삭제 (정기게임은 유지)
  await supabase
    .from("schedules")
    .delete()
    .eq("schedule_type", "once")
    .lt("start_time", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: schedules } = await supabase
    .from("schedules")
    .select(
      "id, title, game_name, game_image, start_time, max_players, schedule_type, is_ended, recurring_days, recurring_time, profiles!schedules_owner_id_fkey(username, avatar_url), schedule_participants(user_id, status, profiles(username, avatar_url))"
    )
    .order("start_time", { ascending: true });

  const now = new Date();
  const activeSchedules: ScheduleCardData[] = [];
  const pastSchedules: ScheduleCardData[] = [];

  for (const s of schedules ?? []) {
    const isPast =
      s.is_ended || (s.schedule_type === "once" && new Date(s.start_time) < now);
    const card: ScheduleCardData = {
      id: s.id,
      title: s.title,
      game_name: s.game_name,
      game_image: s.game_image,
      start_time: s.start_time,
      max_players: s.max_players,
      schedule_type: s.schedule_type,
      is_ended: s.is_ended ?? false,
      recurring_days: (s.recurring_days as number[] | null) ?? null,
      recurring_time: (s.recurring_time as string | null) ?? null,
      owner: s.profiles as unknown as ScheduleCardData["owner"],
      participants: (
        s.schedule_participants as unknown as {
          user_id: string;
          status: string;
          profiles: { username: string; avatar_url: string | null } | null;
        }[]
      )
        .filter((p) => p.status === "accepted")
        .map((p) => ({ user_id: p.user_id, profiles: p.profiles })),
      isPast,
    };
    if (isPast) {
      pastSchedules.push(card);
    } else {
      activeSchedules.push(card);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📋" size={28} />
          <h1 className="text-xl font-bold">전체 스케줄 보드</h1>
        </div>
        <Link
          href="/schedules"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          내 스케줄
        </Link>
      </div>

      {/* 진행 중 스케줄 */}
      {activeSchedules.length > 0 ? (
        <ScheduleGrid schedules={activeSchedules} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-card-border py-16">
          <TwEmoji emoji="📭" size={40} />
          <p className="text-muted">등록된 스케줄이 없습니다</p>
        </div>
      )}

      {/* 종료된 스케줄 */}
      {pastSchedules.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted">
            종료된 스케줄 ({pastSchedules.length})
          </h2>
          <ScheduleGrid schedules={pastSchedules} />
        </div>
      )}
    </div>
  );
}
