"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = formData.get("username") as string;

  if (!username || username.trim().length === 0) {
    redirect("/profile?error=empty_username");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: username.trim() })
    .eq("id", user.id);

  if (error) {
    redirect("/profile?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?success=true");
}
