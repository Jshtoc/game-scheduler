import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { SteamLinkInput } from "@/components/ui/SteamLinkInput";
import { ScheduleFormFields } from "@/components/ui/ScheduleForm";
import { LoadingForm } from "@/components/ui/LoadingForm";
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
    .single();

  if (!schedule) notFound();

  // 주최자 또는 사이트 마스터/관리자만 수정 가능
  const isOwner = schedule.owner_id === user.id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSiteAdmin = profile?.role === "master" || profile?.role === "admin";
  if (!isOwner && !isSiteAdmin) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="✏️" size={28} />
        <h1 className="text-xl font-bold">스케줄 수정</h1>
      </div>

      <LoadingForm action={updateSchedule} className="flex max-w-lg flex-col gap-5">
        <input type="hidden" name="id" value={id} />

        <SteamLinkInput
          defaultGameName={schedule.game_name}
          defaultGameImage={schedule.game_image ?? undefined}
        />

        <ScheduleFormFields
          defaultValues={{
            title: schedule.title,
            start_time: toLocalDatetime(schedule.start_time),
            max_players: schedule.max_players,
            description: schedule.description,
            schedule_type: schedule.schedule_type ?? "once",
            recurring_days: schedule.recurring_days,
            recurring_time: schedule.recurring_time,
          }}
        />

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
      </LoadingForm>
    </div>
  );
}
