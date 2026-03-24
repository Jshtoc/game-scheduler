"use client";

import { useEffect, useState, useCallback } from "react";
import TwEmoji from "@/components/ui/TwEmoji";
import type { FriendWithUser, ApiResponse } from "@/types/friend";

export default function FriendsList() {
  const [friends, setFriends] = useState<FriendWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends");
      const data: ApiResponse<FriendWithUser[]> = await res.json();

      if (data.success && data.data) {
        setFriends(data.data);
      } else {
        setError(data.error ?? "친구 목록을 불러올 수 없습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFriends();
  }, [fetchFriends]);

  const handleDelete = async (friendId: string, displayName: string) => {
    if (!confirm(`${displayName}님을 친구에서 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(friendId);
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      const data: ApiResponse<{ message: string }> = await res.json();

      if (data.success) {
        setFriends((prev) => prev.filter((f) => f.user.id !== friendId));
      } else {
        alert(data.error ?? "삭제에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => void fetchFriends()}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <TwEmoji emoji="😢" size={48} />
        <p className="text-zinc-500">아직 친구가 없습니다.</p>
        <p className="text-sm text-zinc-400">
          친구 추가 탭에서 친구를 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm text-zinc-500">
        총 {friends.length}명의 친구
      </p>
      <ul className="space-y-2">
        {friends.map((friend) => (
          <li
            key={friend.friendshipId}
            className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <TwEmoji emoji="👤" size={20} />
              </div>
              <div>
                <p className="font-medium">{friend.user.displayName}</p>
                <p className="text-sm text-zinc-500">
                  @{friend.user.username}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                void handleDelete(friend.user.id, friend.user.displayName)
              }
              disabled={deletingId === friend.user.id}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
            >
              {deletingId === friend.user.id ? "삭제 중..." : "삭제"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
