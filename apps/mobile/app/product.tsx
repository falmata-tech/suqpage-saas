import {
  selectionKey,
  MAX_INQUIRY_SELECTIONS,
} from "../../../lib/product-inquiry";
import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { Shop } from "@suqpage/contracts";
import { useApp, useLoad, request } from "../src/runtime";
import { Screen, Copy, Card, Button, Chip, Status, s } from "../src/ui";
import Gallery from "../src/Gallery";
export default function Product() {
  const { handle, id } = useLocalSearchParams<{ handle: string; id: string }>(),
    { t, basket, setBasket } = useApp();
  const load = useLoad(
    () => request<Shop>("shops/" + encodeURIComponent(handle)),
    [handle],
  );
  const [options, setOptions] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState("");
  const shop = load.data,
    product = shop?.products.find((p) => p.id === Number(id));
  const ready =
    product &&
    ["available", "limited"].includes(product.availability) &&
    product.options.every((o) => options[o.name]);
  function inquire(single: boolean) {
    if (!shop || !product) return;
    const item = { product, quantity: "", options };
    if (single) {
      router.push({
        pathname: "/inquiry",
        params: {
          handle,
          id: String(product.id),
          options: JSON.stringify(options),
        },
      });
      return;
    }
    if (basket && basket.shop.id !== shop.id && basket.items.length) {
      setNotice(
        t(
          "Your inquiry list contains items from another business. Send or clear that list first.",
        ),
      );
      return;
    }
    const remaining = (basket?.items || []).filter(
      (i) =>
        selectionKey(i.product.id, i.options) !==
        selectionKey(product.id, options),
    );
    if (remaining.length >= MAX_INQUIRY_SELECTIONS) {
      setNotice(t("Use up to 20 items per inquiry."));
      return;
    }
    setBasket({
      shop,
      items: [...remaining, item],
    });
    setNotice(t("Added to inquiry list"));
  }
  return (
    <Screen>
      <Status {...load} retry={load.reload} />
      {shop && product ? (
        <>
          <Gallery media={product.media} />
          <Copy big>{product.name}</Copy>
          <Copy muted>{shop.name}</Copy>
          {product.priceMinor !== null && (
            <Copy big>{(product.priceMinor / 100).toLocaleString()} ETB</Copy>
          )}
          <Copy>{product.description}</Copy>
          {product.options.map((o) => (
            <Card key={o.name}>
              <Copy>{o.name}</Copy>
              <View style={s.wrap}>
                {o.values.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    selected={options[o.name] === v}
                    onPress={() => setOptions((s) => ({ ...s, [o.name]: v }))}
                  />
                ))}
              </View>
            </Card>
          ))}
          <Button
            accentColor={shop.accentColor}
            disabled={!ready}
            label={t("Inquire about this item only")}
            onPress={() => inquire(true)}
          />
          <Button
            accentColor={shop.accentColor}
            disabled={!ready}
            secondary
            label={t("Add to inquiry list")}
            icon="plus"
            onPress={() => inquire(false)}
          />
          {notice && <Copy>{notice}</Copy>}
          {basket && basket.items.length > 0 && (
            <Button
            accentColor={shop.accentColor}
              secondary
              label={t("View inquiry list") + ` (${basket.items.length})`}
              onPress={() => router.push("/inquiry")}
            />
          )}
        </>
      ) : (
        shop && <Copy>{t("Currently unavailable")}</Copy>
      )}
    </Screen>
  );
}
