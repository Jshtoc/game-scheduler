"use client";

import { useState } from "react";
import TwEmoji from "@/components/ui/TwEmoji";

interface SteamGameData {
  name: string;
  image: string;
  description: string;
  appId: number;
  storeUrl: string;
}

export function SteamLinkInput({
  defaultGameName,
  defaultGameImage,
}: {
  defaultGameName?: string;
  defaultGameImage?: string;
}) {
  const [steamUrl, setSteamUrl] = useState("");
  const [gameData, setGameData] = useState<SteamGameData | null>(
    defaultGameName
      ? {
          name: defaultGameName,
          image: defaultGameImage ?? "",
          description: "",
          appId: 0,
          storeUrl: "",
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchSteamData() {
    if (!steamUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/steam?url=${encodeURIComponent(steamUrl.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "게임 정보를 가져올 수 없습니다");
        return;
      }

      setGameData(data as SteamGameData);
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  function clearGame() {
    setGameData(null);
    setSteamUrl("");
    setError("");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* hidden inputs for form submission */}
      <input type="hidden" name="game_name" value={gameData?.name ?? ""} />
      <input type="hidden" name="game_image" value={gameData?.image ?? ""} />

      {gameData ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {gameData.image && (
            <img
              src={gameData.image}
              alt={gameData.name}
              className="h-36 w-full object-cover"
            />
          )}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <TwEmoji emoji="🎮" size={16} />
              <span className="text-sm font-semibold">{gameData.name}</span>
            </div>
            <button
              type="button"
              onClick={clearGame}
              className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              변경
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Steam 게임 링크 *</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={steamUrl}
                onChange={(e) => setSteamUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchSteamData();
                  }
                }}
                placeholder="https://store.steampowered.com/app/730/..."
                className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={fetchSteamData}
                disabled={loading || !steamUrl.trim()}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {loading ? "로딩..." : "검색"}
              </button>
            </div>
            <span className="text-xs text-zinc-400">
              Steam 스토어 페이지 URL을 붙여넣으세요
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
