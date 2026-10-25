import React, { useEffect, useState, useCallback, useRef } from "react";
import {TRANSPORT_COPY,OWNER_TRANSPORT_COPY} from "../../../lib/i18n/transport-copy";
import { router,useFocusEffect } from "expo-router";
import { AppState, View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import * as Crypto from "expo-crypto";
import type { Buying } from "@suqpage/contracts";
import { useApp, request, secure, transportStorageKey, ApiFailure } from "../src/runtime";
import { Screen, Copy, Field, Button, Status, colors } from "../src/ui";
import ChatReadSentinel,{ChatReadTranscript} from '../src/ChatReadSentinel';
import {TransportAlerts} from '../src/AttentionAlerts';
import { supportIdlePresentation } from '../../../lib/support-idle-contract';
import {clientChatPresentation} from '../../../lib/support-client-state';
import type {OwnerTransportCommand,OwnerTransportConversation,OwnerTransportState} from '../../../lib/owner-transport-contract';
import TransportCoordinator from "../src/TransportCoordinator";
import {TRANSPORT_COORDINATOR} from "../../../lib/transport-coordinator";
import {estimateServerNow,formatTransportRemaining,transportLiveWait} from "../../../lib/transport-live-wait";
type TransportConversation=Buying|OwnerTransportConversation;
// A single in-memory return draft survives a web-stack remount. Never store it
// on disk, in navigation URLs, or across a different actor/chat identity.
let trackingReturnDraft:{scope:string;token:string;reference:string;expiresAt:number;name:string;phone:string;origin:string;destination:string;message:string;coordinatorId:typeof TRANSPORT_COORDINATOR.id|null}|null=null;
export default function BuyingScreen({owner=false,conversationId,newIntake=false}:{owner?:boolean;conversationId?:string;newIntake?:boolean}={}) {
  const {height:viewportHeight}=useWindowDimensions();
  const shortViewport=viewportHeight<650;
  const { t, locale,session,ownerRequest } = useApp();
  const ownerId=owner?session?.user.id||'':'';
  const scope=owner?'owner:'+ownerId:'visitor',scopeRef=useRef(scope);scopeRef.current=scope;
  const [loadedScope,setLoadedScope]=useState('');
  const defaultsApplied=useRef('');
  const ownerAttempt=useRef<{signature:string;key:string}|null>(null);
  const [conversation, setConversation] = useState<TransportConversation | null>(null),
    [token, setToken] = useState(""),
    [ready, setReady] = useState(false),
    [storageFailed, setStorageFailed] = useState(false),
    [storageAttempt, setStorageAttempt] = useState(0),
    [restoring, setRestoring] = useState(false),
    [checking, setChecking] = useState(false),
    [connected, setConnected] = useState(true),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [callbackPhone,setCallbackPhone]=useState(""),
    [callbackEmail,setCallbackEmail]=useState(""),
    [origin, setOrigin] = useState(""),
    [destination, setDestination] = useState(""),
    [message, setMessage] = useState(""),
    [clockNow,setClockNow]=useState(Date.now()),
    [coordinatorId,setCoordinatorId]=useState<typeof TRANSPORT_COORDINATOR.id|null>(null),
    [busy, setBusy] = useState(false),
    [resuming,setResuming]=useState(false),
    [error, setError] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  const live = useRef(true), focused = useRef(false), version = useRef(0), busyRef = useRef(false);
  const transcriptRef=useRef<ScrollView>(null),transcriptNearBottom=useRef(true);
  const pollController = useRef<AbortController | null>(null);
  const wakePolling=useRef<()=>void>(()=>{});
  const currentConversation = useRef(conversation);
  currentConversation.current = conversation;
  const serverClock=useRef({serverNow:Date.now(),clientAt:performance.now()});
  const idle=conversation?supportIdlePresentation(conversation,Date.now()):{warning:false,autoEnded:false};
  const presentation=conversation?clientChatPresentation(conversation):null;
  useEffect(()=>{if(!conversation)return;const serverNow=conversation.serverNow??Date.now();serverClock.current={serverNow,clientAt:performance.now()};setClockNow(serverNow);},[conversation?.serverNow]);
  const firstStaffReplyAt=conversation?(conversation.firstStaffReplyAt!==undefined?conversation.firstStaffReplyAt:conversation.messages.reduce<number|null>((first,item)=>item.sender==='staff'?Math.min(first??item.createdAt,item.createdAt):first,null)):null;
  const liveWait=conversation?transportLiveWait({status:conversation.status,waitStartedAt:conversation.transportWaitStartedAt??conversation.createdAt,agentJoined:conversation.agentJoined,agentJoinedAt:conversation.agentJoinedAt,firstStaffReplyAt},clockNow):null;
  const callbackMode=Boolean(conversation&&liveWait?.phase==='inbox');
  const callbackSubmitted=Boolean(conversation?.transportCallback?.submitted);
  const terminalClosed=conversation?.status==='closed'&&!idle.autoEnded;
  const callbackAttempt=useRef<{signature:string;key:string}|null>(null);
  useEffect(()=>{if(!conversation||conversation.status==='closed'||callbackMode)return;const timer=setInterval(()=>setClockNow(estimateServerNow(serverClock.current.serverNow,serverClock.current.clientAt,performance.now())),1000);return()=>clearInterval(timer);},[Boolean(conversation),conversation?.status,callbackMode]);
  useEffect(()=>{
    if(!conversation)return;
    setCallbackPhone(conversation.transportCallback?.phone||phone);
    setCallbackEmail(conversation.transportCallback?.email||'');
    callbackAttempt.current=null;
  },[conversation?.publicRef,conversation?.transportCallback?.phone,conversation?.transportCallback?.email]);
  const ownerPath='owner/transport'+(conversationId?'?conversation='+encodeURIComponent(conversationId):newIntake?'?new=1':'');
  useFocusEffect(useCallback(()=>{
    const saved=trackingReturnDraft;
    if(saved&&saved.expiresAt<=Date.now()){trackingReturnDraft=null;return;}
    if(!saved||!ready||restoring||loadedScope!==scope||saved.scope!==scope||saved.token!==token||saved.reference!==(conversation?.publicRef||''))return;
    trackingReturnDraft=null;setName(saved.name);setPhone(saved.phone);setOrigin(saved.origin);setDestination(saved.destination);setMessage(saved.message);setCoordinatorId(saved.coordinatorId);
  },[ready,restoring,loadedScope,scope,token,conversation?.publicRef]));
  function openTracking(){
    if(busyRef.current)return;
    trackingReturnDraft={scope,token,reference:conversation?.publicRef||'',expiresAt:Date.now()+10*60_000,name,phone,origin,destination,message,coordinatorId};
    router.push('/tracking');
  }
  useEffect(() => {
    live.current = true;
    return () => { live.current = false; version.current++; pollController.current?.abort(); };
  }, []);
  useEffect(() => {
    let active = true;
    version.current++;
    pollController.current?.abort();
    setReady(false);
    setStorageFailed(false);
    setError("");
    if(owner){
      setConversation(null);currentConversation.current=null;setLoadedScope('');setRestoring(true);
      if(defaultsApplied.current!==scope){ownerAttempt.current=null;busyRef.current=false;setBusy(false);setName('');setPhone('');setOrigin('');setDestination('');setMessage('');setCoordinatorId(null);setKey(Crypto.randomUUID());}
      const expectedScope=scope;
      if(!ownerId){setRestoring(false);return()=>{active=false;};}
      ownerRequest<OwnerTransportState>(ownerPath).then(data=>{
        if(!active||!live.current||scopeRef.current!==expectedScope)return;
        if(defaultsApplied.current!==expectedScope){setName(data.defaults.name);setPhone(data.defaults.phone);defaultsApplied.current=expectedScope;}
        currentConversation.current=data.conversation;setConversation(data.conversation);setLoadedScope(expectedScope);setReady(true);setRestoring(false);setChecking(false);setConnected(true);
      }).catch(error=>{
        if(!active||!live.current||scopeRef.current!==expectedScope)return;
        setStorageFailed(true);setRestoring(false);setChecking(false);setError(error instanceof Error?error.message:'Unable to connect. Please try again.');
        if(error instanceof ApiFailure&&error.code==='setup_required')router.replace('/account');
      });
      return()=>{active=false;};
    }
    setConversation(null);currentConversation.current=null;setLoadedScope('');
    secure.getItem(transportStorageKey).then((value) => {
      if (active && live.current) {
        setToken(value || "");
        setRestoring(Boolean(value));
        setReady(true);
        setLoadedScope('visitor');
      }
    }).catch(() => {
      if (active && live.current) {
        setStorageFailed(true);
        setError("Unable to connect. Please try again.");
      }
    });
    return () => {
      active = false;
    };
  }, [storageAttempt,owner,ownerId,ownerPath]);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      if (owner?(!ownerId||!ready||!conversation):!token) return () => { focused.current = false; version.current++; };
      if(callbackMode||terminalClosed){setChecking(false);pollController.current?.abort();return()=>{focused.current=false;version.current++;pollController.current?.abort();};}
      const expectedScope=scope;
      setChecking(true);
      let active = true,
        timer: ReturnType<typeof setTimeout>,
        failures = 0,inFlight:number|null=null;
      async function poll() {
        const generation = version.current;
        const expectedRef = currentConversation.current?.publicRef;
        if (
          active&&scopeRef.current===expectedScope&&inFlight!==generation&&!busyRef.current && (AppState.currentState === "active" ||
          AppState.currentState === null) && (typeof document==='undefined'||!document.hidden)
        )
          try {
            inFlight=generation;
            const controller = new AbortController();
            pollController.current = controller;
            const ownerConversation=currentConversation.current;
            if(owner&&(!ownerConversation||!('id'in ownerConversation)))throw Error('Support could not be refreshed.');
            const data = owner?await ownerRequest<OwnerTransportState>('owner/transport?conversation='+(ownerConversation&&'id'in ownerConversation?ownerConversation.id:conversationId)):await request<{ conversation: Buying | null }>(
              "transport",
              { buyingToken: token, signal: controller.signal },
            );
            if (active && live.current && generation === version.current&&scopeRef.current===expectedScope) {
              if (!data.conversation || (expectedRef && data.conversation.publicRef !== expectedRef)) throw new Error("session");
              currentConversation.current=data.conversation;setConversation(data.conversation);
              setRestoring(false);
              setChecking(false);
              setConnected(true);
              setError("");
              failures = 0;
            }
          } catch (e) {
            if (active && live.current && generation === version.current&&scopeRef.current===expectedScope) {
              if (owner&&e instanceof ApiFailure&&[401,403,404].includes(e.status)){currentConversation.current=null;setConversation(null);setReady(false);setRestoring(false);setChecking(false);setStorageFailed(true);setError(e.message);return;}
              if (!owner&&e instanceof ApiFailure && [401, 404].includes(e.status)) {
                try { await secure.removeItem(transportStorageKey); }
                catch { if(active && live.current && generation === version.current)setError("Unable to connect. Please try again."); return; }
                if (!active || !live.current || generation !== version.current) return;
                setToken("");
                setConversation(null);
                setRestoring(false);
                setChecking(false);
                setError("");
                return;
              }
              setError(t("Reconnecting…"));
              setConnected(false);
              failures++;
            }
          }finally{if(inFlight===generation)inFlight=null;}
        if (active&&generation===version.current&&scopeRef.current===expectedScope){clearTimeout(timer);timer = setTimeout(poll, currentConversation.current?.status==='closed'?30000:Math.min(30000, 5000 * 2 ** Math.min(failures,3)));}
      }
      wakePolling.current=()=>{clearTimeout(timer);if(active&&live.current&&focused.current&&scopeRef.current===expectedScope)timer=setTimeout(poll,currentConversation.current?.status==='closed'?30000:5000);};
      void poll();
      return () => {
        active = false;
        wakePolling.current=()=>{};
        focused.current = false;
        version.current++;
        pollController.current?.abort();
        clearTimeout(timer);
      };
    }, [token,owner,ownerId,ready,owner?conversation?.publicRef:undefined,callbackMode,terminalClosed]),
  );
  async function send(action: "start" | "message" | "close" | "resume") {
    if (!live.current||scopeRef.current!==scope||busyRef.current || !ready || restoring || checking || (owner&&(!ownerId||loadedScope!==scope)) || (action==='resume'?!idle.autoEnded:action !== "start" && (!conversation || conversation.status === "closed"))) return;
    if(action==='start'&&coordinatorId!==TRANSPORT_COORDINATOR.id){setError(t('Choose a logistics service provider'));return;}
    busyRef.current = true;
    const generation = ++version.current, expectedRef = conversation?.publicRef;
    const expectedScope=scope;
    pollController.current?.abort();
    setBusy(true);
    setResuming(action==='resume');
    setError("");
    try {
      let ownerCommand:OwnerTransportCommand|undefined;
      if(owner){
        if(action==='start')ownerCommand={action:'start',name,phone,origin,destination,message,idempotencyKey:key,coordinatorId:TRANSPORT_COORDINATOR.id};
        else if(action==='message'){
          if(!conversation||!('id'in conversation))throw Error('Support could not be updated.');
          const target={conversationId:conversation.id,publicRef:conversation.publicRef};
          ownerCommand={action:'message',...target,message,idempotencyKey:key};
        }else{
          if(!conversation||!('id'in conversation))throw Error('Support could not be updated.');
          ownerCommand={action,...{conversationId:conversation.id,publicRef:conversation.publicRef}};
        }
        if(ownerCommand&&(ownerCommand.action==='start'||ownerCommand.action==='message')){
          const signature=JSON.stringify([scope,{...ownerCommand,idempotencyKey:undefined}]);
          if(!ownerAttempt.current||ownerAttempt.current.signature!==signature)ownerAttempt.current={signature,key:Crypto.randomUUID()};
          if(ownerCommand.action==='start')ownerCommand={...ownerCommand,idempotencyKey:ownerAttempt.current.key};
          else ownerCommand={...ownerCommand,idempotencyKey:ownerAttempt.current.key};
        }
      }
      const data = owner?await ownerRequest<OwnerTransportState>('owner/transport',ownerCommand):await request<{ token?: string; conversation: Buying }>(
        "transport",
        {
          buyingToken: token,
          body: {
            action,
            ...(action==='start'?{coordinatorId}:{}),
            name,
            phone,
            origin,
            destination,
            message,
            idempotencyKey: key,
            ...(conversation ? { publicRef: conversation.publicRef } : {}),
          },
        },
      );
      if (!live.current || !focused.current || generation !== version.current||scopeRef.current!==expectedScope) return;
      if(!data.conversation)throw Error('Support could not be updated.');
      if (expectedRef && data.conversation.publicRef !== expectedRef) throw new Error("Support could not be updated.");
      if (!owner&&'token'in data&&data.token) {
        await secure.setItem(transportStorageKey, data.token);
        if (!live.current || !focused.current || generation !== version.current) return;
        setToken(data.token);
      }
      currentConversation.current=data.conversation;setConversation(data.conversation);
      setConnected(true);
      if(action==='start'||action==='message'){if(owner)ownerAttempt.current=null;setMessage("");setKey(Crypto.randomUUID());}
    } catch (e) {
      if (live.current && focused.current && generation === version.current&&scopeRef.current===expectedScope)setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      if(scopeRef.current===expectedScope)busyRef.current = false;
      if (live.current&&scopeRef.current===expectedScope){setBusy(false);setResuming(false);wakePolling.current();}
    }
  }
  async function submitCallback(){
    if(!live.current||scopeRef.current!==scope||busyRef.current||!ready||checking||!callbackMode||callbackSubmitted||!callbackPhone.trim()||!conversation)return;
    busyRef.current=true;setBusy(true);setError('');const generation=++version.current;pollController.current?.abort();
    const signature=JSON.stringify([scope,conversation.publicRef,callbackPhone.trim(),callbackEmail.trim()]);
    if(!callbackAttempt.current||callbackAttempt.current.signature!==signature)callbackAttempt.current={signature,key:Crypto.randomUUID()};
    try{
      const data=owner
        ?await ownerRequest<OwnerTransportState>('owner/transport',{action:'callback',conversationId:('id'in conversation?conversation.id:Number(conversationId)),publicRef:conversation.publicRef,phone:callbackPhone,email:callbackEmail,idempotencyKey:callbackAttempt.current.key} satisfies OwnerTransportCommand)
        :await request<{conversation:Buying}>('transport',{buyingToken:token,body:{action:'callback',phone:callbackPhone,email:callbackEmail,idempotencyKey:callbackAttempt.current.key,publicRef:conversation.publicRef}});
      if(!live.current||!focused.current||generation!==version.current)return;
      const updated='conversation'in data?data.conversation:null;
      if(!updated||updated.publicRef!==conversation.publicRef)throw Error('Support could not be updated.');
      currentConversation.current=updated;setConversation(updated);setConnected(true);callbackAttempt.current=null;
    }catch(e){if(live.current&&focused.current&&generation===version.current)setError(e instanceof Error?e.message:'Please try again.');}
    finally{busyRef.current=false;if(live.current){setBusy(false);setChecking(false);}}
  }
  async function anotherChat() {
    if (!live.current||scopeRef.current!==scope||busyRef.current || checking) return;
    if(owner){setCoordinatorId(null);router.replace({pathname:'/owner/[section]',params:{section:'transport',view:'new',returnTo:'profile'}});return;}
    busyRef.current = true; setBusy(true); setError("");
    const generation = ++version.current;
    pollController.current?.abort();
    try {
      try { await request('transport/attention',{buyingToken:token,body:{action:'unsubscribe'}}); }
      catch { /* Retained history stays private; expiry also fences delivery. */ }
      if (!live.current || !focused.current || generation !== version.current) return;
      await secure.removeItem(transportStorageKey);
      if (!live.current || !focused.current || generation !== version.current) return;
      setToken(""); setConversation(null); setCoordinatorId(null); setKey(Crypto.randomUUID());
    } catch { if (live.current && focused.current && generation === version.current)setError("Unable to connect. Please try again."); }
    finally { busyRef.current=false; if(live.current)setBusy(false); }
  }
  const showingConversation=loadedScope===scope&&(!owner||Boolean(ownerId))&&Boolean(conversation);
  return (
    <Screen scroll={!showingConversation||shortViewport}>
      {showingConversation&&conversation ? <View style={[conversationLayout.fullScreen,shortViewport&&conversationLayout.shortScreen]}>
        <View style={conversationLayout.utilities}>
          {owner&&<>
            <View style={[conversationLayout.utility,{flexBasis:104}]}><Button secondary wrapLabel label={t('Back to account')} onPress={()=>router.replace('/account')}/></View>
            <View style={[conversationLayout.utility,{flexBasis:104}]}><Button secondary wrapLabel label={t('Chat history')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'transport-history',returnTo:'profile'}})}/></View>
          </>}
            <View style={[conversationLayout.utility,{flexBasis:owner?104:150}]}><Button secondary wrapLabel label={t('Shipment records')} disabled={busy} onPress={openTracking}/></View>
          {!owner&&!callbackMode&&<TransportAlerts token={token}/>}
        </View>
        {!callbackMode&&<Status loading={checking} error={error}/>}
        {callbackMode?<View style={conversationLayout.callback}>
          {callbackSubmitted? <>
            <Copy big heading>{t(TRANSPORT_COPY.callbackReceivedHeading)}</Copy>
            <Copy>{t(TRANSPORT_COPY.callbackReceived,{value1:TRANSPORT_COORDINATOR.name})}</Copy>
            <View style={conversationLayout.callbackDetails}>
              {!!conversation.transportCallback?.phone&&<Copy>{t(TRANSPORT_COPY.callbackPhone)}: {conversation.transportCallback.phone}</Copy>}
              {!!conversation.transportCallback?.email&&<Copy>{t(TRANSPORT_COPY.callbackEmail)}: {conversation.transportCallback.email}</Copy>}
            </View>
            <Copy muted>{conversation.publicRef}</Copy>
            <Button secondary label={t('Send another request')} onPress={()=>void anotherChat()}/>
          </>:<>
            <Copy big heading>{t(TRANSPORT_COPY.callbackHeading,{value1:TRANSPORT_COORDINATOR.name})}</Copy>
            <Copy muted>{t(TRANSPORT_COPY.callbackDescription)}</Copy>
            <Field label={t(TRANSPORT_COPY.callbackPhone)} value={callbackPhone} onChangeText={setCallbackPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={40}/>
            <Field label={t(TRANSPORT_COPY.callbackEmail)} value={callbackEmail} onChangeText={setCallbackEmail} keyboardType="email-address" autoComplete="email" maxLength={254}/>
            {!!error&&<Status error={error}/>}
            <Button label={t(busy?'Sending…':TRANSPORT_COPY.callbackSubmit)} disabled={busy||checking||!callbackPhone.trim()} onPress={()=>void submitCallback()}/>
            <Button secondary label={t(TRANSPORT_COPY.tryLater)} disabled={busy||checking} onPress={()=>void send('close')}/>
          </>}
        </View>:<>
        <TransportCoordinator compact websiteLink/>
        <View style={conversationLayout.statusRow}>
          <View style={conversationLayout.statusText}>
            <View style={conversationLayout.metadata}>
              <Copy muted>{conversation.publicRef}</Copy>
            </View>
            <Copy>{t(checking ? "Checking…" : !connected ? "Reconnecting…" : (liveWait?.phase==='waiting'||liveWait?.phase==='busy')&&presentation!.awaitingTeam ? TRANSPORT_COPY.waitingStatus : presentation!.statusKey,{value1:TRANSPORT_COORDINATOR.name})}</Copy>
            {(liveWait?.phase==='waiting'||liveWait?.phase==='busy')?<Copy>{t(TRANSPORT_COPY.countdown,{value1:formatTransportRemaining(liveWait.elapsedMs,locale)})}</Copy>:null}
            {!checking&&connected&&presentation?.joined&&<Copy>{t(presentation.joined.key,presentation.joined.values)}</Copy>}
          </View>
          {conversation.status!=='closed'&&<View style={conversationLayout.endAction}>
            <Button secondary wrapLabel disabled={busy||checking} label={t('End chat')} onPress={()=>void send('close')}/>
          </View>}
        </View>
        {(liveWait?.phase==='waiting'||liveWait?.phase==='busy')&&presentation?.awaitingTeam&&!checking?<Copy muted>{t(TRANSPORT_COPY.waiting,{value1:TRANSPORT_COORDINATOR.name})}</Copy>:null}
        {!checking&&connected&&idle.warning?<Copy>{t('This chat will end soon. Send a message to keep it open.')}</Copy>:null}
        <ChatReadTranscript identity={`${scope}:${conversation.publicRef}`} active={!checking&&connected&&!callbackMode} onRead={async messageId=>{if(!live.current||scopeRef.current!==scope)return;if(owner){if(!('id'in conversation))throw Error('Support could not be updated.');await ownerRequest('owner/transport',{action:'read',conversationId:conversation.id,messageId,publicRef:conversation.publicRef} satisfies OwnerTransportCommand);}else await request('transport',{buyingToken:token,body:{action:'read',messageId,publicRef:conversation.publicRef}});}}>
          <ScrollView ref={transcriptRef} style={[conversationLayout.transcript,shortViewport&&conversationLayout.shortTranscript]} scrollEnabled={!shortViewport} contentContainerStyle={conversationLayout.transcriptContent} keyboardShouldPersistTaps="handled" scrollEventThrottle={100} onScroll={event=>{const {contentOffset,contentSize,layoutMeasurement}=event.nativeEvent;transcriptNearBottom.current=contentOffset.y+layoutMeasurement.height>=contentSize.height-48;}} onContentSizeChange={()=>{if(!shortViewport&&transcriptNearBottom.current)requestAnimationFrame(()=>transcriptRef.current?.scrollToEnd({animated:false}));}}>
            {conversation.messages.map((m) => (
              <View key={m.id} style={[conversationLayout.bubble,{alignSelf:m.sender==='visitor'?'flex-end':'flex-start',backgroundColor:m.sender==='visitor'?colors.soft:'white'}]}>
                <Copy>{m.body}</Copy>
                <Copy muted>{m.sender==='visitor'?t('You'):m.senderName}{' · '}{new Date(Number(m.createdAt)).toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',hour12:true})}</Copy>
                {m.sender==='visitor'?<Copy muted>{t(m.read?'Read':'Sent')}</Copy>:null}
                {m.sender==='staff'?<ChatReadSentinel messageId={m.id}/>:null}
              </View>
            ))}
          </ScrollView>
        </ChatReadTranscript>
        <View style={conversationLayout.replyArea}>
          {conversation.status==='closed'?<View style={conversationLayout.closedActions}>
            {conversation.resolvedAt==null&&idle.autoEnded&&<Copy>{t('This chat ended because we did not hear back. Your messages are saved.')}</Copy>}
            {idle.autoEnded?<Button label={t(resuming?'Resuming…':'Resume chat')} disabled={busy||checking} onPress={()=>void send('resume')}/>:null}
            <Button label={t("Send another request")} secondary={idle.autoEnded} disabled={busy||checking} onPress={()=>void anotherChat()}/>
          </View>:<View style={conversationLayout.composer}>
            <View style={conversationLayout.composerInput}><Field label={t("Message")} multiline value={message} maxLength={4000} onChangeText={setMessage} style={conversationLayout.messageField}/></View>
            <View style={conversationLayout.composerSend}><Button disabled={busy||checking||!message.trim()} label={t("Send reply")} onPress={()=>void send("message")}/></View>
          </View>}
        </View>
        </>}
      </View> : <>
        {owner?<View style={conversationLayout.intakeUtilities}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Back to account')} onPress={()=>router.replace('/account')} style={conversationLayout.intakeUtility}><Text style={conversationLayout.intakeUtilityText}>{t('Account')}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Chat history')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'transport-history',returnTo:'profile'}})} style={conversationLayout.intakeUtility}><Text style={conversationLayout.intakeUtilityText}>{t('Chat history')}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Shipment records')} accessibilityState={{disabled:busy}} disabled={busy} onPress={openTracking} style={[conversationLayout.intakeUtility,busy&&{opacity:0.45}]}><Text style={conversationLayout.intakeUtilityText}>{t('Shipment records')}</Text></Pressable>
        </View>:<Button secondary label={t('Shipment records')} disabled={busy} onPress={openTracking}/>}
        <Status loading={(!ready&&!storageFailed)||restoring||checking} error={error}/>
        {storageFailed&&<Button secondary label={t("Try again")} onPress={()=>setStorageAttempt(value=>value+1)}/>}
        {ready&&!restoring&&(!owner||Boolean(ownerId)&&loadedScope===scope)&&<View style={conversationLayout.intake}>
          <Copy big heading>{t(owner?OWNER_TRANSPORT_COPY.invitation:TRANSPORT_COPY.invitation)}</Copy>
          <Copy muted>{t(owner?OWNER_TRANSPORT_COPY.description:TRANSPORT_COPY.description)}</Copy>
          <TransportCoordinator selection selectedId={coordinatorId} onSelect={setCoordinatorId}/>
          <View style={[intake.row,intake.route]}>
            <View style={intake.cell}><Field label={t("From")} value={origin} maxLength={120} onChangeText={setOrigin} placeholder={t("City or area")}/></View>
            <View style={intake.cell}><Field label={t("To")} value={destination} maxLength={120} onChangeText={setDestination} placeholder={t("City or area")}/></View>
          </View>
          <View style={intake.row}>
            <View style={intake.cell}><Field label={t("Name")} value={name} maxLength={80} onChangeText={setName} autoComplete="name"/></View>
            <View style={intake.cell}><Field label={t("Phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={40} placeholder="+251…"/></View>
          </View>
          <Field label={t("Goods or transport details (optional)")} value={message} maxLength={3700} style={intake.details} onChangeText={setMessage} multiline/>
          <Button icon="chat" label={t("Start chat")} disabled={busy||!coordinatorId||!name.trim()||!phone.trim()||!origin.trim()||!destination.trim()} onPress={()=>void send("start")}/>
        </View>}
      </>}
    </Screen>
  );
}

