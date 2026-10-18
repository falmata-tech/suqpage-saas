import React, { useEffect, useState, useCallback, useRef } from "react";
import {TRANSPORT_COPY,OWNER_TRANSPORT_COPY} from "../../../lib/i18n/transport-copy";
import { router,useFocusEffect } from "expo-router";
import { AppState, View, StyleSheet } from "react-native";
import * as Crypto from "expo-crypto";
import type { Buying } from "@suqpage/contracts";
import { useApp, request, secure, ApiFailure } from "../src/runtime";
import { Screen, Copy, Card, Field, Button, Status, colors } from "../src/ui";
import ChatReadSentinel,{ChatReadTranscript} from '../src/ChatReadSentinel';
import {TransportAlerts} from '../src/AttentionAlerts';
import { supportIdlePresentation } from '../../../lib/support-idle-contract';
import {clientChatPresentation} from '../../../lib/support-client-state';
import type {OwnerTransportCommand,OwnerTransportConversation,OwnerTransportState} from '../../../lib/owner-transport-contract';
type TransportConversation=Buying|OwnerTransportConversation;
// A single in-memory return draft survives a web-stack remount. Never store it
// on disk, in navigation URLs, or across a different actor/chat identity.
let trackingReturnDraft:{scope:string;token:string;reference:string;expiresAt:number;name:string;phone:string;origin:string;destination:string;message:string}|null=null;
export default function BuyingScreen({owner=false,conversationId,newIntake=false}:{owner?:boolean;conversationId?:string;newIntake?:boolean}={}) {
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
    [origin, setOrigin] = useState(""),
    [destination, setDestination] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [resuming,setResuming]=useState(false),
    [error, setError] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  const live = useRef(true), focused = useRef(false), version = useRef(0), busyRef = useRef(false);
  const pollController = useRef<AbortController | null>(null);
  const wakePolling=useRef<()=>void>(()=>{});
  const currentConversation = useRef(conversation);
  currentConversation.current = conversation;
  const idle=conversation?supportIdlePresentation(conversation,Date.now()):{warning:false,autoEnded:false};
  const presentation=conversation?clientChatPresentation(conversation):null;
  const ownerPath='owner/transport'+(conversationId?'?conversation='+encodeURIComponent(conversationId):newIntake?'?new=1':'');
  useFocusEffect(useCallback(()=>{
    const saved=trackingReturnDraft;
    if(saved&&saved.expiresAt<=Date.now()){trackingReturnDraft=null;return;}
    if(!saved||!ready||restoring||loadedScope!==scope||saved.scope!==scope||saved.token!==token||saved.reference!==(conversation?.publicRef||''))return;
    trackingReturnDraft=null;setName(saved.name);setPhone(saved.phone);setOrigin(saved.origin);setDestination(saved.destination);setMessage(saved.message);
  },[ready,restoring,loadedScope,scope,token,conversation?.publicRef]));
  function openTracking(){
    if(busyRef.current)return;
    trackingReturnDraft={scope,token,reference:conversation?.publicRef||'',expiresAt:Date.now()+10*60_000,name,phone,origin,destination,message};
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
      if(defaultsApplied.current!==scope){ownerAttempt.current=null;busyRef.current=false;setBusy(false);setName('');setPhone('');setOrigin('');setDestination('');setMessage('');setKey(Crypto.randomUUID());}
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
    secure.getItem("suqpage-transport").then((value) => {
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
      const expectedScope=scope;
      setChecking(true);
      let active = true,
        timer: ReturnType<typeof setTimeout>,
        failures = 0,inFlight=false;
      async function poll() {
        const generation = version.current;
        const expectedRef = currentConversation.current?.publicRef;
        if (
          scopeRef.current===expectedScope&&!inFlight&&!busyRef.current && (AppState.currentState === "active" ||
          AppState.currentState === null) && (typeof document==='undefined'||!document.hidden)
        )
          try {
            inFlight=true;
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
                try { await secure.removeItem("suqpage-transport"); }
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
          }finally{inFlight=false;}
        if (active){clearTimeout(timer);timer = setTimeout(poll, currentConversation.current?.status==='closed'?30000:Math.min(30000, 5000 * 2 ** Math.min(failures,3)));}
      }
      wakePolling.current=()=>{clearTimeout(timer);if(active)timer=setTimeout(poll,5000);};
      void poll();
      return () => {
        active = false;
        wakePolling.current=()=>{};
        focused.current = false;
        version.current++;
        pollController.current?.abort();
        clearTimeout(timer);
      };
    }, [token,owner,ownerId,ready,owner?conversation?.publicRef:undefined]),
  );
  async function send(action: "start" | "message" | "close" | "resume") {
    if (!live.current||scopeRef.current!==scope||busyRef.current || !ready || restoring || checking || (owner&&(!ownerId||loadedScope!==scope)) || (action==='resume'?!idle.autoEnded:action !== "start" && (!conversation || conversation.status === "closed"))) return;
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
        if(action==='start')ownerCommand={action,name,phone,origin,destination,message,idempotencyKey:key};
        else{
          if(!conversation||!('id'in conversation))throw Error('Support could not be updated.');
          const target={conversationId:conversation.id,publicRef:conversation.publicRef};
          ownerCommand=action==='message'?{action,...target,message,idempotencyKey:key}:{action,...target};
        }
        if(ownerCommand.action==='start'||ownerCommand.action==='message'){
          const signature=JSON.stringify([scope,{...ownerCommand,idempotencyKey:undefined}]);
          if(!ownerAttempt.current||ownerAttempt.current.signature!==signature)ownerAttempt.current={signature,key:Crypto.randomUUID()};
          ownerCommand={...ownerCommand,idempotencyKey:ownerAttempt.current.key};
        }
      }
      const data = owner?await ownerRequest<OwnerTransportState>('owner/transport',ownerCommand):await request<{ token?: string; conversation: Buying }>(
        "transport",
        {
          buyingToken: token,
          body: {
            action,
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
        await secure.setItem("suqpage-transport", data.token);
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
      if (live.current&&scopeRef.current===expectedScope){setBusy(false);setResuming(false);if(action==='resume'&&currentConversation.current?.status!=='closed')wakePolling.current();}
    }
  }
  async function anotherChat() {
    if (!live.current||scopeRef.current!==scope||busyRef.current || checking) return;
    if(owner){router.replace({pathname:'/owner/[section]',params:{section:'transport',view:'new',returnTo:'profile'}});return;}
    busyRef.current = true; setBusy(true); setError("");
    const generation = ++version.current;
    pollController.current?.abort();
    try {
      try { await request('transport/attention',{buyingToken:token,body:{action:'unsubscribe'}}); }
      catch { /* Retained history stays private; expiry also fences delivery. */ }
      if (!live.current || !focused.current || generation !== version.current) return;
      await secure.removeItem("suqpage-transport");
      if (!live.current || !focused.current || generation !== version.current) return;
      setToken(""); setConversation(null); setKey(Crypto.randomUUID());
    } catch { if (live.current && focused.current && generation === version.current)setError("Unable to connect. Please try again."); }
    finally { busyRef.current=false; if(live.current)setBusy(false); }
  }
  return (
    <Screen>
      {owner&&<><Button secondary label={t('Back to account')} onPress={()=>router.replace('/account')}/><Button secondary label={t('Chat history')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'transport-history',returnTo:'profile'}})}/></>}
      <Copy muted>{t("Live Chat")}</Copy>
      <Button secondary label={t('Tracking')} disabled={busy} onPress={openTracking}/>
      <Status loading={(!ready && !storageFailed) || restoring || checking} error={error} />
      {storageFailed && <Button secondary label={t("Try again")} onPress={() => setStorageAttempt(value => value + 1)}/>}
      {loadedScope!==scope||(owner&&!ownerId)?null:conversation ? (
        <>
          {!owner&&<TransportAlerts token={token}/>}
          <Card>
            <Copy big>
              {t(
                checking ? "Checking…" : !connected ? "Reconnecting…" : presentation!.statusKey,
              )}
            </Copy>
            {!checking && connected && presentation?.joined && (
              <Copy>{t(presentation.joined.key,presentation.joined.values)}</Copy>
            )}
            <Copy muted>{conversation.publicRef}</Copy>
          </Card>
          {!checking&&connected&&idle.warning?<Copy>{t('This chat will end soon. Send a message to keep it open.')}</Copy>:null}
          <ChatReadTranscript identity={`${scope}:${conversation.publicRef}`} active={!checking&&connected} onRead={async messageId=>{if(!live.current||scopeRef.current!==scope)return;if(owner){if(!('id'in conversation))throw Error('Support could not be updated.');await ownerRequest('owner/transport',{action:'read',conversationId:conversation.id,messageId,publicRef:conversation.publicRef} satisfies OwnerTransportCommand);}else await request('transport',{buyingToken:token,body:{action:'read',messageId,publicRef:conversation.publicRef}});}}>
          {conversation.messages.map((m) => (
            <View
              key={m.id}
              style={{
                alignSelf: m.sender === "visitor" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                backgroundColor: m.sender === "visitor" ? colors.soft : "white",
                borderRadius: 16,
                padding: 14,
                gap: 6,
              }}
            >
              <Copy>{m.body}</Copy>
              <Copy muted>
                {m.sender === "visitor" ? t("You") : m.senderName}
                {" · "}
                {new Date(Number(m.createdAt)).toLocaleTimeString(locale, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Copy>
              {m.sender==='visitor'?<Copy muted>{t(m.read?'Read':'Sent')}</Copy>:null}
              {m.sender==='staff'?<ChatReadSentinel messageId={m.id}/>:null}
            </View>
          ))}
          </ChatReadTranscript>
          {conversation.status === "closed" ? (
            <>
              {conversation.resolvedAt==null&&<Copy>{t(idle.autoEnded?'This chat ended because we did not hear back. Your messages are saved.':"Our team can still follow up by phone.")}</Copy>}
              {idle.autoEnded?<Button label={t(resuming?'Resuming…':'Resume chat')} disabled={busy||checking} onPress={()=>void send('resume')}/>:null}
              <Button
                label={t("Start another chat")}
                secondary={idle.autoEnded}
                disabled={busy || checking}
                onPress={() => void anotherChat()}
              />
            </>
          ) : (
            <>
              <Field
                label={t("Message")}
                multiline
                value={message}
                maxLength={4000}
                onChangeText={setMessage}
              />
              <Button
                disabled={busy || checking || !message.trim()}
                label={t("Send reply")}
                onPress={() => void send("message")}
              />
              <Button
                secondary
                disabled={busy || checking}
                label={t("End chat")}
                onPress={() => void send("close")}
              />
            </>
          )}
        </>
      ) : (
        ready &&
        !restoring && (
          <>
            <Copy big heading>{t(owner?OWNER_TRANSPORT_COPY.invitation:TRANSPORT_COPY.invitation)}</Copy>
            <Copy muted>{t(owner?OWNER_TRANSPORT_COPY.description:TRANSPORT_COPY.description)}</Copy>
            <View style={[intake.row, intake.route]}>
              <View style={intake.cell}><Field label={t("From")} value={origin} maxLength={120} onChangeText={setOrigin} placeholder={t("City or area")} /></View>
              <View style={intake.cell}><Field label={t("To")} value={destination} maxLength={120} onChangeText={setDestination} placeholder={t("City or area")} /></View>
            </View>
            <View style={intake.row}>
              <View style={intake.cell}><Field label={t("Name")} value={name} maxLength={80} onChangeText={setName} autoComplete="name" /></View>
              <View style={intake.cell}><Field label={t("Phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={40} placeholder="+251…" /></View>
            </View>
            <Field
              label={t("Goods or transport details (optional)")}
              value={message}
              maxLength={3700}
              style={intake.details}
              onChangeText={setMessage}
              multiline
            />
            <Copy muted>{t("We’ll reply here or call if you leave the chat.")}</Copy>
            <Button
              icon="chat"
              label={t("Start chat")}
              disabled={
                busy || !name.trim() || !phone.trim() || !origin.trim() || !destination.trim()
              }
              onPress={() => void send("start")}
            />
          </>
        )
      )}
    </Screen>
  );
}

const intake = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
  cell: { flex: 1, minWidth: 0 },
  route: { backgroundColor: colors.soft, borderColor: "#f0cbb8", borderWidth: 1, borderRadius: 12, padding: 12 },
  details: { minHeight: 68, borderWidth: 1, borderColor: "#cad3d7", borderRadius: 8, backgroundColor: "white", color: colors.ink, padding: 12, fontSize: 16, textAlignVertical: "top" },
});
