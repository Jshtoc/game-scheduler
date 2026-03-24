import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSchedulesPage() {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select(
      "*, profiles!schedules_owner_id_fkey(username, avatar_url), schedule_participants(user_id, status)"
    )
    .order("start_time", { ascending: true });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">스케줄 관리</h1>
        </div>
        <p className="text-sm text-muted">총 {schedules?.length ?? 0}개</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">게임</th>
              <th className="px-4 py-3 font-medium text-muted">제목</th>
              <th className="px-4 py-3 font-medium text-muted">주최자</th>
              <th className="px-4 py-3 font-medium text-muted">유형</th>
              <th className="px-4 py-3 font-medium text-muted">시작</th>
              <th className="px-4 py-3 font-medium text-muted">인원</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {schedules?.map((schedule) => {
              const owner = schedule.profiles as {
                username: string;
                avatar_url: string | null;
              } | null;
              const accepted = (
                schedule.schedule_participants as { user_id: string; status: string }[]
              ).filter((p) => p.status === "accepted").length;

              return (
                <tr key={schedule.id} className="transition-colors hover:bg-background">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {schedule.game_image ? (
                        <img
                          src={schedule.game_image}
                          alt={schedule.game_name}
                          className="h-8 w-12 rounded object-cover"
                        />
                      ) : (
                        <TwEmoji emoji="🎮" size={16} />
                      )}
                      <span className="text-muted">{schedule.game_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/schedules/${schedule.id}`}
                      className="font-medium transition-colors hover:text-accent"
                    >
                      {schedule.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {owner?.avatar_url && (
                        <img
                          src={owner.avatar_url}
                          alt={owner.username}
                          className="h-5 w-5 rounded-full"
                        />
                      )}
                      <span className="text-muted">{owner?.username ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        schedule.schedule_type === "recurring"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                          : "bg-card-border"
                      }`}
                    >
                      {schedule.schedule_type === "recurring" ? "정기" : "단발"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(schedule.start_time).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {accepted}
                    {schedule.max_players ? ` / ${schedule.max_players}` : ""}명
                  </td>
                </tr>
              );
            })}
            {(!schedules || schedules.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  등록된 스케줄이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
