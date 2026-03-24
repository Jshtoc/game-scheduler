import TwEmoji from "@/components/ui/TwEmoji";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="👤" size={28} />
        <h1 className="text-xl font-bold">내 프로필</h1>
      </div>

      {success && (
        <div className="max-w-lg rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          프로필이 수정되었습니다.
        </div>
      )}

      {error && (
        <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error === "empty_username"
            ? "이름을 입력해 주세요."
            : "오류가 발생했습니다."}
        </div>
      )}

      <div className="max-w-lg rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <TwEmoji emoji="👤" size={32} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold">
              {profile?.username ?? "사용자"}
            </h2>
            <p className="text-sm text-zinc-500">
              Discord: {profile?.discord_id ?? "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              이메일
            </label>
            <p className="text-sm">{user.email ?? "-"}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              가입일
            </label>
            <p className="text-sm">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <form action={updateProfile} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">
              표시 이름
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="username"
                required
                defaultValue={profile?.username ?? ""}
                className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
