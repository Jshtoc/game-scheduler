import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

export interface ScheduleCardData {
  id: string;
  title: string;
  game_name: string;
  game_image: string | null;
  start_time: string;
  max_players: number | null;
  schedule_type: string;
  is_ended: boolean;
  owner: { username: string; avatar_url: string | null } | null;
  participants: {
    user_id: string;
    profiles: { username: string; avatar_url: string | null } | null;
  }[];
  isPast: boolean;
}

export function ScheduleCard({ schedule }: { schedule: ScheduleCardData }) {
  const acceptedCount = schedule.participants.length;
  const isFull =
    schedule.max_players != null && acceptedCount >= schedule.max_players;

  return (
    <Link
      href={`/schedules/${schedule.id}`}
      className={`flex flex-col overflow-hidden rounded-xl border border-card-border bg-card transition-colors hover:border-accent/30 ${
        schedule.isPast ? "opacity-40 grayscale" : ""
      }`}
    >
      {schedule.game_image && (
        <img
          src={schedule.game_image}
          alt={schedule.game_name}
          className="h-28 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold">{schedule.title}</h3>
            {schedule.schedule_type === "recurring" && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                정기
              </span>
            )}
            {schedule.isPast && (
              <span className="rounded-full bg-card-border px-2 py-0.5 text-xs font-medium text-muted">
                종료
              </span>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isFull
                ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                : "bg-card-border"
            }`}
          >
            {acceptedCount} {schedule.max_players ? `/ ${schedule.max_players}` : ""}명
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted">
          <div className="flex items-center gap-2">
            <TwEmoji emoji="🎮" size={14} />
            <span>{schedule.game_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <TwEmoji emoji="👤" size={14} />
            <span className="text-muted/60">주최</span>
            <div className="flex items-center gap-1.5">
              {schedule.owner?.avatar_url && (
                <img
                  src={schedule.owner.avatar_url}
                  alt={schedule.owner.username}
                  className="h-4 w-4 rounded-full"
                />
              )}
              <span>{schedule.owner?.username ?? "알 수 없음"}</span>
            </div>
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

        {/* 참여자 아바타 */}
        {schedule.participants.length > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {schedule.participants.slice(0, 5).map((p) => {
                const profile = p.profiles;
                return profile?.avatar_url ? (
                  <img
                    key={p.user_id}
                    src={profile.avatar_url}
                    alt={profile.username}
                    title={profile.username}
                    className="h-6 w-6 rounded-full border-2 border-card"
                  />
                ) : (
                  <div
                    key={p.user_id}
                    title={profile?.username ?? "알 수 없음"}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-card-border"
                  >
                    <TwEmoji emoji="👤" size={12} />
                  </div>
                );
              })}
            </div>
            {schedule.participants.length > 5 && (
              <span className="text-xs text-muted">
                +{schedule.participants.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
