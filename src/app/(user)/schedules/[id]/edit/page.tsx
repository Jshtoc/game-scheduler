import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SteamLinkInput } from "@/components/ui/SteamLinkInput";
import { createClient } from "@/lib/supabase/server";
import { updateSchedule } from "@/lib/actions/schedule";
import { notFound, redirect } from "next/navigation";

function toLocalDatetime(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditSchedulePage({
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

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!schedule) notFound();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("groups(id, name)")
    .eq("user_id", user.id);

  const groups =
    memberships?.map((m) => m.groups as { id: string; name: string }) ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="✏️" size={28} />
        <h1 className="text-xl font-bold">스케줄 수정</h1>
      </div>

      <form action={updateSchedule} className="flex max-w-lg flex-col gap-5">
        <input type="hidden" name="id" value={id} />

        <SteamLinkInput
          defaultGameName={schedule.game_name}
          defaultGameImage={schedule.game_image ?? undefined}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">제목 *</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={schedule.title}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">시작 시간 *</span>
          <input
            type="datetime-local"
            name="start_time"
            required
            defaultValue={toLocalDatetime(schedule.start_time)}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">종료 시간</span>
          <input
            type="datetime-local"
            name="end_time"
            defaultValue={schedule.end_time ? toLocalDatetime(schedule.end_time) : ""}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">최대 인원</span>
          <input
            type="number"
            name="max_players"
            min="2"
            defaultValue={schedule.max_players ?? ""}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">설명</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={schedule.description ?? ""}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        {groups.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">그룹 (선택)</span>
            <select
              name="group_id"
              defaultValue={schedule.group_id ?? ""}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
            >
              <option value="">그룹 없음 (개인 스케줄)</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            저장
          </button>
          <Link
            href={`/schedules/${id}`}
            className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
