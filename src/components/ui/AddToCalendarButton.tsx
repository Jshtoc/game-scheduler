"use client";

function formatLocalDate(date: Date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}${s}`;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function getNextDayOfWeek(startDate: Date, targetDay: number): Date {
  const date = new Date(startDate);
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

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams({ action: "TEMPLATE", ...params });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }

  function handleClick() {
    const localStart = new Date(startTime);
    const details = buildDetails();
    const urls: string[] = [];

    if (scheduleType === "recurring" && recurringDays && recurringDays.length > 0) {
      const startDayOfWeek = localStart.getDay();
      const isStartDayInRecurring = recurringDays.includes(startDayOfWeek);

      // 1. 첫 시작일이 정기 요일에 포함되지 않으면 단발 이벤트
      if (!isStartDayInRecurring) {
        urls.push(
          buildUrl({
            text: `${gameName} - ${title} (첫 게임)`,
            dates: `${formatLocalDate(localStart)}/${formatLocalDate(addHours(localStart, 2))}`,
            details,
          })
        );
      }

      // 2. 정기 반복 이벤트
      let recurStart: Date;
      if (isStartDayInRecurring) {
        recurStart = new Date(localStart);
      } else {
        const sorted = recurringDays
          .map((d) => getNextDayOfWeek(localStart, d))
          .sort((a, b) => a.getTime() - b.getTime());
        recurStart = sorted[0];
      }

      // 정기 시간 적용
      if (recurringTime) {
        const [h, m] = recurringTime.split(":").map(Number);
        recurStart.setHours(h, m, 0, 0);
      } else {
        recurStart.setHours(localStart.getHours(), localStart.getMinutes(), 0, 0);
      }

      const days = recurringDays.map((d) => dayToRRule[d]).join(",");
      urls.push(
        buildUrl({
          text: `${gameName} - ${title}`,
          dates: `${formatLocalDate(recurStart)}/${formatLocalDate(addHours(recurStart, 2))}`,
          details,
          recur: `RRULE:FREQ=WEEKLY;BYDAY=${days}`,
        })
      );
    } else {
      // 단발성
      urls.push(
        buildUrl({
          text: `${gameName} - ${title}`,
          dates: `${formatLocalDate(localStart)}/${formatLocalDate(addHours(localStart, 2))}`,
          details,
        })
      );
    }

    // 첫 번째는 바로, 두 번째부터는 딜레이
    urls.forEach((url, i) => {
      if (i === 0) {
        window.open(url, "_blank");
      } else {
        setTimeout(() => window.open(url, "_blank"), 300 * i);
      }
    });
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