const intake = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
  cell: { flex: 1, minWidth: 0 },
  route: { backgroundColor: colors.soft, borderColor: "#f0cbb8", borderWidth: 1, borderRadius: 12, padding: 12 },
  details: { minHeight: 68, borderWidth: 1, borderColor: "#cad3d7", borderRadius: 8, backgroundColor: "white", color: colors.ink, padding: 12, fontSize: 16, textAlignVertical: "top" },
});

const conversationLayout=StyleSheet.create({
  fullScreen:{flex:1,minHeight:0,width:'100%',maxWidth:760,alignSelf:'center',padding:12,gap:10},
  shortScreen:{flex:0,minHeight:0},
  utilities:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8},
  utility:{flexGrow:1,flexShrink:1,minWidth:0},
  intakeUtilities:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8,marginHorizontal:18},
  intakeUtility:{minHeight:44,flexShrink:1,justifyContent:'center',paddingHorizontal:10,paddingVertical:8,borderWidth:1,borderColor:colors.line,borderRadius:8,backgroundColor:'white'},
  intakeUtilityText:{fontSize:13,lineHeight:18,fontWeight:'600',color:colors.ink,textAlign:'center'},
  intake:{gap:12,paddingBottom:18},
  statusRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-start',gap:10},
  statusText:{flex:1,minWidth:156,gap:3},
  company:{fontSize:13,lineHeight:20,fontWeight:'600',color:colors.muted},
  metadata:{flexDirection:'row',flexWrap:'wrap',alignItems:'baseline',gap:6},
  endAction:{maxWidth:'100%'},
  transcript:{flex:1,minHeight:0,borderWidth:1,borderColor:colors.line,borderRadius:10,backgroundColor:'#edf2f2'},
  shortTranscript:{flexGrow:0,minHeight:100},
  transcriptContent:{flexGrow:1,justifyContent:'flex-end',gap:10,padding:12},
  bubble:{maxWidth:'90%',borderRadius:14,padding:12,gap:5},
  replyArea:{flexShrink:0,paddingTop:2},
  composer:{flexDirection:'row',alignItems:'flex-end',gap:8},
  composerInput:{flex:1,minWidth:0},
  composerSend:{flexShrink:0,minWidth:92},
  messageField:{minHeight:52,maxHeight:128,padding:10,textAlignVertical:'top'},
  closedActions:{gap:8},
  callback:{flex:1,minHeight:0,justifyContent:'flex-start',gap:12,width:'100%',maxWidth:520,alignSelf:'center',paddingVertical:20},
  callbackDetails:{backgroundColor:colors.soft,borderRadius:10,padding:12,gap:6},
});
