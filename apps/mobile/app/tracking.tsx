import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams} from 'expo-router';
import {isTrackingChallengeId,trackingEmail,TrackingError} from '../../../lib/tracking-contract';
import {API,secure,useApp} from '../src/runtime';
import {Button,Card,Copy,Field,Screen,Status} from '../src/ui';
import TransportPlanView from '../src/TransportPlanView';
import {createTrackingClient,createTrackingStore,createTrackingDetailLive,trackingReference,TrackingFailure,type TrackingSession,type TrackingChallenge,type TrackingShipmentList,type TrackingShipmentSummary,type TrackingShipmentDetail,type TrackingDetailState} from '../src/tracking-client';

const client=createTrackingClient(API),store=createTrackingStore(secure,API);
const connection='Unable to connect. Please try again.';
export default function Tracking(){
 const{t,locale}=useApp(),params=useLocalSearchParams<{reference?:string|string[]}>();
 const[session,setSession]=useState<TrackingSession|null>(null),[restoring,setRestoring]=useState(true),[storageBlocked,setStorageBlocked]=useState(false),[email,setEmail]=useState(''),[code,setCode]=useState(''),[challenge,setChallenge]=useState<TrackingChallenge|null>(null),[resendAt,setResendAt]=useState(0),[now,setNow]=useState(Date.now()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState(()=>trackingReference(params.reference)),[items,setItems]=useState<TrackingShipmentSummary[]>([]),[cursor,setCursor]=useState<string|null>(null),[listLoading,setListLoading]=useState(false),[listError,setListError]=useState('');
 const live=useRef(true),generation=useRef(0),pending=useRef<AbortController|null>(null),busyRef=useRef(false),listPending=useRef<AbortController|null>(null),cleanupToken=useRef('');
 const selectedRef=useRef(selected);selectedRef.current=selected;
 const invalidate=useCallback(()=>{generation.current++;pending.current?.abort();pending.current=null;listPending.current?.abort();listPending.current=null;},[]);
 useEffect(()=>{live.current=true;return()=>{live.current=false;invalidate();};},[invalidate]);
 useEffect(()=>{const value=trackingReference(params.reference);if(value)setSelected(value);},[params.reference]);
 useEffect(()=>{if(!challenge)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[challenge]);
 async function restore(){
  invalidate();const current=generation.current,controller=new AbortController();pending.current=controller;setRestoring(true);setError('');
  try{const saved=await store.read();if(!live.current||current!==generation.current)return;
   if(saved){const response=await client<{expiresAt:number}>('session',{token:saved.token,signal:controller.signal});if(!live.current||current!==generation.current)return;if(!response.value||response.value.expiresAt<=Date.now())throw new TrackingFailure('Verify your email to continue.',401);setSession({...saved,expiresAt:response.value.expiresAt});}
   setStorageBlocked(false);
  }catch(error){if(!live.current||current!==generation.current)return;
   if(error instanceof TrackingFailure&&error.status===401){try{await store.clear();}catch{setStorageBlocked(true);setError(connection);}}
   else{setStorageBlocked(true);setError(connection);}
  }finally{if(live.current&&current===generation.current){pending.current=null;setRestoring(false);}}
 }
 useEffect(()=>{void restore();},[]);
 const expire=useCallback(async()=>{
  invalidate();setSession(null);setItems([]);setCursor(null);setListError('');setListLoading(false);setChallenge(null);setCode('');setBusy(false);busyRef.current=false;
  try{await store.clear();if(live.current){setStorageBlocked(false);setError('Verify your email to continue.');}}
  catch{if(live.current){setStorageBlocked(true);setError(connection);}}
 },[invalidate]);
 useEffect(()=>{if(!session)return;const timer=setTimeout(()=>void expire(),Math.max(0,session.expiresAt-Date.now()));return()=>clearTimeout(timer);},[session,expire]);
 const loadList=useCallback(async(continuation:string|null=null)=>{
  if(!session||listPending.current)return;
  const current=generation.current,controller=new AbortController();listPending.current=controller;setListLoading(true);setListError('');
  try{const response=await client<TrackingShipmentList>('shipments'+(continuation?'?cursor='+continuation:''),{token:session.token,signal:controller.signal});if(!live.current||current!==generation.current||controller.signal.aborted)return;
   const value=response.value;if(!value||!Array.isArray(value.shipments)||value.shipments.some(item=>!trackingReference(item.reference))||value.nextCursor!==null&&!/^\d{1,20}$/.test(value.nextCursor))throw Error('Invalid shipments');
   setItems(old=>{const existing=continuation?old:[],seen=new Set(existing.map(item=>item.reference));return[...existing,...value.shipments.filter(item=>{if(seen.has(item.reference))return false;seen.add(item.reference);return true;})];});setCursor(value.nextCursor);
  }catch(error){if(!live.current||current!==generation.current||controller.signal.aborted)return;if(error instanceof TrackingFailure&&error.status===401)void expire();else setListError(connection);}
  finally{if(current===generation.current&&listPending.current===controller){listPending.current=null;if(live.current)setListLoading(false);}}
 },[session,expire]);
 useFocusEffect(useCallback(()=>{if(session&&!selectedRef.current)void loadList();return()=>{listPending.current?.abort();listPending.current=null;};},[session,loadList]));
 useEffect(()=>{if(session&&!selected&&!items.length)void loadList();},[session,selected,loadList]);
 async function authenticate(resend=false){
  if(busyRef.current||storageBlocked||restoring)return;
  if(resend&&Date.now()<resendAt)return;
  busyRef.current=true;setBusy(true);setError('');const current=generation.current,controller=new AbortController();pending.current=controller;
  try{
   if(!challenge||resend){const normalized=trackingEmail(email);const response=await client<TrackingChallenge>('request-code',{body:{email:normalized,locale:locale==='am'||locale==='om'?locale:'en'},signal:controller.signal});if(!live.current||current!==generation.current)return;
    if(!response.value||!isTrackingChallengeId(response.value.challengeId)||!Number.isFinite(response.value.resendAfter)||response.value.resendAfter<0)throw Error('Invalid challenge');setEmail(normalized);setChallenge(response.value);setCode('');setResendAt(Date.now()+response.value.resendAfter*1000);setNow(Date.now());
   }else{const response=await client<TrackingSession>('verify',{body:{challengeId:challenge.challengeId,code:code.trim()},signal:controller.signal});if(!live.current||current!==generation.current)return;
    const value=response.value;if(!value)throw Error('Invalid verification');
    try{await store.save(value);}catch{cleanupToken.current=value.token;setStorageBlocked(true);throw Error(connection);}
    if(!live.current||current!==generation.current)return;
    setSession(value);setChallenge(null);setCode('');setItems([]);setCursor(null);
   }
  }catch(error){if(live.current&&current===generation.current)setError(error instanceof TrackingFailure||error instanceof TrackingError?error.message:connection);}
  finally{if(current===generation.current){pending.current=null;busyRef.current=false;if(live.current)setBusy(false);}}
 }
 async function signOut(){
  if(busyRef.current)return;const token=session?.token||cleanupToken.current;invalidate();setSession(null);setItems([]);setCursor(null);setListLoading(false);setListError('');setSelected('');setEmail('');setChallenge(null);setCode('');setResendAt(0);setError('');setStorageBlocked(true);setBusy(true);busyRef.current=true;
  try{await store.clear();cleanupToken.current='';if(token)try{await client('logout',{token,body:{}});}catch(error){if(!(error instanceof TrackingFailure&&error.status===401))throw error;}
   if(live.current)setStorageBlocked(false);
  }catch{cleanupToken.current=token;if(live.current)setError(connection);}
  finally{busyRef.current=false;if(live.current)setBusy(false);}
 }
 const remaining=Math.max(0,Math.ceil((resendAt-now)/1000));
 return <Screen><Copy big heading>{t('Tracking')}</Copy>
  <Status loading={restoring} error={error}/>
  {storageBlocked?<Button label={t('Retry')} disabled={busy||restoring} onPress={()=>void(cleanupToken.current?signOut():restore())}/>:!restoring&&!session?<Card>
   <Copy>{t('Enter your email to view your shipment plans.')}</Copy>
   <Field label={t('Email')} value={email} maxLength={254} editable={!challenge&&!busy} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail}/>
   {challenge&&<><Copy muted>{t('Check your email for a six-digit code.')}</Copy><Field label={t('Verification code')} value={code} maxLength={6} editable={!busy} autoComplete="one-time-code" keyboardType="number-pad" onChangeText={setCode}/></>}
   <Status loading={busy}/><Button label={t(challenge?'Verify code':'Send code')} disabled={busy||!email.trim()||Boolean(challenge&&!/^\d{6}$/.test(code.trim()))} onPress={()=>void authenticate()}/>
   {challenge&&<><Button secondary label={remaining?t('Resend code in {seconds}s',{seconds:remaining}):t('Resend code')} disabled={busy||remaining>0} onPress={()=>void authenticate(true)}/><Button secondary label={t('Change email')} disabled={busy} onPress={()=>{invalidate();setChallenge(null);setCode('');setError('');}}/></>}
  </Card>:session&&selected?<TrackingDetail key={session.token+':'+selected} token={session.token} reference={selected} onBack={()=>setSelected('')} onExpired={expire}/>:session?<>
   <Copy heading>{t('Your shipments')}</Copy><Button secondary label={t('Sign out')} disabled={busy} onPress={()=>void signOut()}/><Status loading={listLoading} error={listError} retry={()=>void loadList()}/>
   {!listLoading&&!listError&&!items.length&&<Copy>{t('No shipments yet. Your transport agent can add a plan for this email.')}</Copy>}
   {items.map(item=><Card key={item.reference}><Copy heading>{item.label||item.reference}</Copy>{Boolean(item.label)&&<Copy muted>{item.reference}</Copy>}<View style={{flexDirection:'row',flexWrap:'wrap',gap:16}}><View style={{flex:1,minWidth:100}}><Copy muted>{t('From')}</Copy><Copy>{item.firstOrigin}</Copy></View><View style={{flex:1,minWidth:100}}><Copy muted>{t('To')}</Copy><Copy>{item.lastDestination}</Copy></View></View><Copy muted>{item.legCount===1?t('1 transport stage'):t('{count} transport stages',{count:item.legCount})}</Copy><Button secondary label={t('Open')} onPress={()=>setSelected(item.reference)}/></Card>)}
   {cursor&&<Button secondary label={t('Load more')} disabled={listLoading} onPress={()=>void loadList(cursor)}/>}
  </>:null}
 </Screen>;
}

function TrackingDetail({token,reference,onBack,onExpired}:{token:string;reference:string;onBack:()=>void;onExpired:()=>Promise<void>}){
 const{t}=useApp(),focused=useRef(false),controller=useRef<ReturnType<typeof createTrackingDetailLive>|null>(null);
 const[state,setState]=useState<TrackingDetailState>({shipment:null,loading:true,error:'',missing:false,unauthenticated:false});
 const updateActive=useCallback(()=>controller.current?.setActive(focused.current&&(AppState.currentState==='active'||AppState.currentState===null)&&(typeof document==='undefined'||!document.hidden&&document.hasFocus())),[]);
 useEffect(()=>{const live=createTrackingDetailLive({read:(session,ref,etag,signal)=>client<TrackingShipmentDetail>('shipments/'+ref,{token:session,etag:etag||undefined,signal}),onChange:setState});controller.current=live;live.setScope(token,reference);updateActive();
  const resume=()=>{updateActive();void live.refresh();},app=AppState.addEventListener('change',resume);if(typeof document!=='undefined')document.addEventListener('visibilitychange',resume);if(typeof window!=='undefined'){window.addEventListener('online',resume);window.addEventListener('focus',resume);window.addEventListener('blur',resume);}
  return()=>{live.stop();app.remove();if(controller.current===live)controller.current=null;if(typeof document!=='undefined')document.removeEventListener('visibilitychange',resume);if(typeof window!=='undefined'){window.removeEventListener('online',resume);window.removeEventListener('focus',resume);window.removeEventListener('blur',resume);}};
 },[token,reference,updateActive]);
 useFocusEffect(useCallback(()=>{focused.current=true;updateActive();return()=>{focused.current=false;updateActive();};},[updateActive]));
 useEffect(()=>{if(state.unauthenticated)void onExpired();},[state.unauthenticated,onExpired]);
 return <><Button secondary label={t('Back to shipments')} onPress={onBack}/><Status loading={state.loading} error={state.error} retry={()=>void controller.current?.refresh()}/>{state.missing&&<Copy>{t('This shipment is unavailable.')}</Copy>}{state.shipment&&<><Copy heading>{state.shipment.label||state.shipment.reference}</Copy>{Boolean(state.shipment.label)&&<Copy muted>{state.shipment.reference}</Copy>}<TransportPlanView plan={state.shipment}/></>}</>;
}
