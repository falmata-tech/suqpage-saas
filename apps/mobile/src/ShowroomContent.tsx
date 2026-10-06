import { storefrontAccent } from "../../../lib/storefront-accent";
import React, { useState } from "react";
import {
  View,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import type { Shop, Offering } from "@suqpage/contracts";
import { useApp, API } from "./runtime";
import {
  Photo,
  LinkedText,
  Button,
  useOpenLink,
  colors,
  Icon,
} from "./ui";
import YouTubeVideo from "./YouTubeVideo";
import { publicContactLinks } from "../../../lib/business-profile-contacts";
import Gallery from "./Gallery";
export function ShowroomContent({ shop, preview = false }: { shop: Shop; preview?: boolean }) {
  const { t, basket } = useApp(), { fontScale } = useWindowDimensions();
  const accent = storefrontAccent(shop.accentColor);
  const openLink = useOpenLink();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Offering | null>(null);
  if (preview && selected) return <View style={{ gap: 14 }}>
    <Button secondary label={t("Back")} onPress={() => setSelected(null)} />
    <Gallery media={selected.media} privateImage />
    <Text style={v.title}>{selected.name}</Text>
    {selected.priceMinor !== null && <Text style={v.price}>{(selected.priceMinor / 100).toLocaleString()} ETB</Text>}
    <LinkedText style={v.body}>{selected.description}</LinkedText>
  </View>;
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const products =
    shop?.products.filter((p) =>
      words.every((w) =>
        (p.name + " " + p.description).toLocaleLowerCase().includes(w),
      ),
    ) || [];
  return (
    <View style={{
          paddingBottom: 24,
          maxWidth: 760,
          width: "100%",
          alignSelf: "center",
          backgroundColor: "white",
        }}
      >
        {shop && (
          <>
            {shop.isDemo && (
              <Text style={v.demo}>
                {t(
                  "Demo business — products and contact details are examples.",
                )}
              </Text>
            )}
            <View style={accent ? { borderBottomWidth: 4, borderColor: accent.accent } : undefined}>
            {shop.videoUrl ? (
              <YouTubeVideo
                video={shop.videoUrl}
                poster={shop.cover}
                posterTint={accent?.accent}
                privateImage={preview}
                height={210}
              />
            ) : (
              <View><Photo refPath={shop.cover} height={210} privateImage={preview} />{accent && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: accent.accent, opacity: .08 }]} />}</View>
            )}
            </View>
            <View style={v.section}>
              {accent && shop.logo ? <View style={{ width: 60, padding: 5, borderRadius: 12, borderWidth: 2, borderColor: accent.edge, backgroundColor: accent.soft }}><Photo refPath={shop.logo} height={46} privateImage={preview} /></View> : null}
              <Text style={v.handle}>@{shop.handle}</Text>
              <Text style={v.title}>{shop.name}</Text>
              <LinkedText style={v.body}>{shop.about}</LinkedText>
            </View>
            <View style={v.section}>
              <Text style={[v.heading, accent && { color: accent.ink, borderBottomWidth: 3, borderColor: accent.edge, paddingBottom: 12 }]}>
                {t("Products & services")}{" "}
                <Text style={v.handle}>({shop.products.length})</Text>
              </Text>
              <View style={v.search}>
                <Icon name="search" size={19} />
                <TextInput
                  accessibilityLabel={t("Search this business")}
                  placeholder={t("Search this business")}
                  value={query}
                  onChangeText={setQuery}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    color: colors.ink,
                    fontSize: 14,
                  }}
                />
                {query !== "" && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("Clear")}
                    onPress={() => setQuery("")}
                    style={{ padding: 10 }}
                  >
                    <Icon name="close" size={18} />
                  </Pressable>
                )}
              </View>
              <View style={v.grid}>
                {products.map((p) => (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    onPress={() =>
                      preview ? setSelected(p) : router.push({
                        pathname: "/product",
                        params: { handle: shop.handle, id: p.id },
                      })
                    }
                    style={[
                      v.product,
                      { width: fontScale > 1.3 ? "100%" : "48%" },
                    ]}
                  >
                    <Photo
                      refPath={
                        p.media.find((m) => m.kind === "image")?.ref || ""
                      }
                      privateImage={preview}
                      height={160}
                    />
                    <View style={{ padding: 10, gap: 6 }}>
                      <Text style={v.productName}>{p.name}</Text>
                      {p.priceMinor !== null && (
                        <Text style={v.price}>
                          {(p.priceMinor / 100).toLocaleString()} ETB
                        </Text>
                      )}
                      <Text style={[v.link, accent && { color: accent.ink }]}>{t("View details")} →</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              {products.length === 0 && (
                <Text style={v.body}>{t("No matches found")}</Text>
              )}
              {!preview && basket?.shop.id === shop.id && basket.items.length > 0 && (
                <Button
                  secondary
                  accentColor={shop.accentColor}
                  label={t("View inquiry list") + ` (${basket.items.length})`}
                  onPress={() => router.push("/inquiry")}
                />
              )}
            </View>
            <View style={[v.contact, accent && { backgroundColor: accent.soft, borderTopWidth: 2, borderColor: accent.edge }]}>
              <Text style={[v.title, { color: accent ? colors.ink : "white" }]}>
                {t("Stay in touch")}
              </Text>
              {publicContactLinks(shop.contacts).map((c) => (
                <Pressable
                  key={c.kind}
                  accessibilityRole="link"
                  accessibilityLabel={t(c.label)}
                  onPress={() => void openLink(c.href)}
                  style={[v.contactLink, accent && { borderColor: accent.edge }]}
                >
                  <Text
                    style={{ color: accent?.ink || "white", fontSize: 15, fontWeight: "600" }}
                  >
                    {t(c.label)}
                  </Text>
                  <Icon name="arrow" color={accent?.ink || "white"} size={18} />
                </Pressable>
              ))}
              {!preview && <Button secondary label={t("Open website")} onPress={()=>void openLink(`${API}/@${shop.handle}`)}/> }
            </View>
          </>
        )}
    </View>
  );
}
const v = StyleSheet.create({
  demo: {
    backgroundColor: colors.soft,
    color: colors.brand,
    fontSize: 11,
    padding: 9,
    textAlign: "center",
  },
  play: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#0002",
  },
  playCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0008",
    borderWidth: 1,
    borderColor: "#ffffffaa",
  },
  section: { padding: 18, gap: 14 },
  handle: { fontSize: 12, color: colors.muted },
  title: { fontSize: 25, lineHeight: 31, fontWeight: "800", color: colors.ink },
  body: { fontSize: 14, lineHeight: 22, color: colors.muted },
  heading: { fontSize: 18, fontWeight: "700", color: colors.ink },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  product: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    overflow: "hidden",
  },
  productName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  price: { fontSize: 13, fontWeight: "600", color: colors.ink },
  link: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
    paddingVertical: 9,
  },
  contact: { backgroundColor: "#263a38", padding: 22, gap: 12, marginTop: 12 },
  contactLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffffff44",
    borderRadius: 6,
  },
});
