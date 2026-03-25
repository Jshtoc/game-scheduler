"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";
import { LoadingOverlay } from "@/components/ui/GlobalLoading";
import { bulkDeleteSchedules } from "@/lib/actions/admin";

interface ScheduleData {
  id: string;
  title: string;
  game_name: string;
  game_image: string | null;
  start_time: string;
  max_players: number | null;
  schedule_type: string;
  owner: { username: string; avatar_url: string | null } | null;
  acceptedCount: number;
}

export function AdminSchedulesTable({
  schedules,
}: {
  schedules: ScheduleData[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, startDelete] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  const allSelected =
    schedules.length > 0 && selected.size === schedules.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(schedules.map((s) => s.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`선택한 ${selected.size}개의 스케줄을 삭제하시겠습니까?`)) return;

    const formData = new FormData();
    formData.set("ids", JSON.stringify([...selected]));

    startDelete(async () => {
      await bulkDeleteSchedules(formData);
      setSelected(new Set());
      router.refresh();
    });
  }

  function handleRefresh() {
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <>
      <LoadingOverlay show={isDeleting} />

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="📅" size={28} />
          <h1 className="text-xl font-bold">스케줄 관리</h1>
          <span className="text-sm text-muted">({schedules.length}개)</span>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            >
              {selected.size}개 삭제
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-card-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRefreshing ? "animate-spin" : ""}
            >
              <path d="M14 8A6 6 0 1 1 10 2.5" />
              <path d="M14 2v4h-4" />
            </svg>
            새로고침
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-background">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded accent-accent"
                />
              </th>
              <th className="px-4 py-3 font-medium text-muted">게임</th>
              <th className="px-4 py-3 font-medium text-muted">제목</th>
              <th className="px-4 py-3 font-medium text-muted">주최자</th>
              <th className="px-4 py-3 font-medium text-muted">유형</th>
              <th className="px-4 py-3 font-medium text-muted">시작</th>
              <th className="px-4 py-3 font-medium text-muted">인원</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className={`transition-colors hover:bg-background ${
                  selected.has(schedule.id) ? "bg-accent/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(schedule.id)}
                    onChange={() => toggleOne(schedule.id)}
                    className="h-4 w-4 rounded accent-accent"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {schedule.game_image ? (
                      <img
                        src={schedule.game_image}
                        alt={schedule.game_name}
                        className="h-8 w-12 rounded object-cover"
                      />
                    ) : (
                      <TwEmoji emoji="🎮" size={16} />
                    )}
                    <span className="text-muted">{schedule.game_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/schedules/${schedule.id}`}
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {schedule.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {schedule.owner?.avatar_url && (
                      <img
                        src={schedule.owner.avatar_url}
                        alt={schedule.owner.username}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    <span className="text-muted">
                      {schedule.owner?.username ?? "-"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      schedule.schedule_type === "recurring"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-card-border"
                    }`}
                  >
                    {schedule.schedule_type === "recurring" ? "정기" : "단발"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(schedule.start_time).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-muted">
                  {schedule.acceptedCount}
                  {schedule.max_players
                    ? ` / ${schedule.max_players}`
                    : ""}
                  명
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted"
                >
                  등록된 스케줄이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
