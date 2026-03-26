"use client";

import { useState } from "react";
import { ScheduleCard, type ScheduleCardData, type CardSize } from "@/components/ui/ScheduleCard";
import TwEmoji from "@/components/ui/TwEmoji";

const sizeOptions: { value: CardSize; label: string }[] = [
  { value: "large", label: "크게" },
  { value: "medium", label: "중간" },
  { value: "small", label: "작게" },
];

const gridClass: Record<CardSize, string> = {
  large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  medium: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  small: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5",
};

const PAGE_SIZE = 20;

export function ScheduleGrid({
  activeSchedules,
  pastSchedules,
  defaultSize = "large",
}: {
  activeSchedules: ScheduleCardData[];
  pastSchedules: ScheduleCardData[];
  defaultSize?: CardSize;
}) {
  const [size, setSize] = useState<CardSize>(defaultSize);
  const [activePage, setActivePage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const activeTotalPages = Math.ceil(activeSchedules.length / PAGE_SIZE);
  const pastTotalPages = Math.ceil(pastSchedules.length / PAGE_SIZE);

  const pagedActive = activeSchedules.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE
  );
  const pagedPast = pastSchedules.slice(
    (pastPage - 1) * PAGE_SIZE,
    pastPage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 크기 선택 */}
      <div className="flex gap-1.5 self-end">
        {sizeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSize(opt.value);
              setActivePage(1);
              setPastPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              size === opt.value
                ? "bg-accent text-dark"
                : "border border-card-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 진행 중 스케줄 */}
      {pagedActive.length > 0 ? (
        <>
          <div className={`grid gap-4 ${gridClass[size]}`}>
            {pagedActive.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} size={size} />
            ))}
          </div>
          {activeTotalPages > 1 && (
            <Pagination
              current={activePage}
              total={activeTotalPages}
              onChange={setActivePage}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-card-border py-16">
          <TwEmoji emoji="📭" size={40} />
          <p className="text-muted">스케줄이 없습니다</p>
        </div>
      )}

      {/* 종료된 스케줄 */}
      {pastSchedules.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted">
            종료된 스케줄 ({pastSchedules.length})
          </h2>
          <div className={`grid gap-4 ${gridClass[size]}`}>
            {pagedPast.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} size={size} />
            ))}
          </div>
          {pastTotalPages > 1 && (
            <Pagination
              current={pastPage}
              total={pastTotalPages}
              onChange={setPastPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="rounded-lg border border-card-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
      >
        이전
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            page === current
              ? "bg-accent text-dark"
              : "border border-card-border text-muted hover:border-accent hover:text-accent"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="rounded-lg border border-card-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
      >
        다음
      </button>
    </div>
  );
}
