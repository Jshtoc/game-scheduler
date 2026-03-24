"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      description,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect("/groups?error=" + encodeURIComponent(error.message));
  }

  // 생성자를 owner 멤버로 등록
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  redirect(`/groups/${data.id}`);
}

export async function updateGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("groups")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/groups/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
  redirect(`/groups/${id}`);
}

export async function deleteGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  await supabase.from("groups").delete().eq("id", id).eq("owner_id", user.id);

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  redirect("/groups");
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const groupId = formData.get("group_id") as string;
  const username = formData.get("username") as string;

  // 사용자 검색
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!targetUser) {
    redirect(`/groups/${groupId}/invite?error=user_not_found`);
  }

  // 이미 멤버인지 확인
  const { data: existing } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", targetUser.id)
    .single();

  if (existing) {
    redirect(`/groups/${groupId}/invite?error=already_member`);
  }

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: targetUser.id,
    role: "member",
  });

  if (error) {
    redirect(`/groups/${groupId}/invite?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const groupId = formData.get("group_id") as string;
  const userId = formData.get("user_id") as string;

  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  revalidatePath(`/groups/${groupId}`);
}

export async function leaveGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const groupId = formData.get("group_id") as string;

  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  redirect("/groups");
}
