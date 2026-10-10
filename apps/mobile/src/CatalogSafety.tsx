import React,{useRef,useState} from 'react';
import {View,Pressable,Text} from 'react-native';
import {router} from 'expo-router';
import {REPORT_REASONS,type ReportReason,type BlockedBusiness} from '../../../lib/catalog-safety';
import {request,useApp} from './runtime';
import {useBlockedBusinesses} from './blocked-businesses';
import {Button,Copy,Field,Status,Chip,s,colors} from './ui';
import {Sheet} from './chrome';
import {randomUUID} from 'expo-crypto';
export function CatalogSafety({business,productId,children}:{business:BlockedBusiness;productId?:number;children:React.ReactNode}){
  const {list,ready,save}=useBlockedBusinesses(),{t,basket,setBasket}=useApp();
  const blocked=list.some(v=>v.id===business.id);
  const [open,setOpen]=useState(false),[reason,setReason]=useState<ReportReason>(REPORT_REASONS[0]),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const key=useRef('');
  async function toggle(){setBusy(true);setError('');try{await save(blocked?list.filter(v=>v.id!==business.id):[...list,business]);if(!blocked&&basket?.shop.id===business.id)setBasket(null);}catch{setError('Could not save blocked businesses. Try again.');}finally{setBusy(false);}}
  async function report(){setBusy(true);setError('');try{await request('reports',{body:{businessId:business.id,productId:productId??null,reason,details,idempotencyKey:key.current}});setNotice('Report received.');setOpen(false);key.current='';}catch(e){setError(e instanceof Error?e.message:'Report could not be saved.');}finally{setBusy(false);}}
  if(!ready)return <Status loading/>;
  return <>{blocked?<View style={{padding:24,gap:16}}><Copy big>{t('Business blocked.')}</Copy><Copy>{business.name}</Copy></View>:children}
    <View style={[s.wrap,{padding:16,borderTopWidth:1,borderTopColor:colors.line}]}>
      {!blocked&&<Pressable accessibilityRole="button" onPress={()=>{key.current=randomUUID();setError('');setNotice('');setOpen(true);}} style={{minHeight:44,justifyContent:'center',padding:8}}><Text style={{color:colors.muted}}>{t(productId?'Report product':'Report business')}</Text></Pressable>}
      <Pressable disabled={busy} accessibilityRole="button" onPress={()=>void toggle()} style={{minHeight:44,justifyContent:'center',padding:8}}><Text style={{color:colors.muted}}>{t(blocked?'Unblock business':'Block business')}</Text></Pressable>
      <Pressable accessibilityRole="link" onPress={()=>router.push('/blocked-businesses')} style={{minHeight:44,justifyContent:'center',padding:8}}><Text style={{color:colors.muted}}>{t('Blocked businesses')}</Text></Pressable>
    </View>
    {Boolean(notice)&&<Copy>{t(notice)}</Copy>}{Boolean(error)&&!open&&<Status error={error}/>}
    <Sheet visible={open} title={t(productId?'Report product':'Report business')} onClose={()=>setOpen(false)}><Copy>{business.name}</Copy><Copy>{t('Reason')}</Copy><View style={s.wrap}>{REPORT_REASONS.map(v=><Chip key={v} label={t(v)} selected={reason===v} onPress={()=>{setReason(v);key.current=randomUUID();}}/>)}</View><Field label={t('Details (optional)')} value={details} multiline maxLength={1500} onChangeText={v=>{setDetails(v);key.current=randomUUID();}}/><Status error={error}/><Button label={t(busy?'Sending…':'Send report')} disabled={busy} onPress={()=>void report()}/></Sheet>
  </>;
}
