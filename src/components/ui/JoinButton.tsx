"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinSchedule } from "@/lib/actions/schedule";
import { LoadingOverlay } from "@/components/ui/GlobalLoading";
import TwEmoji from "@/components/ui/TwEmoji";

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

    if (target.schedule_type === "once") {
      if (s.schedule_type === "once" && isSameDate(targetDate, sDate)) return s;
      if (s.schedule_type === "recurring" && s.recurring_days?.includes(targetDay)) return s;
    }

    if (target.schedule_type === "recurring" && target.recurring_days) {
      if (s.schedule_type === "once" && target.recurring_days.includes(sDate.getDay())) return s;
      if (s.schedule_type === "recurring" && s.recurring_days) {
        if (target.recurring_days.some((d) => s.recurring_days!.includes(d))) return s;
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
  const [conflict, setConflict] = useState<MySchedule | null>(null);
  const [showModal, setShowModal] = useState(false);

  function doJoin() {
    setShowModal(false);
    const formData = new FormData();
    formData.set("schedule_id", scheduleId);
    formData.set("status", "accepted");

    startTransition(async () => {
      await joinSchedule(formData);
      router.refresh();
    });
  }

  function handleClick() {
    const found = getConflict(
      {
        start_time: targetStartTime,
        schedule_type: targetScheduleType,
        recurring_days: targetRecurringDays,
      },
      mySchedules
    );

    if (found) {
      setConflict(found);
      setShowModal(true);
    } else {
      doJoin();
    }
  }

  return (
    <>
      <LoadingOverlay show={isPending} />

      {/* 겹침 확인 팝업 */}
      {showModal && conflict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-card-border bg-card p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <TwEmoji emoji="⚠️" size={48} />
            <p className="text-center text-sm font-medium">
              <span className="font-bold">
                {conflict.title} - {conflict.game_name}
              </span>
              과 플레이 날짜가 겹칩니다.
              <br />
              참가하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={doJoin}
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
              >
                참가
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-card-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

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
