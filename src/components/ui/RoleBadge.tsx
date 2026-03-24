import type { UserRole } from "@/lib/auth";

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  master: {
    label: "마스터",
    className: "bg-accent text-dark",
  },
  admin: {
    label: "관리자",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  member: {
    label: "회원",
    className: "bg-card-border text-muted",
  },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
