"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 본인이 마스터인지 확인
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "master") {
    redirect("/admin/users");
  }

  const targetId = formData.get("user_id") as string;
  const newRole = formData.get("role") as string;

  // 본인 역할은 변경 불가
  if (targetId === user.id) {
    redirect("/admin/users");
  }

  // master 역할은 부여 불가 (마스터는 1명만)
  if (newRole === "master") {
    redirect("/admin/users");
  }

  await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetId);

  revalidatePath("/admin/users");
}

export async function kickUser(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 본인이 마스터인지 확인
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "master") {
    redirect("/admin/users");
  }

  const targetId = formData.get("user_id") as string;

  // 본인은 탈퇴 불가
  if (targetId === user.id) {
    redirect("/admin/users");
  }

  // 참가 기록, 프로필 삭제 (auth.users는 Supabase Admin API 필요)
  await supabase.from("schedule_participants").delete().eq("user_id", targetId);
  await supabase.from("group_members").delete().eq("user_id", targetId);
  await supabase.from("friendships").delete().or(`requester_id.eq.${targetId},addressee_id.eq.${targetId}`);
  await supabase.from("schedules").delete().eq("owner_id", targetId);
  await supabase.from("profiles").delete().eq("id", targetId);

  revalidatePath("/admin/users");
}

export async function updateUserPenalties(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "master") {
    redirect("/admin/users");
  }

  const changesRaw = formData.get("changes") as string;
  if (!changesRaw) return;

  const changes = JSON.parse(changesRaw) as {
    userId: string;
    noshow_count: number;
    late_count: number;
    warning_count: number;
  }[];

  for (const change of changes) {
    await supabase
      .from("profiles")
      .update({
        noshow_count: change.noshow_count,
        late_count: change.late_count,
        warning_count: change.warning_count,
      })
      .eq("id", change.userId);
  }

  revalidatePath("/admin/users");
}
