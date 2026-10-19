'use client';
import type {OwnerEditResult} from '@/lib/owner-edit-contract';
import {useRef,useState} from 'react';
import {unstable_rethrow} from 'next/navigation';
import Link from 'next/link';
import HandleField from './HandleField';
import LoadingBar from './LoadingBar';
import {useUiText} from '@/lib/i18n/ui';
import type {HandleSettings} from '@/lib/business-handle-runtime';

export default function HandleSettingsForm({settings,businessId,admin=false,action,returnTo}:{settings:HandleSettings;businessId:number;admin?:boolean;action:(form:FormData)=>Promise<OwnerEditResult>;returnTo?:'page'|'profile'|'showroom'}) {
  const t=useUiText();const [ready,setReady]=useState(false);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
  const inFlight=useRef(false);
  const locked=!admin&&settings.nextChangeAt>Date.now();
  return <form aria-busy={saving} className="panel form-grid" onSubmit={async event=>{event.preventDefault();if(inFlight.current)return;const form=new FormData(event.currentTarget);inFlight.current=true;setSaving(true);setError('');try{const result=await action(form);if(result)setError(result.error);}catch(error){unstable_rethrow(error);setError('Unable to connect. Please try again.');}finally{inFlight.current=false;setSaving(false);}}}>
    {saving&&<div className="field full"><LoadingBar/></div>}
    {error?<p className="field full error" role="alert">{t(error)}</p>:null}
    <input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="expectedVersion" value={settings.contentVersion}/>
    {returnTo ? <input type="hidden" name="returnTo" value={returnTo}/> : null}
    <div className="field full"><h2>{t('Page address')}</h2><p className="handle-address" dir="ltr">mirtpage.com/@{settings.handle}</p></div>
    {locked?<div className="field full"><p>{t('You can change your handle once every 30 days. Contact support for help.')}</p><Link className="btn secondary" href="/dashboard/support">{t('Contact support')}</Link></div>:<>
      <HandleField currentHandle={settings.handle} onReady={setReady}/>
      <div className="field full"><small>{t('You can change your handle once every 30 days.')}</small></div>
      {admin?<div className="field full"><label htmlFor="handle-reason">{t('Support reason')}</label><textarea id="handle-reason" name="reason" required minLength={5} maxLength={300}/></div>:null}
      <div className="field full"><button className="btn brand" disabled={!ready||saving}>{saving?t('Saving...'):t('Save handle')}</button></div>
    </>}
  </form>;
}
