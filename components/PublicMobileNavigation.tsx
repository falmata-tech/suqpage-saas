"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Map,Star,CircleUserRound,Info} from "lucide-react";
import {useUiText} from "@/lib/i18n/ui";
import NavigationPendingIndicator from "@/components/NavigationPendingIndicator";
export default function PublicMobileNavigation({signedIn=false,onboarding=false,dashboardHref="/dashboard"}:{signedIn?:boolean;onboarding?:boolean;dashboardHref?:string}){
 const t=useUiText(),path=usePathname();
 const items=[{href:"/",label:"Market",icon:Map,active:path==="/"||path==="/discover"||path.startsWith("/@")},{href:"/featured",label:"Featured",icon:Star,active:path==="/featured"},{href:"/about",label:"About",icon:Info,active:path==="/about"||["/privacy","/terms","/account-deletion"].includes(path)},{href:onboarding?"/request":signedIn?dashboardHref:"/login",label:signedIn?"Account":"Login",icon:CircleUserRound,active:path==="/login"||path==="/request"||path.startsWith("/dashboard")}];
 const visible=items;
 return <nav style={{gridTemplateColumns:`repeat(${visible.length}, minmax(0, 1fr))`}} className="public-mobile-tabs" aria-label={t("MirtPage application navigation")}>{visible.map(({href,label,icon:Icon,active})=><Link key={label} href={href} aria-current={active?"page":undefined}><Icon aria-hidden="true" size={21}/><span>{t(label)}</span><NavigationPendingIndicator label={t(label)}/></Link>)}</nav>;
}
