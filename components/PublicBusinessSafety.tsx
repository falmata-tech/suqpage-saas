'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {Flag,Ban,X} from 'lucide-react';
import {useUiText} from '@/lib/i18n/ui';
import {REPORT_REASONS,type ReportReason,type BlockedBusiness} from '@/lib/catalog-safety';
import {useBlockedBusinesses} from './useBlockedBusinesses';
import styles from './PublicBusinessSafety.module.css';
export default function PublicBusinessSafety({business,productId,disabled,children}:{business:BlockedBusiness;productId?:number;disabled?:boolean;children:ReactNode}){
  const t=useUiText(),router=useRouter(),{list,save}=useBlockedBusinesses();
  const [open,setOpen]=useState(false),[reason,setReason]=useState<ReportReason>(REPORT_REASONS[0]),[details,setDetails]=useState(''),[notice,setNotice]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null),key=useRef('');
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  const blocked=!disabled&&list.some(item=>item.id===business.id);
  async function toggle(){setError('');setBusy(true);try{await save(blocked?list.filter(v=>v.id!==business.id):[...list,business]);router.refresh();}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  async function submit(event:React.FormEvent){event.preventDefault();setError('');setBusy(true);try{
    const r=await fetch('/api/catalog/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId:business.id,productId:productId??null,reason,details,idempotencyKey:key.current})});
    const v=await r.json();if(!r.ok)throw Error(v.error||'Report could not be saved.');setNotice('Report received.');setOpen(false);key.current='';
  }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  if(disabled)return children;
  return <>{blocked?<section className={styles.blocked}><h1>{t('Business blocked.')}</h1><p>{business.name}</p><button className="btn" onClick={toggle} disabled={busy}>{t('Unblock business')}</button></section>:children}
    <div className={styles.actions} aria-label={t('Listing options')}>
      {!blocked&&<button onClick={()=>{key.current=crypto.randomUUID();setNotice('');setError('');setOpen(true);}}><Flag size={16} aria-hidden="true"/>{t(productId?'Report product':'Report business')}</button>}
      <button onClick={toggle} disabled={busy}><Ban size={16} aria-hidden="true"/>{t(blocked?'Unblock business':'Block business')}</button>
      <a href="/blocked-businesses">{t('Blocked businesses')}</a>
    </div>
    {notice&&<p role="status" className={styles.notice}>{t(notice)}</p>}{error&&!open&&<p role="alert" className={styles.notice}>{t(error)}</p>}
    <dialog ref={dialog} className={styles.dialog} onCancel={()=>setOpen(false)} aria-labelledby="report-title"><form onSubmit={submit}>
      <div className={styles.heading}><h2 id="report-title">{t(productId?'Report product':'Report business')}</h2><button type="button" aria-label={t('Close')} onClick={()=>setOpen(false)}><X/></button></div>
      <p>{business.name}</p><label htmlFor="report-reason">{t('Reason')}</label><select id="report-reason" value={reason} onChange={e=>{setReason(e.target.value as ReportReason);key.current=crypto.randomUUID();}}>{REPORT_REASONS.map(v=><option key={v} value={v}>{t(v)}</option>)}</select>
      <label htmlFor="report-details">{t('Details (optional)')}</label><textarea id="report-details" maxLength={1500} rows={4} value={details} onChange={e=>{setDetails(e.target.value);key.current=crypto.randomUUID();}}/>
      {error&&<p role="alert">{t(error)}</p>}<button className="btn brand" disabled={busy}>{t(busy?'Sending…':'Send report')}</button>
    </form></dialog>
  </>;
}
