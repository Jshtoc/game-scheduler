"use client";

interface PenaltyCounterProps {
  value: number;
  label: string;
  isMaster: boolean;
  onChange: (value: number) => void;
}

export function PenaltyCounter({
  value,
  label,
  isMaster,
  onChange,
}: PenaltyCounterProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-muted">{label}</span>
      <div className="flex items-center gap-1">
        {isMaster && (
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex h-5 w-5 items-center justify-center rounded text-xs text-muted transition-colors hover:bg-card-border"
          >
            -
          </button>
        )}
        <span
          className={`min-w-[20px] text-center text-sm font-bold ${
            value > 0 ? "text-red-500" : "text-muted"
          }`}
        >
          {value}
        </span>
        {isMaster && (
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex h-5 w-5 items-center justify-center rounded text-xs text-muted transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
