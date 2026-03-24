import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { createGroup } from "@/lib/actions/group";

export default function NewGroupPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="👥" size={28} />
        <h1 className="text-xl font-bold">그룹 만들기</h1>
      </div>

      <form action={createGroup} className="flex max-w-lg flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">그룹 이름 *</span>
          <input
            type="text"
            name="name"
            required
            placeholder="발로란트 팀"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">설명</span>
          <textarea
            name="description"
            rows={3}
            placeholder="그룹에 대한 설명을 입력하세요"
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            그룹 생성
          </button>
          <Link
            href="/groups"
            className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
