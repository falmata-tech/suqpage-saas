import StorefrontAccentPicker from "./StorefrontAccentPicker";
import { ShowroomContent } from "./ShowroomContent";
import React, { useState } from "react";
import { View, Platform, Alert } from "react-native";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import type { OwnerHome, Profile, Media, Offering } from "@suqpage/contracts";
import { useApp, useLoad, request, auth, API } from "./runtime";
import {
  Copy,
  Card,
  Field,
  Button,
  Chip,
  Photo,
  Status,
  s,
  openLink,
} from "./ui";
export function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  return {
    busy,
    error,
    notice,
    run: async (fn: () => Promise<void | false>, message = "Saved") => {
      setBusy(true);
      setError("");
      setNotice("");
      try {
        const result = await fn();
        if (result !== false) setNotice(message);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Please try again.");
      } finally {
        setBusy(false);
      }
    },
  };
}
export function ActionStatus({
  state,
}: {
  state: ReturnType<typeof useAction>;
}) {
  const { t } = useApp();
  return (
    <>
      <Status error={state.error} />
      {state.notice && <Copy>{t(state.notice)}</Copy>}
    </>
  );
}
export async function addAsset(
  form: FormData,
  field: string,
  asset: ImagePicker.ImagePickerAsset,
) {
  if (Platform.OS === "web") {
    const blob = await (await fetch(asset.uri)).blob();
    form.append(field, blob, asset.fileName || "photo.jpg");
  } else
    form.append(field, {
      uri: asset.uri,
      name: asset.fileName || "photo.jpg",
      type: asset.mimeType || "image/jpeg",
    } as unknown as Blob);
}
export async function pickImages(multiple = false) {
  // The system picker grants access only to the selected photos.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: multiple,
    selectionLimit: 8,
    quality: 0.8,
  });
  return result.canceled ? [] : result.assets;
}
export function Setup() {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [business, setBusiness] = useState(""),
    [category, setCategory] = useState(""),
    [consent, setConsent] = useState(false),
    [key] = useState(() => Crypto.randomUUID());
  const categories = useLoad(() =>
    request<{ categories: { key: string; label: string }[] }>("categories"),
  );
  return (
    <>
      <Copy big>{t("Account setup")}</Copy>
      <Field label={t("Your name")} value={name} onChangeText={setName} />
      <Field
        label={t("Account phone")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Field
        label={t("Business name")}
        value={business}
        onChangeText={setBusiness}
      />
      <Copy>{t("Category")}</Copy>
      <Status {...categories} retry={categories.reload} />
      <View style={s.wrap}>
        {categories.data?.categories.map((c) => (
          <Chip
            key={c.key}
            label={t(c.label)}
            selected={category === c.key}
            onPress={() => setCategory(c.key)}
          />
        ))}
      </View>
      <Chip
        label={t("I agree to the Terms and Privacy Policy")}
        selected={consent}
        onPress={() => setConsent(!consent)}
      />
      <View style={s.row}>
        <Button
          secondary
          label={t("Terms")}
          onPress={() => void openLink(API + "/terms")}
        />
        <Button
          secondary
          label={t("Privacy")}
          onPress={() => void openLink(API + "/privacy")}
        />
      </View>
      <ActionStatus state={action} />
      <Button
        disabled={
          action.busy || !consent || !category || !name || !phone || !business
        }
        label={t("Create your business page")}
        onPress={() =>
          void action.run(async () => {
            await ownerRequest("signup", {
              name,
              phone,
              businessName: business,
              businessCategory: category,
              consent,
              idempotencyKey: key,
            });
            router.replace({
              pathname: "/owner/[section]",
              params: { section: "page" },
            });
          }, "Your page is ready to edit")
        }
      />
    </>
  );
}
export function PageEditor({
  home,
  reload,
}: {
  home: OwnerHome;
  reload: () => void;
}) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const fallback: Profile = {
    template: "profile-v1",
    coverStyle: "blended",
    introduction: "",
    about: home.shop.about,
    heroImage: home.shop.cover,
    videoUrl: home.shop.videoUrl,
    accentColor: home.shop.accentColor,
    contacts: home.shop.contacts,
  };
  const [content, setContent] = useState<Profile>(
      home.draft?.content || fallback,
    ),
    [video, setVideo] = useState(""),
    [videoKey, setVideoKey] = useState(() => Crypto.randomUUID());
  const [version, setVersion] = useState(home.draft?.version),
    [preview, setPreview] = useState(false),
    [colorOpen, setColorOpen] = useState(false);
  const update = (key: keyof Profile, value: unknown) =>
    setContent((p) => ({ ...p, [key]: value }));
  return (
    <>
      <Copy big>{t("Your page")}</Copy>
      {preview ? (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><Button secondary label={t("Page color")} onPress={() => setColorOpen(!colorOpen)} /></View>
          {colorOpen && <StorefrontAccentPicker value={content.accentColor || ""} onChange={v => update("accentColor", v)} disabled={action.busy} onClose={() => setColorOpen(false)} />}
          <View style={{ flex: 1 }}><Button
            disabled={action.busy}
            label={t("Save changes")}
            onPress={() =>
              void action.run(async () => {
                const result = await ownerRequest<{ version: number }>(
                  "owner/page",
                  { action: version ? "save" : "start", version, content },
                );
                setVersion(result.version);
              })
            }
          /></View>
          </View>
          <ShowroomContent preview shop={{
            ...home.shop,
            about: content.about || content.introduction,
            cover: content.heroImage,
            videoUrl: content.videoUrl,
            accentColor: content.accentColor,
            contacts: content.contacts || home.shop.contacts,
            products: home.shop.products.filter(p => p.published),
          }} />
          <Button
            secondary
            label={t("Edit")}
            onPress={() => setPreview(false)}
          />
        </>
      ) : (
        <>
          <Photo refPath={content.heroImage} height={210} privateImage />
          <Button
            secondary
            disabled={action.busy}
            label={t("Cover photo")}
            onPress={() =>
              void action.run(async () => {
                const picked = await pickImages();
                if (!picked.length) return false;
                const form = new FormData();
                await addAsset(form, "file", picked[0]);
                const r = await ownerRequest<{ ref: string }>(
                  "owner/cover",
                  undefined,
                  form,
                );
                update("heroImage", r.ref);
              }, "Photo ready. Save your page to apply it.")
            }
          />
          <Field
            label={t("About the business")}
            multiline
            value={content.about}
            onChangeText={(v) => update("about", v)}
          />
          <View style={s.wrap}>
            {["blended", "overlay"].map((c) => (
              <Chip
                key={c}
                label={t(c === "blended" ? "Blended" : "Overlay")}
                selected={content.coverStyle === c}
                onPress={() => update("coverStyle", c)}
              />
            ))}
          </View>
          <Button secondary label={t("Page color")} onPress={() => { setPreview(true); setColorOpen(true); }} />
          <Copy big>{t("Public contact details")}</Copy>
          {(
            [
              "phone",
              "email",
              "whatsapp",
              "telegram",
              "tiktok",
              "instagram",
              "facebook",
              "website",
            ] as const
          ).map((key) => (
            <Field
              key={key}
              label={t(
                {
                  phone: "Phone",
                  email: "Email",
                  whatsapp: "WhatsApp",
                  telegram: "Telegram",
                  tiktok: "TikTok",
                  instagram: "Instagram",
                  facebook: "Facebook",
                  website: "Website",
                }[key],
              )}
              value={content.contacts?.[key] || ""}
              autoCapitalize="none"
              onChangeText={(v) =>
                setContent((p) => ({
                  ...p,
                  contacts: { ...p.contacts, [key]: v },
                }))
              }
            />
          ))}
          <Button
            secondary
            label={t("Preview")}
            onPress={() => setPreview(true)}
          />
          <Button
            disabled={action.busy}
            label={t("Save changes")}
            onPress={() =>
              void action.run(async () => {
                const result = await ownerRequest<{ version: number }>(
                  "owner/page",
                  { action: version ? "save" : "start", version, content },
                );
                setVersion(result.version);
              })
            }
          />
          {home.shop.status !== "active" && (
            <>
              <Copy muted>
                {t("Set up your page and items, then publish when ready.")}
              </Copy>
              {home.issues.map((i, j) => (
                <Copy key={j}>{t(i.label)}</Copy>
              ))}
              <Button
                disabled={action.busy}
                label={t("Publish page")}
                onPress={() =>
                  void action.run(async () => {
                    const saved = await ownerRequest<{
                      version: number;
                      publication: { revision: number } | null;
                    }>("owner/page", {
                      action: version ? "save" : "start",
                      version,
                      content,
                    });
                    setVersion(saved.version);
                    await ownerRequest("owner/publish", {
                      version: saved.version,
                      revision:
                        saved.publication?.revision || home.publicationRevision,
                    });
                    reload();
                  }, "Your page is live")
                }
              />
            </>
          )}
          <Card>
            <Copy>{t("Business video")}</Copy>
            <Field
              label={t("Video link")}
              value={video}
              onChangeText={setVideo}
              autoCapitalize="none"
            />
            <Copy muted>
              {t(
                "Send us a video link. Our team will review it for your page.",
              )}
            </Copy>
            <Button
              secondary
              disabled={action.busy || !video}
              label={t("Send video request")}
              onPress={() =>
                void action.run(async () => {
                  const result = await ownerRequest<{ id: number }>(
                    "owner/video",
                    {
                      target: "header",
                      sourceUrl: video,
                      idempotencyKey: videoKey,
                    },
                  );
                  setVideoKey(Crypto.randomUUID());
                  setVideo("");
                  router.push({
                    pathname: "/owner/[section]",
                    params: { section: "chat", id: result.id },
                  });
                }, "Request sent")
              }
            />
          </Card>
        </>
      )}
      <ActionStatus state={action} />
    </>
  );
}
export function ProductEditor({
  home,
  id,
  onSaved,
}: {
  home: OwnerHome;
  id?: string;
  onSaved: () => void;
}) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const product = home.shop.products.find((p) => p.id === Number(id));
  const [name, setName] = useState(product?.name || ""),
    [description, setDescription] = useState(product?.description || ""),
    [price, setPrice] = useState(
      product?.priceMinor === null || product?.priceMinor === undefined
        ? ""
        : String(product.priceMinor / 100),
    ),
    [kind, setKind] = useState(product?.kind || "standard_product"),
    [availability, setAvailability] = useState(
      product?.availability || "available",
    ),
    [published, setPublished] = useState(product?.published ?? true),
    [media, setMedia] = useState<Media[]>(product?.media || []),
    [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]),
    [video, setVideo] = useState(""),
    [key] = useState(() => Crypto.randomUUID()),
    [videoKey, setVideoKey] = useState(() => Crypto.randomUUID());
  if (id && !product) return <Copy>{t("Product not found.")}</Copy>;
  return (
    <>
      <Copy big>{t(product ? "Edit offering" : "Add product or service")}</Copy>
      <Field label={t("Name")} value={name} onChangeText={setName} />
      <View style={s.wrap}>
        {[
          ["standard_product", "Product"],
          ["service", "Service"],
          ["made_to_order", "Made to order"],
        ].map(([k, label]) => (
          <Chip
            key={k}
            label={t(label)}
            selected={kind === k}
            onPress={() => setKind(k)}
          />
        ))}
      </View>
      <Field
        label={t("Description")}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Field
        label={t("Price in ETB")}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <Copy>{t("Photos and videos")}</Copy>
      {media.map((m, i) => (
        <Card key={m.ref}>
          {m.kind === "image" ? (
            <Photo refPath={m.ref} privateImage height={130} />
          ) : (
            <Copy>{t("Video")}</Copy>
          )}
          <View style={s.row}>
            <Button
              secondary
              disabled={i === 0}
              label={t("Move up")}
              onPress={() =>
                setMedia((old) => {
                  const copy = [...old];
                  [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                  return copy;
                })
              }
            />
            <Button
              secondary
              label={t("Remove")}
              onPress={() => setMedia((old) => old.filter((_, j) => i !== j))}
            />
          </View>
        </Card>
      ))}
      {assets.map((a, i) => (
        <Card key={a.uri}>
          <Photo refPath={a.uri} height={130} />
          <Button
            secondary
            label={t("Remove")}
            onPress={() => setAssets((old) => old.filter((_, j) => j !== i))}
          />
        </Card>
      ))}
      <Button
        secondary
        disabled={action.busy}
        label={t("Add photos")}
        onPress={() =>
          void action.run(async () => {
            const chosen = await pickImages(true);
            if (
              chosen.length +
                assets.length +
                media.filter((m) => m.kind === "image").length >
              8
            )
              throw Error("Use up to 8 photos.");
            setAssets((old) => [...old, ...chosen]);
          }, "")
        }
      />
      <View style={s.wrap}>
        {[
          ["available", "Available"],
          ["limited", "Limited"],
          ["unavailable", "Unavailable"],
          ["coming_soon", "Coming soon"],
        ].map(([v, l]) => (
          <Chip
            key={v}
            label={t(l)}
            selected={availability === v}
            onPress={() => setAvailability(v)}
          />
        ))}
      </View>
      <Chip
        label={t("Show on my page")}
        selected={published}
        onPress={() => setPublished(!published)}
      />
      <ActionStatus state={action} />
      <Button
        disabled={action.busy || !name.trim()}
        label={t("Save changes")}
        onPress={() =>
          void action.run(async () => {
            const value = price.trim() === "" ? null : Number(price);
            if (value !== null && (!Number.isFinite(value) || value < 0))
              throw Error("Enter a valid price.");
            const form = new FormData();
            form.append(
              "details",
              JSON.stringify({
                name,
                description,
                priceMinor: value === null ? null : Math.round(value * 100),
                offeringKind: kind,
                availability,
                isPublished: published,
                expectedContentVersion: home.shop.version,
                idempotencyKey: key,
                media,
              }),
            );
            for (const asset of assets) await addAsset(form, "images", asset);
            await ownerRequest(
              "owner/products" + (id ? "/" + id : ""),
              undefined,
              form,
            );
            onSaved();
          })
        }
      />
      {product && (
        <Card>
          <Field
            label={t("Video link")}
            value={video}
            onChangeText={setVideo}
            autoCapitalize="none"
          />
          <Copy muted>
            {t("Send us a video link. Our team will review it for your page.")}
          </Copy>
          <Button
            secondary
            disabled={action.busy || !video}
            label={t("Send video request")}
            onPress={() =>
              void action.run(async () => {
                const result = await ownerRequest<{ id: number }>(
                  "owner/video",
                  {
                    target: "product",
                    productId: product.id,
                    sourceUrl: video,
                    idempotencyKey: videoKey,
                  },
                );
                setVideoKey(Crypto.randomUUID());
                setVideo("");
                router.push({
                  pathname: "/owner/[section]",
                  params: { section: "chat", id: result.id },
                });
              }, "Request sent")
            }
          />
        </Card>
      )}
    </>
  );
}
