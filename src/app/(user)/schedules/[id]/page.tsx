import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { AddToCalendarButton } from "@/components/ui/AddToCalendarButton";
import { createClient } from "@/lib/supabase/server";
import { deleteSchedule, endSchedule, joinSchedule, leaveSchedule } from "@/lib/actions/schedule";
import { getCurrentUserRole, canEditSchedule } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { role: userRole } = await getCurrentUserRole();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*, profiles!schedules_owner_id_fkey(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!schedule) notFound();

  const { data: participants } = await supabase
    .from("schedule_participants")
    .select("*, profiles(username, avatar_url)")
    .eq("schedule_id", id);

  const isOwner = schedule.owner_id === user.id;
  const myParticipation = participants?.find((p) => p.user_id === user.id);
  const isSiteAdmin = canEditSchedule(userRole);
  const canEdit = isOwner || isSiteAdmin;
  const acceptedCount =
    participants?.filter((p) => p.status === "accepted").length ?? 0;
  const isFull =
    schedule.max_players != null && acceptedCount >= schedule.max_players;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">{schedule.title}</h1>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/schedules/${id}/edit`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              수정
            </Link>
          )}
          {canEdit && !schedule.is_ended && schedule.schedule_type === "recurring" && (
            <form action={endSchedule}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:border-red-400 hover:text-red-500"
              >
                종료
              </button>
            </form>
          )}
          {canEdit && (
            <form action={deleteSchedule}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                삭제
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {schedule.game_image && (
          <img
            src={schedule.game_image}
            alt={schedule.game_name}
            className="h-48 w-full object-cover"
          />
        )}
        <div className="flex flex-col gap-4 p-6">
          {/* 게임 이름 + 스토어 링크 */}
          <div className="flex items-center gap-2 text-sm">
            <TwEmoji emoji="🎮" size={16} />
            <span className="text-zinc-500">게임:</span>
            <span className="font-medium">{schedule.game_name}</span>
            {schedule.game_store_url && (
              <a
                href={schedule.game_store_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                Steam 스토어
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TwEmoji emoji="👤" size={16} />
            <span className="text-zinc-500">주최:</span>
            <span className="font-medium">
              {(schedule.profiles as { username: string })?.username ?? "알 수 없음"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TwEmoji emoji="📌" size={16} />
            <span className="text-zinc-500">유형:</span>
            <span className="font-medium">
              {schedule.schedule_type === "recurring" ? "정기게임" : "단발성"}
            </span>
          </div>
          {schedule.schedule_type === "recurring" && schedule.recurring_days && (
            <div className="flex items-center gap-2 text-sm">
              <TwEmoji emoji="🔄" size={16} />
              <span className="text-zinc-500">정기:</span>
              <span className="font-medium">
                매주 {(schedule.recurring_days as number[]).map((d: number) => ["일", "월", "화", "수", "목", "금", "토"][d]).join(", ")}
                {schedule.recurring_time && ` ${schedule.recurring_time}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <TwEmoji emoji="🕐" size={16} />
            <span className="text-zinc-500">
              {schedule.schedule_type === "recurring" ? "첫 시작일:" : "시작:"}
            </span>
            <span className="font-medium">
              {new Date(schedule.start_time).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* 인원 현황 */}
          <div className="flex items-center gap-2 text-sm">
            <TwEmoji emoji="👥" size={16} />
            <span className="text-zinc-500">참가:</span>
            <span className="font-medium">
              {acceptedCount}명
              {schedule.max_players && ` / ${schedule.max_players}명`}
            </span>
            {isFull && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                마감
              </span>
            )}
          </div>

          {schedule.description && (
            <div className="mt-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {schedule.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 참가 / 참가 취소 버튼 */}
      <div className="flex gap-2">
        {myParticipation ? (
          <form action={leaveSchedule}>
            <input type="hidden" name="schedule_id" value={id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            >
              참가 취소
            </button>
          </form>
        ) : (
          <form action={joinSchedule}>
            <input type="hidden" name="schedule_id" value={id} />
            <input type="hidden" name="status" value="accepted" />
            <button
              type="submit"
              disabled={isFull}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isFull ? "마감됨" : "참가하기"}
            </button>
          </form>
        )}
        <AddToCalendarButton
          title={schedule.title}
          gameName={schedule.game_name}
          startTime={schedule.start_time}
          description={schedule.description}
          storeUrl={schedule.game_store_url}
          scheduleType={schedule.schedule_type}
          recurringDays={schedule.recurring_days as number[] | null}
          recurringTime={schedule.recurring_time}
        />
      </div>

      {/* 참가자 목록 */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          참가자 ({acceptedCount}명)
        </h2>
        {acceptedCount > 0 ? (
          <div className="flex flex-wrap gap-3">
            {participants
              ?.filter((p) => p.status === "accepted")
              .map((p) => {
                const profile = p.profiles as {
                  username: string;
                  avatar_url: string | null;
                };
                return (
                  <div
                    key={p.user_id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <TwEmoji emoji="👤" size={16} />
                    )}
                    <span className="text-sm font-medium">
                      {profile?.username ?? "알 수 없음"}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">아직 참가자가 없습니다</p>
        )}
      </div>

      <Link
        href="/schedules"
        className="mt-4 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
