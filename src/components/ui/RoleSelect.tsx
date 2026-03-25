"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/lib/actions/admin";
import { LoadingOverlay } from "@/components/ui/GlobalLoading";

export function RoleSelect({
  userId,
  currentRole,
  isMaster,
}: {
  userId: string;
  currentRole: string;
  isMaster: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isMaster || currentRole === "master") {
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    if (newRole === currentRole) return;

    const formData = new FormData();
    formData.set("user_id", userId);
    formData.set("role", newRole);

    startTransition(async () => {
      await updateUserRole(formData);
      alert("등급이 변경되었습니다.");
      router.refresh();
    });
  }

  return (
    <>
      <LoadingOverlay show={isPending} />
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        className="cursor-pointer rounded-lg border border-card-border bg-card px-2 py-1 text-xs font-medium outline-none focus:border-accent"
      >
        <option value="admin">관리자</option>
        <option value="member">회원</option>
      </select>
    </>
  );
}
