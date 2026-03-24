"use client";

import { useState } from "react";
import Link from "next/link";
import TwEmoji from "@/components/ui/TwEmoji";

interface ScheduleEvent {
  id: string;
  title: string;
  game_name: string;
  game_image: string | null;
  start_time: string;
  schedule_type: string;
  recurring_days: number[] | null;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getSchedulesForDate(
  schedules: ScheduleEvent[],
  year: number,
  month: number,
  day: number
) {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return schedules.filter((s) => {
    if (s.schedule_type === "recurring" && s.recurring_days) {
      const startDate = new Date(s.start_time);
      if (date >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) {
        return s.recurring_days.includes(dayOfWeek);
      }
      return false;
    }
    const local = new Date(s.start_time);
    const localDate = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
    return localDate === dateStr;
  });
}

export function Calendar({ schedules }: { schedules: ScheduleEvent[] }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">
          {currentYear}년 {currentMonth + 1}월
        </h2>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4L10 8L6 12" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0
                ? "text-red-400"
                : i === 6
                  ? "text-blue-400"
                  : "text-muted"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-card-border bg-card-border">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-24 bg-card p-1.5"
              />
            );
          }

          const daySchedules = getSchedulesForDate(
            schedules,
            currentYear,
            currentMonth,
            day
          );
          const isToday =
            day === todayDate &&
            currentMonth === todayMonth &&
            currentYear === todayYear;
          const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

          return (
            <div
              key={day}
              className={`min-h-24 p-1.5 ${
                isToday ? "bg-accent/10" : "bg-card"
              }`}
            >
              <span
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday
                    ? "bg-accent font-bold text-dark"
                    : dayOfWeek === 0
                      ? "text-red-400"
                      : dayOfWeek === 6
                        ? "text-blue-400"
                        : ""
                }`}
              >
                {day}
              </span>
              <div className="flex flex-col gap-0.5">
                {daySchedules.slice(0, 2).map((s) => (
                  <Link
                    key={s.id + day}
                    href={`/schedules/${s.id}`}
                    className="truncate rounded-md bg-dark px-1.5 py-0.5 text-[10px] font-bold leading-tight text-accent transition-colors hover:bg-dark-card dark:bg-accent dark:text-dark dark:hover:bg-accent-hover"
                    title={s.title}
                  >
                    {s.title}
                  </Link>
                ))}
                {daySchedules.length > 2 && (
                  <span className="px-1 text-[10px] text-muted">
                    +{daySchedules.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
