import TwEmoji from "@/components/ui/TwEmoji";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="🎮" size={48} />
        <h1 className="text-4xl font-bold tracking-tight">Game Scheduler</h1>
      </div>
      <p className="text-lg text-zinc-500">게임 일정을 관리하세요</p>
    </div>
  );
}
