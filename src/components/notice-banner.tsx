"use client";

import { useSearchParams } from "next/navigation";

export function NoticeBanner() {
  const params = useSearchParams();
  if (params.get("notice") !== "admin") return null;
  return (
    <p role="status" className="bg-highlight px-5 py-3 text-center text-sm">
      That desk is for Lumen staff. Sign in with an admin account to continue.
    </p>
  );
}
