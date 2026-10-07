'use client';
import {useState} from 'react';
import Link from 'next/link';
import HandleField from './HandleField';
import {useUiText} from '@/lib/i18n/ui';
import type {HandleSettings} from '@/lib/business-handle-runtime';

export default function HandleSettingsForm({settings,businessId,admin=false,action,returnTo}:{settings:HandleSettings;businessId:number;admin?:boolean;action:(form:FormData)=>Promise<void>;returnTo?:'page'}) {
  const t=useUiText();const [ready,setReady]=useState(false);const [saving,setSaving]=useState(false);
  const locked=!admin&&settings.nextChangeAt>Date.now();
  return <form className="panel form-grid" action={async form=>{setSaving(true);try{await action(form);}finally{setSaving(false);}}}>
    <input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="expectedVersion" value={settings.contentVersion}/>
    {returnTo ? <input type="hidden" name="returnTo" value={returnTo}/> : null}
    <div className="field full"><h2>{t('Page address')}</h2><p className="handle-address" dir="ltr">suqpage.com/@{settings.handle}</p></div>
    {locked?<div className="field full"><p>{t('You can change your handle once every 30 days. Contact support for help.')}</p><Link className="btn secondary" href="/dashboard/support">{t('Contact support')}</Link></div>:<>
      <HandleField currentHandle={settings.handle} onReady={setReady}/>
      <div className="field full"><small>{t('You can change your handle once every 30 days.')}</small></div>
      {admin?<div className="field full"><label htmlFor="handle-reason">{t('Support reason')}</label><textarea id="handle-reason" name="reason" required minLength={5} maxLength={300}/></div>:null}
      <div className="field full"><button className="btn brand" disabled={!ready||saving}>{saving?t('Saving...'):t('Save handle')}</button></div>
    </>}
  </form>;
}
