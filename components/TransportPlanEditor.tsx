"use client";

import {useEffect,useId,useRef,useState,type ReactNode} from "react";
import {unstable_rethrow} from "next/navigation";
import {ArrowDown,ArrowUp,Plus,Save,Trash2} from "lucide-react";
import type {TransportMethod,TransportPlan} from "@suqpage/contracts";
import {TRANSPORT_METHODS,TRANSPORT_PLAN_MAX_LEGS,type TransportPlanLegInput} from "@/lib/transport-plan-contract";
import {saveTransportPlanAction} from "@/app/dashboard/support/[id]/plan/actions";
import {useUiText} from "@/lib/i18n/ui";
import type {SupportViewState} from "@/lib/support-navigation";
import SupportNavigationFields from "./SupportNavigationFields";
import useFormExitGuard from "./useFormExitGuard";
import styles from "./TransportPlanStaff.module.css";
import type {OwnerEditResult} from "@/lib/owner-edit-contract";

type DraftLeg=Omit<TransportPlanLegInput,'method'>&{key:string;method:TransportMethod|''};
const methodKeys:Record<TransportMethod,string>={air:'Air',truck:'Truck',van:'Van',car:'Car',motorcycle:'Motorcycle'};

type EditorProps={plan:TransportPlan|null;cancelHref:string;submitLabel?:string;visibilityMessage?:string;focusFirstLeg?:boolean}&(
 |{action?:undefined;conversationId:number;publicRef:string;navigation:SupportViewState;formFields?:never;beforeLegs?:never}
 |{action:(form:FormData)=>Promise<OwnerEditResult>;conversationId?:never;publicRef?:never;navigation?:never;formFields?:ReactNode;beforeLegs?:ReactNode}
);

