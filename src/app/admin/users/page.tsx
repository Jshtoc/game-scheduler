import TwEmoji from "@/components/ui/TwEmoji";

const mockUsers = [
  { id: "1", username: "Player1", discord_id: "123456789", createdAt: "2026-03-01" },
  { id: "2", username: "GamerX", discord_id: "987654321", createdAt: "2026-03-10" },
  { id: "3", username: "ProScheduler", discord_id: "456789123", createdAt: "2026-03-15" },
];

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👤" size={28} />
          <h1 className="text-xl font-bold">회원 관리</h1>
        </div>
        <p className="text-sm text-zinc-500">총 {mockUsers.length}명</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">이름</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Discord ID</th>
              <th className="px-4 py-3 font-medium text-zinc-500">가입일</th>
              <th className="px-4 py-3 font-medium text-zinc-500">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {mockUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-zinc-500">{user.discord_id}</td>
                <td className="px-4 py-3 text-zinc-500">{user.createdAt}</td>
                <td className="px-4 py-3">
                  <button className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
