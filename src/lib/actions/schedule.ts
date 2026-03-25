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
  const gameName = (formData.get("game_name") as string) || "미정";
  const gameImage = (formData.get("game_image") as string) || null;
  const gameStoreUrl = (formData.get("game_store_url") as string) || null;
  const scheduleType = (formData.get("schedule_type") as string) || "once";
  const maxPlayers = formData.get("max_players")
    ? Number(formData.get("max_players"))
    : null;
  const description = (formData.get("description") as string) || null;
  const groupId = (formData.get("group_id") as string) || null;

  // 시작 시간 처리
  let startTime: string;
  let recurringDays: number[] | null = null;
  let recurringTime: string | null = null;

  if (scheduleType === "recurring") {
    const startDate = formData.get("start_date") as string;
    recurringTime = formData.get("recurring_time") as string;
    const daysRaw = formData.get("recurring_days") as string;
    recurringDays = JSON.parse(daysRaw || "[]") as number[];
    startTime = `${startDate}T${recurringTime}`;
  } else {
    startTime = formData.get("start_time") as string;
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      owner_id: user.id,
      title,
      game_name: gameName,
      game_image: gameImage,
      game_store_url: gameStoreUrl,
      start_time: startTime,
      max_players: maxPlayers,
      description,
      group_id: groupId,
      schedule_type: scheduleType,
      recurring_days: recurringDays,
      recurring_time: recurringTime,
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
  redirect("/schedules?created=true");
}

export async function updateSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  // 주최자 또는 관리자만 수정 가능
  const { data: schedule } = await supabase
    .from("schedules")
    .select("owner_id")
    .eq("id", id)
    .single();

  const isOwner = schedule?.owner_id === user.id;

  if (!isOwner) {
    const { data: myRole } = await supabase
      .from("schedule_participants")
      .select("role")
      .eq("schedule_id", id)
      .eq("user_id", user.id)
      .single();

    if (myRole?.role !== "admin") {
      redirect(`/schedules/${id}`);
    }
  }

  const scheduleType = (formData.get("schedule_type") as string) || "once";
  let startTime: string;
  let recurringDays: number[] | null = null;
  let recurringTime: string | null = null;

  if (scheduleType === "recurring") {
    const startDate = formData.get("start_date") as string;
    recurringTime = formData.get("recurring_time") as string;
    const daysRaw = formData.get("recurring_days") as string;
    recurringDays = JSON.parse(daysRaw || "[]") as number[];
    startTime = `${startDate}T${recurringTime}`;
  } else {
    startTime = formData.get("start_time") as string;
  }

  const { error } = await supabase
    .from("schedules")
    .update({
      title: formData.get("title") as string,
      game_name: formData.get("game_name") as string,
      game_image: (formData.get("game_image") as string) || null,
      game_store_url: (formData.get("game_store_url") as string) || null,
      start_time: startTime,
      max_players: formData.get("max_players")
        ? Number(formData.get("max_players"))
        : null,
      description: (formData.get("description") as string) || null,
      group_id: (formData.get("group_id") as string) || null,
      schedule_type: scheduleType,
      recurring_days: recurringDays,
      recurring_time: recurringTime,
    })
    .eq("id", id);

  if (error) {
    redirect(`/schedules/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/schedules");
  revalidatePath(`/schedules/${id}`);
  revalidatePath("/dashboard");
  redirect("/schedules?updated=true");
}

export async function endSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  // 주최자 또는 마스터/관리자
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSiteAdmin = profile?.role === "master" || profile?.role === "admin";

  if (isSiteAdmin) {
    await supabase.from("schedules").update({ is_ended: true }).eq("id", id);
  } else {
    await supabase.from("schedules").update({ is_ended: true }).eq("id", id).eq("owner_id", user.id);
  }

  revalidatePath("/schedules");
  revalidatePath("/schedules/board");
  revalidatePath("/dashboard");
  redirect("/schedules?ended=true");
}

export async function deleteSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSiteAdmin = profile?.role === "master" || profile?.role === "admin";

  if (isSiteAdmin) {
    await supabase.from("schedules").delete().eq("id", id);
  } else {
    await supabase.from("schedules").delete().eq("id", id).eq("owner_id", user.id);
  }

  revalidatePath("/schedules");
  revalidatePath("/dashboard");
  redirect("/schedules?deleted=true");
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
  revalidatePath("/schedules");
  redirect(`/schedules/${scheduleId}`);
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
  revalidatePath("/schedules");
  redirect(`/schedules/${scheduleId}`);
}