/** Legacy chat wrapper and independent shipment wrapper share only explicit form UI. */
export default function TransportPlanEditor({conversationId,publicRef,plan,navigation,cancelHref,action=saveTransportPlanAction,formFields,beforeLegs,submitLabel='Save plan',visibilityMessage='These route details are visible to the requester and anyone with the link.',focusFirstLeg=true}:EditorProps){
  const t=useUiText(),prefix=useId(),serial=useRef(1);
  const expectedVersion=useRef(plan?.version||0);
  const [legs,setLegs]=useState<DraftLeg[]>(()=>plan?.legs.length?plan.legs.map(leg=>({...leg,key:leg.id})):[{id:null,key:'new-0',providerName:'',method:'',origin:'',destination:''}]);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[focusKey,setFocusKey]=useState<string|null>(focusFirstLeg?legs[0]?.key||null:null);
  const pending=useRef(false),form=useRef<HTMLFormElement>(null),inputs=useRef(new Map<string,HTMLInputElement>()),errorRef=useRef<HTMLParagraphElement>(null);
  const guard=useFormExitGuard(form,pending);
  useEffect(()=>{if(focusKey){inputs.current.get(focusKey)?.focus();setFocusKey(null);}},[focusKey,legs]);
  useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
  const update=(key:string,patch:Partial<Pick<DraftLeg,'providerName'|'method'|'origin'|'destination'>>)=>setLegs(current=>current.map(leg=>leg.key===key?{...leg,...patch}:leg));
  const move=(index:number,direction:-1|1)=>setLegs(current=>{
    const target=index+direction;
    if(target<0||target>=current.length)return current;
    const next=[...current];[next[index],next[target]]=[next[target],next[index]];return next;
  });
  return <>
    <form ref={form} className={styles.editor} aria-busy={busy} onSubmit={async event=>{
      event.preventDefault();if(pending.current)return;
      const data=new FormData(event.currentTarget);
      pending.current=true;setBusy(true);setError('');
      try{
        const result=await action(data);
        if(result?.error)setError(result.error);
      }catch(failure){unstable_rethrow(failure);setError('Unable to connect. Please try again.');}
      finally{pending.current=false;setBusy(false);}
    }}>
      {navigation?<SupportNavigationFields state={navigation}/>:null}
      {conversationId!==undefined?<input type="hidden" name="conversationId" value={conversationId}/>:null}
      {publicRef!==undefined?<input type="hidden" name="publicRef" value={publicRef}/>:null}
      {formFields}
      <input type="hidden" name="expectedVersion" value={expectedVersion.current}/>
      <input type="hidden" name="legs" value={JSON.stringify(legs.map(({key:_key,...leg})=>leg))}/>
      <p className={styles.visibility}>{t(visibilityMessage)}</p>
      <fieldset disabled={busy}>
        {beforeLegs}
        <ol className={styles.legs}>
          {legs.map((leg,index)=>{
            const id=`${prefix}-${leg.key}`;
            return <li key={leg.key} className={styles.leg} data-transport-leg>
              <div className={styles.legHeading}>
                <h2 id={id+'-heading'}>{t('Leg {value1}',{value1:index+1})}</h2>
                <div className={styles.legActions}>
                  <button type="button" aria-label={`${t('Move up')}: ${t('Leg {value1}',{value1:index+1})}`} disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={16} aria-hidden="true"/>{t('Move up')}</button>
                  <button type="button" aria-label={`${t('Move down')}: ${t('Leg {value1}',{value1:index+1})}`} disabled={index===legs.length-1} onClick={()=>move(index,1)}><ArrowDown size={16} aria-hidden="true"/>{t('Move down')}</button>
                  <button type="button" aria-label={`${t('Remove leg')}: ${t('Leg {value1}',{value1:index+1})}`} disabled={legs.length===1} onClick={()=>{
                    const next=legs.filter(item=>item.key!==leg.key);setLegs(next);setFocusKey(next[Math.min(index,next.length-1)]?.key||null);
                  }}><Trash2 size={16} aria-hidden="true"/>{t('Remove leg')}</button>
                </div>
              </div>
              <div className={styles.pair}>
                <label htmlFor={id+'-provider'}>{t('Provider name')}<input id={id+'-provider'} ref={node=>{if(node)inputs.current.set(leg.key,node);else inputs.current.delete(leg.key);}} required maxLength={120} value={leg.providerName} onChange={event=>update(leg.key,{providerName:event.target.value})}/></label>
                <label htmlFor={id+'-method'}><span id={id+'-method-label'}>{t('Transport method')}</span><select id={id+'-method'} aria-labelledby={id+'-method-label'} required value={leg.method} onChange={event=>update(leg.key,{method:event.target.value as TransportMethod})}>
                  <option value="" disabled>{t('Choose a transport method')}</option>
                  {TRANSPORT_METHODS.map(method=><option key={method} value={method}>{t(methodKeys[method])}</option>)}
                </select></label>
              </div>
              <div className={styles.pair}>
                <label htmlFor={id+'-origin'}>{t('From')}<input id={id+'-origin'} required maxLength={120} value={leg.origin} onChange={event=>update(leg.key,{origin:event.target.value})}/></label>
                <label htmlFor={id+'-destination'}>{t('To')}<input id={id+'-destination'} required maxLength={120} value={leg.destination} onChange={event=>update(leg.key,{destination:event.target.value})}/></label>
              </div>
            </li>;
          })}
        </ol>
        <div className={styles.actions}><button type="button" className="btn secondary" disabled={legs.length>=TRANSPORT_PLAN_MAX_LEGS} onClick={()=>{
          const key='new-'+serial.current++;setLegs(current=>[...current,{id:null,key,providerName:'',method:'',origin:'',destination:''}]);setFocusKey(key);
        }}><Plus size={18} aria-hidden="true"/>{t('Add leg')}</button></div>
      </fieldset>
      {error?<p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">{t(error)}</p>:null}
      <div className={styles.actions}>
        <button className="btn brand" disabled={busy}><Save size={18} aria-hidden="true"/>{t(busy?'Saving…':submitLabel)}</button>
        <button type="button" className="btn secondary" disabled={busy} onClick={()=>guard.requestExit(cancelHref)}>{t('Cancel')}</button>
      </div>
    </form>
    {guard.confirmation}
  </>;
}
