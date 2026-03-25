"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import TwEmoji from "@/components/ui/TwEmoji";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { RoleSelect } from "@/components/ui/RoleSelect";
import { PenaltyCounter } from "@/components/ui/PenaltyCounter";
import { kickUser, updateUserPenalties } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/auth";

interface UserData {
  id: string;
  username: string;
  discord_id: string;
  avatar_url: string | null;
  role: string;
  noshow_count: number;
  late_count: number;
  warning_count: number;
  created_at: string;
}

type PenaltyField = "noshow_count" | "late_count" | "warning_count";

interface PenaltyChanges {
  [userId: string]: {
    noshow_count: number;
    late_count: number;
    warning_count: number;
  };
}

const sortOptions = [
  { value: "date", label: "가입일순" },
  { value: "role", label: "등급순" },
  { value: "noshow", label: "노쇼순" },
  { value: "late", label: "지각순" },
  { value: "warning", label: "경고순" },
];

const roleOrder: Record<string, number> = { master: 0, admin: 1, member: 2 };

export function UsersTable({
  users,
  isMaster,
}: {
  users: UserData[];
  isMaster: boolean;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [isApplying, startApply] = useTransition();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [penaltyChanges, setPenaltyChanges] = useState<PenaltyChanges>({});

  function handleRefresh() {
    startRefresh(() => {
      router.refresh();
    });
  }

  function handleSortClick(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const handlePenaltyChange = useCallback(
    (userId: string, field: PenaltyField, value: number, original: UserData) => {
      setPenaltyChanges((prev) => {
        const current = prev[userId] ?? {
          noshow_count: original.noshow_count,
          late_count: original.late_count,
          warning_count: original.warning_count,
        };
        const updated = { ...current, [field]: value };

        // 원래 값과 같으면 변경 내역에서 제거
        if (
          updated.noshow_count === original.noshow_count &&
          updated.late_count === original.late_count &&
          updated.warning_count === original.warning_count
        ) {
          const next = { ...prev };
          delete next[userId];
          return next;
        }

        return { ...prev, [userId]: updated };
      });
    },
    []
  );

  const hasChanges = Object.keys(penaltyChanges).length > 0;

  function handleApply() {
    const changes = Object.entries(penaltyChanges).map(([userId, vals]) => ({
      userId,
      ...vals,
    }));

    const formData = new FormData();
    formData.set("changes", JSON.stringify(changes));

    startApply(async () => {
      await updateUserPenalties(formData);
      setPenaltyChanges({});
      router.refresh();
    });
  }

  function getPenaltyValue(user: UserData, field: PenaltyField): number {
    return penaltyChanges[user.id]?.[field] ?? user[field] ?? 0;
  }

  const filtered = useMemo(() => {
    let result = users;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((u) => u.username.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case "role":
          diff = (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2);
          break;
        case "noshow":
          diff = (b.noshow_count ?? 0) - (a.noshow_count ?? 0);
          break;
        case "late":
          diff = (b.late_count ?? 0) - (a.late_count ?? 0);
          break;
        case "warning":
          diff = (b.warning_count ?? 0) - (a.warning_count ?? 0);
          break;
        default:
          diff =
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime();
          break;
      }
      return sortDir === "desc" ? -diff : diff;
    });

    return result;
  }, [users, query, sortKey, sortDir]);

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TwEmoji emoji="👤" size={28} />
          <h1 className="text-xl font-bold">회원 관리</h1>
          <span className="text-sm text-muted">({users.length}명)</span>
        </div>
        <div className="flex items-center gap-2">
          {isMaster && (
            <button
              onClick={handleApply}
              disabled={!hasChanges || isApplying}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                hasChanges
                  ? "bg-accent text-dark hover:bg-accent-hover"
                  : "cursor-not-allowed bg-card-border text-muted/40"
              }`}
            >
              {isApplying ? "적용 중..." : "적용"}
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
            {isRefreshing ? "로딩..." : "새로고침"}
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="닉네임 검색..."
            className="w-48 rounded-xl border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-xl border border-card-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              초기화
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {sortOptions.map((opt) => {
            const isActive = sortKey === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSortClick(opt.value)}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-dark"
                    : "border border-card-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {opt.label}
                {isActive && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={sortDir === "desc" ? "rotate-180" : ""}
                  >
                    <path d="M6 9V3M6 3L3 6M6 3L9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">프로필</th>
              <th className="px-4 py-3 font-medium text-muted">이름</th>
              <th className="px-4 py-3 font-medium text-muted">등급</th>
              <th className="px-4 py-3 text-center font-medium text-muted">
                노쇼
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted">
                지각
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted">
                경고
              </th>
              <th className="px-4 py-3 font-medium text-muted">가입일</th>
              {isMaster && (
                <th className="px-4 py-3 font-medium text-muted">관리</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filtered.map((user) => {
              const isChanged = !!penaltyChanges[user.id];
              return (
                <tr
                  key={user.id}
                  className={`transition-colors hover:bg-background ${
                    isChanged ? "bg-accent/5" : ""
                  }`}
                >
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
                      value={getPenaltyValue(user, "noshow_count")}
                      label="노쇼"
                      isMaster={isMaster}
                      onChange={(v) =>
                        handlePenaltyChange(user.id, "noshow_count", v, user)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <PenaltyCounter
                      value={getPenaltyValue(user, "late_count")}
                      label="지각"
                      isMaster={isMaster}
                      onChange={(v) =>
                        handlePenaltyChange(user.id, "late_count", v, user)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <PenaltyCounter
                      value={getPenaltyValue(user, "warning_count")}
                      label="경고"
                      isMaster={isMaster}
                      onChange={(v) =>
                        handlePenaltyChange(user.id, "warning_count", v, user)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  {isMaster && (
                    <td className="px-4 py-3">
                      {user.role !== "master" && (
                        <form action={kickUser}>
                          <input
                            type="hidden"
                            name="user_id"
                            value={user.id}
                          />
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
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={isMaster ? 8 : 7}
                  className="px-4 py-8 text-center text-muted"
                >
                  {query
                    ? `"${query}" 검색 결과가 없습니다`
                    : "등록된 회원이 없습니다"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
