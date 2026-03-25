"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TwEmoji from "@/components/ui/TwEmoji";

interface ModalConfig {
  paramKey: string;
  message: string;
}

export function SuccessModal({ configs }: { configs: ModalConfig[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = configs.find(
    (c) => searchParams.get(c.paramKey) === "true"
  );

  if (!active) return null;

  function handleClose() {
    router.replace("/schedules");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-card-border bg-card p-8">
        <TwEmoji emoji="✅" size={48} />
        <p className="text-lg font-bold">{active.message}</p>
        <button
          onClick={handleClose}
          className="rounded-xl bg-accent px-8 py-2.5 text-sm font-bold text-dark transition-colors hover:bg-accent-hover"
        >
          확인
        </button>
      </div>
    </div>
  );
}
