import TwEmoji from "@/components/ui/TwEmoji";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { RoleSelect } from "@/components/ui/RoleSelect";
import { PenaltyCounter } from "@/components/ui/PenaltyCounter";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import { kickUser } from "@/lib/actions/admin";
import { UserFilter } from "@/components/ui/UserFilter";
import type { UserRole } from "@/lib/auth";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; dir?: string }>;
}) {
  const { sort, q, dir } = await searchParams;
  const isDesc = dir === "desc";
  const supabase = await createClient();
  const { role: myRole } = await getCurrentUserRole();
  const isMaster = myRole === "master";

  let query = supabase.from("profiles").select("*");

  if (q) {
    query = query.ilike("username", `%${q}%`);
  }

  const roleOrder: Record<string, number> = { master: 0, admin: 1, member: 2 };

  if (sort !== "role") {
    switch (sort) {
      case "noshow":
        query = query.order("noshow_count", { ascending: isDesc });
        break;
      case "late":
        query = query.order("late_count", { ascending: isDesc });
        break;
      case "warning":
        query = query.order("warning_count", { ascending: isDesc });
        break;
      case "name":
        query = query.order("username", { ascending: !isDesc });
        break;
      default:
        query = query.order("created_at", { ascending: isDesc });
        break;
    }
  }

  const { data: rawUsers } = await query;

  // 등급순은 커스텀 정렬 (master > admin > member)
  let users = rawUsers;
  if (sort === "role" && users) {
    users = [...users].sort((a, b) => {
      const diff = roleOrder[a.role] - roleOrder[b.role];
      return isDesc ? -diff : diff;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👤" size={28} />
          <h1 className="text-xl font-bold">회원 관리</h1>
        </div>
        <p className="text-sm text-muted">총 {users?.length ?? 0}명</p>
      </div>

      <UserFilter currentSort={sort ?? "date"} currentQuery={q ?? ""} currentDir={dir ?? "asc"} />

      <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">프로필</th>
              <th className="px-4 py-3 font-medium text-muted">이름</th>
              <th className="px-4 py-3 font-medium text-muted">등급</th>
              <th className="px-4 py-3 text-center font-medium text-muted">노쇼</th>
              <th className="px-4 py-3 text-center font-medium text-muted">지각</th>
              <th className="px-4 py-3 text-center font-medium text-muted">경고</th>
              <th className="px-4 py-3 font-medium text-muted">가입일</th>
              {isMaster && (
                <th className="px-4 py-3 font-medium text-muted">관리</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {users?.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-background">
                <td className="px-4 py-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card-border">
                      <TwEmoji emoji="👤" size={16} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role as UserRole} />
                    <RoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      isMaster={isMaster}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PenaltyCounter
                    userId={user.id}
                    field="noshow_count"
                    count={user.noshow_count ?? 0}
                    label="노쇼"
                    isMaster={isMaster}
                  />
                </td>
                <td className="px-4 py-3">
                  <PenaltyCounter
                    userId={user.id}
                    field="late_count"
                    count={user.late_count ?? 0}
                    label="지각"
                    isMaster={isMaster}
                  />
                </td>
                <td className="px-4 py-3">
                  <PenaltyCounter
                    userId={user.id}
                    field="warning_count"
                    count={user.warning_count ?? 0}
                    label="경고"
                    isMaster={isMaster}
                  />
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </td>
                {isMaster && (
                  <td className="px-4 py-3">
                    {user.role !== "master" && (
                      <form action={kickUser}>
                        <input type="hidden" name="user_id" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                        >
                          탈퇴
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td
                  colSpan={isMaster ? 8 : 7}
                  className="px-4 py-8 text-center text-muted"
                >
                  {q ? `"${q}" 검색 결과가 없습니다` : "등록된 회원이 없습니다"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
