"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const gameName = formData.get("game_name") as string;
  const gameImage = (formData.get("game_image") as string) || null;
  const startTime = formData.get("start_time") as string;
  const endTime = (formData.get("end_time") as string) || null;
  const maxPlayers = formData.get("max_players")
    ? Number(formData.get("max_players"))
    : null;
  const description = (formData.get("description") as string) || null;
  const groupId = (formData.get("group_id") as string) || null;

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      owner_id: user.id,
      title,
      game_name: gameName,
      game_image: gameImage,
      start_time: startTime,
      end_time: endTime,
      max_players: maxPlayers,
      description,
      group_id: groupId,
    })
    .select("id")
    .single();

  if (error) {
    redirect("/schedules?error=" + encodeURIComponent(error.message));
  }

  // 생성자를 참가자로 자동 등록
  await supabase.from("schedule_participants").insert({
    schedule_id: data.id,
    user_id: user.id,
    status: "accepted",
  });

  revalidatePath("/schedules");
  revalidatePath("/dashboard");
  redirect(`/schedules/${data.id}`);
}

export async function updateSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("schedules")
    .update({
      title: formData.get("title") as string,
      game_name: formData.get("game_name") as string,
      game_image: (formData.get("game_image") as string) || null,
      start_time: formData.get("start_time") as string,
      end_time: (formData.get("end_time") as string) || null,
      max_players: formData.get("max_players")
        ? Number(formData.get("max_players"))
        : null,
      description: (formData.get("description") as string) || null,
      group_id: (formData.get("group_id") as string) || null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/schedules/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/schedules");
  revalidatePath(`/schedules/${id}`);
  revalidatePath("/dashboard");
  redirect(`/schedules/${id}`);
}

export async function deleteSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  await supabase.from("schedules").delete().eq("id", id).eq("owner_id", user.id);

  revalidatePath("/schedules");
  revalidatePath("/dashboard");
  redirect("/schedules");
}

export async function joinSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const scheduleId = formData.get("schedule_id") as string;
  const status = (formData.get("status") as string) || "accepted";

  await supabase.from("schedule_participants").upsert(
    {
      schedule_id: scheduleId,
      user_id: user.id,
      status,
    },
    { onConflict: "schedule_id,user_id" }
  );

  revalidatePath(`/schedules/${scheduleId}`);
}

export async function leaveSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const scheduleId = formData.get("schedule_id") as string;

  await supabase
    .from("schedule_participants")
    .delete()
    .eq("schedule_id", scheduleId)
    .eq("user_id", user.id);

  revalidatePath(`/schedules/${scheduleId}`);
}
