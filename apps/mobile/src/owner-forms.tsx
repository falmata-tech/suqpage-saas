import {Sheet} from "./chrome";
import {File as PickedFile} from 'expo-file-system';
import {appendPickedImage} from './image-upload';
import CitySelector from './CitySelector';
import { HandleInput, HandleEditor } from "./owner-handle";
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
  useOpenLink,
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
      <Status loading={state.busy} error={state.error} />
      {Boolean(state.notice) && <Copy>{t(state.notice)}</Copy>}
    </>
  );
}
export async function addAsset(
  form: FormData,
  field: string,
  asset: ImagePicker.ImagePickerAsset,
) {
  await appendPickedImage(form,field,asset,async uri=>{
    if(Platform.OS==='web')return (await fetch(uri)).blob();
    if(!/^(?:file|content):\/\//.test(uri))throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.');
    return new PickedFile(uri);
  });
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
  const openLink = useOpenLink();
  const { t, ownerRequest, session } = useApp(),
    action = useAction();
  const [placeId,setPlaceId]=useState("");
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [business, setBusiness] = useState(""),
    [handle, setHandle] = useState(""),
    [handleReady, setHandleReady] = useState(false),
    [handleRevision, setHandleRevision] = useState(0),
    [category, setCategory] = useState(""),
    [consent, setConsent] = useState(false),
    [key] = useState(() => Crypto.randomUUID());
  const categories = useLoad(() =>
    request<{ categories: { key: string; label: string }[] }>("categories"),
  );
  return (
    <>
      <Copy big>{t("Account setup")}</Copy>
      <Copy muted>{t("Verified email")}</Copy>
      <Copy>{session?.user.email || ""}</Copy>
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
      <CitySelector onSelect={place=>setPlaceId(place?.id || "")}/>
      <HandleInput value={handle} onChange={setHandle} onReady={setHandleReady} refreshKey={handleRevision} />
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
          action.busy || !consent || !category || !name || !phone || !business || !handleReady || !placeId
        }
        label={t("Create your business page")}
        onPress={() =>
          void action.run(async () => {
            try { await ownerRequest("signup", {
              name,
              phone,
              businessName: business,
              handle,
              businessCategory: category,
              placeId,
              consent,
              idempotencyKey: key,
            }); } catch (error) { setHandleReady(false); setHandleRevision(v => v + 1); throw error; }
            router.replace({
              pathname: "/owner/[section]",
              params: { section: "page", view: "preview" },
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
  initialPreview = false,
  onSaved,
}: {
  home: OwnerHome;
  reload: () => void;
  initialPreview?: boolean;
  onSaved?: () => void;
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
    [preview, setPreview] = useState(initialPreview),
    [colorOpen, setColorOpen] = useState(false);
  const [publicationReview, setPublicationReview] = useState<{
    version: number;
    revision: number;
    issues: OwnerHome["issues"];
  } | null>(null);
  const update = (key: keyof Profile, value: unknown) =>
    setContent((p) => ({ ...p, [key]: value }));
  async function reviewPublication() {
    let reviewVersion = version;
    if (JSON.stringify(content) !== JSON.stringify(home.draft?.content || fallback) || !version) {
      const saved = await ownerRequest<{ version: number }>("owner/page", {
        action: version ? "save" : "start", version, content,
      });
      reviewVersion = saved.version;
      setVersion(saved.version);
    }
    const current = await ownerRequest<OwnerHome>("owner/home");
    if (current.shop.status !== "draft" || !current.draft) { reload(); return; }
    if (reviewVersion && current.draft.version !== reviewVersion) {
      setContent(current.draft.content);
      setVersion(current.draft.version);
      throw new Error("The draft has changed. Reload and review it before publishing.");
    }
    setVersion(current.draft.version);
    setPublicationReview({
      version: current.draft.version,
      revision: current.publicationRevision,
      issues: current.issues,
    });
  }
  function openMissing(label: string) {
    setPublicationReview(null);
    if(label==='Replace or remove sample offerings')router.push({pathname:'/owner/[section]',params:{section:'products'}});
    else if(label==='Choose your business location')router.push({pathname:'/owner/[section]',params:{section:'business'}});
    else {setPreview(false);router.setParams({view:'edit'});}
  }
  return (
    <>
      <Copy big>{t("Your page")}</Copy>
      <ActionStatus state={action}/>

      {preview ? (
        <>
          <Copy muted>{t(home.shop.status === "active" ? "Your page is live" : "Private until you publish")}</Copy>
          <View style={s.row}>
            <View style={{ flex: 1 }}><Button secondary label={t("Edit")} onPress={() => {router.setParams({view:"edit"}); setPreview(false);}} /></View>
            {home.shop.status === "draft" && <View style={{ flex: 1 }}><Button label={t("Publish")} disabled={action.busy} onPress={() => void action.run(reviewPublication, "")} /></View>}
          </View>
          {colorOpen || JSON.stringify(content) !== JSON.stringify(home.draft?.content || fallback) ? <View style={{ flexDirection: 'row', gap: 8 }}>
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
                onSaved?.();
              })
            }
          /></View>
          </View> : null}
          <ShowroomContent preview shop={{
            ...home.shop,
            about: content.about || content.introduction,
            cover: content.heroImage,
            videoUrl: content.videoUrl,
            accentColor: content.accentColor,
            contacts: content.contacts || home.shop.contacts,
            products: home.shop.products.filter(p => p.published),
          }} />
        </>
      ) : (
        <>
          {!onSaved && <HandleEditor initialHandle={home.shop.handle} onSaved={reload} />}
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
          <Copy muted>{t("TikTok, YouTube, Facebook videos or Instagram Reels")}</Copy>
          <Field label={t("Business video")} value={content.videoUrl} onChangeText={value=>update("videoUrl",value)} autoCapitalize="none"/>
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
                onSaved?.();
              })
            }
          />
          {home.shop.status === "draft" && <Button label={t("Publish page")} disabled={action.busy} onPress={()=>void action.run(reviewPublication,'')}/>}

        </>
      )}
      {publicationReview&&<Sheet visible title={t('Publish page')} onClose={()=>{if(!action.busy)setPublicationReview(null);}}><ActionStatus state={action}/>
        <Copy muted>{t('Your page and listed products or services will be visible to customers. You can update them any time.')}</Copy>
        {publicationReview.issues.map(issue=><Button key={issue.label} secondary label={t(issue.label)} onPress={()=>openMissing(issue.label)}/>)}
        <Button label={t('Publish page')} disabled={action.busy||publicationReview.issues.length>0} onPress={()=>void action.run(async()=>{await ownerRequest('owner/publish',{version:publicationReview.version,revision:publicationReview.revision});setPublicationReview(null);if(onSaved)onSaved();else reload();},'Your page is live')}/>
        <Button secondary label={t('Cancel')} disabled={action.busy} onPress={()=>setPublicationReview(null)}/>
      </Sheet>}
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
    [media, setMedia] = useState<Media[]>(product?.media || (home.exampleVideoRef?[{kind:"video",ref:home.exampleVideoRef}]:[])),
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
      <Card><Copy muted>{t("TikTok, YouTube, Facebook videos or Instagram Reels")}</Copy><Field label={t("Video link")} value={video} onChangeText={setVideo} autoCapitalize="none"/><Button secondary disabled={action.busy||!video.trim()||media.filter(item=>item.kind==='video').length>=4} label={t('Add video')} onPress={()=>void action.run(async()=>{const result=await ownerRequest<{ref:string}>('owner/video-link',{url:video});setMedia(current=>[...current,{kind:'video',ref:result.ref}]);setVideo('');return false;})}/></Card>
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


    </>
  );
}
