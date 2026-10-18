import {copyBrowserText,openCopiedBrowserLink} from "../../../lib/browser-clipboard";
import React, { useState, useMemo, useEffect } from "react";
import { View, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { buildSocialInquiryMessage, inquiryHandoffs,selectionKey } from "../../../lib/product-inquiry";
import {canOpenPublicContact} from '../../../lib/demo-inquiry-policy';
import type { Shop } from "@suqpage/contracts";
import { inquiryOptions } from "../src/inquiry-options";
import { useApp, useLoad, request, API, type BasketItem } from "../src/runtime";
import {useBlockedBusinesses} from '../src/blocked-businesses';
import {CatalogSafety} from '../src/CatalogSafety';
import {inquiryCatalogProduct,restoreCatalogSelections} from '../src/catalog-products';
import {useBusinessInquiry} from '../src/use-business-inquiry';
import {
  Screen,
  Copy,
  Field,
  Card,
  Button,
  Status,
  s,
  openLink,
} from "../src/ui";
export default function Inquiry() {
  const blocked=useBlockedBusinesses();
  const { handle, id, options } = useLocalSearchParams<{
      handle?: string;
      id?: string;
      options?: string;
    }>(),
    { t } = useApp();
  const targetHandle=handle;
  const load = useLoad(
    async () =>
      targetHandle
        ? request<Shop>("shops/" + encodeURIComponent(targetHandle))
        : null,
    [targetHandle],
  );
  const [note, setNote] = useState(""),
    [showNote, setShowNote] = useState(false),
    [error, setError] = useState(""),
    [copyFeedback, setCopyFeedback] = useState(""),
    [busy, setBusy] = useState(false);
  const shop = load.loading||load.error?null:load.data;
  const inquiry=useBusinessInquiry(shop);
  const items = useMemo<BasketItem[]>(() => {
    if (id) {
      const p = shop?.products.find((p) => p.id === Number(id)&&inquiryCatalogProduct(p));
      const parsed = inquiryOptions(options);
      return shop&&p ? restoreCatalogSelections(shop,[{ product: p, quantity: "", options: parsed }]) : [];
    }
    return inquiry.items;
  }, [id, shop, options, inquiry.items]);
  const summary = shop ? [buildSocialInquiryMessage(shop, items.map(item => ({
    id: item.product.id, name: item.product.name, quantity: item.quantity,
    options: item.options, service: item.product.kind === "service",
  })), API, t), note.trim()].filter(Boolean).join("\n\n") : "";
  const handoffs = shop ? inquiryHandoffs(shop.contacts, summary) : [];
  async function copyMessage() {
    try {
      return Platform.OS === "web" ? await copyBrowserText(summary) : await Clipboard.setStringAsync(summary);
    } catch { return false; }
  }
  const [fallback, setFallback] = useState<{href:string;label:string} | null>(null);
  useEffect(() => { setError(""); setCopyFeedback(""); setFallback(null); }, [summary]);
  async function handoff(link: ReturnType<typeof inquiryHandoffs>[number]) {
    if (!shop || !canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, link.kind)) return;
    setFallback(null);
    let copied: boolean, opened: boolean;
    if (Platform.OS === "web") ({copied,opened} = await openCopiedBrowserLink(summary,link.href,link.external));
    else {
      copied = await copyMessage();
      try { await openLink(link.href); opened=true; } catch { opened=false; }
    }
    setCopyFeedback(t(copied ? "Message copied. Paste it in the conversation if needed." : "Select and copy your message"));
    if (!opened) { setFallback(link); setError(t("Could not open the social app. Use the link below.")); }
  }
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if(shop&&blocked.list.some(b=>b.id===shop.id))return <Screen><CatalogSafety business={shop}><View/></CatalogSafety></Screen>;
  return (
    <Screen>
      <Status {...load} retry={load.reload} />
      <Status error={inquiry.error} retry={inquiry.retry}/>
      {shop && items.length > 0 ? (
        <>
          <Copy big>{shop.name}</Copy>
          {items.map((i, index) => (
            <Card key={`${i.product.id}-${index}`}>
              <Copy>{i.product.name}</Copy>
              {!id && (
                <>
                  <Field
                    label={t("Add quantity (optional)")}
                    value={i.quantity}
                    onChangeText={(quantity) =>
                      inquiry.setItems(items=>items.map(item=>selectionKey(item.product.id,item.options)===selectionKey(i.product.id,i.options)?{...item,quantity}:item))
                    }
                  />
                  <Button
                    secondary
                    label={t("Remove")}
                    onPress={() =>
                      inquiry.setItems(items=>items.filter(item=>selectionKey(item.product.id,item.options)!==selectionKey(i.product.id,i.options)))
                    }
                  />
                </>
              )}
            </Card>
          ))}
          <Button secondary label={t("Add a note (optional)")} onPress={() => setShowNote(value => !value)}/>
          {showNote && <Field label={t("Your message")} value={note} onChangeText={setNote} multiline/>}
          <Copy>{t("Message the business")}</Copy>
          <Copy muted>{t("Your message and selected products are copied before the conversation opens. Paste them if needed.")}</Copy>
          <View style={s.wrap}>
            {handoffs.map(link => <Button key={link.kind} label={link.label} disabled={busy || !canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, link.kind)}
              onPress={() => void run(() => handoff(link))} />)}
          </View>
          <View style={{alignItems:"flex-end"}}><Button secondary disabled={busy} label={t("Copy message")} onPress={() => void run(async () => {
              setCopyFeedback(t(await copyMessage() ? "Message copied. Paste it in the conversation if needed." : "Select and copy your message"));
            })} />
          </View>
          {!handoffs.length && <Copy muted>{t("No social contact is available here. You can still copy the message.")}</Copy>}
          <Card><Copy>{t("Your message")}</Copy><Copy selectable>{summary}</Copy></Card>
          {Boolean(copyFeedback) && <Copy>{copyFeedback}</Copy>}
          {Boolean(error) && <Copy>{error}</Copy>}
          {fallback && <Button secondary label={fallback.label + " ↗"} onPress={() => void run(() => openLink(fallback.href))}/>}
        </>
      ) : (
        !load.loading&&!load.error&&inquiry.ready&&!inquiry.error && <Copy>{t("Your inquiry list is empty.")}</Copy>
      )}
    </Screen>
  );
}
