"use client";

import { updateUserPenalty } from "@/lib/actions/admin";

interface PenaltyCounterProps {
  userId: string;
  field: "noshow_count" | "late_count" | "warning_count";
  count: number;
  label: string;
  isMaster: boolean;
}

export function PenaltyCounter({
  userId,
  field,
  count,
  label,
  isMaster,
}: PenaltyCounterProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-muted">{label}</span>
      <div className="flex items-center gap-1">
        {isMaster && (
          <form action={updateUserPenalty}>
            <input type="hidden" name="user_id" value={userId} />
            <input type="hidden" name="field" value={field} />
            <input type="hidden" name="action" value="decrement" />
            <button
              type="submit"
              className="flex h-5 w-5 items-center justify-center rounded text-xs text-muted transition-colors hover:bg-card-border"
            >
              -
            </button>
          </form>
        )}
        <span
          className={`min-w-[20px] text-center text-sm font-bold ${
            count > 0 ? "text-red-500" : "text-muted"
          }`}
        >
          {count}
        </span>
        {isMaster && (
          <form action={updateUserPenalty}>
            <input type="hidden" name="user_id" value={userId} />
            <input type="hidden" name="field" value={field} />
            <input type="hidden" name="action" value="increment" />
            <button
              type="submit"
              className="flex h-5 w-5 items-center justify-center rounded text-xs text-muted transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950"
            >
              +
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
