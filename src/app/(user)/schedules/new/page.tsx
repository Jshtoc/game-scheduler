import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SteamLinkInput } from "@/components/ui/SteamLinkInput";
import { ScheduleFormFields } from "@/components/ui/ScheduleForm";
import { createSchedule } from "@/lib/actions/schedule";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="📅" size={28} />
        <h1 className="text-xl font-bold">새 스케줄</h1>
      </div>

      <form action={createSchedule} className="flex max-w-lg flex-col gap-5">
        <SteamLinkInput />
        <ScheduleFormFields />

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
