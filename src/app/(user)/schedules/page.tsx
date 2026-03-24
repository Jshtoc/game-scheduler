import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ScheduleCard } from "@/components/ui/ScheduleCard";
import type { ScheduleCardData } from "@/components/ui/ScheduleCard";

export default async function SchedulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: participations } = await supabase
    .from("schedule_participants")
    .select("schedule_id")
    .eq("user_id", user?.id ?? "")
    .eq("status", "accepted");

  const scheduleIds = participations?.map((p) => p.schedule_id) ?? [];

  let activeSchedules: ScheduleCardData[] = [];
  let pastSchedules: ScheduleCardData[] = [];

  if (scheduleIds.length > 0) {
    const { data } = await supabase
      .from("schedules")
      .select(
        "id, title, game_name, game_image, start_time, max_players, schedule_type, is_ended, profiles!schedules_owner_id_fkey(username, avatar_url), schedule_participants(user_id, status, profiles(username, avatar_url))"
      )
      .in("id", scheduleIds)
      .order("start_time", { ascending: true });

    const now = new Date();
    for (const s of data ?? []) {
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
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">내 스케줄</h1>
        </div>
        <Link
          href="/schedules/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
        >
          새 스케줄
        </Link>
      </div>

      {/* 진행 중 스케줄 */}
      {activeSchedules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeSchedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-card-border py-16">
          <TwEmoji emoji="📭" size={40} />
          <p className="text-muted">참가 중인 스케줄이 없습니다</p>
          <Link
            href="/schedules/board"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
          >
            스케줄 보드 보기
          </Link>
        </div>
      )}

      {/* 종료된 스케줄 */}
      {pastSchedules.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted">
            종료된 스케줄 ({pastSchedules.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastSchedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
