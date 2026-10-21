'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useUiText} from '@/lib/i18n/ui';
import {useBlockedBusinesses} from './useBlockedBusinesses';
export default function BlockedBusinessList(){const {list,save}=useBlockedBusinesses(),t=useUiText(),router=useRouter(),[error,setError]=useState('');
  async function remove(id?:number){try{await save(id?list.filter(v=>v.id!==id):[]);router.refresh();}catch(e){setError(e instanceof Error?e.message:'Please try again.');}}
  return <>{list.length?list.map(v=><div className="panel" key={v.id}><strong>{v.name}</strong><p>@{v.handle}</p><button className="btn secondary" onClick={()=>void remove(v.id)}>{t('Unblock business')}</button></div>):<p>{t('No blocked businesses.')}</p>}{Boolean(list.length)&&<button className="btn" onClick={()=>void remove()}>{t('Clear all')}</button>}{error&&<p role="alert">{t(error)}</p>}</>;}
