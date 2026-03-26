"use client";

import { useState } from "react";
import { ScheduleCard, type ScheduleCardData, type CardSize } from "@/components/ui/ScheduleCard";

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

export function ScheduleGrid({
  schedules,
  defaultSize = "large",
}: {
  schedules: ScheduleCardData[];
  defaultSize?: CardSize;
}) {
  const [size, setSize] = useState<CardSize>(defaultSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 self-end">
        {sizeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSize(opt.value)}
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
      <div className={`grid gap-4 ${gridClass[size]}`}>
        {schedules.map((schedule) => (
          <ScheduleCard key={schedule.id} schedule={schedule} size={size} />
        ))}
      </div>
    </div>
  );
}
