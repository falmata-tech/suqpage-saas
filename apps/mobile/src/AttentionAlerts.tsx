import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {AppState,Platform,Pressable,View} from 'react-native';
import {router,usePathname,useGlobalSearchParams} from 'expo-router';
import type {AttentionFeed,AttentionItem} from '../../../lib/attention-contract';
import {attentionLabel} from '../../../lib/i18n/attention-copy';
import {useApp,request} from './runtime';
import {attentionRoute,notificationDevice,listenToAttentionTap} from './attention-platform';
import {Copy,Button,Icon,Status,colors,s} from './ui';
import {Sheet} from './chrome';
type Feed=AttentionFeed & {push?:{web:{available:boolean;publicKey:string};expo:{available:boolean}}};
type State={feed:Feed|null;reload:()=>Promise<void>;save:(body:Record<string,unknown>)=>Promise<void>};
const Context=createContext<State|null>(null);
export function openAttention(destination:unknown){
  if(!destination||typeof destination!=='object')return;const d=destination as {screen?:unknown;id?:unknown};
  if(d.screen==='transport-chat'){router.push('/buying');return;}
  if(d.screen==='inquiries'&&typeof d.id==='number'&&Number.isSafeInteger(d.id)&&d.id>0){router.push({pathname:'/owner/[section]',params:{section:'inquiries',id:d.id}});return;}
  if(d.screen==='owner-chat'&&typeof d.id==='number'&&Number.isSafeInteger(d.id)&&d.id>0){router.push({pathname:'/owner/[section]',params:{section:'chat',id:d.id}});}
}
export function OwnerAttentionProvider({children}:{children:React.ReactNode}){
  const {session,ready,ownerRequest}=useApp(),path=usePathname(),params=useGlobalSearchParams<{id?:string}>();const [feed,setFeed]=useState<Feed|null>(null),[pending,setPending]=useState<unknown>(null),generation=useRef(0);
  async function reload(){if(!session)return;const g=generation.current;const value=await ownerRequest<Feed>('owner/attention');if(g===generation.current)setFeed(value);}
  async function save(body:Record<string,unknown>){const g=generation.current;const value=await ownerRequest<Feed>('owner/attention',body);if(g===generation.current)setFeed(value);}
  useEffect(()=>{attentionRoute(path+(path==='/owner/chat'?`?id=${params.id}`:''));},[path,params.id]);
  useEffect(()=>listenToAttentionTap(setPending),[]);
  useEffect(()=>{
    if(!ready||!pending||typeof pending!=='object')return;
    const d=pending as {screen?:unknown};
    if(d.screen!=='transport-chat'&&!session){router.navigate('/account');return;}
    openAttention(pending);setPending(null);
  },[pending,ready,session?.user.id]);
  useEffect(()=>{
    generation.current++;setFeed(null);if(!session)return;
    let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;
    async function poll(){if(stopped)return;if(AppState.currentState==='active'||AppState.currentState===null)try{await reload();failures=0;}catch{failures++;}if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));}
    void poll();const sub=AppState.addEventListener('change',v=>{if(v==='active'){clearTimeout(timer);void poll();}});
    return()=>{stopped=true;clearTimeout(timer);sub.remove();};
  },[session?.user.id]);
  return <Context.Provider value={{feed,reload,save}}>{children}</Context.Provider>;
}
function AlertsControl({state,inline=false,preferencesOnly=false}:{state:State;inline?:boolean;preferencesOnly?:boolean}){
  const {t,locale}=useApp(),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function action(run:()=>Promise<void>){setBusy(true);setError('');try{await run();}catch(e){setError(e instanceof Error?e.message:'Could not update alerts. Try again.');}finally{setBusy(false);}}
  async function visit(item:AttentionItem){await state.save({action:'read',id:item.id});setOpen(false);openAttention(item.destination);}
  const available=Platform.OS==='web'?state.feed?.push?.web.available:state.feed?.push?.expo.available;
  const enabled=Platform.OS==='web'?state.feed?.enabled?.web:state.feed?.enabled?.expo;
  const content=<>
      {enabled&&<Button secondary disabled={busy||!state.feed} label={t('Play a sound for new alerts')} onPress={()=>void action(()=>state.save({action:'preferences',soundEnabled:!state.feed?.preferences.soundEnabled,language:locale}))}/>}
      {available&&state.feed&&<Copy muted>{t(state.feed.preferences.soundEnabled?'On':'Off')}</Copy>}
      {available&&<Button secondary disabled={busy} label={t(enabled?'Turn off notifications':'Turn on notifications')} onPress={()=>void action(async()=>{if(enabled){await state.save({action:'unsubscribe'});return;}const device=await notificationDevice(state.feed?.push?.web.publicKey);await state.save({action:'subscribe',device});})}/>}
      {!preferencesOnly&&Boolean(state.feed?.unread)&&<Button secondary disabled={busy} label={t('Mark all read')} onPress={()=>void action(()=>state.save({action:'read_all',id:state.feed!.latestId}))}/>}
      <Status error={error} loading={!state.feed&&!error}/>
      {preferencesOnly&&state.feed&&!available&&<Copy muted>{t('Notifications are not available right now.')}</Copy>}
      {!preferencesOnly&&state.feed&&!state.feed.items.length&&<Copy>{t('No alerts yet.')}</Copy>}
      {!preferencesOnly&&state.feed?.items.map(item=><Pressable key={item.id} accessibilityRole="button" disabled={busy} onPress={()=>void action(()=>visit(item))} style={{padding:14,gap:6,borderWidth:1,borderColor:colors.line,borderRadius:8,backgroundColor:item.read?'white':colors.soft}}><Copy>{t(attentionLabel(item))}</Copy><Copy muted>{new Date(item.createdAt).toLocaleString(locale,{hour12:true})}</Copy></Pressable>)}
  </>;
  return <>
    {!inline&&<Pressable accessibilityRole="button" accessibilityLabel={t('Alerts')} style={[s.row,{alignSelf:'flex-end',minHeight:48,gap:8,padding:8}]} onPress={()=>{setOpen(true);void state.reload().catch(()=>setError('Alerts are temporarily unavailable.'));}}><Icon name="bell" color={colors.brand}/><Copy>{t('Alerts')}</Copy>{Boolean(state.feed?.unread)&&<Copy>{state.feed!.unread>99?'99+':state.feed!.unread}</Copy>}</Pressable>}
    {inline?content:<Sheet visible={open} title={t('Alerts')} onClose={()=>setOpen(false)}>{content}</Sheet>}
  </>;
}
export function OwnerAlerts({inline=false,preferencesOnly=false}:{inline?:boolean;preferencesOnly?:boolean}={}){const state=useContext(Context);return state?<AlertsControl state={state} inline={inline} preferencesOnly={preferencesOnly}/>:null;}
export function useOwnerAlertCount(){const state=useContext(Context);return state?.feed?.unread||0;}
export function TransportAlerts({token}:{token:string}){
  const [feed,setFeed]=useState<Feed|null>(null);
  async function reload(){setFeed(await request<Feed>('transport/attention',{buyingToken:token}));}
  async function save(body:Record<string,unknown>){setFeed(await request<Feed>('transport/attention',{buyingToken:token,body}));}
  useEffect(()=>{let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;async function poll(){if(stopped)return;if(AppState.currentState===null||AppState.currentState==='active')try{await reload();failures=0;}catch{failures++;}if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));}void poll();return()=>{stopped=true;clearTimeout(timer);};},[token]);
  return <AlertsControl state={{feed,reload,save}}/>;
}
