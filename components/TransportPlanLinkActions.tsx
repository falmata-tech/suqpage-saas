"use client";

import {useEffect,useId,useRef,useState} from "react";
import {unstable_rethrow} from "next/navigation";
import {Copy,RefreshCw} from "lucide-react";
import {replaceTransportPlanLinkAction} from "@/app/dashboard/support/[id]/plan/actions";
import type {SupportViewState} from "@/lib/support-navigation";
import {useUiText} from "@/lib/i18n/ui";
import SupportNavigationFields from "./SupportNavigationFields";
import styles from "./TransportPlanStaff.module.css";

export default function TransportPlanLinkActions({conversationId,publicRef,version,sharePath,navigation}:{
  conversationId:number;publicRef:string;version:number;sharePath:string;navigation:SupportViewState;
}){
  const t=useUiText(),heading=useId(),dialog=useRef<HTMLDialogElement>(null),replaceButton=useRef<HTMLButtonElement>(null),fallbackInput=useRef<HTMLInputElement>(null),pending=useRef(false);
  const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false),[fallback,setFallback]=useState('');
  const wasOpen=useRef(false);
  useEffect(()=>{
    if(confirm&&!dialog.current?.open)dialog.current?.showModal();
    if(!confirm&&dialog.current?.open)dialog.current.close();
    if(!confirm&&wasOpen.current)replaceButton.current?.focus();
    wasOpen.current=confirm;
  },[confirm]);
  useEffect(()=>{if(fallback){fallbackInput.current?.focus();fallbackInput.current?.select();}},[fallback]);
  return <section className={styles.linkActions} aria-label={t('Copy plan link')}>
    <p className={styles.visibility}>{t('Anyone with this link can view the plan.')}</p>
    <div className={styles.actions}>
      <button type="button" className="btn secondary" onClick={async()=>{
        setCopied(false);setFallback('');
        if(!/^\/transport-plan#[a-f0-9]{64}$/.test(sharePath))return;
        const link=new URL(sharePath,window.location.origin).href;
        try{await navigator.clipboard.writeText(link);setCopied(true);}catch{setFallback(link);}
      }}><Copy size={18} aria-hidden="true"/>{t('Copy plan link')}</button>
      <button ref={replaceButton} type="button" className="btn secondary" onClick={()=>{setError('');setConfirm(true);}}><RefreshCw size={18} aria-hidden="true"/>{t('Replace plan link')}</button>
    </div>
    {copied?<p role="status">{t('Copied')}</p>:null}
    {fallback?<label>{t('Select and copy the link below.')}<input ref={fallbackInput} readOnly value={fallback}/></label>:null}
    <dialog ref={dialog} className={styles.confirmation} aria-labelledby={heading} onCancel={event=>{if(pending.current)event.preventDefault();else setConfirm(false);}} onClose={()=>{if(!pending.current)setConfirm(false);}}>
      <h2 id={heading}>{t('Replace this plan link?')}</h2>
      <p>{t('The previous link will stop working.')}</p>
      <form aria-busy={busy} onSubmit={async event=>{
        event.preventDefault();if(pending.current)return;
        const data=new FormData(event.currentTarget);pending.current=true;setBusy(true);setError('');
        try{const result=await replaceTransportPlanLinkAction(data);if(result?.error)setError(result.error);}
        catch(failure){unstable_rethrow(failure);setError('Unable to connect. Please try again.');}
        finally{pending.current=false;setBusy(false);}
      }}>
        <SupportNavigationFields state={navigation}/>
        <input type="hidden" name="conversationId" value={conversationId}/>
        <input type="hidden" name="publicRef" value={publicRef}/>
        <input type="hidden" name="expectedVersion" value={version}/>
        {error?<p className={styles.error} role="alert">{t(error)}</p>:null}
        <div className={styles.actions}>
          <button type="button" className="btn secondary" autoFocus disabled={busy} onClick={()=>setConfirm(false)}>{t('Cancel')}</button>
          <button className="btn brand" disabled={busy}>{t(busy?'Saving…':'Replace link')}</button>
        </div>
      </form>
    </dialog>
  </section>;
}
