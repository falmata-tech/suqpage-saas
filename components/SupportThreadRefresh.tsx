"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SupportThreadRefresh({ active, closed=false }: { active: boolean; closed?:boolean }) {
  const router = useRouter();
  const [isPending,startTransition]=useTransition();
  const pending=useRef(false);
  useEffect(()=>{pending.current=isPending;},[isPending]);
  useEffect(() => {
    if (!active) return;
    const refreshVisibleThread = () => {
      if (!document.hidden&&!pending.current){
        pending.current=true;
        startTransition(()=>router.refresh());
      }
    };
    const timer = window.setInterval(refreshVisibleThread, closed?30000:5000);
    document.addEventListener("visibilitychange", refreshVisibleThread);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisibleThread);
    };
  }, [active, closed, router,startTransition]);
  return null;
}
