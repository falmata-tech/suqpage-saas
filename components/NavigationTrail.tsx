"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavigationTrail({ items, fallback }: { items:Array<{ label:string; href?:string }>; fallback:string }) {
  const router = useRouter();
  function back() {
    let canUseHistory = false;
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      canUseHistory = window.history.length > 1 && referrer?.origin === window.location.origin;
    } catch {}
    if (canUseHistory) router.back(); else router.push(fallback);
  }
  return <div className="navigation-trail">
    <nav aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index ? <span aria-hidden="true">/</span> : null}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>
    <button type="button" className="small-btn" onClick={back}>← Back</button>
  </div>;
}
