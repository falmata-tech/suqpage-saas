import { Attachment, pickSupportFile, supportReplyForm, type PickedSupportFile } from "./support-files";
import { inquiryContactLinks } from "../../../lib/inquiry-contact-links";
import React, { useState, useCallback } from "react";
import { View, AppState } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Crypto from "expo-crypto";
import type { Page, Inquiry, Conversation, Message } from "@suqpage/contracts";
import { useApp, useLoad } from "./runtime";
import { Copy, Card, Field, Button, Chip, Status, s, openLink } from "./ui";
import { useAction, ActionStatus } from "./owner-forms";
export function Inquiries() {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("");
  const load = useLoad(
    () =>
      ownerRequest<Page<Inquiry>>(
        `owner/inquiries?page=${page}&status=${status}`,
      ),
    [page, status],
  );
  return (
    <>
      <Copy big>{t("Customer inquiries")}</Copy>
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
      <Status {...load} retry={load.reload} />
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
          {i.note && <Copy>{i.note}</Copy>}
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
      <Copy big>{t("Support")}</Copy>
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
      <Status {...load} retry={load.reload} />
      {load.data?.items.map((c) => (
        <Card key={c.id}>
          <Copy>{c.subject}</Copy>
          <Copy muted>
            {t(
              c.status === "closed"
                ? "Closed"
                : c.status === "waiting"
                  ? "Waiting"
                  : "Open",
            )}
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
  const { t, ownerRequest, locale } = useApp(),
    action = useAction();
  const [attachment,setAttachment]=useState<PickedSupportFile|null>(null);
  const [message, setMessage] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  type Thread = {
    conversation: { subject: string; status: string };
    messages: Message[];
  };
  const load = useLoad(() => ownerRequest<Thread>("owner/support/" + id), [id]);
  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      let timer: ReturnType<typeof setTimeout>;
      let failures = 0;
      async function poll() {
        if (
          AppState.currentState === "active" ||
          AppState.currentState === null
        )
          try {
            const value = await ownerRequest<Thread>("owner/support/" + id);
            if (!stopped) {
              load.setData(value);
              failures = 0;
            }
          } catch {
            failures++;
          }
        if (!stopped)
          timer = setTimeout(poll, Math.min(30000, 5000 * 2 ** failures));
      }
      timer = setTimeout(poll, 5000);
      return () => {
        stopped = true;
        clearTimeout(timer);
      };
    }, [id]),
  );
  return (
    <>
      <Status {...load} retry={load.reload} />
      {load.data && (
        <>
          <Copy big>{load.data.conversation.subject}</Copy>
          <Copy muted>
            {t(
              load.data.conversation.status === "closed"
                ? "Chat ended"
                : load.data.conversation.status === "waiting"
                  ? "Waiting for our team"
                  : "Live chat",
            )}
          </Copy>
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
            </Card>
          ))}
          <ActionStatus state={action} />
          {load.data.conversation.status === "closed" ? (
            <Button
              label={t("Reopen")}
              disabled={action.busy}
              onPress={() =>
                void action.run(async () => {
                  await ownerRequest("owner/support/" + id, {
                    action: "reopen",
                  });
                  load.reload();
                }, "")
              }
            />
          ) : (
            <>
              <Field
                label={t("Message")}
                multiline
                value={message}
                onChangeText={setMessage}
              />
              {attachment&&<><Copy>{attachment.name}</Copy><Button secondary label={t("Remove")} onPress={()=>setAttachment(null)}/></>}
              <Button secondary disabled={action.busy} label={t("Attach file")} onPress={()=>void action.run(async()=>{const file=await pickSupportFile();if(file)setAttachment(file);},"")}/>
              <Button
                disabled={action.busy || !message.trim()}
                label={t("Send reply")}
                onPress={() =>
                  void action.run(async () => {
                    if(attachment){await ownerRequest(`owner/support/${id}/attachments`,undefined,await supportReplyForm(attachment,message,key));}
                    else await ownerRequest("owner/support/" + id, {action:"message",message,idempotencyKey:key});
                    setAttachment(null);
                    setMessage("");
                    setKey(Crypto.randomUUID());
                    load.reload();
                  }, "")
                }
              />
              <Button
                secondary
                disabled={action.busy}
                label={t("End chat")}
                onPress={() =>
                  void action.run(async () => {
                    await ownerRequest("owner/support/" + id, {
                      action: "close",
                    });
                    load.reload();
                  }, "")
                }
              />
            </>
          )}
        </>
      )}
    </>
  );
}
