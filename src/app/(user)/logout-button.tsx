"use client";

import TwEmoji from "@/components/ui/TwEmoji";

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <TwEmoji emoji="🚪" size={18} />
        로그아웃
      </button>
    </form>
  );
}
