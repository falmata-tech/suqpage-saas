import React, { useState, useEffect } from "react";
import { View } from "react-native";
import type { OwnerHome } from "@suqpage/contracts";
import { useApp, useLoad, request } from "./runtime";
import { Copy, Field, Chip, Button, Card, Status, Photo, s } from "./ui";
import { router } from "expo-router";
import { useAction, ActionStatus, pickImages, addAsset } from "./owner-forms";
type Details = {
  business: { name: string; logo_path:string; content_version: number };
  proposal: {
    version: number;
    city: string;
    region: string;
    location_mode: string;
    latitude: number | null;
    longitude: number | null;
    place_id: string | null;
  } | null;
  existing: { city: string; region: string } | null;
  category: string;
};
type Place = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};
export function BusinessForm({onSaved}: {onSaved?: () => void} = {}) {
  const { ownerRequest } = useApp();
  const load = useLoad(() => ownerRequest<Details>("owner/business"));
  return (
    <>
      <Status {...load} retry={load.reload} />
      {load.data && <Form data={load.data} onSaved={onSaved} />}
    </>
  );
}
function Form({ data, onSaved }: { data: Details; onSaved?: () => void }) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const [name, setName] = useState(data.business.name),
    [logo,setLogo]=useState<Awaited<ReturnType<typeof pickImages>>[number]|null>(null),
    [removeLogo,setRemoveLogo]=useState(false),
    [category, setCategory] = useState(data.category),
    [mode, setMode] = useState(data.proposal?.location_mode || "area"),
    [placeId, setPlaceId] = useState(data.proposal?.place_id || ""),
    [city, setCity] = useState(
      data.proposal?.city || data.existing?.city || "",
    ),
    [region, setRegion] = useState(
      data.proposal?.region || data.existing?.region || "",
    ),
    [latitude, setLatitude] = useState(String(data.proposal?.latitude ?? "")),
    [longitude, setLongitude] = useState(
      String(data.proposal?.longitude ?? ""),
    ),
    [query, setQuery] = useState(""),
    [delayed, setDelayed] = useState(""),
    [version, setVersion] = useState(data.business.content_version),
    [locVersion, setLocVersion] = useState(data.proposal?.version || 0);
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const places = useLoad(
      () =>
        request<{ places: Place[] }>("places?q=" + encodeURIComponent(delayed)),
      [delayed],
    ),
    categories = useLoad(() =>
      request<{ categories: { key: string; label: string }[] }>("categories"),
    );
  return (
    <>
      <Copy big>{t("Business details")}</Copy>
      <Field label={t("Business name")} value={name} onChangeText={setName} />
      {!removeLogo&&Boolean(logo?.uri||data.business.logo_path)&&<Photo refPath={logo?.uri||data.business.logo_path} privateImage height={100}/>}
      <Button secondary disabled={action.busy} label={t("Logo")} onPress={()=>void action.run(async()=>{const picked=await pickImages();if(picked.length){setLogo(picked[0]);setRemoveLogo(false);}},"")}/>
      <Button secondary disabled={action.busy} label={t("Remove logo")} onPress={()=>{setLogo(null);setRemoveLogo(true);}}/>
      <Copy>{t("Category")}</Copy>
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
      <Field
        label={t("Search a city or town")}
        value={query}
        onChangeText={setQuery}
      />
      {query.length >= 2 &&
        places.data?.places.map((p) => (
          <Button
            secondary
            key={p.id}
            label={`${p.name} · ${p.region}`}
            onPress={() => {
              setPlaceId(p.id);
              setCity(p.name);
              setRegion(p.region);
              setLatitude(String(p.latitude));
              setLongitude(String(p.longitude));
              setQuery("");
            }}
          />
        ))}
      <Copy>
        {city}
        {city && region ? " · " : ""}
        {region}
      </Copy>
      <View style={s.wrap}>
        <Chip
          label={t("General area")}
          selected={mode === "area"}
          onPress={() => setMode("area")}
        />
        <Chip
          label={t("Public storefront")}
          selected={mode === "storefront"}
          onPress={() => setMode("storefront")}
        />
      </View>
      {mode === "storefront" && (
        <>
          <Field
            label={t("Latitude")}
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
          />
          <Field
            label={t("Longitude")}
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
          />
        </>
      )}
      <ActionStatus state={action} />
      <Button
        disabled={action.busy}
        label={t("Save changes")}
        onPress={() =>
          void action.run(async () => {
            const details = {
              name,
              category,
              city,
              region,
              placeId,
              mode,
              latitude,
              longitude,
              expectedVersion: version,
              locationVersion: locVersion,
            };
            if(logo||removeLogo){const form=new FormData();form.set("details",JSON.stringify({...details,removeLogo}));if(logo)await addAsset(form,"logo",logo);await ownerRequest("owner/business",undefined,form);}else await ownerRequest("owner/business",details);
            const saved = await ownerRequest<Details>("owner/business");
            setVersion(saved.business.content_version);
            setLocVersion(saved.proposal?.version || 0);
            onSaved?.();
          })
        }
      />
    </>
  );
}
export function Settings({ home, onSaved }: { home: OwnerHome; onSaved?: () => void }) {
  const { t, ownerRequest, signOut } = useApp(), action = useAction();
  const [phone, setPhone] = useState(home.user.phone), [name, setName] = useState(home.user.name);
  return <>
    <Copy big>{t("Account security")}</Copy>
    <Copy>{home.user.email}</Copy>
    <Field label={t("Name")} value={name} onChangeText={setName} maxLength={80} />
    <Field label={t("Account phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
    <Button disabled={action.busy} label={t("Save changes")} onPress={() => void action.run(async () => { await ownerRequest("owner/account", {phone, name}); onSaved?.(); })} />
    <ActionStatus state={action} />
    <Button secondary label={t("Sign out")} onPress={() => void signOut()} />
    <Button secondary label={t("Delete account")} onPress={() => router.push("/account-deletion")} />
  </>;
}
