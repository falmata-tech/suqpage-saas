import { Attachment, pickSupportFile, supportReplyForm, type PickedSupportFile } from "./support-files";
import { inquiryContactLinks } from "../../../lib/inquiry-contact-links";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, AppState } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Crypto from "expo-crypto";
import type { Page, Inquiry, Conversation, Message } from "@suqpage/contracts";
import { useApp, useLoad } from "./runtime";
import { Copy, Card, Field, Button, Chip, Status, s, openLink } from "./ui";
import { useAction, ActionStatus } from "./owner-forms";
import ChatReadSentinel,{ChatReadTranscript} from './ChatReadSentinel';
import { supportIdlePresentation } from '../../../lib/support-idle-contract';
import {clientChatPresentation,type ClientChatSnapshot} from '../../../lib/support-client-state';
import ResourceLoading from './ResourceLoading';
export function Inquiries({focusId}:{focusId?:string}={}) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("");
  const [focus,setFocus]=useState(focusId||'');useEffect(()=>{setFocus(focusId||'');setPage(1);},[focusId]);
  const load = useLoad(
    () =>
      ownerRequest<Page<Inquiry>>(
        `owner/inquiries?page=${page}&status=${status}&inquiry=${encodeURIComponent(focus)}`,
      ),
    [page, status,focus],
  );
  return (
    <>
      <Copy big>{t("Inquiry history")}</Copy>
      <Copy muted>{t("Saved inquiries from before social-only contact.")}</Copy>
      {Boolean(focus)&&<Button secondary label={t('All inquiries')} onPress={()=>setFocus('')}/>}
      <View style={s.wrap}>
        {["", "new", "contacted", "confirmed", "closed", "cancelled"].map(
          (v) => (
            <Chip
              key={v}
              label={t(v ? v[0].toUpperCase() + v.slice(1) : "All")}
              selected={v === status}
              onPress={() => {
                setStatus(v);
                setPage(1);
              }}
            />
          ),
        )}
      </View>
      <ResourceLoading load={load} variant="rows"/>
      <ActionStatus state={action} />
      {load.data?.items.map((i) => (
        <Card key={i.id}>
          <Copy big>{i.customerName}</Copy>
          <Copy>{i.contact}</Copy>
          {i.items.map((item, j) => (
            <Copy key={j}>
              {item.name}
              {item.quantity ? " · " + item.quantity : ""}
            </Copy>
          ))}
          {i.items.map((item,j)=>Object.keys(item.options||{}).length>0&&<Copy key={`options-${j}`}>{Object.entries(item.options).map(([k,v])=>`${k}: ${v}`).join(" · ")}</Copy>)}
          {Boolean(i.note) && <Copy>{i.note}</Copy>}
          {inquiryContactLinks(i.contactMethod,i.contact).map(link=><Button key={link.label} secondary label={t(link.label)} onPress={()=>void action.run(()=>openLink(link.href))}/>)}
          <View style={s.wrap}>
            {["new", "contacted", "confirmed", "closed", "cancelled"].map(
              (v) => (
                <Chip
                  key={v}
                  label={t(v[0].toUpperCase() + v.slice(1))}
                  selected={v === i.status}
                  onPress={() =>
                    void action.run(async () => {
                      await ownerRequest(`owner/inquiries/${i.id}`, {
                        status: v,
                      });
                      load.reload();
                    })
                  }
                />
              ),
            )}
          </View>
        </Card>
      ))}
      {load.data && !load.data.items.length && (
        <Copy>{t("No inquiries yet.")}</Copy>
      )}
      <View style={s.row}>
        <Button
          secondary
          label={t("Previous")}
          disabled={page <= 1}
          onPress={() => setPage((p) => p - 1)}
        />
        <Copy>
          {load.data?.page || page} / {load.data?.pages || 1}
        </Copy>
        <Button
          secondary
          label={t("Next")}
          disabled={!load.data || page >= load.data.pages}
          onPress={() => setPage((p) => p + 1)}
        />
      </View>
    </>
  );
}
export function SupportList() {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const [page, setPage] = useState(1),
    [subject, setSubject] = useState(""),
    [message, setMessage] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  const load = useLoad(
    () => ownerRequest<Page<Conversation>>("owner/support?page=" + page),
    [page],
  );
  return (
    <>
      <Copy big heading>{t("Support")}</Copy>
      <Card>
        <Field label={t("Subject")} value={subject} onChangeText={setSubject} />
        <Field
          label={t("How can we help?")}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <ActionStatus state={action} />
        <Button
          disabled={action.busy || !subject.trim() || !message.trim()}
          label={t("Start chat")}
          onPress={() =>
            void action.run(async () => {
              const result = await ownerRequest<{ id: number }>(
                "owner/support",
                { subject, message, idempotencyKey: key },
              );
              setKey(Crypto.randomUUID());
              setSubject("");
              setMessage("");
              load.reload();
              router.push({
                pathname: "/owner/[section]",
                params: { section: "chat", id: result.id },
              });
            }, "")
          }
        />
      </Card>
      <ResourceLoading load={load} variant="rows"/>
      {load.data?.items.map((c) => (
        <Card key={c.id}>
          <Copy>{c.subject}</Copy>
          <Copy muted>
            {t(clientChatPresentation(c).statusKey)}
          </Copy>
          <Button
            secondary
            label={t("Open")}
            onPress={() =>
              router.push({
                pathname: "/owner/[section]",
                params: { section: "chat", id: c.id },
              })
            }
          />
        </Card>
      ))}
      <View style={s.row}>
        <Button
          secondary
          label={t("Previous")}
          disabled={page <= 1}
          onPress={() => setPage((p) => p - 1)}
        />
        <Button
          secondary
          label={t("Next")}
          disabled={!load.data || page >= load.data.pages}
          onPress={() => setPage((p) => p + 1)}
        />
      </View>
    </>
  );
}
export function OwnerChat({ id }: { id: string }) {
  const { t, ownerRequest, locale,session } = useApp(),
    action = useAction();
  const [attachment,setAttachment]=useState<PickedSupportFile|null>(null);
  const [message, setMessage] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  type Thread = {
    conversation: ClientChatSnapshot & { subject: string; assistanceCategory?:string; publicRef?:string;idleWarningAt?:number|null;idleEndsAt?:number|null;idleEndedAt?:number|null };
    messages: Message[];
  };
  const [data,setData]=useState<Thread|null>(null),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[revision,setRevision]=useState(0);
  const current=useRef(data);current.current=data;
  const version=useRef(0),focused=useRef(false),reading=useRef(false),commandBusy=useRef(false);
  const reload=()=>{setLoading(true);setRevision(value=>value+1);};
  const load={data,loading,error:loadError,reload};
  const idle=data?supportIdlePresentation(data.conversation,Date.now()):{warning:false,autoEnded:false};
  const presentation=data?clientChatPresentation(data.conversation):null;
  useEffect(()=>{current.current=null;setData(null);setMessage('');setAttachment(null);setLoadError('');setLoading(true);},[id]);
  useFocusEffect(
    useCallback(() => {
      focused.current=true;
      let stopped = false;
      let timer: ReturnType<typeof setTimeout>;
      let failures = 0,settled=false;
      async function poll() {
        if(stopped)return;
        const generation=version.current,expectedRef=current.current?.conversation.publicRef;
        if (!reading.current&&!commandBusy.current&&(AppState.currentState === "active" || AppState.currentState === null)&&(typeof document==='undefined'||!document.hidden)) {
          reading.current=true;
          try {
            const value = await ownerRequest<Thread>("owner/support/" + id);
            if (!stopped&&generation===version.current) {
              if(value.conversation.assistanceCategory==='shipment_observation'){current.current=null;setData(null);setLoading(false);router.replace({pathname:'/owner/[section]',params:{section:'transport',id,returnTo:'profile'}});return;}
              if(expectedRef&&value.conversation.publicRef!==expectedRef)throw Error('Support could not be updated.');
              current.current=value;setData(value);setLoadError('');setLoading(false);
              settled=true;
              failures = 0;
            }
          } catch(error) {
            if(!stopped&&generation===version.current){failures++;setLoading(false);setLoadError(error instanceof Error?error.message:'Please try again.');}
          }finally{reading.current=false;}
        }
        if (!stopped)
          timer = setTimeout(poll, settled&&current.current?.conversation.status==='closed'?30000:Math.min(30000, 5000 * 2 ** Math.min(failures,3)));
      }
      void poll();
      return () => {
        stopped = true;
        focused.current=false;version.current++;
        clearTimeout(timer);
      };
    }, [id,ownerRequest,revision]),
  );
  function runCommand(work:()=>Promise<void>,after?:()=>void){
    if(commandBusy.current||loading||!data)return;
    commandBusy.current=true;const generation=++version.current;
    void action.run(async()=>{
      try{await work();if(!focused.current||generation!==version.current)return false;after?.();}
      catch(error){if(focused.current&&generation===version.current)throw error;return false;}
      finally{commandBusy.current=false;if(focused.current&&generation===version.current)reload();}
    },'');
  }
  return (
    <>
      <ResourceLoading load={load} variant="thread"/>
      {load.data && (
        <>
          <Copy big heading>{load.data.conversation.subject}</Copy>
          <Copy muted>
            {t(presentation!.statusKey)}
          </Copy>
          {presentation?.joined?<Copy muted>{t(presentation.joined.key,presentation.joined.values)}</Copy>:null}
          {load.data.conversation.publicRef?<Copy muted>{load.data.conversation.publicRef}</Copy>:null}
          {!loading&&idle.warning?<Copy>{t('This chat will end soon. Send a message to keep it open.')}</Copy>:null}
          {idle.autoEnded?<Copy>{t('This chat ended because we did not hear back. Your messages are saved.')}</Copy>:null}
          <ChatReadTranscript identity={`${session?.user.id??''}:${id}:${load.data.conversation.publicRef??''}`} active={!loading&&!loadError} onRead={async messageId=>{if(!focused.current||current.current?.conversation.publicRef!==load.data?.conversation.publicRef)return;await ownerRequest('owner/support/'+id,{action:'read',messageId,publicRef:load.data?.conversation.publicRef});}}>
          {load.data.messages.map((m) => (
            <Card key={m.id}>
              <Copy muted>
                {m.senderName} ·{" "}
                {new Date(Number(m.createdAt)).toLocaleTimeString(locale, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Copy>
              <Copy>{m.body}</Copy>
              {m.attachment&&<Attachment conversationId={id} file={m.attachment}/>}
              {m.sender==='owner'?<Copy muted>{t(m.read?'Read':'Sent')}</Copy>:null}
              {m.sender==='staff'?<ChatReadSentinel messageId={m.id}/>:null}
            </Card>
          ))}
          </ChatReadTranscript>
          <ActionStatus state={action} />
          {load.data.conversation.status === "closed" ? (
            <Button
              label={t(idle.autoEnded?(action.busy?'Resuming…':'Resume chat'):"Reopen")}
              disabled={action.busy||loading}
              onPress={() =>
                runCommand(async () => {
                  await ownerRequest("owner/support/" + id, {
                    action: "reopen",
                  });
                })
              }
            />
          ) : (
            <>
              <Field
                label={t("Message")}
                multiline
                value={message}
                onChangeText={setMessage}
                editable={!action.busy&&!loading}
              />
              {attachment&&<><Copy>{attachment.name}</Copy><Button secondary label={t("Remove")} onPress={()=>setAttachment(null)}/></>}
              <Button secondary disabled={action.busy} label={t("Attach file")} onPress={()=>void action.run(async()=>{const file=await pickSupportFile();if(file)setAttachment(file);},"")}/>
              <Button
                disabled={action.busy || loading || !message.trim()}
                label={t("Send reply")}
                onPress={() =>
                  runCommand(async () => {
                    if(attachment){await ownerRequest(`owner/support/${id}/attachments`,undefined,await supportReplyForm(attachment,message,key));}
                    else await ownerRequest("owner/support/" + id, {action:"message",message,idempotencyKey:key});
                  },()=>{
                    setAttachment(null);
                    setMessage("");
                    setKey(Crypto.randomUUID());
                  })
                }
              />
              <Button
                secondary
                disabled={action.busy||loading}
                label={t("End chat")}
                onPress={() =>
                  runCommand(async () => {
                    await ownerRequest("owner/support/" + id, {
                      action: "close",
                    });
                  })
                }
              />
            </>
          )}
        </>
      )}
    </>
  );
}
