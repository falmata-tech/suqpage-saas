import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import type { Shop } from "@suqpage/contracts";
import { inquiryOptions } from "../src/inquiry-options";
import { useApp, useLoad, request, API, type BasketItem } from "../src/runtime";
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
  const { handle, id, options } = useLocalSearchParams<{
      handle?: string;
      id?: string;
      options?: string;
    }>(),
    { t, basket, setBasket } = useApp();
  const load = useLoad(
    async () =>
      handle
        ? request<Shop>("shops/" + encodeURIComponent(handle))
        : basket?.shop || null,
    [handle, basket?.shop.id],
  );
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [note, setNote] = useState(""),
    [onPlatform, setPlatform] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [key] = useState(() => Crypto.randomUUID());
  const shop = load.data;
  const items = useMemo<BasketItem[]>(() => {
    if (id) {
      const p = shop?.products.find((p) => p.id === Number(id));
      const parsed = inquiryOptions(options);
      return p ? [{ product: p, quantity: "", options: parsed }] : [];
    }
    return basket?.items || [];
  }, [id, shop, options, basket]);
  const summary = shop
    ? [
        `Hello ${shop.name},`,
        ...items.map(
          (i) =>
            `${i.product.name}${i.quantity ? " · " + i.quantity : ""}${Object.entries(
              i.options,
            )
              .map(([k, v]) => ` · ${k}: ${v}`)
              .join("")}\n${API}/@${shop.handle}?product=${i.product.id}`,
        ),
        note,
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";
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
  return (
    <Screen>
      <Status {...load} retry={load.reload} />
      {shop && items.length > 0 && !sent ? (
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
                      setBasket((b) =>
                        b
                          ? {
                              ...b,
                              items: b.items.map((item, j) =>
                                index === j ? { ...item, quantity } : item,
                              ),
                            }
                          : b,
                      )
                    }
                  />
                  <Button
                    secondary
                    label={t("Remove")}
                    onPress={() =>
                      setBasket((b) =>
                        b
                          ? {
                              ...b,
                              items: b.items.filter((_, j) => index !== j),
                            }
                          : b,
                      )
                    }
                  />
                </>
              )}
            </Card>
          ))}
          <Field
            label={t("Your message")}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <Copy>{t("Send inquiry")}</Copy>
          {shop.contacts.whatsapp && (
            <Button
              label="WhatsApp"
              disabled={busy}
              onPress={() =>
                void run(() =>
                  openLink(
                    `https://wa.me/${shop.contacts.whatsapp!.replace(/\D/g, "")}?text=${encodeURIComponent(summary)}`,
                  ),
                )
              }
            />
          )}
          <View style={s.wrap}>
            {shop.contacts.telegram && (
              <Button
                secondary
                label="Telegram"
                onPress={() =>
                  void run(() =>
                    openLink(
                      `https://t.me/${shop.contacts.telegram!.replace(/^.*t.me\//, "").replace(/^@/, "")}?text=${encodeURIComponent(summary)}`,
                    ),
                  )
                }
              />
            )}
            <Button
              secondary
              label={t("Copy inquiry")}
              onPress={() =>
                void run(async () => {
                  await Clipboard.setStringAsync(summary);
                  setError(t("Copied"));
                })
              }
            />
            {shop.contacts.phone && (
              <Button
                secondary
                label="SMS"
                onPress={() =>
                  void run(() =>
                    openLink(
                      `sms:${shop.contacts.phone}?body=${encodeURIComponent(summary)}`,
                    ),
                  )
                }
              />
            )}
          </View>
          <Button
            secondary
            label={t("Send inquiry on Suqpage")}
            onPress={() => setPlatform(true)}
          />
          {onPlatform && (
            <Card>
              <Field label={t("Name")} value={name} onChangeText={setName} />
              <Field
                label={t("Phone")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Button
                disabled={busy || !name.trim() || !phone.trim()}
                label={t("Send inquiry")}
                onPress={() =>
                  void run(async () => {
                    await request("inquiries", {
                      body: {
                        businessId: shop.id,
                        customerName: name,
                        contact: phone,
                        contactMethod: "phone",
                        note,
                        idempotencyKey: key,
                        items: items.map((i) => ({
                          productId: i.product.id,
                          quantity: i.quantity,
                          options: i.options,
                        })),
                      },
                    });
                    setSent(true);
                    if (!id) setBasket(null);
                  })
                }
              />
            </Card>
          )}
          <Status error={error} />
        </>
      ) : sent ? (
        <Card>
          <Copy big>{t("Inquiry sent")}</Copy>
          <Copy>
            {t("The business can contact you using your phone number.")}
          </Copy>
        </Card>
      ) : (
        !load.loading && <Copy>{t("Your inquiry list is empty.")}</Copy>
      )}
    </Screen>
  );
}
