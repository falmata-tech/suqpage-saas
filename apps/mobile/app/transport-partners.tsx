import React,{useEffect,useRef,useState} from 'react';
import * as Crypto from 'expo-crypto';
import {router} from 'expo-router';
import {useApp,request} from '../src/runtime';
import {Screen,Copy,Field,Button,Status} from '../src/ui';
const empty={companyName:'',contactName:'',email:'',phone:'',message:''};
export default function TransportPartnerInterest(){
 const{t,locale}=useApp(),[draft,setDraft]=useState(empty),[reference,setReference]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const live=useRef(true),sending=useRef(false),attempt=useRef<{signature:string;key:string}|null>(null),pending=useRef<AbortController|null>(null);
 useEffect(()=>{live.current=true;return()=>{live.current=false;pending.current?.abort();};},[]);
 const change=(key:keyof typeof empty,value:string)=>setDraft(old=>({...old,[key]:value}));
 async function submit(){
  if(sending.current)return;
  const value={...draft,locale:locale==='am'||locale==='om'?locale:'en'},signature=JSON.stringify(value);
  if(!attempt.current||attempt.current.signature!==signature)attempt.current={signature,key:Crypto.randomUUID()};
  sending.current=true;setBusy(true);setError('');const controller=new AbortController();pending.current=controller;
  try{
   const result=await request<{reference:string}>('transport-partners',{body:{...value,idempotencyKey:attempt.current.key},signal:controller.signal});
   if(!/^PI-[A-F0-9]{12}$/.test(result.reference))throw Error('We could not receive your request. Please try again later.');
   if(live.current){setReference(result.reference);setDraft(empty);attempt.current=null;}
  }catch(error){if(live.current)setError(error instanceof Error?error.message:'We could not receive your request. Please try again later.');}
  finally{sending.current=false;if(live.current)setBusy(false);}
 }
 return <Screen><Button secondary label={t('About MirtPage')} onPress={()=>router.navigate('/about')}/><Copy muted>{t('For independent logistics service providers')}</Copy><Copy big heading>{t('Get listed on MirtPage')}</Copy>{reference?<><Copy heading>{t('Request received. We’ll contact you about the next steps.')}</Copy><Copy>{t('Reference')}: {reference}</Copy></>:<>
  <Copy muted>{t('Freight brokerages, parcel express companies, and hub-and-spoke logistics operators can ask to be listed on MirtPage. Tell us about your company and we’ll contact you.')}</Copy>
  <Field label={t('Company name')} value={draft.companyName} maxLength={160} editable={!busy} onChangeText={v=>change('companyName',v)}/>
  <Field label={t('Contact name')} value={draft.contactName} maxLength={80} editable={!busy} onChangeText={v=>change('contactName',v)}/>
  <Field label={t('Email')} value={draft.email} maxLength={160} autoCapitalize="none" keyboardType="email-address" editable={!busy} onChangeText={v=>change('email',v)}/>
  <Field label={t('Phone (optional)')} value={draft.phone} maxLength={40} keyboardType="phone-pad" editable={!busy} onChangeText={v=>change('phone',v)}/>
  <Field label={t('About your company')} value={draft.message} maxLength={4000} multiline style={{minHeight:130}} editable={!busy} onChangeText={v=>change('message',v)}/>
  <Status error={error}/><Button label={t(busy?'Sending…':'Send request')} disabled={busy||!draft.companyName.trim()||!draft.contactName.trim()||!draft.email.trim()||!draft.message.trim()} onPress={()=>void submit()}/>
 </>}</Screen>;
}
