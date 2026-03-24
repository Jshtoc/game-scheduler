"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import TwEmoji from "@/components/ui/TwEmoji";
import type { ApiResponse, FriendRequest } from "@/types/friend";

interface SendFriendRequestProps {
  onSent: () => void;
}

export default function SendFriendRequest({ onSent }: SendFriendRequestProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = username.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "사용자 이름을 입력해주세요." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverUsername: trimmed }),
      });
      const data: ApiResponse<FriendRequest> = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "친구 요청을 보냈습니다!",
        });
        setUsername("");
        onSent();
      } else {
        setMessage({
          type: "error",
          text: data.error ?? "요청에 실패했습니다.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "네트워크 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 pb-4">
        <TwEmoji emoji="🔍" size={48} />
        <p className="text-zinc-500">사용자 이름으로 친구를 추가하세요</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label
            htmlFor="username-input"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            사용자 이름
          </label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="예: player2"
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "보내는 중..." : "친구 요청 보내기"}
        </button>
      </form>

      {message && (
        <div
          className={`rounded-lg p-3 text-center text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
