import TwEmoji from "@/components/ui/TwEmoji";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("role, groups(id, name, description, owner_id)")
    .eq("user_id", user?.id ?? "");

  const groups =
    memberships?.map((m) => ({
      ...(m.groups as { id: string; name: string; description: string | null; owner_id: string }),
      role: m.role as string,
    })) ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👥" size={28} />
          <h1 className="text-xl font-bold">내 그룹</h1>
        </div>
        <Link
          href="/groups/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          그룹 만들기
        </Link>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TwEmoji emoji="👥" size={20} />
                  <h3 className="font-semibold">{group.name}</h3>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {group.role === "owner"
                    ? "그룹장"
                    : group.role === "admin"
                      ? "관리자"
                      : "멤버"}
                </span>
              </div>
              {group.description && (
                <p className="text-sm text-zinc-500">{group.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <TwEmoji emoji="🫂" size={40} />
          <p className="text-zinc-500">아직 소속된 그룹이 없습니다</p>
          <Link
            href="/groups/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            첫 그룹 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
