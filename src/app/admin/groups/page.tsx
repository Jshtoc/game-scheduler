import TwEmoji from "@/components/ui/TwEmoji";

const mockGroups = [
  {
    id: "1",
    name: "발로란트 팀",
    owner: "Player1",
    memberCount: 5,
    createdAt: "2026-03-05",
  },
  {
    id: "2",
    name: "롤 내전 모임",
    owner: "GamerX",
    memberCount: 12,
    createdAt: "2026-03-12",
  },
  {
    id: "3",
    name: "오버워치 클랜",
    owner: "ProScheduler",
    memberCount: 8,
    createdAt: "2026-03-18",
  },
];

export default function GroupsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👥" size={28} />
          <h1 className="text-xl font-bold">그룹 관리</h1>
        </div>
        <p className="text-sm text-zinc-500">총 {mockGroups.length}개</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">그룹명</th>
              <th className="px-4 py-3 font-medium text-zinc-500">그룹장</th>
              <th className="px-4 py-3 font-medium text-zinc-500">멤버 수</th>
              <th className="px-4 py-3 font-medium text-zinc-500">생성일</th>
              <th className="px-4 py-3 font-medium text-zinc-500">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {mockGroups.map((group) => (
              <tr key={group.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TwEmoji emoji="👥" size={16} />
                    <span className="font-medium">{group.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500">{group.owner}</td>
                <td className="px-4 py-3 text-zinc-500">{group.memberCount}명</td>
                <td className="px-4 py-3 text-zinc-500">{group.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                      상세
                    </button>
                    <button className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
