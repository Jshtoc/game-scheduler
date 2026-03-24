"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const sortOptions = [
  { value: "date", label: "가입일순" },
  { value: "role", label: "등급순" },
  { value: "noshow", label: "노쇼순" },
  { value: "late", label: "지각순" },
  { value: "warning", label: "경고순" },
];

export function UserFilter({
  currentSort,
  currentQuery,
  currentDir,
}: {
  currentSort: string;
  currentQuery: string;
  currentDir: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  function navigate(params: URLSearchParams) {
    router.push(`/admin/users?${params.toString()}`);
  }

  function handleSortClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSort === value) {
      // 같은 버튼 클릭 시 방향 토글
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", value);
      params.set("dir", "asc");
    }
    navigate(params);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    navigate(params);
  }

  function handleReset() {
    setQuery("");
    router.push("/admin/users");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임 검색..."
          className="w-48 rounded-xl border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
        >
          검색
        </button>
        {(currentQuery || currentSort !== "date") && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-card-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            초기화
          </button>
        )}
      </form>

      <div className="flex gap-1.5">
        {sortOptions.map((opt) => {
          const isActive = currentSort === opt.value;
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
                  className={currentDir === "desc" ? "rotate-180" : ""}
                >
                  <path d="M6 9V3M6 3L3 6M6 3L9 6" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
