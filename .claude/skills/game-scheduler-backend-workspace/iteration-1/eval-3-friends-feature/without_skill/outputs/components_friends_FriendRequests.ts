"use client";

import { useEffect, useState, useCallback } from "react";
import TwEmoji from "@/components/ui/TwEmoji";
import type {
  FriendRequestWithUser,
  ApiResponse,
  FriendRequest,
} from "@/types/friend";

interface FriendRequestsProps {
  onUpdate: () => void;
}

interface FriendRequestsData {
  received: FriendRequestWithUser[];
  sent: FriendRequestWithUser[];
}

export default function FriendRequests({ onUpdate }: FriendRequestsProps) {
  const [received, setReceived] = useState<FriendRequestWithUser[]>([]);
  const [sent, setSent] = useState<FriendRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends/requests");
      const data: ApiResponse<FriendRequestsData> = await res.json();

      if (data.success && data.data) {
        setReceived(data.data.received);
        setSent(data.data.sent);
      } else {
        setError(data.error ?? "요청 목록을 불러올 수 없습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data: ApiResponse<FriendRequest> = await res.json();

      if (data.success) {
        setReceived((prev) =>
          prev.filter((r) => r.request.id !== requestId)
        );
        onUpdate();
      } else {
        alert(data.error ?? "처리에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
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
          onClick={() => void fetchRequests()}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (received.length === 0 && sent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <TwEmoji emoji="📭" size={48} />
        <p className="text-zinc-500">친구 요청이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {received.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <TwEmoji emoji="📥" size={16} />
            받은 요청 ({received.length})
          </h3>
          <ul className="space-y-2">
            {received.map((item) => (
              <li
                key={item.request.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <TwEmoji emoji="👤" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{item.sender.displayName}</p>
                    <p className="text-sm text-zinc-500">
                      @{item.sender.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      void handleAction(item.request.id, "accept")
                    }
                    disabled={processingId === item.request.id}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    수락
                  </button>
                  <button
                    onClick={() =>
                      void handleAction(item.request.id, "reject")
                    }
                    disabled={processingId === item.request.id}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    거절
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sent.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <TwEmoji emoji="📤" size={16} />
            보낸 요청 ({sent.length})
          </h3>
          <ul className="space-y-2">
            {sent.map((item) => (
              <li
                key={item.request.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <TwEmoji emoji="👤" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{item.sender.displayName}</p>
                    <p className="text-sm text-zinc-500">
                      @{item.sender.username}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  대기 중
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
