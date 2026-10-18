"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from 'react';
import {businessListOrigin} from '@/lib/business-workspace-navigation';
import styles from "./BusinessWorkspaceNavigation.module.css";

export type BusinessWorkspaceLink = {href:string;label:string;activePaths?:string[]};

/** The server supplies only destinations this principal may access. */
export default function BusinessWorkspaceNavigation({name,handle,parentHref,parentLabel,label,links,actorId,businessId}: {
  name:string;handle:string;parentHref:string;parentLabel:string;label:string;links:BusinessWorkspaceLink[];actorId:number;businessId:number;
}) {
  const pathname=usePathname();
  const sections=useRef<HTMLElement>(null);
  const [returnHref,setReturnHref]=useState(parentHref);
  useEffect(()=>{
    if(parentHref!=='/dashboard/admin/businesses'){setReturnHref(parentHref);return;}
    const key=`suqpage:business-list-origin:${actorId}:${businessId}`,params=new URLSearchParams(window.location.search);
    setReturnHref(parentHref);
    try{
      if(['nav_q','nav_page','nav_status'].some(field=>params.has(field))){const target=businessListOrigin(params);window.sessionStorage.setItem(key,target);setReturnHref(target);}
      else {const saved=window.sessionStorage.getItem(key);if(saved){const values=new URLSearchParams(saved.split('?')[1]||'');const hinted=new URLSearchParams([...values.entries()].map(([field,value])=>['nav_'+field,value]));setReturnHref(businessListOrigin(hinted));}}
    }catch{setReturnHref(parentHref);}
  },[pathname,parentHref,actorId,businessId]);
  const active=links.flatMap(link=>[link.href.split('?')[0],...(link.activePaths||[])].filter(path=>
    pathname===path||(path!=='/dashboard'&&pathname.startsWith(path+'/'))
  ).map(path=>({href:link.href,length:path.length}))).sort((a,b)=>b.length-a.length)[0]?.href;
  useEffect(()=>{
    const nav=sections.current;if(!nav)return;
    const reveal=()=>{
      const current=nav.querySelector<HTMLElement>('[aria-current="page"]');if(!current)return;
      const bounds=nav.getBoundingClientRect(),item=current.getBoundingClientRect();
      // Reveal only the local horizontal strip; scrollIntoView can also move the
      // document or its ancestors and take the user away from the selected task.
      if(item.left<bounds.left)nav.scrollLeft+=item.left-bounds.left;
      else if(item.right>bounds.right)nav.scrollLeft+=item.right-bounds.right;
    };
    reveal();
    if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(reveal);observer.observe(nav);return()=>observer.disconnect();}
  },[active,actorId,businessId]);
  return <section className={styles.context} aria-label={label}>
    <div className={styles.identity}><div><strong>{name}</strong><span>@{handle}</span></div><Link href={returnHref}>{parentLabel}</Link></div>
    <nav ref={sections} className={styles.sections} aria-label={label}>{links.map(link=><Link key={link.href} href={link.href} aria-current={active===link.href?'page':undefined}>{link.label}</Link>)}</nav>
  </section>;
}
