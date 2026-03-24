"use client";

import { useState } from "react";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const PLAYER_OPTIONS = [2, 3, 4, 5, 6];

interface ScheduleFormFieldsProps {
  defaultValues?: {
    title?: string;
    start_time?: string;
    max_players?: number | null;
    description?: string | null;
    schedule_type?: "once" | "recurring";
    recurring_days?: number[] | null;
    recurring_time?: string | null;
  };
}

export function ScheduleFormFields({ defaultValues }: ScheduleFormFieldsProps) {
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">(
    defaultValues?.schedule_type ?? "once"
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    defaultValues?.recurring_days ?? []
  );
  const [maxPlayersMode, setMaxPlayersMode] = useState<"preset" | "custom">(
    defaultValues?.max_players && !PLAYER_OPTIONS.includes(defaultValues.max_players)
      ? "custom"
      : "preset"
  );
  const [maxPlayers, setMaxPlayers] = useState<number | "">(
    defaultValues?.max_players ?? ""
  );

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <>
      {/* 제목 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">제목 *</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaultValues?.title ?? ""}
          placeholder="제목을 입력하세요"
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
        />
      </label>

      {/* 단발성 / 정기게임 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">유형 *</span>
        <input type="hidden" name="schedule_type" value={scheduleType} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScheduleType("once")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              scheduleType === "once"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            단발성
          </button>
          <button
            type="button"
            onClick={() => setScheduleType("recurring")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              scheduleType === "recurring"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            정기게임
          </button>
        </div>
      </div>

      {/* 단발성: 시작 시간 */}
      {scheduleType === "once" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">시작 시간 *</span>
          <input
            type="datetime-local"
            name="start_time"
            required
            defaultValue={defaultValues?.start_time ?? ""}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        </label>
      )}

      {/* 정기게임: 첫 시작일 + 요일 + 시간 */}
      {scheduleType === "recurring" && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">첫 게임 시작일 *</span>
            <input
              type="date"
              name="start_date"
              required
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">정기 요일 *</span>
            <input
              type="hidden"
              name="recurring_days"
              value={JSON.stringify(selectedDays)}
            />
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                    selectedDays.includes(idx)
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">정기 시간 *</span>
            <input
              type="time"
              name="recurring_time"
              required
              defaultValue={defaultValues?.recurring_time ?? ""}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
            />
          </label>
        </>
      )}

      {/* 최대 인원 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">최대 인원</span>
        <input type="hidden" name="max_players" value={maxPlayers} />
        <div className="flex flex-wrap gap-1.5">
          {PLAYER_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setMaxPlayersMode("preset");
                setMaxPlayers(n);
              }}
              className={`h-10 w-12 rounded-lg border text-sm font-medium transition-colors ${
                maxPlayersMode === "preset" && maxPlayers === n
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {n}인
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMaxPlayersMode("custom");
              setMaxPlayers("");
            }}
            className={`rounded-lg border px-3 text-sm font-medium transition-colors ${
              maxPlayersMode === "custom"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            직접입력
          </button>
        </div>
        {maxPlayersMode === "custom" && (
          <input
            type="number"
            min="2"
            placeholder="인원 수 입력"
            value={maxPlayers}
            onChange={(e) =>
              setMaxPlayers(e.target.value ? Number(e.target.value) : "")
            }
            className="mt-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
          />
        )}
      </div>

      {/* 설명 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">설명</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="스케줄에 대한 설명을 입력하세요"
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
        />
      </label>
    </>
  );
}
