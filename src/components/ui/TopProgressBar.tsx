"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopProgress() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);
  }

  // 페이지 변경 감지 → 완료
  useEffect(() => {
    stopProgress();
  }, [pathname, searchParams]);

  // 링크 클릭 감지 → 시작
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href === pathname) return;

      setVisible(true);
      setProgress(15);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 10));
      }, 400);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[200] h-0.5">
      <div
        className="h-full bg-accent transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "400ms",
        }}
      />
    </div>
  );
}
