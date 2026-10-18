'use client';
import LoadingBar from "./LoadingBar";
import {useRef,useState} from 'react';
import {unstable_rethrow} from 'next/navigation';
import {useUiText} from '@/lib/i18n/ui';
import type {OwnerEditResult} from '@/lib/owner-edit-contract';
export default function AccountProfileForm({name,email,phone,action,returnTo='profile'}:{name:string;email:string;phone:string;action:(form:FormData)=>Promise<OwnerEditResult>;returnTo?:'profile'|'account'}){
  const t=useUiText(),[error,setError]=useState(''),[busy,setBusy]=useState(false),[enteredName,setName]=useState(name),[enteredPhone,setPhone]=useState(phone);
  const pending=useRef(false);
  return <form className="panel form-grid" aria-label={t('Edit account details')} aria-busy={busy} action={async form=>{if(pending.current)return;pending.current=true;setBusy(true);setError('');try{const result=await action(form);if(result)setError(result.error);}catch(error){unstable_rethrow(error);setError('Unable to connect. Please try again.');}finally{pending.current=false;setBusy(false);}}}>
    {returnTo==='account'&&<input type="hidden" name="returnTo" value="account"/>}
    {busy&&<div className="field full"><LoadingBar/></div>}
    {error&&<p className="field full error" role="alert">{t(error)}</p>}
    <div className="field"><label htmlFor="profile-name">{t('Name')}</label><input id="profile-name" name="name" value={enteredName} onChange={e=>setName(e.target.value)} required maxLength={80} disabled={busy}/></div>
    <div className="field"><label htmlFor="profile-email">{t('Account email')}</label><input id="profile-email" value={email} readOnly/></div>
    <div className="field"><label htmlFor="profile-phone">{t('Account phone')}</label><input id="profile-phone" name="accountPhone" value={enteredPhone} onChange={e=>setPhone(e.target.value)} type="tel" maxLength={40} disabled={busy}/></div>
    <button className="btn brand" disabled={busy}>{t(busy?'Saving...':'Save changes')}</button>
  </form>;
}
