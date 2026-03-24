import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ScheduleWithOwner } from "@/lib/types/database";

export default async function SchedulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: mySchedules, error: myError } = await supabase
    .from("schedules")
    .select("*, profiles!schedules_owner_id_fkey(username, avatar_url)")
    .eq("owner_id", user?.id ?? "")
    .order("start_time", { ascending: true });

  console.log("mySchedules:", mySchedules, "error:", myError);

  // 그룹 스케줄 (소속 그룹의 다른 사람 스케줄)
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user?.id ?? "");

  const groupIds = memberships?.map((g) => g.group_id) ?? [];

  let groupSchedules: typeof mySchedules = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("schedules")
      .select("*, profiles!schedules_owner_id_fkey(username, avatar_url)")
      .neq("owner_id", user?.id ?? "")
      .in("group_id", groupIds)
      .order("start_time", { ascending: true });
    groupSchedules = data;
  }

  const allSchedules = [
    ...(mySchedules ?? []),
    ...(groupSchedules ?? []),
  ] as ScheduleWithOwner[];

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">내 스케줄</h1>
        </div>
        <Link
          href="/schedules/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          새 스케줄
        </Link>
      </div>

      {allSchedules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allSchedules.map((schedule) => {
            const isPast = new Date(schedule.start_time) < new Date();
            return (
              <Link
                key={schedule.id}
                href={`/schedules/${schedule.id}`}
                className={`flex flex-col gap-3 rounded-xl border p-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  isPast
                    ? "border-zinc-100 opacity-60 dark:border-zinc-900"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {schedule.game_image && (
                  <img
                    src={schedule.game_image}
                    alt={schedule.game_name}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{schedule.title}</h3>
                  {schedule.max_players && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                      최대 {schedule.max_players}명
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <TwEmoji emoji="🎮" size={14} />
                    <span>{schedule.game_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TwEmoji emoji="👤" size={14} />
                    <span>{schedule.profiles?.username ?? "알 수 없음"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TwEmoji emoji="🕐" size={14} />
                    <span>
                      {new Date(schedule.start_time).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <TwEmoji emoji="📭" size={40} />
          <p className="text-zinc-500">아직 스케줄이 없습니다</p>
          <Link
            href="/schedules/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            첫 스케줄 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
