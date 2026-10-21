import React,{useRef,useState} from 'react';
import {View,Pressable,Text} from 'react-native';
import {router} from 'expo-router';
import {REPORT_REASONS,type ReportReason,type BlockedBusiness} from '../../../lib/catalog-safety';
import {request,useApp} from './runtime';
import {useBlockedBusinesses} from './blocked-businesses';
import {Button,Copy,Field,Status,Chip,s,colors} from './ui';
import {Sheet} from './chrome';
import {randomUUID} from 'expo-crypto';
import {businessInquiries} from './use-business-inquiry';
type SafetyView='options'|'report'|null;
export function CatalogSafety({business,productId,children}:{business:BlockedBusiness;productId?:number;children:React.ReactNode}){
  const {list,ready,save}=useBlockedBusinesses(),{t,basket,setBasket}=useApp();
  const blocked=list.some(v=>v.id===business.id);
  const [view,setView]=useState<SafetyView>(null),[reason,setReason]=useState<ReportReason>(REPORT_REASONS[0]),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const preferences=useRef({list,basket});preferences.current={list,basket};
  const key=useRef(''),inFlight=useRef(false),currentView=useRef<SafetyView>(null),retry=useRef<null|(()=>Promise<void>)>(null);
  function show(next:SafetyView){if(inFlight.current)return;currentView.current=next;setView(next);setError('');retry.current=null;}
  async function changeBlock(value:boolean){
    if(inFlight.current||currentView.current!=='options')return;
    inFlight.current=true;setBusy(true);setError('');retry.current=()=>changeBlock(value);
    try{
      const current=preferences.current;
      await save(value?[...current.list.filter(v=>v.id!==business.id),business]:current.list.filter(v=>v.id!==business.id));
      if(value){if(current.basket?.shop.id===business.id)setBasket(null);await businessInquiries.clear(business.id);}
      currentView.current=null;setView(null);retry.current=null;
    }catch{setError('Could not save blocked businesses. Try again.');}finally{inFlight.current=false;setBusy(false);}
  }
  async function report(){
    if(inFlight.current||currentView.current!=='report')return;
    inFlight.current=true;setBusy(true);setError('');retry.current=report;
    try{await request('reports',{body:{businessId:business.id,productId:productId??null,reason,details,idempotencyKey:key.current}});setNotice('Report received.');currentView.current=null;setView(null);key.current='';retry.current=null;}
    catch(e){setError(e instanceof Error?e.message:'Report could not be saved.');}finally{inFlight.current=false;setBusy(false);}
  }
  if(!ready)return <Status loading/>;
  return <>{blocked?<View style={{padding:24,gap:16}}><Copy big>{t('Business blocked.')}</Copy><Copy>{business.name}</Copy></View>:children}
    <View style={[s.wrap,{padding:16,borderTopWidth:1,borderTopColor:colors.line}]}>
      <Pressable testID="listing-options" accessibilityRole="button" accessibilityLabel={t('Listing options')} disabled={busy} onPress={()=>{setNotice('');show('options');}} style={{minHeight:48,minWidth:48,justifyContent:'center',padding:8}}><Text style={{color:colors.muted}}>{t('Listing options')}</Text></Pressable>
    </View>
    {Boolean(notice)&&<Copy>{t(notice)}</Copy>}
    <Sheet visible={view!==null} title={t(view==='report'?(productId?'Report product':'Report business'):'Listing options')} onClose={()=>show(null)}>{view!==null&&<View testID="listing-options-content" style={{gap:14}}>
      <Copy>{business.name}</Copy>
      {view==='options'?<>
        {!blocked&&<Button secondary label={t(productId?'Report product':'Report business')} disabled={busy} onPress={()=>{if(inFlight.current)return;key.current=randomUUID();show('report');}}/>}
        <Button secondary label={t(blocked?'Unblock business':'Block business')} disabled={busy} onPress={()=>void changeBlock(!blocked)}/>
        <Pressable accessibilityRole="link" accessibilityLabel={t('Blocked businesses')} disabled={busy} onPress={()=>{if(inFlight.current)return;show(null);router.push('/blocked-businesses');}} style={{minHeight:48,minWidth:48,justifyContent:'center',padding:8}}><Text style={{color:colors.ink}}>{t('Blocked businesses')}</Text></Pressable>
      </>:<>
        <Copy>{t('Reason')}</Copy><View pointerEvents={busy?'none':'auto'} style={s.wrap}>{REPORT_REASONS.map(v=><Chip key={v} minHeight={48} label={t(v)} selected={reason===v} onPress={()=>{if(inFlight.current)return;setReason(v);key.current=randomUUID();setError('');retry.current=null;}}/>)}</View>
        <Field label={t('Details (optional)')} value={details} multiline editable={!busy} maxLength={1500} onChangeText={v=>{if(inFlight.current)return;setDetails(v);key.current=randomUUID();setError('');retry.current=null;}}/>
        <Button secondary label={t('Back')} disabled={busy} onPress={()=>show('options')}/>
        <Button label={t(busy?'Sending…':'Send report')} disabled={busy} onPress={()=>void report()}/>
      </>}
      <Status loading={busy} error={error} retry={error?()=>{void retry.current?.();}:undefined}/>
      <Button secondary label={t('Cancel')} disabled={busy} onPress={()=>show(null)}/>
    </View>}</Sheet>
  </>;
}
