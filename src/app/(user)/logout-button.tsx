"use client";

import TwEmoji from "@/components/ui/TwEmoji";

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
      >
        <TwEmoji emoji="🚪" size={18} />
        로그아웃
      </button>
    </form>
  );
}
