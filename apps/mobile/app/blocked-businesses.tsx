import React,{useState} from 'react';
import {useApp} from '../src/runtime';
import {useBlockedBusinesses} from '../src/blocked-businesses';
import {Screen,Copy,Card,Button,Status} from '../src/ui';
export default function Blocked(){const {t}=useApp(),{list,ready,save}=useBlockedBusinesses(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function remove(id?:number){setBusy(true);setError('');try{await save(id?list.filter(v=>v.id!==id):[]);}catch{setError('Could not save blocked businesses. Try again.');}finally{setBusy(false);}}
  return <Screen><Copy big>{t('Blocked businesses')}</Copy><Status loading={!ready} error={error}/>{ready&&!list.length&&<Copy>{t('No blocked businesses.')}</Copy>}{list.map(v=><Card key={v.id}><Copy big>{v.name}</Copy><Copy>@{v.handle}</Copy><Button secondary disabled={busy} label={t('Unblock business')} onPress={()=>void remove(v.id)}/></Card>)}{Boolean(list.length)&&<Button secondary disabled={busy} label={t('Clear all')} onPress={()=>void remove()}/>}</Screen>;}
