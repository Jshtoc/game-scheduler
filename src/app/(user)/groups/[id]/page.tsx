import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { createClient } from "@/lib/supabase/server";
import { deleteGroup, removeMember, leaveGroup } from "@/lib/actions/group";
import { notFound, redirect } from "next/navigation";

export default async function GroupDetailPage({
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

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  if (!group) notFound();

  const { data: members } = await supabase
    .from("group_members")
    .select("*, profiles(id, username, avatar_url)")
    .eq("group_id", id)
    .order("joined_at", { ascending: true });

  const { data: schedules } = await supabase
    .from("schedules")
    .select("id, title, game_name, start_time")
    .eq("group_id", id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  const isOwner = group.owner_id === user.id;
  const myMembership = members?.find((m) => m.user_id === user.id);
  const isAdmin = myMembership?.role === "owner" || myMembership?.role === "admin";

  const roleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "그룹장";
      case "admin":
        return "관리자";
      default:
        return "멤버";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👥" size={28} />
          <div>
            <h1 className="text-xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-zinc-500">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              href={`/groups/${id}/invite`}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              멤버 초대
            </Link>
          )}
          {isOwner ? (
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                그룹 삭제
              </button>
            </form>
          ) : (
            <form action={leaveGroup}>
              <input type="hidden" name="group_id" value={id} />
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                그룹 나가기
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 멤버 목록 */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          멤버 ({members?.length ?? 0}명)
        </h2>
        <div className="flex flex-col gap-2">
          {members?.map((member) => {
            const profile = member.profiles as {
              id: string;
              username: string;
              avatar_url: string | null;
            };
            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <TwEmoji emoji="👤" size={24} />
                  )}
                  <span className="text-sm font-medium">
                    {profile?.username ?? "알 수 없음"}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                    {roleLabel(member.role)}
                  </span>
                </div>
                {isOwner && member.user_id !== user.id && (
                  <form action={removeMember}>
                    <input type="hidden" name="group_id" value={id} />
                    <input type="hidden" name="user_id" value={member.user_id} />
                    <button
                      type="submit"
                      className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                    >
                      내보내기
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 그룹 스케줄 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">다가오는 스케줄</h2>
          <Link
            href={`/schedules/new`}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
          >
            스케줄 추가
          </Link>
        </div>
        {schedules && schedules.length > 0 ? (
          <div className="flex flex-col gap-2">
            {schedules.map((schedule) => (
              <Link
                key={schedule.id}
                href={`/schedules/${schedule.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2">
                  <TwEmoji emoji="🎮" size={16} />
                  <span className="text-sm font-medium">{schedule.title}</span>
                  <span className="text-xs text-zinc-500">
                    {schedule.game_name}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(schedule.start_time).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">다가오는 스케줄이 없습니다</p>
        )}
      </div>

      <Link
        href="/groups"
        className="mt-4 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
