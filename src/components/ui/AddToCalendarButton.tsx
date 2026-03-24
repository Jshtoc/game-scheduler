"use client";

function toGoogleCalendarDate(iso: string) {
  const date = new Date(iso);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function getNextDayOfWeek(startDate: Date, targetDay: number): Date {
  const date = new Date(startDate);
  // 시작일 다음 날부터 찾기
  date.setDate(date.getDate() + 1);
  while (date.getDay() !== targetDay) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

const dayToRRule = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

interface AddToCalendarProps {
  title: string;
  gameName: string;
  startTime: string;
  description?: string | null;
  storeUrl?: string | null;
  scheduleType: "once" | "recurring";
  recurringDays?: number[] | null;
  recurringTime?: string | null;
}

export function AddToCalendarButton({
  title,
  gameName,
  startTime,
  description,
  storeUrl,
  scheduleType,
  recurringDays,
  recurringTime,
}: AddToCalendarProps) {
  function buildDetails() {
    return [
      `게임: ${gameName}`,
      description ?? "",
      storeUrl ? `Steam: ${storeUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openGoogleCalendar(params: URLSearchParams) {
    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank"
    );
  }

  function handleClick() {
    if (scheduleType === "recurring" && recurringDays && recurringDays.length > 0) {
      // 정기게임: 첫 시작일 1회 + 정기 요일 반복, 2개 탭
      const startDate = new Date(startTime);
      const startDayOfWeek = startDate.getDay();
      const isStartDayInRecurring = recurringDays.includes(startDayOfWeek);

      // 1. 첫 시작일이 정기 요일에 포함되지 않으면 단발 이벤트 생성
      if (!isStartDayInRecurring) {
        const start = toGoogleCalendarDate(startTime);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        const end = toGoogleCalendarDate(endDate.toISOString());

        const params = new URLSearchParams({
          action: "TEMPLATE",
          text: `${gameName} - ${title} (첫 게임)`,
          dates: `${start}/${end}`,
          details: buildDetails(),
        });
        openGoogleCalendar(params);
      }

      // 2. 정기 요일 반복 이벤트
      // 정기 요일 중 가장 가까운 날짜를 시작점으로
      let recurStart: Date;
      if (isStartDayInRecurring) {
        recurStart = startDate;
      } else {
        // 첫 시작일 이후 가장 가까운 정기 요일 찾기
        const sorted = recurringDays
          .map((d) => getNextDayOfWeek(startDate, d))
          .sort((a, b) => a.getTime() - b.getTime());
        recurStart = sorted[0];
      }

      // 정기 시간 적용
      if (recurringTime) {
        const [h, m] = recurringTime.split(":").map(Number);
        recurStart.setHours(h, m, 0, 0);
      } else {
        recurStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
      }

      const recurStartStr = toGoogleCalendarDate(recurStart.toISOString());
      const recurEndDate = new Date(recurStart.getTime() + 2 * 60 * 60 * 1000);
      const recurEndStr = toGoogleCalendarDate(recurEndDate.toISOString());

      const days = recurringDays.map((d) => dayToRRule[d]).join(",");
      const recurParams = new URLSearchParams({
        action: "TEMPLATE",
        text: `${gameName} - ${title}`,
        dates: `${recurStartStr}/${recurEndStr}`,
        details: buildDetails(),
        recur: `RRULE:FREQ=WEEKLY;BYDAY=${days}`,
      });

      // 첫 시작일이 정기 요일이면 1개만, 아니면 약간 딜레이 후 두 번째 탭
      if (!isStartDayInRecurring) {
        setTimeout(() => openGoogleCalendar(recurParams), 500);
      } else {
        openGoogleCalendar(recurParams);
      }
    } else {
      // 단발성
      const start = toGoogleCalendarDate(startTime);
      const endDate = new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000);
      const end = toGoogleCalendarDate(endDate.toISOString());

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: `${gameName} - ${title}`,
        dates: `${start}/${end}`,
        details: buildDetails(),
      });
      openGoogleCalendar(params);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Google 캘린더에 추가
    </button>
  );
}
