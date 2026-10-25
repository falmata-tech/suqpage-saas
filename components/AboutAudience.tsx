"use client";

import {useRef,useState,type KeyboardEvent} from "react";
import Link from "next/link";
import {ArrowRight,MapPin,MessageCircle,Search,Store} from "lucide-react";
import {useUiText} from "@/lib/i18n/ui";
import {ABOUT_STOREFRONT_SECTIONS,CUSTOMER_MAP_COPY} from "@/lib/storefront-copy";
import {TRANSPORT_COPY} from "@/lib/i18n/transport-copy";
import styles from "./AboutStorefront.module.css";

const icons={shop:Store,map:MapPin,chat:MessageCircle,search:Search};
type Audience=typeof ABOUT_STOREFRONT_SECTIONS[number]["id"];

export default function AboutAudience(){
 const t=useUiText(),[audience,setAudience]=useState<Audience>("customers"),tabs=useRef<Array<HTMLButtonElement|null>>([]);
 function navigate(event:KeyboardEvent<HTMLButtonElement>,index:number){
  const next=event.key==="Home"?0:event.key==="End"?ABOUT_STOREFRONT_SECTIONS.length-1:event.key==="ArrowRight"?(index+1)%ABOUT_STOREFRONT_SECTIONS.length:event.key==="ArrowLeft"?(index+ABOUT_STOREFRONT_SECTIONS.length-1)%ABOUT_STOREFRONT_SECTIONS.length:null;
  if(next===null)return;event.preventDefault();setAudience(ABOUT_STOREFRONT_SECTIONS[next].id);tabs.current[next]?.focus();
 }
 return <div className={styles.page+" public-about-experience"}>
  <header className={styles.header}><h1>{t("About AfricMade")}</h1>
   <div role="tablist" aria-label={t("About AfricMade")} className={styles.audiences}>{ABOUT_STOREFRONT_SECTIONS.map((section,index)=><button key={section.id} ref={node=>{tabs.current[index]=node;}} type="button" role="tab" id={`about-tab-${section.id}`} aria-controls={`for-${section.id}`} aria-selected={audience===section.id} tabIndex={audience===section.id?0:-1} onClick={()=>setAudience(section.id)} onKeyDown={event=>navigate(event,index)}>{t(section.label)}</button>)}</div>
  </header>
  {ABOUT_STOREFRONT_SECTIONS.map(section=><section key={section.id} id={`for-${section.id}`} role="tabpanel" aria-labelledby={`about-tab-${section.id}`} hidden={audience!==section.id} className={`${styles.section} ${section.id==="businesses"?styles.business:""}`}>
   <div className={styles.intro}><h2>{t(section.title)}</h2><p>{t(section.description)}</p>
    <Link className={styles.action} href={section.id==="customers"?"/":"/login"}>{t(section.action)} <ArrowRight aria-hidden="true"/></Link>
    {section.id==="customers"&&<Link className={styles.mapLink} href="/?view=map"><MapPin aria-hidden="true"/><span><strong>{t(CUSTOMER_MAP_COPY.title)}</strong>{t(CUSTOMER_MAP_COPY.description)}</span></Link>}
   </div>
   <div className={styles.benefits}>{section.benefits.map(benefit=>{const Icon=icons[benefit.icon];return <article key={benefit.title}><span className={styles.icon}><Icon aria-hidden="true"/></span><div><h3>{t(benefit.title)}</h3><p>{t(benefit.description)}</p></div></article>;})}</div>
  </section>)}
  <footer className={styles.footer}><nav aria-label={t('About AfricMade')}><Link href="/?chat=transport">{t(TRANSPORT_COPY.launcherTitle)}</Link><Link href="/transport-partners">{t("Logistics service providers: Ask to be listed")}</Link><Link href="/showrooms">{t("Businesses")}</Link><Link href="/privacy">{t("Privacy")}</Link><Link href="/terms">{t("Terms")}</Link><Link href="/account-deletion">{t("Delete account")}</Link></nav><div className={styles.companyDetails}><span>{t('Jigjiga, Somali Region, Ethiopia')}</span><span>© {new Date().getFullYear()} MarketVision Technology</span></div></footer>
 </div>;
}
