import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SteamLinkInput } from "@/components/ui/SteamLinkInput";
import { createClient } from "@/lib/supabase/server";
import { createSchedule } from "@/lib/actions/schedule";
import { redirect } from "next/navigation";

export default async function NewSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("group_members")
    .select("groups(id, name)")
    .eq("user_id", user.id);

  const groups =
    memberships?.map((m) => m.groups as { id: string; name: string }) ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="📅" size={28} />
        <h1 className="text-xl font-bold">새 스케줄</h1>
      </div>

      <form action={createSchedule} className="flex max-w-lg flex-col gap-5">
        <SteamLinkInput />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">제목 *</span>
          <input
            type="text"
            name="title"
            required
            placeholder="발로란트 5인큐"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">시작 시간 *</span>
          <input
            type="datetime-local"
            name="start_time"
            required
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">종료 시간</span>
          <input
            type="datetime-local"
            name="end_time"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">최대 인원</span>
          <input
            type="number"
            name="max_players"
            min="2"
            placeholder="5"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">설명</span>
          <textarea
            name="description"
            rows={3}
            placeholder="스케줄에 대한 설명을 입력하세요"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        {groups.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">그룹 (선택)</span>
            <select
              name="group_id"
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
            스케줄 생성
          </button>
          <Link
            href="/schedules"
            className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
