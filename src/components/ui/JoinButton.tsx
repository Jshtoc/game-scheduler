"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinSchedule } from "@/lib/actions/schedule";
import { LoadingOverlay } from "@/components/ui/GlobalLoading";

interface MySchedule {
  title: string;
  game_name: string;
  start_time: string;
  schedule_type: string;
  recurring_days: number[] | null;
}

interface JoinButtonProps {
  scheduleId: string;
  targetStartTime: string;
  targetScheduleType: string;
  targetRecurringDays: number[] | null;
  isFull: boolean;
  mySchedules: MySchedule[];
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getConflict(
  target: { start_time: string; schedule_type: string; recurring_days: number[] | null },
  mySchedules: MySchedule[]
): MySchedule | null {
  const targetDate = new Date(target.start_time);
  const targetDay = targetDate.getDay();

  for (const s of mySchedules) {
    const sDate = new Date(s.start_time);

    // 대상이 단발성
    if (target.schedule_type === "once") {
      // 기존이 단발성: 날짜 비교
      if (s.schedule_type === "once" && isSameDate(targetDate, sDate)) {
        return s;
      }
      // 기존이 정기: 대상 날짜의 요일이 정기 요일에 포함
      if (s.schedule_type === "recurring" && s.recurring_days?.includes(targetDay)) {
        return s;
      }
    }

    // 대상이 정기
    if (target.schedule_type === "recurring" && target.recurring_days) {
      // 기존이 단발성: 기존 날짜의 요일이 대상 정기 요일에 포함
      if (s.schedule_type === "once" && target.recurring_days.includes(sDate.getDay())) {
        return s;
      }
      // 기존이 정기: 요일 겹침
      if (s.schedule_type === "recurring" && s.recurring_days) {
        const overlap = target.recurring_days.some((d) => s.recurring_days!.includes(d));
        if (overlap) return s;
      }
    }
  }

  return null;
}

export function JoinButton({
  scheduleId,
  targetStartTime,
  targetScheduleType,
  targetRecurringDays,
  isFull,
  mySchedules,
}: JoinButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function doJoin() {
    const formData = new FormData();
    formData.set("schedule_id", scheduleId);
    formData.set("status", "accepted");

    startTransition(async () => {
      await joinSchedule(formData);
      router.refresh();
    });
  }

  function handleClick() {
    const conflict = getConflict(
      {
        start_time: targetStartTime,
        schedule_type: targetScheduleType,
        recurring_days: targetRecurringDays,
      },
      mySchedules
    );

    if (conflict) {
      const ok = confirm(
        `"${conflict.title} - ${conflict.game_name}"과 플레이 날짜가 겹칩니다. 참가하시겠습니까?`
      );
      if (!ok) return;
    }

    doJoin();
  }

  return (
    <>
      <LoadingOverlay show={isPending} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isFull}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-dark transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {isFull ? "마감됨" : "참가하기"}
      </button>
    </>
  );
}
