import { createClient } from "@/lib/supabase/server";
import { AdminSchedulesTable } from "@/components/ui/AdminSchedulesTable";

export default async function AdminSchedulesPage() {
  const supabase = await createClient();

  const { data: rawSchedules } = await supabase
    .from("schedules")
    .select(
      "*, profiles!schedules_owner_id_fkey(username, avatar_url), schedule_participants(user_id, status)"
    )
    .order("start_time", { ascending: true });

  const schedules = (rawSchedules ?? []).map((s) => ({
    id: s.id as string,
    title: s.title as string,
    game_name: s.game_name as string,
    game_image: s.game_image as string | null,
    start_time: s.start_time as string,
    max_players: s.max_players as number | null,
    schedule_type: s.schedule_type as string,
    owner: s.profiles as unknown as { username: string; avatar_url: string | null } | null,
    acceptedCount: (
      s.schedule_participants as { user_id: string; status: string }[]
    ).filter((p) => p.status === "accepted").length,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <AdminSchedulesTable schedules={schedules} />
    </div>
  );
}
