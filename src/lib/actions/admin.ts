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

export async function updateUserPenalty(formData: FormData) {
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

  const targetId = formData.get("user_id") as string;
  const field = formData.get("field") as string;
  const action = formData.get("action") as string;

  if (!["noshow_count", "late_count", "warning_count"].includes(field)) return;

  const { data: target } = await supabase
    .from("profiles")
    .select(field)
    .eq("id", targetId)
    .single();

  if (!target) return;

  const current = (target as unknown as Record<string, number>)[field] ?? 0;
  const newValue = action === "increment" ? current + 1 : Math.max(0, current - 1);

  await supabase
    .from("profiles")
    .update({ [field]: newValue })
    .eq("id", targetId);

  revalidatePath("/admin/users");
}
