"use client";

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {ArrowLeft} from 'lucide-react';
import {useUiText} from '@/lib/i18n/ui';
import {supportInboxHref,type SupportViewState} from '@/lib/support-navigation';

/** The server scopes data first. This only replaces a safe, fixed inbox address. */
export default function SupportInboxRedirect({state,error,fallback=false}:{state:SupportViewState;error?:string;fallback?:boolean}){
  const router=useRouter(),t=useUiText();
  const inbox=supportInboxHref(state);
  const href=error?`${inbox}${inbox.includes('?')?'&':'?'}error=${encodeURIComponent(error.slice(0,500))}`:inbox;
  useEffect(()=>{router.replace(href,{scroll:false});},[router,href]);
  return fallback?<Link className="support-back-link" href={href}><ArrowLeft size={17} aria-hidden="true"/>{t("Back to inbox")}</Link>:null;
}
