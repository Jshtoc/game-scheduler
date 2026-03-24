import TwEmoji from "@/components/ui/TwEmoji";
import { createClient } from "@/lib/supabase/server";

export default async function AdminGroupsPage() {
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("groups")
    .select("*, profiles!groups_owner_id_fkey(username, avatar_url), group_members(user_id)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👥" size={28} />
          <h1 className="text-xl font-bold">그룹 관리</h1>
        </div>
        <p className="text-sm text-muted">총 {groups?.length ?? 0}개</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">그룹명</th>
              <th className="px-4 py-3 font-medium text-muted">그룹장</th>
              <th className="px-4 py-3 font-medium text-muted">멤버 수</th>
              <th className="px-4 py-3 font-medium text-muted">생성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {groups?.map((group) => {
              const owner = group.profiles as {
                username: string;
                avatar_url: string | null;
              } | null;
              const memberCount = (group.group_members as { user_id: string }[]).length;

              return (
                <tr key={group.id} className="transition-colors hover:bg-background">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TwEmoji emoji="👥" size={16} />
                      <span className="font-medium">{group.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {owner?.avatar_url && (
                        <img
                          src={owner.avatar_url}
                          alt={owner.username}
                          className="h-5 w-5 rounded-full"
                        />
                      )}
                      <span className="text-muted">{owner?.username ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{memberCount}명</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(group.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              );
            })}
            {(!groups || groups.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  생성된 그룹이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
