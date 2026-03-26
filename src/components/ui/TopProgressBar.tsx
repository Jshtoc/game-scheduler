"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;

      setLoading(true);
      setProgress(20);

      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return 90;
          return p + Math.random() * 15;
        });
      }, 300);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearInterval(interval);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[200] h-0.5">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
