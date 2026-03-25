"use client";

import { useState } from "react";
import { LoadingOverlay } from "@/components/ui/GlobalLoading";

export function LoadingForm({
  action,
  children,
  className,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    setLoading(true);
  }

  return (
    <>
      <LoadingOverlay show={loading} />
      <form
        action={action}
        onSubmit={handleSubmit}
        className={className}
      >
        {children}
      </form>
    </>
  );
}
