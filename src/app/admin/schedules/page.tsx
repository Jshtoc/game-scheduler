import TwEmoji from "@/components/ui/TwEmoji";

const mockSchedules = [
  {
    id: "1",
    title: "발로란트 5인큐",
    game: "Valorant",
    owner: "Player1",
    startTime: "2026-03-24 20:00",
    players: "3/5",
  },
  {
    id: "2",
    title: "롤 내전",
    game: "League of Legends",
    owner: "GamerX",
    startTime: "2026-03-25 19:00",
    players: "8/10",
  },
  {
    id: "3",
    title: "오버워치 팀 연습",
    game: "Overwatch 2",
    owner: "ProScheduler",
    startTime: "2026-03-26 21:00",
    players: "5/6",
  },
];

export default function SchedulesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">스케줄 관리</h1>
        </div>
        <p className="text-sm text-zinc-500">총 {mockSchedules.length}개</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{schedule.title}</h3>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                {schedule.players}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <TwEmoji emoji="🎮" size={14} />
                <span>{schedule.game}</span>
              </div>
              <div className="flex items-center gap-2">
                <TwEmoji emoji="👤" size={14} />
                <span>{schedule.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <TwEmoji emoji="🕐" size={14} />
                <span>{schedule.startTime}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                수정
              </button>
              <button className="flex-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
