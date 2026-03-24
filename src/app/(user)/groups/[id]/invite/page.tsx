import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { inviteMember } from "@/lib/actions/group";

const errorMessages: Record<string, string> = {
  user_not_found: "해당 사용자를 찾을 수 없습니다.",
  already_member: "이미 그룹에 가입된 사용자입니다.",
};

export default async function InviteMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="➕" size={28} />
        <h1 className="text-xl font-bold">멤버 초대</h1>
      </div>

      {error && (
        <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {errorMessages[error] ?? "오류가 발생했습니다."}
        </div>
      )}

      <form action={inviteMember} className="flex max-w-lg flex-col gap-5">
        <input type="hidden" name="group_id" value={id} />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">사용자 이름 *</span>
          <input
            type="text"
            name="username"
            required
            placeholder="초대할 사용자의 이름을 입력하세요"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
          <span className="text-xs text-zinc-400">
            Game Scheduler에 가입된 사용자의 표시 이름으로 검색합니다
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            초대
          </button>
          <Link
            href={`/groups/${id}`}
            className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
