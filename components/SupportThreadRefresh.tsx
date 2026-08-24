"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SupportThreadRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const refreshVisibleThread = () => {
      if (!document.hidden) router.refresh();
    };
    const timer = window.setInterval(refreshVisibleThread, 5000);
    document.addEventListener("visibilitychange", refreshVisibleThread);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisibleThread);
    };
  }, [active, router]);
  return null;
}
