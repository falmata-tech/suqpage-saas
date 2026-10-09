"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Map,Star,Inbox,CircleUserRound} from "lucide-react";
import {useUiText} from "@/lib/i18n/ui";
import NavigationPendingIndicator from "@/components/NavigationPendingIndicator";
export default function PublicMobileNavigation({signedIn=false,onboarding=false}:{signedIn?:boolean;onboarding?:boolean}){
 const t=useUiText(),path=usePathname();
 const items=[{href:"/",label:"Market",icon:Map,active:path==="/"||path==="/discover"||path.startsWith("/@")},{href:"/featured",label:"Featured",icon:Star,active:path==="/featured"},{href:signedIn?"/dashboard/inquiries":"/login?next=inquiries",label:"Inquiries",icon:Inbox,active:path.startsWith("/dashboard/inquiries")},{href:onboarding?"/request":signedIn?"/dashboard/profile":"/login",label:"Account",icon:CircleUserRound,active:path==="/login"||path==="/request"||(path.startsWith("/dashboard")&&!path.startsWith("/dashboard/inquiries"))}];
 return <nav className="public-mobile-tabs" aria-label={t("Suqpage application navigation")}>{items.filter(item=>item.label!=='Inquiries'||signedIn).map(({href,label,icon:Icon,active})=><Link key={label} href={href} aria-current={active?"page":undefined}><Icon aria-hidden="true" size={21}/><span>{t(label)}</span><NavigationPendingIndicator label={t(label)}/></Link>)}</nav>;
}
