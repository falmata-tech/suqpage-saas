import React, { useEffect, useState, useCallback } from "react";
import {TRANSPORT_COPY} from "../../../lib/i18n/transport-copy";
import { useFocusEffect } from "expo-router";
import { AppState, View, StyleSheet } from "react-native";
import * as Crypto from "expo-crypto";
import type { Buying } from "@suqpage/contracts";
import { useApp, request, secure, ApiFailure } from "../src/runtime";
import { Screen, Copy, Card, Field, Button, Status, colors } from "../src/ui";
import ChatReadSentinel from '../src/ChatReadSentinel';
import {TransportAlerts} from '../src/AttentionAlerts';
export default function BuyingScreen() {
  const { t, locale } = useApp();
  const [conversation, setConversation] = useState<Buying | null>(null),
    [token, setToken] = useState(""),
    [ready, setReady] = useState(false),
    [restoring, setRestoring] = useState(false),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [origin, setOrigin] = useState(""),
    [destination, setDestination] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  useEffect(() => {
    let live = true;
    secure.getItem("suqpage-transport").then((value) => {
      if (live) {
        setToken(value || "");
        setRestoring(Boolean(value));
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let active = true,
        timer: ReturnType<typeof setTimeout>,
        failures = 0;
      async function poll() {
        if (
          AppState.currentState === "active" ||
          AppState.currentState === null
        )
          try {
            const data = await request<{ conversation: Buying | null }>(
              "transport",
              { buyingToken: token },
            );
            if (active) {
              setConversation(data.conversation);
              setRestoring(false);
              setError("");
              failures = 0;
              if (data.conversation?.status === "closed") return;
            }
          } catch (e) {
            if (active) {
              if (e instanceof ApiFailure && [401, 404].includes(e.status)) {
                await secure.removeItem("suqpage-transport");
                setToken("");
                setConversation(null);
                setRestoring(false);
                setError("");
                return;
              }
              setError(t("Reconnecting…"));
              failures++;
            }
          }
        if (active)
          timer = setTimeout(poll, Math.min(30000, 5000 * 2 ** failures));
      }
      void poll();
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [token]),
  );
  async function send(action: "start" | "message" | "close") {
    setBusy(true);
    setError("");
    try {
      const data = await request<{ token?: string; conversation: Buying }>(
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
      if (data.token) {
        await secure.setItem("suqpage-transport", data.token);
        setToken(data.token);
      }
      setConversation(data.conversation);
      setMessage("");
      setKey(Crypto.randomUUID());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Copy muted>{t("Live Chat")}</Copy>
      <Status loading={!ready || restoring} error={error} />
      {conversation ? (
        <>
          <TransportAlerts token={token}/>
          <Card>
            <Copy big>
              {t(
                conversation.status === "closed"
                  ? "Chat ended"
                  : conversation.agentJoined ? 'An agent joined your chat' : conversation.messages.some(message => message.sender === "staff")
                    ? "Chat connected"
                    : "Waiting for our transport team",
              )}
            </Copy>
            {Boolean(conversation.assignedUserName) && (
              <Copy>{t('Assigned to {value1}',{value1:conversation.assignedUserName||''})}</Copy>
            )}
            <Copy muted>{conversation.publicRef}</Copy>
          </Card>
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
              {m.sender==='staff'&&m.id===conversation.messages.filter(item=>item.sender==='staff').at(-1)?.id ? <ChatReadSentinel messageId={m.id} onRead={async messageId=>{await request('transport',{buyingToken:token,body:{action:'read',messageId,publicRef:conversation.publicRef}});}}/>:null}
            </View>
          ))}
          {conversation.status === "closed" ? (
            <>
              <Copy>{t("Our team can still follow up by phone.")}</Copy>
              <Button
                label={t("Start another chat")}
                onPress={async () => {
                  try{await request('transport/attention',{buyingToken:token,body:{action:'unsubscribe'}});}catch{/* Retained history stays private; expiry also fences delivery. */}
                  await secure.removeItem("suqpage-transport");
                  setToken("");
                  setConversation(null);
                  setKey(Crypto.randomUUID());
                }}
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
                disabled={busy || !message.trim()}
                label={t("Send reply")}
                onPress={() => void send("message")}
              />
              <Button
                secondary
                disabled={busy}
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
            <Copy big>{t(TRANSPORT_COPY.invitation)}</Copy>
            <Copy muted>{t(TRANSPORT_COPY.description)}</Copy>
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
