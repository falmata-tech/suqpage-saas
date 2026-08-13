import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NavigationTrail({ items, fallback }: { items:Array<{ label:string; href?:string }>; fallback:string }) {
  return <div className="navigation-trail">
    <nav aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index ? <span aria-hidden="true">/</span> : null}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>
    <Link className="small-btn navigation-back" href={fallback}><ArrowLeft aria-hidden="true" size={16}/>Back</Link>
  </div>;
}
