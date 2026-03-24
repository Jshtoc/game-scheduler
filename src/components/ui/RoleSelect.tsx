"use client";

import { updateUserRole } from "@/lib/actions/admin";

export function RoleSelect({
  userId,
  currentRole,
  isMaster,
}: {
  userId: string;
  currentRole: string;
  isMaster: boolean;
}) {
  if (!isMaster || currentRole === "master") {
    return null;
  }

  return (
    <form action={updateUserRole}>
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => {
          const form = e.target.closest("form");
          if (form) form.requestSubmit();
        }}
        className="rounded-lg border border-card-border bg-card px-2 py-1 text-xs font-medium outline-none focus:border-accent"
      >
        <option value="admin">관리자</option>
        <option value="member">회원</option>
      </select>
    </form>
  );
}
